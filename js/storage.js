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

/* ==========================================
   DAILY TASK RESET
========================================== */

const DAILY_RESET_KEY = "airdropHub_lastReset";

export function resetDailyTasks(projects) {

    const today = new Date().toISOString().split("T")[0];

    const lastReset = localStorage.getItem(DAILY_RESET_KEY);

    if (lastReset === today) {
        return projects;
    }

    projects.forEach(project => {

        if (project.taskType === "Daily") {

            project.dailyDone = false;

        }

    });

    localStorage.setItem(DAILY_RESET_KEY, today);

    saveProjects(projects);

    return projects;

}
