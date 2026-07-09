/* ==========================================
   AIRDROP HUB V4.1
   APP.JS
========================================== */

import { initEvents } from "./event.js";

import { loadProjects } from "./storage.js";

import { renderProjects } from "./render.js";

import { updateDashboard } from "./dashboard.js";

import { showLoading, hideLoading } from "./helpers.js";

/* ==========================================
   INITIALIZE APPLICATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    showLoading();

    try {

        /* memastikan data localStorage terbaca */

        const projects = loadProjects();

        /* update dashboard */

        updateDashboard(projects);

        /* render project */

        renderProjects();

        /* semua event */

        initEvents();

    } catch (error) {

        console.error(error);

        alert("Terjadi kesalahan saat memuat aplikasi.");

    } finally {

        setTimeout(() => {

            hideLoading();

        }, 400);

    }

});

/* ==========================================
   AUTO SAVE
========================================== */

window.addEventListener("beforeunload", () => {

    console.log("Airdrop Hub Saved");

});

/* ==========================================
   ONLINE / OFFLINE
========================================== */

window.addEventListener("offline", () => {

    console.warn("Offline Mode");

});

window.addEventListener("online", () => {

    console.log("Online");

});

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

/* ==========================================
   VERSION
========================================== */

console.log(
`
==========================================
AIRDROP HUB V4.1
Module Version
==========================================

✓ storage.js

✓ helpers.js

✓ dashboard.js

✓ modal.js

✓ project.js

✓ render.js

✓ events.js

✓ app.js

==========================================
`
);
