/* ==========================================
   NOTIFICATIONSUI.JS
   Tampilan Notification Center: badge di header,
   modal daftar notifikasi, dan tombol aksinya.
   (Penyimpanan datanya ada di notifications.js)
========================================== */

import {
    getNotifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    clearNotifications
} from "./notifications.js";

import { openModalEl, closeModalEl } from "./modalAnim.js";
import { showConfirm } from "./dialog.js";
import { editProject } from "./project.js";
import { showCloudAuthModal } from "./authUI.js";
import { t } from "./i18n.js";
import { EVENTS } from "./constants.js";

/* ==========================================
   ELEMENT
========================================== */

const notifBtn = document.getElementById("notifBtn");
const notifBadge = document.getElementById("notifBadge");
const notifModal = document.getElementById("notifModal");
const notifList = document.getElementById("notifList");
const notifEmpty = document.getElementById("notifEmpty");
const closeNotifModal = document.getElementById("closeNotifModal");
const notifClearBtn = document.getElementById("notifClearBtn");

const NOTIF_ICON = {
    error: "fa-solid fa-circle-exclamation",
    warning: "fa-solid fa-triangle-exclamation",
    info: "fa-solid fa-circle-info"
};

/* ==========================================
   RENDER
========================================== */

function timeAgo(isoString) {

    const diffMs = Date.now() - new Date(isoString).getTime();

    const mins = Math.floor(diffMs / 60000);

    if (mins < 1) return "Baru saja";

    if (mins < 60) return `${mins} menit lalu`;

    const hours = Math.floor(mins / 60);

    if (hours < 24) return `${hours} jam lalu`;

    const days = Math.floor(hours / 24);

    return `${days} hari lalu`;

}

export function refreshNotifBadge() {

    const count = unreadNotificationCount();

    if (count > 0) {

        notifBadge.textContent = count > 9 ? "9+" : String(count);
        notifBadge.style.display = "flex";

        // restart animasi pop setiap kali badge ter-update
        notifBadge.classList.remove("pop");
        void notifBadge.offsetWidth;
        notifBadge.classList.add("pop");

    } else {

        notifBadge.style.display = "none";

    }

}

function renderNotifList() {

    const list = getNotifications();

    notifList.innerHTML = "";

    if (!list.length) {

        notifEmpty.style.display = "block";
        return;

    }

    notifEmpty.style.display = "none";

    list.forEach((n) => {

        const item = document.createElement("div");

        item.className = "notif-item" + (n.read ? "" : " unread");

        item.dataset.type = n.type || "info";

        const action = n.meta && n.meta.action;

        let actionBtn = "";

        if (action === "editProject" && n.meta.projectId) {

            actionBtn = `<button type="button" class="notif-action-btn" data-notif-action="editProject" data-project-id="${n.meta.projectId}"><i class="fa-solid fa-pen" aria-hidden="true"></i> Edit</button>`;

        } else if (action === "login") {

            actionBtn = `<button type="button" class="notif-action-btn" data-notif-action="login"><i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Login</button>`;

        }

        item.innerHTML = `
            <i class="notif-icon ${NOTIF_ICON[n.type] || NOTIF_ICON.info}"></i>
            <div class="notif-body">
                <div class="notif-message"></div>
                <div class="notif-time">${timeAgo(n.createdAt)}</div>
                ${actionBtn}
            </div>
        `;

        item.querySelector(".notif-message").textContent = n.message;

        notifList.appendChild(item);

    });

}

/* ==========================================
   OPEN / CLOSE
========================================== */

function closeNotifModalFn() {

    closeModalEl(notifModal);

    document.body.classList.remove("modal-open");

}

/* ==========================================
   INIT
========================================== */

export function initNotificationsUI() {

    notifList.addEventListener("click", (e) => {

        const btn = e.target.closest(".notif-action-btn");

        if (!btn) return;

        const action = btn.dataset.notifAction;

        if (action === "editProject") {

            closeNotifModalFn();
            editProject(btn.dataset.projectId);

        } else if (action === "login") {

            closeNotifModalFn();
            showCloudAuthModal();

        }

    });

    notifBtn.addEventListener("click", () => {

        renderNotifList();

        openModalEl(notifModal);

        document.body.classList.add("modal-open");

        markAllNotificationsRead();

        refreshNotifBadge();

    });

    closeNotifModal.addEventListener("click", closeNotifModalFn);

    notifClearBtn.addEventListener("click", async () => {

        const confirmed = await showConfirm(t("notif.clearConfirm"), t("notif.clearBtn"));

        if (confirmed) {

            clearNotifications();

            renderNotifList();

            refreshNotifBadge();

        }

    });

    window.addEventListener(EVENTS.notification, refreshNotifBadge);

    refreshNotifBadge();

}
