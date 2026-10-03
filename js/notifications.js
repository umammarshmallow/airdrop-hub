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

// Hanya menghapus notifikasi yang SUDAH dibaca; yang belum dibaca tetap
// ada (dan titik merah di lonceng tetap menyala).
export function clearReadNotifications() {

    const list = getNotifications().filter((n) => !n.read);

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}

export function dismissNotificationsByAction(action) {

    const list = getNotifications().filter(
        (n) => !(n.meta && n.meta.action === action)
    );

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}

// Menggabungkan data baru ke meta satu notifikasi (mis. { done: true }
// setelah tombol "Perbarui" dipakai).
export function updateNotificationMeta(id, patch) {

    const list = getNotifications().map((n) => (
        n.id === id ? { ...n, meta: { ...(n.meta || {}), ...patch } } : n
    ));

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}

export function markNotificationRead(id) {

    const list = getNotifications().map((n) => (
        n.id === id ? { ...n, read: true } : n
    ));

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}

export function removeNotification(id) {

    const list = getNotifications().filter((n) => n.id !== id);

    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent(EVENTS.notification));

}
