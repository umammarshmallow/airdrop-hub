/* ==========================================
   SETTINGS.JS
   Pengaturan tampilan: mode gelap/terang dan
   bahasa (ID / EN).
========================================== */

import { getLang, setLang, applyStaticTranslations, t } from "./i18n.js";
import { refreshCloudAuthTexts } from "./authUI.js";
import { refreshProjectsView } from "./projectsView.js";
import { STORAGE_KEYS, FEEDBACK_EMAIL } from "./constants.js";
import { openModalEl, closeModalEl } from "./modalAnim.js";
import { showToast } from "./uiFeedback.js";

/* ==========================================
   DARK / LIGHT MODE
========================================== */

const darkModeToggle = document.getElementById("darkModeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeModeLabel = document.getElementById("themeModeLabel");

function applyTheme(theme) {

    document.body.classList.toggle("theme-light", theme === "light");

    darkModeToggle.checked = theme === "dark";

    const themeKey = theme === "dark" ? "settings.darkMode" : "settings.lightMode";

    if (themeIcon) {

        themeIcon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";

    }

    if (themeModeLabel) {

        themeModeLabel.setAttribute("data-i18n", themeKey);
        themeModeLabel.textContent = t(themeKey);

    }

}

/* ==========================================
   LANGUAGE (ID / EN)
========================================== */

function applyLang(lang, { refresh = true } = {}) {

    setLang(lang);

    // semua tombol bahasa (menu Settings + modal Login) dikelola bersama
    document.querySelectorAll("[data-lang]").forEach(btn => {

        btn.classList.toggle("active", btn.dataset.lang === lang);

    });

    applyStaticTranslations();

    // judul/deskripsi/tombol modal login bergantung pada mode (Login/Register)
    refreshCloudAuthTexts();

    if (refresh) refreshProjectsView(false);

}

/* ==========================================
   FEEDBACK & SARAN (email)
   Tombol di Settings membuka kotak pilihan:
   - Aplikasi email : mailto: (subjek & kerangka isi sudah terisi)
   - Gmail (web)    : halaman tulis email Gmail di tab baru
   - Salin alamat   : untuk Yahoo/Outlook/layanan lain
   Tidak ada data yang dikirim oleh website itu sendiri.
========================================== */

const feedbackModal = document.getElementById("feedbackModal");

function feedbackParts() {

    return {
        to: FEEDBACK_EMAIL,
        subject: encodeURIComponent(t("feedback.subject")),
        body: encodeURIComponent(t("feedback.body"))
    };

}

function openFeedbackModal() {

    const emailText = document.getElementById("feedbackEmailText");

    if (emailText) emailText.textContent = FEEDBACK_EMAIL;

    openModalEl(feedbackModal);

}

function closeFeedbackModal() {

    closeModalEl(feedbackModal);

}

function openMailApp() {

    const { to, subject, body } = feedbackParts();

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

}

function openGmailWeb() {

    const { to, subject, body } = feedbackParts();

    window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`,
        "_blank",
        "noopener"
    );

}

// Salin alamat email: Clipboard API butuh koneksi aman (https), jadi
// ada cadangan lewat textarea sementara untuk browser/konteks lain.
async function copyFeedbackEmail() {

    let copied = false;

    try {

        if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(FEEDBACK_EMAIL);

            copied = true;

        }

    } catch (error) { copied = false; }

    if (!copied) {

        const temp = document.createElement("textarea");

        temp.value = FEEDBACK_EMAIL;
        temp.setAttribute("readonly", "");
        temp.style.position = "fixed";
        temp.style.opacity = "0";

        document.body.appendChild(temp);
        temp.select();

        try { copied = document.execCommand("copy"); } catch (error) { copied = false; }

        temp.remove();

    }

    // modal ditutup dulu supaya toast (z-index lebih rendah) tidak tertutup
    closeFeedbackModal();

    if (copied) {

        showToast(t("feedback.copied"));

    } else {

        showToast(t("feedback.copyFailed").replace("{email}", FEEDBACK_EMAIL), 5000, "error");

    }

}

function initFeedback() {

    const feedbackBtn = document.getElementById("feedbackBtn");

    if (!feedbackBtn || !feedbackModal) return;

    feedbackBtn.addEventListener("click", openFeedbackModal);

    document.getElementById("closeFeedbackModal").addEventListener("click", closeFeedbackModal);

    // klik area gelap di luar kotak = tutup
    feedbackModal.addEventListener("click", (e) => {

        if (e.target === feedbackModal) closeFeedbackModal();

    });

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape" && feedbackModal.classList.contains("show")) closeFeedbackModal();

    });

    feedbackModal.querySelectorAll("[data-feedback]").forEach(btn => {

        btn.addEventListener("click", () => {

            const choice = btn.dataset.feedback;

            if (choice === "copy") {

                copyFeedbackEmail();

                return;

            }

            if (choice === "gmail") openGmailWeb();

            if (choice === "app") openMailApp();

            closeFeedbackModal();

        });

    });

}

/* ==========================================
   INIT
========================================== */

export function initSettings() {

    applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "dark");

    darkModeToggle.addEventListener("change", () => {

        const theme = darkModeToggle.checked ? "dark" : "light";

        localStorage.setItem(STORAGE_KEYS.theme, theme);

        applyTheme(theme);

    });

    initFeedback();

    applyLang(getLang(), { refresh: false });

    document.querySelectorAll("[data-lang]").forEach(btn => {

        btn.addEventListener("click", () => applyLang(btn.dataset.lang));

    });

}
