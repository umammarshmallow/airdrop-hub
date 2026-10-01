/* ==========================================
   FORGOTPASSWORD.JS
   Lupa password: kirim link reset via email
   (fitur bawaan Firebase).
========================================== */

import { openModalEl, closeModalEl } from "./modalAnim.js";
import { sendResetEmail } from "./cloudSync.js";
import { withUiTimeout } from "./asyncUtils.js";
import { getLang, t } from "./i18n.js";
import {
    showCloudAuthModal,
    closeCloudAuthModal,
    getCloudAuthEmail
} from "./authUI.js";

/* ==========================================
   ELEMENT
========================================== */

const forgotModal = document.getElementById("forgotModal");
const forgotEmail = document.getElementById("forgotEmail");
const forgotError = document.getElementById("forgotError");
const forgotEmailShown = document.getElementById("forgotEmailShown");
const forgotBackBtn = document.getElementById("forgotBackBtn");
const forgotPrimaryBtn = document.getElementById("forgotPrimaryBtn");
const forgotStep1 = document.getElementById("forgotStep1");
const forgotStep2 = document.getElementById("forgotStep2");
const forgotLink = document.getElementById("cloudAuthForgotLink");

let forgotSent = false;

/* ==========================================
   UI STATE
========================================== */

function setForgotError(message) {

    forgotError.textContent = message || "";
    forgotError.style.display = message ? "block" : "none";

}

function showForgotStep(sent) {

    forgotSent = sent;

    forgotStep1.style.display = sent ? "none" : "block";
    forgotStep2.style.display = sent ? "block" : "none";

    forgotPrimaryBtn.textContent = t(sent ? "forgot.backToLogin" : "forgot.sendLink");
    forgotBackBtn.style.display = sent ? "none" : "";

    setForgotError("");

}

function friendlyResetError(error) {

    const code = (error && error.code) || "";
    const msg = (error && error.message) || "";

    if (msg === "NOT_CONFIGURED") return t("forgot.notConfigured");
    if (msg === "TIMEOUT") return "Koneksi ke server lambat/gagal. Periksa jaringan lalu coba lagi.";
    if (code.includes("invalid-email")) return t("forgot.invalidEmail");
    if (code.includes("too-many-requests")) return t("forgot.tooMany");

    return t("forgot.failed");

}

function closeForgotModal() {

    closeModalEl(forgotModal);

    // kembali ke modal login setelah animasi tutup selesai
    setTimeout(() => { showCloudAuthModal(); }, 240);

}

/* ==========================================
   KIRIM LINK RESET
========================================== */

async function forgotSend() {

    const email = forgotEmail.value.trim();

    if (!email) { setForgotError(t("forgot.emailRequired")); return; }

    forgotPrimaryBtn.disabled = true;
    forgotBackBtn.disabled = true;

    try {

        await withUiTimeout(sendResetEmail(email, getLang()), 10000);

        forgotEmailShown.textContent = email;
        showForgotStep(true);

    } catch (error) {

        // Firebase bisa membalas "user-not-found" untuk email yang belum
        // terdaftar; dianggap sukses supaya email terdaftar tidak bisa ditebak.
        if (error && error.code && error.code.includes("user-not-found")) {

            forgotEmailShown.textContent = email;
            showForgotStep(true);

        } else {

            console.error("[ForgotPassword]", error);
            setForgotError(friendlyResetError(error));

        }

    } finally {

        forgotPrimaryBtn.disabled = false;
        forgotBackBtn.disabled = false;

    }

}

/* ==========================================
   INIT
========================================== */

export function initForgotPassword() {

    forgotPrimaryBtn.addEventListener("click", () => {

        if (forgotSent) return closeForgotModal();

        return forgotSend();

    });

    forgotBackBtn.addEventListener("click", closeForgotModal);

    forgotLink.addEventListener("click", (e) => {

        e.preventDefault();

        forgotEmail.value = getCloudAuthEmail();

        showForgotStep(false);

        closeCloudAuthModal();

        // tunggu animasi tutup modal login selesai, baru buka modal ini
        setTimeout(() => {

            openModalEl(forgotModal);
            document.body.classList.add("modal-open");

        }, 240);

    });

}
