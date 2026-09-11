/* ==========================================
   DIALOG.JS
   Pengganti alert() & confirm() bawaan browser
   dengan modal kustom yang lebih profesional
========================================== */

import {
    openModalEl,
    closeModalEl
} from "./modalAnim.js";

let alertModal, alertMessage, alertOkBtn;
let confirmModal, confirmMessage, confirmOkBtn, confirmCancelBtn;

export function initDialog() {

    alertModal = document.getElementById("customAlertModal");
    alertMessage = document.getElementById("customAlertMessage");
    alertOkBtn = document.getElementById("customAlertOk");

    confirmModal = document.getElementById("customConfirmModal");
    confirmMessage = document.getElementById("customConfirmMessage");
    confirmOkBtn = document.getElementById("customConfirmOk");
    confirmCancelBtn = document.getElementById("customConfirmCancel");

}

/* ==========================================
   SHOW ALERT
   Menggantikan: alert(message)
========================================== */

export function showAlert(message) {

    return new Promise((resolve) => {

        alertMessage.textContent = message;

        openModalEl(alertModal);

        document.body.classList.add("modal-open");

        function onOk() {

            closeModalEl(alertModal);

            document.body.classList.remove("modal-open");

            alertOkBtn.removeEventListener("click", onOk);

            resolve();

        }

        alertOkBtn.addEventListener("click", onOk);

    });

}

/* ==========================================
   SHOW CONFIRM
   Menggantikan: confirm(message)
   Resolve dengan true/false
========================================== */

export function showConfirm(message, confirmLabel = "Delete") {

    return new Promise((resolve) => {

        confirmMessage.textContent = message;

        confirmOkBtn.textContent = confirmLabel;

        openModalEl(confirmModal);

        document.body.classList.add("modal-open");

        function cleanup(result) {

            closeModalEl(confirmModal);

            document.body.classList.remove("modal-open");

            confirmOkBtn.removeEventListener("click", onOk);
            confirmCancelBtn.removeEventListener("click", onCancel);

            resolve(result);

        }

        function onOk() {
            cleanup(true);
        }

        function onCancel() {
            cleanup(false);
        }

        confirmOkBtn.addEventListener("click", onOk);
        confirmCancelBtn.addEventListener("click", onCancel);

    });

}
