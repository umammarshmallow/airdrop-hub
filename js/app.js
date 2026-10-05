/* ==========================================
   AIRDROP HUB
   APP.JS — entry point

   Hanya merakit modul-modul fitur dan menjalankan
   urutan start-up. Logika tiap fitur ada di:
   - nav.js             bottom nav, side menu, halaman Security
   - settings.js        tema gelap/terang & bahasa
   - pwa.js             install prompt & service worker
   - notificationsUI.js Notification Center
   - authUI.js          modal Login / Daftar
   - forgotPassword.js  lupa password
   - profilePage.js     profil, logout, keamanan akun
   - projectsView.js    refresh daftar project
   - cloudStartup.js    sinkronisasi cloud di background
========================================== */

import { initEvents } from "./event.js";
import { showLoading, hideLoading, showToast } from "./uiFeedback.js";
import { initFuzzyText } from "./fuzzyText.js";
import { initDialog } from "./dialog.js";
import { initNav } from "./nav.js";
import { initSettings } from "./settings.js";
import { initPwa } from "./pwa.js";
import { initNotificationsUI } from "./notificationsUI.js";
import { initAuthUI } from "./authUI.js";
import { initForgotPassword } from "./forgotPassword.js";
import { initVerifyEmail, showVerifyEmailModal } from "./verifyEmail.js";
import { initProfilePage, refreshProfilePage } from "./profilePage.js";
import { refreshProjectsView } from "./projectsView.js";
import { runCloudSyncInBackground } from "./cloudStartup.js";

/* ==========================================
   SETUP FITUR (jalan saat modul dimuat)
========================================== */

initNav();
initSettings();
initPwa();
initNotificationsUI();
initAuthUI({
    onAuthenticated: refreshProfilePage,
    onNeedsVerification: showVerifyEmailModal
});
initVerifyEmail({ onLogout: refreshProfilePage });
initForgotPassword();
initProfilePage();

/* ==========================================
   INITIALIZE APPLICATION
========================================== */

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        // Dulu logic di sini ditulis ulang terpisah dari
        // refreshProjectsView() sehingga auto-delete project
        // stale bisa terjadi tanpa notifikasi ke user.
        // Sekarang disatukan supaya toast/notifikasi selalu muncul.
        refreshProjectsView();

    }

});

document.addEventListener("DOMContentLoaded", async () => {

    showLoading();

    initDialog();

    try {

        // Siapkan koneksi Firebase (kalau sudah dikonfigurasi), tapi JANGAN
        // ditunggu (await) di sini — biar app langsung tampil pakai data
        // lokal dulu, cloud sync (termasuk download SDK-nya) menyusul
        // di belakang layar.
        runCloudSyncInBackground();

        /* memastikan data localStorage terbaca */

        refreshProjectsView();

        /* semua event */

        initEvents();

        // Efek fuzzy pada wordmark "Hub"
        const hubCanvas = document.getElementById("hubFuzzyText");
        if (hubCanvas) initFuzzyText(hubCanvas, "Hub");

        // Mengecek pergantian hari setiap 1 menit
        setInterval(() => {

            refreshProjectsView();

        }, 60000);

    } catch (error) {

        console.error(error);

        showToast("Something went wrong while loading the app.", 4000, "error");

    } finally {

        hideLoading();

    }

});

/* ==========================================
   ONLINE / OFFLINE
========================================== */

window.addEventListener("offline", () => {

    console.warn("Offline Mode");

});
