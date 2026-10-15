/* ==========================================
   PROFILEPAGE.JS
   Halaman profil: status login, logout, ganti
   akun, ganti password, dan hapus akun.
========================================== */

import {
    getCurrentUser,
    logoutCloud,
    changePassword,
    deleteAccountCloud,
    isEmailVerified,
    hasPasswordLogin
} from "./cloudSync.js";

import { showToast } from "./uiFeedback.js";
import { showConfirm } from "./dialog.js";
import { renderProjects } from "./render.js";
import { closeMenu, updateAddButtonVisibility } from "./nav.js";
import { showCloudAuthModal } from "./authUI.js";
import { openAccountSwitcher } from "./accountSwitcher.js";
import { getSavedAccounts } from "./accounts.js";
import { showVerifyEmailModal } from "./verifyEmail.js";
import { withUiTimeout } from "./asyncUtils.js";
import { t } from "./i18n.js";

/* ==========================================
   ELEMENT
========================================== */

const profileLoggedInView = document.getElementById("profileLoggedInView");
const profileLoggedOutView = document.getElementById("profileLoggedOutView");
const profileEmailDisplay = document.getElementById("profileEmailDisplay");
const profileAvatar = document.getElementById("profileAvatar");
const profileLoginBtn = document.getElementById("profileLoginBtn");
const profileLogoutBtn = document.getElementById("profileLogoutBtn");
const switchAccountBtn = document.getElementById("switchAccountBtn");
const profileLogoutWrap = document.getElementById("profileLogoutWrap");
const profileSyncBadge = document.getElementById("profileSyncBadge");
const profileVerifyBox = document.getElementById("profileVerifyBox");
const profileVerifyBtn = document.getElementById("profileVerifyBtn");
const securityPasswordCard = document.getElementById("securityPasswordCard");

const securityCurrentPassword = document.getElementById("securityCurrentPassword");
const securityNewPassword = document.getElementById("securityNewPassword");
const securityError = document.getElementById("securityError");
const securityUpdateBtn = document.getElementById("securityUpdateBtn");

const deleteAccountPassword = document.getElementById("deleteAccountPassword");
const deleteAccountError = document.getElementById("deleteAccountError");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

/* ==========================================
   RENDER
========================================== */

export function refreshProfilePage() {

    const user = getCurrentUser();

    if (user) {

        profileLoggedInView.style.display = "block";
        profileLoggedOutView.style.display = "none";
        profileLogoutWrap.style.display = "block";

        profileEmailDisplay.textContent = user.email;
        profileAvatar.textContent = user.email.charAt(0).toUpperCase();

        // Email belum diverifikasi -> cloud nonaktif: ganti lencana "Cloud sync
        // aktif" dengan ajakan verifikasi.
        const verified = isEmailVerified(user);

        profileSyncBadge.style.display = verified ? "" : "none";
        profileVerifyBox.style.display = verified ? "none" : "flex";

        // Akun Google tidak punya password: sembunyikan form ganti/konfirmasi
        // password (hapus akun memakai verifikasi ulang lewat Google).
        const passwordAccount = hasPasswordLogin(user);

        securityPasswordCard.style.display = passwordAccount ? "" : "none";
        deleteAccountPassword.style.display = passwordAccount ? "" : "none";

    } else {

        profileLoggedInView.style.display = "none";
        profileLoggedOutView.style.display = "block";
        profileLogoutWrap.style.display = "none";

        securityCurrentPassword.value = "";
        securityNewPassword.value = "";
        securityError.style.display = "none";

        deleteAccountPassword.value = "";
        deleteAccountError.style.display = "none";

    }

}

/* ==========================================
   LOGIN / LOGOUT / GANTI AKUN
========================================== */

async function handleLogout() {

    const user = getCurrentUser();

    if (!user) return;

    const confirmed = await showConfirm(
        t("cloud.logoutConfirm") + " " + user.email + t("cloud.logoutConfirmSuffix"),
        t("profile.logout")
    );

    if (confirmed) {

        // Hanya akun ini yang keluar (dihapus dari daftar akun perangkat).
        const remaining = await logoutCloud();

        refreshProfilePage();

        // Hak admin (kalau ada) hilang setelah logout -> render ulang
        // supaya tombol Edit/Delete/Add di Home ikut disembunyikan lagi.
        renderProjects();

        updateAddButtonVisibility();

        // Masih ada akun lain di perangkat ini -> tawarkan langsung berpindah.
        if (remaining.length > 0) {

            showToast(t("account.afterLogout"), 3000);

            openAccountSwitcher();

        } else {

            showToast(t("cloud.logoutSuccess"));

        }

    }

}

