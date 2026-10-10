/* ==========================================
   NAV.JS
   Navigasi halaman: bottom nav (Home / Search /
   Add / My Project), side menu (hamburger), halaman
   Security, dan halaman Bantuan / FAQ.
========================================== */

import { openModalEl, closeModalEl } from "./modalAnim.js";
import { resetAllFilters } from "./event.js";
import { renderProjects } from "./render.js";
import { setMode, getMode } from "./project.js";

/* ==========================================
   ELEMENT
========================================== */

const homeBtn = document.getElementById("homeBtn");
const profileBtn = document.getElementById("profileBtn");
const addBottomBtn = document.getElementById("addBottomBtn");
const searchBtn = document.getElementById("searchBtn");

const homePage = document.getElementById("homePage");
const securityPage = document.getElementById("securityPage");
const helpPage = document.getElementById("helpPage");

const allPages = [homePage, securityPage, helpPage];
const bottomNavButtons = [homeBtn, searchBtn, addBottomBtn, profileBtn];

const navIndicator = document.getElementById("navIndicator");
const bottomNav = document.querySelector(".bottom-nav");

const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sideMenuOverlay = document.getElementById("sideMenuOverlay");

const profileSecurityBtn = document.getElementById("profileSecurityBtn");
const closeSecurityPageBtn = document.getElementById("closeSecurityPageBtn");

const helpMenuBtn = document.getElementById("helpMenuBtn");
const closeHelpPageBtn = document.getElementById("closeHelpPageBtn");

/* ==========================================
   BOTTOM NAV
========================================== */

function moveNavIndicator(activeBtn) {

    if (!navIndicator || !activeBtn) return;

    navIndicator.style.width = activeBtn.offsetWidth + "px";
    navIndicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;

}

function setActiveNav(activeBtn) {

    bottomNavButtons.forEach(btn => {

        btn.classList.remove("active");

    });

    if (activeBtn) {

        activeBtn.classList.add("active");

        moveNavIndicator(activeBtn);

    }

}

function showPage(page) {

    allPages.forEach(p => {

        p.style.display = "none";

        p.classList.remove("page-in");

    });

    page.style.display = "block";

    // paksa reflow supaya class "page-in" ditambahkan di frame
    // berikutnya jadi transisinya sempat dianimasikan browser
    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            page.classList.add("page-in");

        });

    });

}

// Home = data publik (semua orang boleh lihat, admin-only edit).
// My Project = data privat (masing-masing user, bebas diedit sendiri).
// Tombol Add sekarang selalu aktif di mode manapun: tujuan simpan
// otomatis mengikuti role (admin -> Home, user lain -> My Project),
// bukan lagi halaman yang sedang dibuka. Lihat addProject() di project.js.
export function updateAddButtonVisibility() {

    addBottomBtn.disabled = false;
    addBottomBtn.style.opacity = "";
    addBottomBtn.style.pointerEvents = "";

}

function switchMode(mode, activeBtn) {

    const modeChanged = getMode() !== mode;

    setMode(mode);

    if (modeChanged) resetAllFilters();

    showPage(homePage);

    setActiveNav(activeBtn);

    renderProjects();

    updateAddButtonVisibility();

}

/* ==========================================
   SECURITY PAGE
========================================== */

function openSecurityPage() {

    closeMenu();

    showPage(securityPage);

    setActiveNav(null);

    bottomNav.style.display = "none";

}

function closeSecurityPage() {

    showPage(homePage);

    setActiveNav(homeBtn);

    bottomNav.style.display = "flex";

}

/* ==========================================
   HELP / FAQ PAGE
========================================== */

function openHelpPage() {

    closeMenu();

    showPage(helpPage);

    setActiveNav(null);

    bottomNav.style.display = "none";

    window.scrollTo(0, 0);

}

function closeHelpPage() {

    showPage(homePage);

    setActiveNav(homeBtn);

    bottomNav.style.display = "flex";

}

/* ==========================================
   HAMBURGER MENU
========================================== */

let navBeforeMenu = null;

function openMenu(highlightProfile) {

    if (highlightProfile) {

        navBeforeMenu = bottomNavButtons.find(btn => btn.classList.contains("active")) || homeBtn;

        setActiveNav(profileBtn);

    }

    openModalEl(sideMenuOverlay);

    document.body.classList.add("modal-open");

}

export function closeMenu() {

    closeModalEl(sideMenuOverlay);

    document.body.classList.remove("modal-open");

    if (navBeforeMenu) {

        setActiveNav(navBeforeMenu);

        navBeforeMenu = null;

    }

}

/* ==========================================
   INIT
========================================== */

export function initNav() {

    homeBtn.addEventListener("click", () => switchMode("home", homeBtn));

    profileBtn.addEventListener("click", () => switchMode("myproject", profileBtn));

    addBottomBtn.addEventListener("click", () => document.getElementById("addProjectBtn").click());

    searchBtn.addEventListener("click", () => {

        switchMode("home", homeBtn);

        document.getElementById("search").focus();

    });

    updateAddButtonVisibility();

    // Halaman Home aktif secara default saat pertama kali dibuka
    setActiveNav(homeBtn);

    // Jaga posisi indikator tetap pas saat ukuran layar berubah
    window.addEventListener("resize", () => {

        const current = bottomNavButtons.find(btn => btn.classList.contains("active"));

        moveNavIndicator(current);

    });

    menuBtn.addEventListener("click", () => openMenu(false));

    closeMenuBtn.addEventListener("click", closeMenu);

    profileSecurityBtn.addEventListener("click", openSecurityPage);

    closeSecurityPageBtn.addEventListener("click", closeSecurityPage);

    helpMenuBtn.addEventListener("click", openHelpPage);

    helpMenuBtn.addEventListener("keydown", (e) => {

        if (e.key === "Enter" || e.key === " ") {

            e.preventDefault();

            openHelpPage();

        }

    });

    closeHelpPageBtn.addEventListener("click", closeHelpPage);

    sideMenuOverlay.addEventListener("click", (e) => {

        if (e.target === sideMenuOverlay) closeMenu();

    });

}
