/* ==========================================
   HELPERS.JS
========================================== */

import { showAlert } from "./dialog.js";
import { t } from "./i18n.js";
import { ICON_CHECK, ICON_XMARK } from "./icons.js";

/* ==========================
FORMAT URL
========================== */

/* ==========================
FORMAT URL (website project)
Alamat website yang disimpan user boleh ditulis tanpa
skema (mis. "example.com"), jadi perlu dilengkapi jadi URL
yang valid sebelum dipakai sebagai href.

Kenapa harus lewat allowlist skema yang eksplisit (bukan
sekadar "kalau belum ada http, tambahin https"):
skema seperti "javascript:" atau "data:" bisa dipakai untuk
menjalankan kode kalau nilainya lolos begitu saja dipasang
ke atribut href. Jadi kita SELALU pastikan hasil akhirnya
berskema http/https, apa pun input mentahnya.
========================== */

const ALLOWED_URL_SCHEMES = ["http:", "https:"];

export function formatUrl(url = "") {

    url = url.trim();

    if (url === "") return "#";

    // Coba anggap input sudah URL lengkap (ada skema eksplisit,
    // termasuk yang berbahaya seperti javascript:/data:).
    try {

        const parsed = new URL(url);

        if (ALLOWED_URL_SCHEMES.includes(parsed.protocol)) {

            return parsed.href;

        }

        // Skema tidak diizinkan (mis. javascript:, data:) -> jangan
        // dipakai mentah-mentah, coba lagi anggap ini domain biasa.

    } catch (error) {

        // Bukan URL lengkap yang valid (kemungkinan besar cuma
        // domain, mis. "example.com") -> lanjut ke fallback di bawah.

    }

    // Fallback: perlakukan sebagai domain tanpa skema, paksa https.
    try {

        const parsed = new URL("https://" + url.replace(/^\/+/, ""));

        return parsed.href;

    } catch (error) {

        // Input tidak bisa dibentuk jadi URL valid sama sekali.
        return "#";

    }

}

/* ==========================
ESCAPE HTML
Menetralkan tanda kurung < > & kutip pada teks yang
berasal dari input user (nama project, catatan, alamat
wallet, dll) sebelum ditempel lewat innerHTML, supaya
tidak bisa disusupi tag/atribut/script asing (XSS).
========================== */

export function escapeHTML(value) {

    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}

/* ==========================
QUICK FILTER PREDICATES
(dipakai bareng oleh dashboard.js untuk hitung,
dan project.js untuk filter list)
========================== */

export function isTaskDueToday(project) {

    if (project.status !== "Active") return false;

    switch (project.taskType) {

        case "Daily":
            return !project.dailyDone;

        case "Weekly":
            return isTodayWeeklyTask(project) && !project.dailyDone;

        case "Testnet":
        case "Mainnet":
            return !project.dailyDone;

        default:
            return false;

    }

}

export function isDeadlineToday(project) {

    if (!project.deadline) return false;

    const now = new Date();
    const dl = new Date(project.deadline);

    return (
        dl.getFullYear() === now.getFullYear() &&
        dl.getMonth() === now.getMonth() &&
        dl.getDate() === now.getDate()
    );

}

function isTodayWeeklyTask(project) {

    if (!project.deadline) return true;

    const deadline = new Date(project.deadline);
    const today = new Date();

    return deadline.getDay() === today.getDay();

}

/* ==========================
FORMAT DATE
========================== */

export function formatDate(timestamp) {

    if (!timestamp) return "-";

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-US", {

        day: "numeric",
        month: "short",
        year: "numeric"

    });

}

/* ==========================
TOAST
========================== */

export function showToast(message, duration = 2500, type = "success") {

    const toast = document.getElementById("toast");
    const text = document.getElementById("toastText");
    const icon = document.getElementById("toastIcon");

    if (!toast || !text) return;

    text.textContent = message;

    if (icon) {

        icon.innerHTML = type === "error" ? ICON_XMARK : ICON_CHECK;

    }

    toast.classList.toggle("toast-error", type === "error");

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, duration);

}

/* ==========================
NOTIFICATION CENTER
(riwayat error/peringatan sistem, terpisah dari toast sekilas)
========================== */

const NOTIF_KEY = "airdropHub_notifications";
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

    localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, MAX_NOTIFS)));

    window.dispatchEvent(new CustomEvent("airdrophub:notification"));

}

export function getNotifications() {

    try {

        const raw = localStorage.getItem(NOTIF_KEY);
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

    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent("airdrophub:notification"));

}

export function clearNotifications() {

    localStorage.setItem(NOTIF_KEY, "[]");

    window.dispatchEvent(new CustomEvent("airdrophub:notification"));

}

export function dismissNotificationsByAction(action) {

    const list = getNotifications().filter(
        (n) => !(n.meta && n.meta.action === action)
    );

    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent("airdrophub:notification"));

}

/* ==========================
LOADING
========================== */

export function showLoading() {

    const loading = document.getElementById("loading");

    if (loading) {

        loading.style.display = "flex";

    }

}

export function hideLoading() {

    const loading = document.getElementById("loading");

    if (loading) {

        loading.style.display = "none";

    }

}

/* ==========================
CLEAR ADD FORM
========================== */

export function clearAddForm() {

    document.getElementById("name").value = "";

    document.getElementById("network").value = "";

    document.getElementById("website").value = "";

    document.getElementById("deadline").value = "";

    document.getElementById("note").value = "";

    document.getElementById("taskType").selectedIndex = 0;

    document.getElementById("priority").selectedIndex = 0;

    document.getElementById("status").selectedIndex = 0;

}

/* ==========================
VALIDASI PROJECT
========================== */

/* ==========================
VALIDASI PROJECT
========================== */

export async function validateProject(project) {

    if (!project.name.trim()) {

        await showAlert(t("project.nameRequired"));

        return false;

    }

    if (!project.network.trim()) {

        await showAlert(t("project.chainRequired"));

        return false;

    }

    return true;

}

/* ==========================
SORT PROJECT
========================== */

export function sortProjects(projects, mode = "default") {

    if (mode === "deadline") {

        return [...projects].sort((a, b) => {

            if (!a.deadline && !b.deadline)
                return a.name.localeCompare(b.name, "en");

            if (!a.deadline) return 1;
            if (!b.deadline) return -1;

            return new Date(a.deadline) - new Date(b.deadline);

        });

    }

    if (mode === "newest") {

        return [...projects].sort(
            (a, b) => b.id - a.id
        );

    }

    const statusOrder = {

        Active: 1,
        Waitlist: 2,
        Pending: 3,
        Complete: 4

    };

    return [...projects].sort((a, b) => {

        const statusA = statusOrder[a.status] ?? 999;
        const statusB = statusOrder[b.status] ?? 999;

        if (statusA !== statusB)
            return statusA - statusB;

        return a.name.localeCompare(
            b.name,
            "en",
            { sensitivity: "base" }
        );

    });

}

/* ==========================
STATUS COLOR
========================== */

export function statusClass(status) {

    switch (status) {

        case "Active":
            return "active";

        case "Pending":
            return "pending";

        case "Waitlist":
            return "waitlist";

        case "Complete":
            return "complete";

        default:
            return "";

    }

  }

/* ==========================
STATUS LABEL (untuk ditampilkan)
========================== */

export function statusLabel(status) {

    switch (status) {

        case "Active": return t("project.active");
        case "Pending": return t("project.pending");
        case "Waitlist": return t("project.waitlist");
        case "Complete": return t("project.complete");
        default: return status;

    }

}
