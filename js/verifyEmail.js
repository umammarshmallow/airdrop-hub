/* ==========================================
   VERIFYEMAIL.JS
   Modal "Verifikasi email". Akun email/password baru wajib
   memverifikasi emailnya (klik link yang dikirim Firebase)
   sebelum sinkronisasi cloud aktif. Sebelum itu app tetap
   bisa dipakai secara lokal.
========================================== */

import { openModalEl, closeModalEl } from "./modalAnim.js";
import { showToast } from "./uiFeedback.js";
import {
    getCurrentUser,
    sendVerificationEmail,
    checkEmailVerified,
    logoutCloud
} from "./cloudSync.js";
import { withUiTimeout } from "./asyncUtils.js";
import { getLang, t } from "./i18n.js";
import { showCloudAuthModal, setCloudAuthMode } from "./authUI.js";

/* ==========================================
   ELEMENT
========================================== */

const verifyModal = document.getElementById("verifyModal");
const verifyEmailShown = document.getElementById("verifyEmailShown");
const verifyError = document.getElementById("verifyError");
const verifyCheckBtn = document.getElementById("verifyCheckBtn");
const verifyResendBtn = document.getElementById("verifyResendBtn");
const verifyLaterBtn = document.getElementById("verifyLaterBtn");
const verifySwitchBtn = document.getElementById("verifySwitchBtn");

const RESEND_COOLDOWN_SECONDS = 60;

let resendTimer = null;

let onLogout = null;

/* ==========================================
   UI STATE
========================================== */

function setVerifyError(message) {

    verifyError.textContent = message || "";
    verifyError.style.display = message ? "block" : "none";

}

function setResendLabel(secondsLeft) {

    verifyResendBtn.textContent = secondsLeft > 0
        ? t("verify.resendIn").replace("{s}", secondsLeft)
        : t("verify.resend");

}

// Jeda antar pengiriman ulang supaya tidak kena batas kirim Firebase.
function startResendCooldown() {

    clearInterval(resendTimer);

    let left = RESEND_COOLDOWN_SECONDS;

    verifyResendBtn.disabled = true;

    setResendLabel(left);

    resendTimer = setInterval(() => {

        left -= 1;

        if (left <= 0) {

            clearInterval(resendTimer);

            verifyResendBtn.disabled = false;

        }

        setResendLabel(left);

    }, 1000);

}

export function showVerifyEmailModal() {

    const user = getCurrentUser();

    if (!user) return;

    verifyEmailShown.textContent = user.email;

    setVerifyError("");

    openModalEl(verifyModal);

    document.body.classList.add("modal-open");

}

function closeVerifyModal() {

    closeModalEl(verifyModal);

    document.body.classList.remove("modal-open");

}

/* ==========================================
   AKSI
========================================== */

async function handleCheck() {

    setVerifyError("");

    verifyCheckBtn.disabled = true;

    try {

        const verified = await withUiTimeout(checkEmailVerified(), 12000);

        if (verified) {

            closeVerifyModal();

            showToast(t("cloud.loginSuccess"));

            setTimeout(() => location.reload(), 700);

            return;

        }

        setVerifyError(t("verify.notYet"));

    } catch (error) {

        console.error("[VerifyEmail]", error);

        setVerifyError(error.message === "TIMEOUT" ? t("cloud.timeout") : t("verify.failed"));

    }

    verifyCheckBtn.disabled = false;

}

async function handleResend() {

    setVerifyError("");

    verifyResendBtn.disabled = true;

    try {

        await withUiTimeout(sendVerificationEmail(getLang()), 10000);

        showToast(t("verify.sent"));

        startResendCooldown();

        return;

    } catch (error) {

        console.error("[VerifyEmail]", error);

        const code = (error && error.code) || "";

        if (code.includes("too-many-requests")) setVerifyError(t("verify.tooMany"));
        else if (error.message === "TIMEOUT") setVerifyError(t("cloud.timeout"));
        else setVerifyError(t("verify.failed"));

    }

    verifyResendBtn.disabled = false;

}

async function handleSwitchAccount() {

    await logoutCloud();

    if (typeof onLogout === "function") onLogout();

    closeVerifyModal();

    setCloudAuthMode("login");

    // tunggu animasi tutup modal ini selesai, baru buka modal login
    setTimeout(() => showCloudAuthModal(), 240);

}

/* ==========================================
   INIT
   onLogout: callback opsional setelah user keluar dari modal ini
   (mis. refresh halaman profil).
========================================== */

export function initVerifyEmail({ onLogout: logoutCallback } = {}) {

    onLogout = logoutCallback;

    verifyCheckBtn.addEventListener("click", handleCheck);

    verifyResendBtn.addEventListener("click", handleResend);

    verifyLaterBtn.addEventListener("click", () => {

        closeVerifyModal();

        showToast(t("verify.laterToast"), 4000, "warning");

    });

    verifySwitchBtn.addEventListener("click", handleSwitchAccount);

}
