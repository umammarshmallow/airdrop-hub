/* ==========================================
   SETTINGS.JS
   Pengaturan tampilan: mode gelap/terang dan
   bahasa (ID / EN).
========================================== */

import { getLang, setLang, applyStaticTranslations, t } from "./i18n.js";
import { refreshCloudAuthTexts } from "./authUI.js";
import { refreshProjectsView } from "./projectsView.js";
import { STORAGE_KEYS } from "./constants.js";

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
   INIT
========================================== */

export function initSettings() {

    applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "dark");

    darkModeToggle.addEventListener("change", () => {

        const theme = darkModeToggle.checked ? "dark" : "light";

        localStorage.setItem(STORAGE_KEYS.theme, theme);

        applyTheme(theme);

    });

    applyLang(getLang(), { refresh: false });

    document.querySelectorAll("[data-lang]").forEach(btn => {

        btn.addEventListener("click", () => applyLang(btn.dataset.lang));

    });

}
