/* ==========================================
   PROJECT.JS
========================================== */

import { loadProjects, saveProjects } from "./storage.js";
import {
    validateProject,
    showToast
} from "./helpers.js";

import { showConfirm } from "./dialog.js";

import {
    closeAddModal,
    closeEditModal,
    fillEditForm,
    openEditModal
} from "./modal.js";

/* ==========================================
   DATA
========================================== */

let projects = loadProjects();

/* ==========================================
   GET PROJECTS
========================================== */

export function getProjects() {

    return projects;

}

/* ==========================================
   SAVE
========================================== */

function save() {

    saveProjects(projects);

}

/* ==========================================
   ADD PROJECT
========================================== */

export async function addProject(data) {

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

    save();

    closeAddModal();

    showToast("Project berhasil ditambahkan.");

    return true;

}

/* ==========================================
   DELETE PROJECT
========================================== */

export async function deleteProject(id) {

    const confirmed = await showConfirm(
        "Yakin ingin menghapus project ini? Tindakan ini tidak bisa dibatalkan."
    );

    if (!confirmed) {

        return false;

    }

    projects = projects.filter(

        project => project.id !== Number(id)

    );

    save();

    showToast("Project berhasil dihapus.");

    return true;

}

/* ==========================================
   OPEN EDIT
========================================== */

export function editProject(id) {

    const project = projects.find(

        project => project.id === Number(id)

    );

    if (!project) return;

    fillEditForm(project);

    openEditModal();

}

/* ==========================================
   UPDATE PROJECT
========================================== */

export async function updateProject(data) {

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

    if (!(await validateProject(project))) {

        return false;

    }

    save();

    closeEditModal();

    showToast("Project berhasil diperbarui.");

    return true;

}

/* ==========================================
   SEARCH
========================================== */

export function filterProjects(

    keyword = "",

    status = "All",

    task = "All"

) {

    keyword = keyword.toLowerCase();

    return projects.filter(project => {

        const keywordMatch =

            project.name
            .toLowerCase()
            .includes(keyword)

            ||

            project.network
            .toLowerCase()
            .includes(keyword);

        const statusMatch =

            status === "All"

            ||

            project.status === status;

        const taskMatch =

            task === "All"

            ||

            project.taskType === task;

        return (

            keywordMatch &&

            statusMatch &&

            taskMatch

        );

    });

}

// Sinkronisasi data project dari luar module
export function setProjects(newProjects) {
    projects = newProjects;
}
