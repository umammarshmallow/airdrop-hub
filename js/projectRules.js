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

// Aturan jatuh tempo per Check-in (untuk "Today's Task"). Hanya Daily yang
// muncul setiap hari; sisanya muncul di hari yang cocok saja, ATAU kapan pun
// admin menandai "Misi Baru" (sampai user menyelesaikannya):
// - Daily    : setiap hari
// - Weekly   : seminggu sekali, di hari yang sama dengan tanggal acuan
// - Monthly  : sebulan sekali, di tanggal yang sama dengan tanggal acuan
// - One Time : sekali saja, tepat di tanggal deadline
// Tanggal acuan = deadline; kalau deadline kosong, tanggal project dibuat.
export function isTaskDueToday(project) {

    if (project.status !== "Active") return false;

    // Misi baru dari admin memicu Today's Task di luar jadwal tanggal
    if (project.checkIn !== "Daily" && project.mission === "New") {

        return !project.dailyDone;

    }

    switch (project.checkIn) {

        case "Daily":
            return !project.dailyDone;

        case "Weekly":
            return isTodayWeeklyTask(project) && !project.dailyDone;

        case "Monthly":
            return isTodayMonthlyTask(project) && !project.dailyDone;

        case "One Time":
            return isDeadlineToday(project) && !project.dailyDone;

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

// "YYYY-MM-DD" dibaca sebagai tanggal LOKAL (new Date("YYYY-MM-DD")
// dibaca UTC dan bisa bergeser satu hari di zona waktu tertentu).
function parseLocalDate(value) {

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));

    if (!match) return null;

    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

}

function getAnchorDate(project) {

    const fromDeadline = parseLocalDate(project.deadline);

    if (fromDeadline) return fromDeadline;

    if (project.createdAt) {

        const fromCreated = new Date(project.createdAt);

        if (!Number.isNaN(fromCreated.getTime())) return fromCreated;

    }

    return null;

}

function isTodayWeeklyTask(project) {

    const anchor = getAnchorDate(project);

    if (!anchor) return false;

    return anchor.getDay() === new Date().getDay();

}

// Bulan yang lebih pendek memakai tanggal terakhir bulan itu
// (acuan tanggal 31 -> jatuh di tanggal 30 atau 28/29).
function isTodayMonthlyTask(project) {

    const anchor = getAnchorDate(project);

    if (!anchor) return false;

    const today = new Date();

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return today.getDate() === Math.min(anchor.getDate(), daysInMonth);

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
