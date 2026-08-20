/* ==========================================
   STORAGE.JS
   Local Storage Manager
========================================== */

export const STORAGE_KEY = "airdropHub";

import { pushToCloud } from "./cloudSync.js";

export function loadProjects() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) return [];

        const projects = JSON.parse(data);

        return Array.isArray(projects) ? projects : [];
    } catch (error) {
        console.error("Gagal membaca LocalStorage:", error);
        return [];
    }
}

export function saveProjects(projects) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(projects)
        );
        pushToCloud();
    } catch (error) {
        console.error("Gagal menyimpan LocalStorage:", error);
    }
    }

/* ==========================================
   BACKUP & RESTORE (Export / Import JSON)
========================================== */

const WALLET_STORAGE_KEY = "airdropHub_wallets";
const DAILY_RESET_STORAGE_KEY = "airdropHub_lastReset";

export function exportBackup() {
    const backup = {
        app: "airdropHub",
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
            [STORAGE_KEY]: localStorage.getItem(STORAGE_KEY) || "[]",
            [WALLET_STORAGE_KEY]: localStorage.getItem(WALLET_STORAGE_KEY) || "[]",
            [DAILY_RESET_STORAGE_KEY]: localStorage.getItem(DAILY_RESET_STORAGE_KEY) || ""
        }
    };

    return JSON.stringify(backup, null, 2);
}

export async function importBackup(jsonString) {
    let parsed;

    try {
        parsed = JSON.parse(jsonString);
    } catch (error) {
        throw new Error("File backup tidak valid (bukan JSON).");
    }

    if (!parsed || typeof parsed !== "object" || !parsed.data) {
        throw new Error("Format file backup tidak dikenali.");
    }

    const { data } = parsed;

    if (typeof data[STORAGE_KEY] === "string") {
        JSON.parse(data[STORAGE_KEY]); // validasi array projects
        localStorage.setItem(STORAGE_KEY, data[STORAGE_KEY]);
    }

    if (typeof data[WALLET_STORAGE_KEY] === "string") {
        JSON.parse(data[WALLET_STORAGE_KEY]); // validasi array wallets
        localStorage.setItem(WALLET_STORAGE_KEY, data[WALLET_STORAGE_KEY]);
    }

    if (typeof data[DAILY_RESET_STORAGE_KEY] === "string" && data[DAILY_RESET_STORAGE_KEY]) {
        localStorage.setItem(DAILY_RESET_STORAGE_KEY, data[DAILY_RESET_STORAGE_KEY]);
    }

    // Pastikan cloud ikut ter-update dengan data hasil import,
    // supaya tidak ketimpa balik saat halaman di-reload.
    await pushToCloud(true);
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
   
    console.log("Daily task berhasil di-reset");

    console.log(projects);

    return projects;

}

/* ==========================================
   AUTO DELETE PROJECT WAITLIST/PENDING
   YANG TIDAK DIUPDATE SELAMA 2 BULAN
========================================== */

const STALE_STATUSES = ["Waitlist", "Pending"];

// approx 2 bulan (60 hari)
const STALE_THRESHOLD_MS = 60 * 24 * 60 * 60 * 1000;

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

        console.log(
            `${removedCount} project (Waitlist/Pending) dihapus otomatis karena tidak diupdate 2 bulan.`
        );

    }

    return {

        projects: remaining,

        removedCount: removedCount

    };

}
