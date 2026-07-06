/* ==========================================
   AIRDROP HUB V5.0
   constants.js
========================================== */

/* =====================
LOCAL STORAGE
===================== */

export const STORAGE_KEY = "airdropHub";

/* =====================
DATA
===================== */

export let projects =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

export function setProjects(data) {
    projects = data;
}

/* =====================
ELEMENT
===================== */

export const projectList =
    document.getElementById("projectList");

export const addProjectBtn =
    document.getElementById("addProjectBtn");

export const projectModal =
    document.getElementById("projectModal");

export const editModal =
    document.getElementById("editModal");

export const closeModal =
    document.getElementById("closeModal");

export const closeEditModal =
    document.getElementById("closeEditModal");

export const saveProject =
    document.getElementById("saveProject");

export const updateProject =
    document.getElementById("updateProject");

/* =====================
SEARCH
===================== */

export const search =
    document.getElementById("search");

export const filterStatus =
    document.getElementById("filterStatus");

export const filterTask =
    document.getElementById("filterTask");

/* =====================
DASHBOARD
===================== */

export const todayTask =
    document.getElementById("todayTask");

export const activeProject =
    document.getElementById("activeProject");

export const pendingProject =
    document.getElementById("pendingProject");

export const waitlistProject =
    document.getElementById("waitlistProject");

export const completeProject =
    document.getElementById("completeProject");

/* =====================
ADD FORM
===================== */

export const nameInput =
    document.getElementById("name");

export const networkInput =
    document.getElementById("network");

export const websiteInput =
    document.getElementById("website");

export const taskTypeInput =
    document.getElementById("taskType");

export const deadlineInput =
    document.getElementById("deadline");

export const priorityInput =
    document.getElementById("priority");

export const statusInput =
    document.getElementById("status");

export const noteInput =
    document.getElementById("note");

/* =====================
EDIT FORM
===================== */

export const editId =
    document.getElementById("editId");

export const editName =
    document.getElementById("editName");

export const editNetwork =
    document.getElementById("editNetwork");

export const editWebsite =
    document.getElementById("editWebsite");

export const editTaskType =
    document.getElementById("editTaskType");

export const editDeadline =
    document.getElementById("editDeadline");

export const editPriority =
    document.getElementById("editPriority");

export const editStatus =
    document.getElementById("editStatus");

export const editNote =
    document.getElementById("editNote");

/* =====================
OTHER ELEMENT
===================== */

export const toast =
    document.getElementById("toast");

export const toastText =
    document.getElementById("toastText");

export const loading =
    document.getElementById("loading");
