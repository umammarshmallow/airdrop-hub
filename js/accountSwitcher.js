/* ==========================================
   ACCOUNTSWITCHER.JS
   Kotak "Pindah Akun": daftar akun yang pernah login di
   perangkat ini. Ketuk akun untuk berpindah tanpa login ulang,
   atau tambah akun baru. Logika sesi ada di cloudSync.js dan
   daftar akunnya di accounts.js.
========================================== */

import { openModalEl, closeModalEl } from "./modalAnim.js";
import { showToast } from "./uiFeedback.js";
import { showConfirm } from "./dialog.js";
import { getSavedAccounts } from "./accounts.js";
import {
    getCurrentUser,
    flushCurrentAccount,
    switchToAccount,
    removeSavedAccount
} from "./cloudSync.js";
import { showCloudAuthModal, setCloudAuthMode } from "./authUI.js";
import { MAX_SAVED_ACCOUNTS } from "./constants.js";
import { t } from "./i18n.js";

const modal = document.getElementById("accountSwitcherModal");
const currentBox = document.getElementById("accountCurrent");
const othersToggle = document.getElementById("accountOthersToggle");
const othersLabel = document.getElementById("accountOthersLabel");
const othersList = document.getElementById("accountOthersList");
const addBtn = document.getElementById("accountAddBtn");
const closeBtn = document.getElementById("closeAccountSwitcher");

let busy = false;

/* ==========================================
   RENDER
========================================== */

function avatarLetter(email) {

    const first = (email || "?").trim().charAt(0);

    return first ? first.toUpperCase() : "?";

}

function providerLabel(provider) {

    return provider === "google" ? t("account.provider.google") : t("account.provider.password");

}

function buildRow({ email, provider, app }, { current }) {

    const row = document.createElement("div");

    row.className = "acct-row" + (current ? " is-current" : "");

    const avatar = document.createElement("div");
    avatar.className = "acct-avatar";
    avatar.textContent = avatarLetter(email);

    const info = document.createElement("div");
    info.className = "acct-info";

    const emailEl = document.createElement("div");
    emailEl.className = "acct-email";
    emailEl.textContent = email;

    const meta = document.createElement("div");
    meta.className = "acct-meta";
    meta.textContent = providerLabel(provider);

    info.append(emailEl, meta);

    row.append(avatar, info);

    if (current) {

        const badge = document.createElement("span");
        badge.className = "acct-badge";
        badge.textContent = t("account.current");

        row.append(badge);

        return row;

    }

    row.setAttribute("role", "button");
    row.tabIndex = 0;
    row.dataset.app = app;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "acct-remove";
    remove.setAttribute("aria-label", t("account.remove"));
    remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    remove.addEventListener("click", (e) => {

        e.stopPropagation();

        handleRemove({ email, app });

    });

    row.append(remove);

    const activate = () => handleSwitch(app);

    row.addEventListener("click", activate);

    row.addEventListener("keydown", (e) => {

        if (e.key === "Enter" || e.key === " ") {

            e.preventDefault();

            activate();

        }

    });

    return row;

}

function render() {

    const user = getCurrentUser();
    const saved = getSavedAccounts();

    currentBox.innerHTML = "";

    // Akun yang sedang dipakai (login) selalu di atas.
    if (user) {

        const entry = saved.find((a) => a.uid === user.uid);

        currentBox.append(buildRow({
            email: user.email || (entry ? entry.email : ""),
            provider: entry ? entry.provider : "password",
            app: entry ? entry.app : ""
        }, { current: true }));

    }

    currentBox.style.display = user ? "" : "none";

    const others = saved.filter((a) => !user || a.uid !== user.uid);

    othersLabel.textContent = t("account.others").replace("{n}", String(others.length));

    othersList.innerHTML = "";

    if (others.length === 0) {

        const empty = document.createElement("p");
        empty.className = "acct-empty";
        empty.textContent = t("account.noOthers");

        othersList.append(empty);

    } else {

        others.forEach((a) => othersList.append(buildRow(a, { current: false })));

    }

    addBtn.disabled = busy;

}

/* ==========================================
   AKSI
========================================== */

// Pastikan perubahan akun sekarang sudah masuk cloud sebelum ditinggalkan.
// Kalau gagal (offline/lambat), tanya dulu supaya tidak ada kejutan.
async function safeToLeave() {

    const synced = await flushCurrentAccount();

    if (synced) return true;

    return showConfirm(t("account.unsyncedConfirm"), t("profile.switchAccount"));

}

async function handleSwitch(appName) {

    if (busy) return;

    busy = true;

    modal.classList.add("is-busy");

    try {

        if (!(await safeToLeave())) return;

        const result = await switchToAccount(appName);

        if (result.ok) {

            showToast(t("account.switching"), 1500);

            setTimeout(() => location.reload(), 400);

            return;

        }

        if (result.reason === "expired" && result.entry) {

            showToast(t("account.expired"), 3500, "warning");

            closeAccountSwitcher();

            setCloudAuthMode("login");

            // login ulang di slot yang sama, email sudah terisi
            setTimeout(() => showCloudAuthModal({ email: result.entry.email, reuseApp: result.entry.app }), 240);

            return;

        }

        showToast(t("account.timeout"), 3500, "warning");

    } finally {

        busy = false;

        modal.classList.remove("is-busy");

    }

}

async function handleRemove({ email, app }) {

    if (busy) return;

    const confirmed = await showConfirm(
        t("account.removeConfirm").replace("{email}", email),
        t("account.remove")
    );

    if (!confirmed) return;

    busy = true;

    try {

        await removeSavedAccount(app);

        showToast(t("account.removed"));

    } finally {

        busy = false;

    }

    render();

}

async function handleAdd() {

    if (busy) return;

    if (getSavedAccounts().length >= MAX_SAVED_ACCOUNTS) {

        showToast(t("account.limit").replace("{n}", String(MAX_SAVED_ACCOUNTS)), 3500, "warning");

        return;

    }

    busy = true;

    try {

        if (!(await safeToLeave())) return;

    } finally {

        busy = false;

    }

    closeAccountSwitcher();

    setCloudAuthMode("login");

    setTimeout(() => showCloudAuthModal(), 240);

}

/* ==========================================
   OPEN / CLOSE
========================================== */

// Menu Settings (kalau sedang terbuka) sengaja TIDAK ditutup: kotak ini
// tampil di atasnya, jadi saat ditutup pengguna kembali ke Settings.
export function openAccountSwitcher() {

    render();

    othersToggle.setAttribute("aria-expanded", "true");
    othersList.style.display = "";

    openModalEl(modal);

}

export function closeAccountSwitcher() {

    closeModalEl(modal);

}

export function initAccountSwitcher() {

    if (!modal) return;

    closeBtn.addEventListener("click", closeAccountSwitcher);

    addBtn.addEventListener("click", handleAdd);

    othersToggle.addEventListener("click", () => {

        const expanded = othersToggle.getAttribute("aria-expanded") === "true";

        othersToggle.setAttribute("aria-expanded", expanded ? "false" : "true");

        othersList.style.display = expanded ? "none" : "";

    });

    modal.addEventListener("click", (e) => {

        if (e.target === modal) closeAccountSwitcher();

    });

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape" && modal.classList.contains("show")) closeAccountSwitcher();

    });

}
