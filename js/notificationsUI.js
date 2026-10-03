/* ==========================================
   NOTIFICATIONSUI.JS
   Tampilan Notification Center: badge di header,
   modal daftar notifikasi, dan tombol aksinya.
   (Penyimpanan datanya ada di notifications.js)
========================================== */

import {
    getNotifications,
    unreadNotificationCount,
    markNotificationRead,
    removeNotification,
    markAllNotificationsRead,
    clearReadNotifications,
    updateNotificationMeta
} from "./notifications.js";

import { openModalEl, closeModalEl } from "./modalAnim.js";
import { showConfirm } from "./dialog.js";
import { editProject, canSyncHomeEdit, syncHomeEdit } from "./project.js";
import { renderProjects } from "./render.js";
import { showToast } from "./uiFeedback.js";
import { showCloudAuthModal } from "./authUI.js";
import { t } from "./i18n.js";
import { escapeHTML } from "./formatters.js";
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
const notifMarkAllBtn = document.getElementById("notifMarkAllBtn");

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

// Tombol footer hanya aktif kalau memang ada yang bisa diproses:
// "Tandai semua dibaca" butuh notifikasi belum dibaca, "Hapus yang dibaca"
// butuh notifikasi yang sudah dibaca.
function updateNotifFooter(list) {

    notifMarkAllBtn.disabled = !list.some((n) => !n.read);

    notifClearBtn.disabled = !list.some((n) => n.read);

}

function renderNotifList() {

    const list = getNotifications();

    updateNotifFooter(list);

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

        } else if (action === "syncHomeEdit") {

            if (n.meta.done) {

                actionBtn = `<div class="notif-time"><i class="fa-solid fa-check" aria-hidden="true"></i> ${escapeHTML(t("notif.updatedDone"))}</div>`;

            } else if (canSyncHomeEdit(n.meta)) {

                actionBtn = `<button type="button" class="notif-action-btn" data-notif-action="syncHomeEdit" data-notif-id="${escapeHTML(n.id)}"><i class="fa-solid fa-rotate" aria-hidden="true"></i> ${escapeHTML(t("notif.updateBtn"))}</button>`;

            }

        }

        const readBtn = n.read
            ? ""
            : `<button type="button" class="notif-read-btn" data-notif-read="${escapeHTML(n.id)}"><i class="fa-solid fa-check" aria-hidden="true"></i> ${escapeHTML(t("notif.markRead"))}</button>`;

        const dismissLabel = escapeHTML(t("notif.dismiss"));

        item.innerHTML = `
            <i class="notif-icon ${NOTIF_ICON[n.type] || NOTIF_ICON.info}"></i>
            <div class="notif-body">
                <div class="notif-message"></div>
                <div class="notif-time">${timeAgo(n.createdAt)}</div>
                <div class="notif-actions">${actionBtn}${readBtn}</div>
            </div>
            <button type="button" class="notif-dismiss-btn" data-notif-dismiss="${escapeHTML(n.id)}" aria-label="${dismissLabel}" title="${dismissLabel}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
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

        const readBtn = e.target.closest(".notif-read-btn");

        if (readBtn) {

            markNotificationRead(readBtn.dataset.notifRead);
            renderNotifList();
            return;

        }

        const dismissBtn = e.target.closest(".notif-dismiss-btn");

        if (dismissBtn) {

            removeNotification(dismissBtn.dataset.notifDismiss);
            renderNotifList();
            return;

        }

        const btn = e.target.closest(".notif-action-btn");

        if (!btn) return;

        const action = btn.dataset.notifAction;

        if (action === "editProject") {

            closeNotifModalFn();
            editProject(btn.dataset.projectId);

        } else if (action === "login") {

            closeNotifModalFn();
            showCloudAuthModal();

        } else if (action === "syncHomeEdit") {

            const notif = getNotifications().find((n) => n.id === btn.dataset.notifId);

            if (!notif) return;

            const result = syncHomeEdit(notif.meta);

            if (result === "ok") {

                updateNotificationMeta(notif.id, { done: true });
                renderProjects();
                renderNotifList();
                showToast(t("notif.updatedToast"));

            } else {

                renderNotifList();
                showToast(t(result === "noHome" ? "notif.updateNoHome" : "notif.updateNoCopy"), 3000, "error");

            }

        }

    });

    notifBtn.addEventListener("click", () => {

        renderNotifList();

        openModalEl(notifModal);

        document.body.classList.add("modal-open");

        // Notifikasi tidak lagi otomatis dianggap dibaca saat panel dibuka;
        // user menandainya sendiri lewat tombol "Tandai dibaca".
        refreshNotifBadge();

    });

    closeNotifModal.addEventListener("click", closeNotifModalFn);

    notifMarkAllBtn.addEventListener("click", () => {

        markAllNotificationsRead();

        renderNotifList();

        refreshNotifBadge();

    });

    notifClearBtn.addEventListener("click", async () => {

        const confirmed = await showConfirm(t("notif.clearConfirm"), t("notif.clearBtn"));

        if (confirmed) {

            clearReadNotifications();

            renderNotifList();

            refreshNotifBadge();

        }

    });

    window.addEventListener(EVENTS.notification, refreshNotifBadge);

    refreshNotifBadge();

}
