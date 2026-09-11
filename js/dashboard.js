/* ==========================================
   DASHBOARD.JS
========================================== */

import { isTaskDueToday, isDeadlineToday } from "./helpers.js";

/* Animasikan angka statistik dari nilai lama ke nilai baru.
   Kalau nilainya tidak berubah (mis. cuma ganti filter search),
   tidak dianimasikan ulang supaya tidak mengganggu. */
function animateCount(el, value) {

    if (!el) return;

    const from = parseInt(el.textContent, 10) || 0;
    const to = Number(value) || 0;

    if (from === to) {
        el.textContent = to;
        return;
    }

    const duration = 400;
    const start = performance.now();

    function tick(now) {

        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        el.textContent = Math.round(from + (to - from) * eased);

        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = to;

    }

    requestAnimationFrame(tick);

}

export function updateDashboard(projects) {

    const todayTask = document.getElementById("todayTask");
    const todayTaskCard = document.getElementById("todayTaskCard");
    const deadlineToday = document.getElementById("deadlineToday");
    const deadlineTodayCard = document.getElementById("deadlineTodayCard");
    const activeProject = document.getElementById("activeProject");
    const pendingProject = document.getElementById("pendingProject");
    const waitlistProject = document.getElementById("waitlistProject");
    const completeProject = document.getElementById("completedProject");

    let today = 0;
    let deadline = 0;
    let active = 0;
    let pending = 0;
    let waitlist = 0;
    let complete = 0;

    projects.forEach(project => {

        if (isDeadlineToday(project)) deadline++;

        switch (project.status) {

            case "Active":
                active++;
                break;

            case "Pending":
                pending++;
                break;

            case "Waitlist":
                waitlist++;
                break;

            case "Complete":
                complete++;
                break;

        }

        if (isTaskDueToday(project)) today++;

    });

    animateCount(todayTask, today);

    if (todayTaskCard) todayTaskCard.dataset.state = today > 0 ? "alert" : "clear";

    animateCount(deadlineToday, deadline);

    if (deadlineTodayCard) deadlineTodayCard.dataset.state = deadline > 0 ? "alert" : "clear";

    animateCount(activeProject, active);

    animateCount(pendingProject, pending);

    animateCount(waitlistProject, waitlist);

    animateCount(completeProject, complete);

}

