/* ==========================================
   PROJECTRULES.JS
   Aturan bisnis project: predikat filter cepat
   (dipakai dashboard.js untuk hitung dan project.js
   untuk filter list), validasi, dan pengurutan.
========================================== */

import { showAlert } from "./dialog.js";
import { t } from "./i18n.js";

/* ==========================
QUICK FILTER PREDICATES
========================== */

export function isTaskDueToday(project) {

    if (project.status !== "Active") return false;

    switch (project.taskType) {

        case "Daily":
            return !project.dailyDone;

        case "Weekly":
            return isTodayWeeklyTask(project) && !project.dailyDone;

        case "Testnet":
        case "Mainnet":
            return !project.dailyDone;

        default:
            return false;

    }

}

export function isDeadlineToday(project) {

    if (!project.deadline) return false;

    const now = new Date();
    const dl = new Date(project.deadline);

    return (
        dl.getFullYear() === now.getFullYear() &&
        dl.getMonth() === now.getMonth() &&
        dl.getDate() === now.getDate()
    );

}

function isTodayWeeklyTask(project) {

    if (!project.deadline) return true;

    const deadline = new Date(project.deadline);
    const today = new Date();

    return deadline.getDay() === today.getDay();

}

/* ==========================
VALIDASI PROJECT
========================== */

export async function validateProject(project) {

    if (!project.name.trim()) {

        await showAlert(t("project.nameRequired"));

        return false;

    }

    if (!project.network.trim()) {

        await showAlert(t("project.chainRequired"));

        return false;

    }

    return true;

}

/* ==========================
SORT PROJECT
========================== */

export function sortProjects(projects, mode = "default") {

    if (mode === "deadline") {

        return [...projects].sort((a, b) => {

            if (!a.deadline && !b.deadline)
                return a.name.localeCompare(b.name, "en");

            if (!a.deadline) return 1;
            if (!b.deadline) return -1;

            return new Date(a.deadline) - new Date(b.deadline);

        });

    }

    if (mode === "newest") {

        return [...projects].sort(
            (a, b) => b.id - a.id
        );

    }

    const statusOrder = {

        Active: 1,
        Waitlist: 2,
        Pending: 3,
        Complete: 4

    };

    return [...projects].sort((a, b) => {

        const statusA = statusOrder[a.status] ?? 999;
        const statusB = statusOrder[b.status] ?? 999;

        if (statusA !== statusB)
            return statusA - statusB;

        return a.name.localeCompare(
            b.name,
            "en",
            { sensitivity: "base" }
        );

    });

}
