/* ==========================================
   PROJECT.JS
========================================== */

import { loadProjects, saveProjects } from "./storage.js";
import {
    validateProject,
    showToast
} from "./helpers.js";

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

export function addProject(data) {

    if (!validateProject(data)) {

        return false;

    }

    projects.push({

        id: Date.now(),

        name: data.name.trim(),

        network: data.network.trim(),

        website: data.website.trim(),

        taskType: data.taskType,

        deadline: data.deadline,

        priority: data.priority,

        status: data.status,

        note: data.note.trim()

        dailyDone: false
   
    });

    save();

    closeAddModal();

    showToast("Project berhasil ditambahkan.");

    return true;

}

/* ==========================================
   DELETE PROJECT
========================================== */

export function deleteProject(id) {

    if (!confirm("Hapus project ini?")) {

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
   CHANGE STATUS
========================================== */

export function changeStatus(id, status) {

    const project = projects.find(

        project => project.id === Number(id)

    );

    if (!project) return false;

    project.status = status;

    save();

    showToast("Status berhasil diperbarui.");

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

export function updateProject(data) {

    const project = projects.find(

        project => project.id === Number(data.id)

    );

    if (!project) {

        return false;

    }

    project.name = data.name.trim();

    project.network = data.network.trim();

    project.website = data.website.trim();

    project.taskType = data.taskType;

    project.deadline = data.deadline;

    project.priority = data.priority;

    project.status = data.status;

    project.note = data.note.trim();

    if (!validateProject(project)) {

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
