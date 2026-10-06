/* ==========================================
   MODAL.JS
========================================== */

import {
    openModalEl,
    closeModalEl
} from "./modalAnim.js";

import { isAdmin } from "./cloudSync.js";
import { t } from "./i18n.js";
import { MISSION_CHECK_INS } from "./projectSchema.js";

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
   KOLOM MISI (khusus admin)
   Muncul di form Tambah (admin) dan form Edit project Home, dan hanya
   kalau Check-in-nya Weekly / Monthly / One Time.
========================================== */

function updateMissionField(checkInId, wrapperId, allowed) {

    const wrapper = document.getElementById(wrapperId);

    if (!wrapper) return;

    wrapper.dataset.allowed = allowed ? "1" : "0";

    const checkIn = document.getElementById(checkInId).value;

    wrapper.style.display = allowed && MISSION_CHECK_INS.includes(checkIn)
        ? "block"
        : "none";

}

/* ==========================================
   CLEAR ADD FORM
========================================== */

function clearAddForm() {

    document.getElementById("name").value = "";

    document.getElementById("network").value = "";

    document.getElementById("website").value = "";

    document.getElementById("websiteInvite").value = "";

    document.getElementById("deadline").value = "";

    syncDeadlineClear("deadline", "clearDeadline");

    document.getElementById("funding").value = "";

    document.getElementById("note").value = "";

    document.getElementById("taskType").selectedIndex = 0;

    document.getElementById("checkIn").selectedIndex = 0;

    document.getElementById("mission").value = "None";

    document.getElementById("priority").selectedIndex = 0;

    document.getElementById("status").selectedIndex = 0;

}

/* ==========================================
   HAPUS / RESET DEADLINE
   Tombol "Hapus" di samping input tanggal: muncul hanya saat
   deadline terisi, dan mengosongkannya (input date di sebagian
   browser mobile tidak punya cara bawaan untuk mengosongkan).
========================================== */

function syncDeadlineClear(inputId, buttonId) {

    const button = document.getElementById(buttonId);

    if (!button) return;

    button.hidden = !document.getElementById(inputId).value;

}

function initDeadlineClear(inputId, buttonId) {

    const input = document.getElementById(inputId);

    const button = document.getElementById(buttonId);

    input.addEventListener("input", () => syncDeadlineClear(inputId, buttonId));

    input.addEventListener("change", () => syncDeadlineClear(inputId, buttonId));

    button.addEventListener("click", () => {

        input.value = "";

        syncDeadlineClear(inputId, buttonId);

        input.focus();

    });

}

/* ==========================================
   OPEN MODAL
========================================== */

export function openAddModal() {

    clearAddForm();

    const admin = isAdmin();

    const destinationText = document.getElementById("addDestinationNoteText");
    if (destinationText) {
        destinationText.textContent = admin
            ? t("project.destinationHome")
            : t("project.destinationMyProject");
    }

    const inviteField = document.getElementById("websiteInviteField");
    if (inviteField) {
        inviteField.style.display = admin ? "block" : "none";
    }

    updateMissionField("checkIn", "missionField", admin);

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

export function fillEditForm(project, { showMission = false } = {}) {

    document.getElementById("editId").value = project.id;

    document.getElementById("editName").value = project.name;

    document.getElementById("editNetwork").value = project.network;

    document.getElementById("editWebsite").value = project.website;

    const editInviteField = document.getElementById("editWebsiteInviteField");
    if (editInviteField) {
        editInviteField.style.display = isAdmin() ? "block" : "none";
    }

    document.getElementById("editWebsiteInvite").value = project.websiteInvite || "";

    document.getElementById("editTaskType").value = project.taskType;

    document.getElementById("editCheckIn").value = project.checkIn;

    document.getElementById("editMission").value = project.mission === "New" ? "New" : "None";

    updateMissionField("editCheckIn", "editMissionField", showMission);

    document.getElementById("editDeadline").value = project.deadline || "";

    syncDeadlineClear("editDeadline", "clearEditDeadline");

    document.getElementById("editFunding").value = project.funding || "";

    document.getElementById("editPriority").value = project.priority;

    document.getElementById("editStatus").value = project.status;

    document.getElementById("editNote").value = project.note;

}

/* ==========================================
   REGISTER EVENT
========================================== */

export function initModal() {

    addProjectBtn.addEventListener("click", openAddModal);

    initDeadlineClear("deadline", "clearDeadline");

    initDeadlineClear("editDeadline", "clearEditDeadline");

    // tampil/sembunyikan kolom Misi saat Check-in diganti
    document.getElementById("checkIn").addEventListener("change", () => {
        updateMissionField("checkIn", "missionField", isAdmin());
    });

    document.getElementById("editCheckIn").addEventListener("change", () => {
        const wrapper = document.getElementById("editMissionField");
        updateMissionField("editCheckIn", "editMissionField", wrapper.dataset.allowed === "1");
    });

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
