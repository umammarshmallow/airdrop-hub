/* ==========================================
   SETTINGS.JS
   Pengaturan tampilan: mode gelap/terang dan
   bahasa (ID / EN).
========================================== */

import { getLang, setLang, applyStaticTranslations, t } from "./i18n.js";
import { refreshCloudAuthTexts } from "./authUI.js";
import { refreshProjectsView } from "./projectsView.js";
import { STORAGE_KEYS, FEEDBACK_EMAIL, APPRECIATION_WALLET } from "./constants.js";
import { QR_ADDRESS, QR_ROWS } from "./appreciationQr.js";
import { openSettingsPage, closeSettingsPageIfOpen } from "./nav.js";
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

const feedbackPage = document.getElementById("feedbackPage");

function feedbackParts() {

    return {
        to: FEEDBACK_EMAIL,
        subject: encodeURIComponent(t("feedback.subject")),
        body: encodeURIComponent(t("feedback.body"))
    };

}

function openFeedbackPage() {

    const emailText = document.getElementById("feedbackEmailText");

    if (emailText) emailText.textContent = FEEDBACK_EMAIL;

    openSettingsPage(feedbackPage);

}

function closeFeedbackPage() {

    closeSettingsPageIfOpen(feedbackPage);

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

    // halaman ditutup dulu supaya pengguna kembali ke Settings dan langsung melihat toast
    closeFeedbackPage();

    if (copied) {

        showToast(t("feedback.copied"));

    } else {

        showToast(t("feedback.copyFailed").replace("{email}", FEEDBACK_EMAIL), 5000, "error");

    }

}

function initFeedback() {

    const feedbackBtn = document.getElementById("feedbackBtn");

    if (!feedbackBtn || !feedbackPage) return;

    feedbackBtn.addEventListener("click", openFeedbackPage);

    document.getElementById("closeFeedbackPageBtn").addEventListener("click", closeFeedbackPage);

    feedbackPage.querySelectorAll("[data-feedback]").forEach(btn => {

        btn.addEventListener("click", () => {

            const choice = btn.dataset.feedback;

            if (choice === "copy") {

                copyFeedbackEmail();

                return;

            }

            if (choice === "gmail") openGmailWeb();

            if (choice === "app") openMailApp();

            closeFeedbackPage();

        });

    });

}

/* ==========================================
   KIRIM APRESIASI UNTUK DEV (USDT / BEP-20)
   Tombol di menu Pengaturan membuka kotak berisi QR dan alamat dompet
   (lihat APPRECIATION_WALLET di constants.js). Tidak ada data yang
   dikirim ke mana pun; alamat hanya ditampilkan dan bisa disalin.
   Menu disembunyikan kalau alamat tidak berformat benar.
========================================== */

const appreciationPage = document.getElementById("appreciationPage");

const WALLET_PATTERN = /^0x[a-fA-F0-9]{40}$/;

let appreciationCopyTimer = null;

// Menggambar QR dari data baris "0/1" menjadi satu SVG (latar putih + zona
// tenang 4 modul supaya mudah dipindai di tema gelap maupun terang).
// QR hanya tampil kalau datanya memang untuk alamat yang sama.
function renderAppreciationQr() {

    const wrap = document.getElementById("appreciationQrWrap");
    const box = document.getElementById("appreciationQr");

    if (!wrap || !box) return;

    const matches = QR_ADDRESS === APPRECIATION_WALLET.address
        && Array.isArray(QR_ROWS)
        && QR_ROWS.length > 0;

    wrap.style.display = matches ? "" : "none";

    if (!matches) {

        box.innerHTML = "";

        return;

    }

    const size = QR_ROWS.length;
    const quiet = 4;
    const total = size + quiet * 2;

    let path = "";

    QR_ROWS.forEach((row, y) => {

        let x = 0;

        while (x < size) {

            if (row[x] === "1") {

                const start = x;

                while (x < size && row[x] === "1") x++;

                path += `M${start + quiet} ${y + quiet}h${x - start}v1h-${x - start}z`;

            } else {

                x++;

            }

        }

    });

    box.innerHTML =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" ` +
        `role="img" aria-label="${t("appreciation.qrLabel")}" shape-rendering="crispEdges">` +
        `<rect width="${total}" height="${total}" fill="#fff"/>` +
        `<path d="${path}" fill="#000"/></svg>`;

}

function openAppreciationPage() {

    const { address, asset, network, explorerUrl } = APPRECIATION_WALLET;

    document.getElementById("appreciationAsset").textContent = asset;
    document.getElementById("appreciationNetwork").textContent = network;
    document.getElementById("appreciationAddress").textContent = address;

    // bantu donatur memastikan alamat tidak tertukar (mis. oleh malware clipboard)
    document.getElementById("appreciationVerify").textContent =
        t("appreciation.verify")
            .replace("{start}", address.slice(0, 8))
            .replace("{end}", address.slice(-6));

    document.getElementById("appreciationExplorer").href = explorerUrl + address;

    resetAppreciationCopyState();

    renderAppreciationQr();

    openSettingsPage(appreciationPage);

}

function resetAppreciationCopyState() {

    clearTimeout(appreciationCopyTimer);

    const button = document.getElementById("appreciationCopyBtn");

    button.classList.remove("copied");

    button.querySelector("span").textContent = t("appreciation.copy");

    document.getElementById("appreciationStatus").textContent = "";

}

async function copyAppreciationAddress() {

    const address = APPRECIATION_WALLET.address;

    let copied = false;

    try {

        if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(address);

            copied = true;

        }

    } catch (error) { copied = false; }

    if (!copied) {

        const temp = document.createElement("textarea");

        temp.value = address;
        temp.setAttribute("readonly", "");
        temp.style.position = "fixed";
        temp.style.opacity = "0";

        document.body.appendChild(temp);
        temp.select();

        try { copied = document.execCommand("copy"); } catch (error) { copied = false; }

        temp.remove();

    }

    const button = document.getElementById("appreciationCopyBtn");
    const status = document.getElementById("appreciationStatus");

    clearTimeout(appreciationCopyTimer);

    if (copied) {

        button.classList.add("copied");

        button.querySelector("span").textContent = t("appreciation.copied");

        status.textContent = "";

        appreciationCopyTimer = setTimeout(resetAppreciationCopyState, 2200);

    } else {

        // gagal menyalin: tandai alamatnya supaya mudah disalin manual
        status.textContent = t("appreciation.copyFailed");

        const addressEl = document.getElementById("appreciationAddress");
        const range = document.createRange();

        range.selectNodeContents(addressEl);

        const selection = window.getSelection();

        selection.removeAllRanges();
        selection.addRange(range);

    }

}

function initAppreciation() {

    const button = document.getElementById("appreciationBtn");

    if (!button || !appreciationPage) return;

    if (!WALLET_PATTERN.test(APPRECIATION_WALLET.address)) {

        button.style.display = "none";

        return;

    }

    button.addEventListener("click", openAppreciationPage);

    document.getElementById("closeAppreciationPageBtn")
        .addEventListener("click", () => closeSettingsPageIfOpen(appreciationPage));

    document.getElementById("appreciationCopyBtn")
        .addEventListener("click", copyAppreciationAddress);

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

    initAppreciation();

    applyLang(getLang(), { refresh: false });

    document.querySelectorAll("[data-lang]").forEach(btn => {

        btn.addEventListener("click", () => applyLang(btn.dataset.lang));

    });

}
