/* ==========================================
   MODAL.JS
========================================== */

import {
    clearAddForm
} from "./helpers.js";

import {
    populateWalletSelect
} from "./walletSelect.js";

import {
    openModalEl,
    closeModalEl
} from "./modalAnim.js";

/* ==========================================
   ELEMENT
========================================== */

const projectModal = document.getElementById("projectModal");
const editModal = document.getElementById("editModal");

const addProjectBtn = document.getElementById("addProjectBtn");
const closeModalBtn = document.getElementById("closeModal");
const closeEditModalBtn = document.getElementById("closeEditModal");

/* ==========================================
   LOCK BODY SCROLL
========================================== */

function lockBodyScroll() {

    document.body.classList.add("modal-open");

}

function unlockBodyScroll() {

    document.body.classList.remove("modal-open");

}

/* ==========================================
   RESET SCROLL POSISI MODAL
   (biar tiap dibuka mulai dari atas, tidak
   "nyangkut" di posisi scroll terakhir)
========================================== */

function resetModalScroll(modalEl) {

    modalEl.scrollTop = 0;

    const content = modalEl.querySelector(".modal-content");

    if (content) {

        content.scrollTop = 0;

    }

}

/* ==========================================
   OPEN MODAL
========================================== */

export function openAddModal() {

    clearAddForm();

    populateWalletSelect(
        document.getElementById("projectWallet"),
        ""
    );

    resetModalScroll(projectModal);

    openModalEl(projectModal);

    lockBodyScroll();

}

export function openEditModal() {

    resetModalScroll(editModal);

    openModalEl(editModal);

    lockBodyScroll();

}

/* ==========================================
   CLOSE MODAL
========================================== */

export function closeAddModal() {

    closeModalEl(projectModal);

    unlockBodyScroll();

}

export function closeEditModal() {

    closeModalEl(editModal);

    unlockBodyScroll();

}

/* ==========================================
   FILL EDIT FORM
========================================== */

export function fillEditForm(project) {

    document.getElementById("editId").value = project.id;

    document.getElementById("editName").value = project.name;

    document.getElementById("editNetwork").value = project.network;

    populateWalletSelect(
        document.getElementById("editProjectWallet"),
        project.network,
        project.wallet
    );

    document.getElementById("editWebsite").value = project.website;

    document.getElementById("editTaskType").value = project.taskType;

    document.getElementById("editDeadline").value = project.deadline || "";

    document.getElementById("editPriority").value = project.priority;

    document.getElementById("editStatus").value = project.status;

    document.getElementById("editNote").value = project.note;

}

/* ==========================================
   REGISTER EVENT
========================================== */

export function initModal() {

    addProjectBtn.addEventListener("click", openAddModal);

    closeModalBtn.addEventListener("click", closeAddModal);

    closeEditModalBtn.addEventListener(
        "click",
        closeEditModal
    );

    window.addEventListener("click", (e) => {

        if (e.target === projectModal) {

            closeAddModal();

        }

        if (e.target === editModal) {

            closeEditModal();

        }

    });

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeAddModal();

            closeEditModal();

        }

    });

}
