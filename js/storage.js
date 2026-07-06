/* ==========================================
   STORAGE.JS
   Local Storage Manager
========================================== */

export const STORAGE_KEY = "airdropHub";

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
    } catch (error) {
        console.error("Gagal menyimpan LocalStorage:", error);
    }
    }
