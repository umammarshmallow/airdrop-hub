/* ==========================================
   PROJECT.JS

   Dua "store" terpisah:
   - myProjectStore  -> data privat, milik masing-masing user,
                        bisa diedit/dihapus bebas oleh pemiliknya.
   - homeProjectStore -> data publik (Home), semua orang boleh
                        lihat, tapi hanya admin (role="admin" di
                        Firestore) yang boleh tambah/edit/hapus.

   Halaman aktif (mode) menentukan store mana yang dipakai oleh
   getProjects()/addProject()/dst, supaya render.js & event.js
   tidak perlu tahu detail Home vs My Project.
========================================== */

import {
    loadProjects,
    saveProjects,
    loadHomeProjects,
    saveHomeProjects
} from "./storage.js";

import { isAdmin } from "./cloudSync.js";

import {
    validateProject,
    showToast,
    isTaskDueToday,
    isDeadlineToday
} from "./helpers.js";

import { showConfirm } from "./dialog.js";

import {
    closeAddModal,
    closeEditModal,
    fillEditForm,
    openEditModal
} from "./modal.js";

/* ==========================================
   FACTORY STORE
========================================== */

function makeProjectStore(loadFn, saveFn, canMutate, deniedMessage) {

    let projects = loadFn();

    function persist() {
        saveFn(projects);
    }

    function checkPermission() {

        if (canMutate && !canMutate()) {

            showToast(deniedMessage, 3000, "error");

            return false;

        }

        return true;

    }

    return {

        getProjects() {
            return projects;
        },

        setProjects(newProjects) {
            projects = newProjects;
        },

        async addProject(data) {

            if (!checkPermission()) return false;

            if (!(await validateProject(data))) {

                return false;

            }

            projects.push({

                id: Date.now(),

                name: data.name.trim(),

                network: data.network.trim(),

                wallet: data.wallet || "",

                website: data.website.trim(),

                taskType: data.taskType,

                deadline: data.deadline,

                priority: data.priority,

                status: data.status,

                note: data.note.trim(),

                dailyDone: false,

                createdAt: Date.now(),

                updatedAt: Date.now()

            });

            persist();

            closeAddModal();

            showToast("Project added successfully.");

            return true;

        },

        async deleteProject(id) {

            if (!checkPermission()) return false;

            const confirmed = await showConfirm(
                "Delete this project? This action cannot be undone."
            );

            if (!confirmed) {

                return false;

            }

            projects = projects.filter(
                project => project.id !== Number(id)
            );

            persist();

            showToast("Project deleted successfully.");

            return true;

        },

        editProject(id) {

            if (!checkPermission()) return;

            const project = projects.find(
                project => project.id === Number(id)
            );

            if (!project) return;

            fillEditForm(project);

            openEditModal();

        },

        async updateProject(data) {

            if (!checkPermission()) return false;

            const project = projects.find(
                project => project.id === Number(data.id)
            );

            if (!project) {

                return false;

            }

            project.name = data.name.trim();

            project.network = data.network.trim();

            project.wallet = data.wallet || "";

            project.website = data.website.trim();

            project.taskType = data.taskType;

            project.deadline = data.deadline;

            project.priority = data.priority;

            project.status = data.status;

            project.note = data.note.trim();

            project.updatedAt = Date.now();

            project.staleWarned = false;

            if (!(await validateProject(project))) {

                return false;

            }

            persist();

            closeEditModal();

            showToast("Project updated successfully.");

            return true;

        },

        markDailyDone(id) {

            if (!checkPermission()) return false;

            const project = projects.find(
                project => project.id === Number(id)
            );

            if (!project) return false;

            project.dailyDone = true;

            project.updatedAt = Date.now();

            persist();

            return true;

        },

        filterProjects(keyword = "", status = "All", task = "All", quickFilter = "None") {

            keyword = keyword.toLowerCase();

            return projects.filter(project => {

                const keywordMatch =
                    project.name.toLowerCase().includes(keyword)
                    ||
                    project.network.toLowerCase().includes(keyword);

                const statusMatch =
                    status === "All"
                    ||
                    project.status === status;

                const taskMatch =
                    task === "All"
                    ||
                    project.taskType === task;

                const quickFilterMatch =
                    quickFilter === "None"
                    ||
                    (quickFilter === "TodayTask" && isTaskDueToday(project))
                    ||
                    (quickFilter === "DeadlineToday" && isDeadlineToday(project));

                return (
                    keywordMatch &&
                    statusMatch &&
                    taskMatch &&
                    quickFilterMatch
                );

            });

        }

    };

}

/* ==========================================
   INSTANCE STORE
========================================== */

export const myProjectStore = makeProjectStore(
    loadProjects,
    saveProjects,
    null,
    ""
);

export const homeProjectStore = makeProjectStore(
    loadHomeProjects,
    saveHomeProjects,
    isAdmin,
    "Only admin can add/edit/delete Home projects."
);

/* ==========================================
   MODE AKTIF (halaman mana yang sedang dilihat)
========================================== */

let currentMode = "home"; // "home" | "myproject"

export function setMode(mode) {
    currentMode = mode;
}

export function getMode() {
    return currentMode;
}

export function isHomeMode() {
    return currentMode === "home";
}

function activeStore() {
    return currentMode === "home" ? homeProjectStore : myProjectStore;
}

/* ==========================================
   FACADE -- dipakai oleh render.js / event.js / app.js
   (mengikuti mode yang sedang aktif)
========================================== */

export function getProjects() {
    return activeStore().getProjects();
}

export function addProject(data) {
    return activeStore().addProject(data);
}

export function deleteProject(id) {
    return activeStore().deleteProject(id);
}

export function editProject(id) {
    return activeStore().editProject(id);
}

export function updateProject(data) {
    return activeStore().updateProject(data);
}

export function filterProjects(keyword, status, task, quickFilter) {
    return activeStore().filterProjects(keyword, status, task, quickFilter);
}

export function markDailyDone(id) {
    return activeStore().markDailyDone(id);
}

// Dipakai khusus oleh refreshProjectsView() (reset harian/auto-cleanup),
// yang memang hanya berlaku untuk data privat My Project -- Home adalah
// data terkurasi admin, jadi tidak ikut direset/dibersihkan otomatis.
export function setProjects(newProjects) {
    myProjectStore.setProjects(newProjects);
}

// Dipakai setelah pullHomeFromCloud() supaya in-memory store Home
// ikut ter-update dari hasil pull cloud terbaru.
export function setHomeProjects(newProjects) {
    homeProjectStore.setProjects(newProjects);
}