// Buka daftar akun yang pernah login di perangkat ini. Tidak ada logout:
// akun sekarang tetap login dan bisa dipakai lagi kapan saja.
function handleSwitchAccount() {

    openAccountSwitcher();

}

/* ==========================================
   GANTI PASSWORD
========================================== */

async function handleUpdatePassword() {

    const current = securityCurrentPassword.value;

    const next = securityNewPassword.value;

    if (!current || !next) {

        securityError.textContent = t("security.fieldsRequired");
        securityError.style.display = "block";

        return;

    }

    if (next.length < 6) {

        securityError.textContent = t("security.minLength");
        securityError.style.display = "block";

        return;

    }

    securityUpdateBtn.disabled = true;

    securityUpdateBtn.textContent = t("cloud.processing");

    try {

        await withUiTimeout(changePassword(current, next), 8000);

        securityCurrentPassword.value = "";
        securityNewPassword.value = "";
        securityError.style.display = "none";

        showToast(t("cloud.passwordChanged"));

    } catch (error) {

        console.error("[Security]", error);

        let msg = t("security.failed");

        if (error.message === "TIMEOUT") msg = t("security.timeout");
        else if (error.code && error.code.includes("wrong-password")) msg = t("security.wrongCurrent");
        else if (error.code && error.code.includes("weak-password")) msg = t("security.weakNew");

        securityError.textContent = msg;
        securityError.style.display = "block";

    }

    securityUpdateBtn.disabled = false;

    securityUpdateBtn.textContent = t("profile.updatePassword");

}

/* ==========================================
   HAPUS AKUN
========================================== */

async function handleDeleteAccount() {

    const password = deleteAccountPassword.value;

    // Akun Google tidak memakai password (verifikasi ulang lewat popup Google)
    if (hasPasswordLogin() && !password) {

        deleteAccountError.textContent = t("delete.passwordRequired");
        deleteAccountError.style.display = "block";

        return;

    }

    const user = getCurrentUser();

    const confirmed = await showConfirm(

        t("delete.confirm").replace("{email}", user ? user.email : ""),

        t("profile.deleteAccount")

    );

    if (!confirmed) return;

    deleteAccountBtn.disabled = true;

    deleteAccountBtn.textContent = t("delete.deleting");

    try {

        await withUiTimeout(deleteAccountCloud(password), 8000);

        showToast(t("delete.success"));

        setTimeout(() => location.reload(), 700);

        return;

    } catch (error) {

        console.error("[Security]", error);

        let msg = t("delete.failed");

        if (error.message === "TIMEOUT") msg = t("security.timeout");
        else if (error.code && error.code.includes("wrong-password")) msg = t("delete.wrongPassword");
        else if (error.code && error.code.includes("requires-recent-login")) msg = t("delete.recentLogin");

        deleteAccountError.textContent = msg;
        deleteAccountError.style.display = "block";

    }

    deleteAccountBtn.disabled = false;

    deleteAccountBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i> <span data-i18n="profile.deleteAccount">Delete Account</span>`;

}

/* ==========================================
   INIT
========================================== */

export function initProfilePage() {

    profileLoginBtn.addEventListener("click", () => {

        // Ada akun tersimpan di perangkat ini -> tampilkan daftarnya dulu
        // (dari sana tetap bisa menambah akun lain). Menu Settings dibiarkan
        // terbuka supaya menutup daftar ini kembali ke Settings.
        if (getSavedAccounts().length > 0) {

            openAccountSwitcher();

            return;

        }

        closeMenu();

        showCloudAuthModal();

    });

    profileVerifyBtn.addEventListener("click", () => {

        closeMenu();

        showVerifyEmailModal();

    });

    profileLogoutBtn.addEventListener("click", handleLogout);

    switchAccountBtn.addEventListener("click", handleSwitchAccount);

    securityUpdateBtn.addEventListener("click", handleUpdatePassword);

    deleteAccountBtn.addEventListener("click", handleDeleteAccount);

}
