/* ==========================================
   STORAGE.JS
   Local Storage Manager
========================================== */

// Set true di console browser (atau ubah di sini saat development)
// untuk melihat log diagnostik non-critical seperti ringkasan cleanup.
const DEBUG = false;

import { pushToCloud, pushHomeToCloud } from "./cloudSync.js";
import { STORAGE_KEYS } from "./constants.js";
import { normalizeProject, applyHomeAutoUpdate } from "./projectSchema.js";

function readFromKey(key) {
    try {
        const data = localStorage.getItem(key);

        if (!data) return [];

        const projects = JSON.parse(data);

        // data lama (taskType Daily/Weekly/One Time) dimigrasi ke taskType + checkIn
        return Array.isArray(projects) ? projects.map(normalizeProject) : [];
    } catch (error) {
        console.error("Gagal membaca LocalStorage:", error);
        return [];
    }
}

function writeToKey(key, projects) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(projects)
        );
    } catch (error) {
        console.error("Gagal menyimpan LocalStorage:", error);
    }
}

export function loadProjects() {
    return readFromKey(STORAGE_KEYS.projects);
}

export function saveProjects(projects) {
    writeToKey(STORAGE_KEYS.projects, projects);
    pushToCloud();
}

/* ==========================================
   HOME (public, admin-only edit)
========================================== */

export function loadHomeProjects() {
    return readFromKey(STORAGE_KEYS.homeProjects);
}

export function saveHomeProjects(projects) {
    writeToKey(STORAGE_KEYS.homeProjects, projects);
    pushHomeToCloud();
}

/* ==========================================
   PERUBAHAN OTOMATIS DARI HOME (MISI & FUNDING) -> SALINAN DI MY PROJECT
   cloudSync.js mengantre perubahan misi/funding saat Home ditarik; di
   sini antrean itu diterapkan ke My Project (dipanggil setelah data My
   Project selesai ditarik dari cloud, supaya tidak tertimpa).
========================================== */

export function applyPendingHomeUpdates(projects) {

    let queue = [];

    try {

        const raw = localStorage.getItem(STORAGE_KEYS.pendingHomeUpdates);

        queue = raw ? JSON.parse(raw) : [];

    } catch (error) { queue = []; }

    if (!Array.isArray(queue) || !queue.length) return projects;

    let changed = 0;

    queue.forEach(update => {
        changed += applyHomeAutoUpdate(projects, update);
    });

    localStorage.removeItem(STORAGE_KEYS.pendingHomeUpdates);

    if (changed) saveProjects(projects);

    return projects;

}

/* ==========================================
   DAILY TASK RESET
========================================== */

// Momen reset terakhir (<= sekarang) untuk jam reset tertentu, mis. 07:00:
// kalau sekarang belum jam 07:00, batasnya adalah 07:00 kemarin.
function lastResetBoundary(resetTime, now) {

    const [hour, minute] = String(resetTime).split(":").map(Number);

    const boundary = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour || 0,
        minute || 0,
        0,
        0
    );

    if (boundary > now) boundary.setDate(boundary.getDate() - 1);

    return boundary;

}

export function resetDailyTasks(projects) {

    const now = new Date();

    const today =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
    const lastReset = localStorage.getItem(STORAGE_KEYS.lastReset);

    // true saat hari sudah berganti sejak reset terakhir (reset jam 00:00)
    const newDay = lastReset !== today;

    let changed = false;

    projects.forEach(project => {

        if (project.status !== "Active") return;

        // One Time tidak pernah direset
        if (project.checkIn === "One Time") return;

        // Daily dengan jam reset 07:00: status "selesai" dikosongkan kalau
        // ditandai selesai SEBELUM batas 07:00 terakhir. Data lama tanpa
        // doneAt memakai aturan pergantian hari seperti biasa.
        if (project.checkIn === "Daily" && project.resetTime === "07:00") {

            const doneAt = Number(project.doneAt);

            const hasDoneAt = Number.isFinite(doneAt) && doneAt > 0;

            const shouldReset = hasDoneAt
                ? doneAt < lastResetBoundary(project.resetTime, now).getTime()
                : newDay;

            if (shouldReset && project.dailyDone) {
                project.dailyDone = false;
                changed = true;
            }

            return;

        }

        // Selain itu status "selesai" kembali kosong tiap hari jam 00:00
        // (Weekly/Monthly baru dianggap due di hari yang cocok).
        if (newDay) {
            project.dailyDone = false;
        }

    });

    if (!newDay && !changed) {
        return projects;
    }

    if (newDay) {
        localStorage.setItem(STORAGE_KEYS.lastReset, today);
    }

    saveProjects(projects);

    return projects;

}

/* ==========================================
   AUTO DELETE PROJECT WAITLIST/PENDING
   YANG TIDAK DIUPDATE SELAMA 2 BULAN
========================================== */

const STALE_STATUSES = ["Waitlist", "Pending"];

// approx 2 bulan (60 hari)
const STALE_THRESHOLD_MS = 60 * 24 * 60 * 60 * 1000;

// jendela peringatan: 1 hari sebelum batas waktu tercapai
const STALE_WARNING_WINDOW_MS = 24 * 60 * 60 * 1000;
const STALE_WARNING_THRESHOLD_MS = STALE_THRESHOLD_MS - STALE_WARNING_WINDOW_MS;

export function cleanupStaleProjects(projects) {

    const now = Date.now();

    const remaining = [];

    let removedCount = 0;

    projects.forEach(project => {

        const lastActivity =
            project.updatedAt ||
            project.createdAt ||
            now;

        const isStale =
            STALE_STATUSES.includes(project.status) &&
            (now - lastActivity) > STALE_THRESHOLD_MS;

        if (isStale) {

            removedCount++;

        } else {

            remaining.push(project);

        }

    });

    if (removedCount > 0) {

        saveProjects(remaining);

        if (DEBUG) {
            console.log(
                `${removedCount} project (Waitlist/Pending) dihapus otomatis karena tidak diupdate 2 bulan.`
            );
        }

    }

    return {

        projects: remaining,

        removedCount: removedCount

    };

}

/* ==========================================
   PERINGATAN H-1 SEBELUM AUTO-DELETE
   Menandai project Waitlist/Pending yang akan
   dihapus otomatis dalam ~1 hari ke depan, supaya
   user sempat menyelamatkan/update projectnya.
   Flag "staleWarned" disimpan di project itu sendiri
   supaya peringatan cuma muncul sekali, tidak berulang
   tiap kali app dibuka/dicek.
========================================== */

export function checkStaleWarnings(projects) {

    const now = Date.now();

    const warned = [];

    projects.forEach(project => {

        const lastActivity =
            project.updatedAt ||
            project.createdAt ||
            now;

        const idleFor = now - lastActivity;

        const isAboutToBeDeleted =
            STALE_STATUSES.includes(project.status) &&
            idleFor >= STALE_WARNING_THRESHOLD_MS &&
            idleFor <= STALE_THRESHOLD_MS;

        if (isAboutToBeDeleted && !project.staleWarned) {

            project.staleWarned = true;

            warned.push(project);

        }

    });

    if (warned.length > 0) {

        saveProjects(projects);

    }

    return warned;

}
