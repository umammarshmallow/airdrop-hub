/* ==========================================
   NOTIFICATIONS.JS
   Penyimpanan Notification Center: riwayat
   error/peringatan sistem, terpisah dari toast
   sekilas. (Tampilannya ada di notificationsUI.js)
========================================== */

import { STORAGE_KEYS, EVENTS } from "./constants.js";

const MAX_NOTIFS = 20;

export function addNotification(message, type = "info", meta = null) {

    const list = getNotifications();

    list.unshift({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        message,
        type, // "info" | "warning" | "error"
        meta, // data tambahan, mis. { action: "editProject", projectId }
        createdAt: new Date().toISOString(),
        read: false
    });

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list.slice(0, MAX_NOTIFS)));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}

export function getNotifications() {

    try {

        const raw = localStorage.getItem(STORAGE_KEYS.notifications);
        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        return [];

    }

}

export function unreadNotificationCount() {

    return getNotifications().filter((n) => !n.read).length;

}

export function markAllNotificationsRead() {

    const list = getNotifications().map((n) => ({ ...n, read: true }));

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}

export function clearNotifications() {

    localStorage.setItem(STORAGE_KEYS.notifications, "[]");

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}

export function dismissNotificationsByAction(action) {

    const list = getNotifications().filter(
        (n) => !(n.meta && n.meta.action === action)
    );

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}
