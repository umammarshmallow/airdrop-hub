/* ==========================================
   STORAGE.JS
   Local Storage Manager
========================================== */

// "My Project" -> data privat milik masing-masing user (per-uid di cloud).
export const STORAGE_KEY = "airdropHub";

// "Home" -> data publik/shared, bisa dibaca semua orang, tapi
// hanya admin (role="admin") yang boleh menyimpan perubahan ke cloud.
export const HOME_STORAGE_KEY = "airdropHub_home";

// Set true di console browser (atau ubah di sini saat development)
// untuk melihat log diagnostik non-critical seperti ringkasan cleanup.
const DEBUG = false;

import { pushToCloud, pushHomeToCloud } from "./cloudSync.js";

function readFromKey(key) {
    try {
        const data = localStorage.getItem(key);

        if (!data) return [];

        const projects = JSON.parse(data);

        return Array.isArray(projects) ? projects : [];
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
    return readFromKey(STORAGE_KEY);
}

export function saveProjects(projects) {
    writeToKey(STORAGE_KEY, projects);
    pushToCloud();
}

/* ==========================================
   HOME (public, admin-only edit)
========================================== */

export function loadHomeProjects() {
    return readFromKey(HOME_STORAGE_KEY);
}

export function saveHomeProjects(projects) {
    writeToKey(HOME_STORAGE_KEY, projects);
    pushHomeToCloud();
}

/* ==========================================
   DAILY TASK RESET
========================================== */

const DAILY_RESET_KEY = "airdropHub_lastReset";

export function resetDailyTasks(projects) {

    const now = new Date();

    const today =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
    const lastReset = localStorage.getItem(DAILY_RESET_KEY);

    if (lastReset === today) {
        return projects;
    }

    projects.forEach(project => {

        if (project.status !== "Active") return;

        switch (project.taskType) {

            case "Daily":
            case "Weekly":
            case "Testnet":
            case "Mainnet":
                project.dailyDone = false;
                break;

        }

    });

    localStorage.setItem(DAILY_RESET_KEY, today);

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
