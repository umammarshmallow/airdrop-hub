/* ==========================================
   CLOUDSTARTUP.JS
   Sinkronisasi cloud saat app dibuka. Jalan di
   background, TIDAK menahan tampilnya app.
========================================== */

import { initFirebaseApp, waitForPersistedSession, isEmailVerified } from "./cloudSync.js";

import { showToast } from "./uiFeedback.js";
import {
    addNotification,
    getNotifications,
    dismissNotificationsByAction
} from "./notifications.js";

import { t } from "./i18n.js";
import { showCloudAuthModal, closeCloudAuthModal } from "./authUI.js";
import { showVerifyEmailModal } from "./verifyEmail.js";
import { refreshProfilePage } from "./profilePage.js";
import { refreshNotifBadge } from "./notificationsUI.js";
import { refreshProjectsView, refreshHomeView } from "./projectsView.js";

// Kalau ternyata user sudah login & ada data cloud, tampilan
// otomatis di-refresh diam-diam begitu data cloud selesai ditarik.
export async function runCloudSyncInBackground() {

    try {

        // SDK Firebase baru di-download di sini (lazy), dan hanya
        // kalau firebaseConfig.js memang sudah diisi.
        const configured = await initFirebaseApp();

        if (!configured) return;

        // Home publik: tarik sekali di sini supaya tampil juga untuk
        // pengunjung yang belum/tidak login.
        await refreshHomeView();

        const existingUser = await waitForPersistedSession((lateUser) => {

            // Ternyata user memang masih login, cuma konfirmasinya
            // dari Firebase telat sedikit. Update tampilan diam-diam,
            // dan kalau modal login sempat kebuka karena dianggap
            // "belum login" tadi, tutup lagi sekarang.
            refreshProfilePage();

            dismissNotificationsByAction("login");
            refreshNotifBadge();

            closeCloudAuthModal();

            // Email belum diverifikasi -> cloud belum aktif, minta verifikasi
            if (!isEmailVerified(lateUser)) {

                showVerifyEmailModal();

                return;

            }

            showToast(t("cloud.activeAs") + " " + lateUser.email, 2500);

            refreshProjectsView(false);

        });

        if (existingUser) {

            refreshProfilePage();

            // Sudah login, peringatan "belum login" sebelumnya (kalau ada) sudah tidak relevan
            dismissNotificationsByAction("login");
            refreshNotifBadge();

            if (!isEmailVerified(existingUser)) {

                // Login tapi email belum diverifikasi: cloud tidak aktif,
                // app tetap jalan dengan data lokal.
                showVerifyEmailModal();

                return;

            }

            showToast(t("cloud.activeAs") + " " + existingUser.email, 2500);

            // Data lokal mungkin baru saja ditimpa oleh data cloud, refresh tampilan.
            refreshProjectsView(false);

        } else {

            showCloudAuthModal();
            refreshProfilePage();

            // Peringatan risiko kehilangan data cukup dikirim sekali,
            // tidak diulang tiap kali app dibuka
            const alreadyWarned = getNotifications().some(
                (n) => n.meta && n.meta.action === "login"
            );

            if (!alreadyWarned) {

                addNotification(
                    t("notif.loginWarning"),
                    "warning",
                    { action: "login" }
                );

                refreshNotifBadge();

            }

        }

    } catch (error) {

        console.warn("[CloudSync] Gagal sync di background, tetap pakai data lokal:", error);

    }

}
