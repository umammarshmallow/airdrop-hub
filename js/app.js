/* ==========================================
   AIRDROP HUB V4.1
   APP.JS
========================================== */

import { initEvents } from "./event.js";

import { loadProjects, resetDailyTasks, cleanupStaleProjects } from "./storage.js";

import { renderProjects } from "./render.js";

import { updateDashboard } from "./dashboard.js";

import { showLoading, hideLoading, showToast } from "./helpers.js";

import { setProjects } from "./project.js";

import { initWallet } from "./wallet.js";

/* ==========================================
   INITIALIZE APPLICATION
========================================== */

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        let projects = loadProjects();

        projects = resetDailyTasks(projects);

        const cleanup = cleanupStaleProjects(projects);

        projects = cleanup.projects;

        setProjects(projects);

        renderProjects();
    }

});

document.addEventListener("DOMContentLoaded", () => {

    showLoading();

    try {

        /* memastikan data localStorage terbaca */

        let projects = loadProjects();

        // Reset task harian bila hari sudah berganti
        projects = resetDailyTasks(projects);

        // Hapus otomatis project Waitlist/Pending yang tidak diupdate 2 bulan
        const cleanup = cleanupStaleProjects(projects);

        projects = cleanup.projects;

        // Sinkronkan data project di seluruh aplikasi
        setProjects(projects);

        // Update dashboard
        updateDashboard(projects);

        // Render ulang
        renderProjects();

        if (cleanup.removedCount > 0) {

            showToast(
                `${cleanup.removedCount} project Waitlist/Pending dihapus otomatis (tidak diupdate 2 bulan).`,
                4000
            );

        }

        /* semua event */

        initEvents();

        // Render halaman Wallet
        initWallet();

       // Mengecek pergantian hari setiap 1 menit
       setInterval(() => {

       let projects = loadProjects();

       projects = resetDailyTasks(projects);

       const cleanup = cleanupStaleProjects(projects);

       projects = cleanup.projects;

       setProjects(projects);

       renderProjects();

       if (cleanup.removedCount > 0) {

           showToast(
               `${cleanup.removedCount} project Waitlist/Pending dihapus otomatis (tidak diupdate 2 bulan).`,
               4000
           );

       }

}, 60000);

    } catch (error) {

        console.error(error);

        alert("Terjadi kesalahan saat memuat aplikasi.");

    } finally {

        setTimeout(() => {

            hideLoading();

        }, 400);

    }

});

/* ==========================================
   AUTO SAVE
========================================== */

window.addEventListener("beforeunload", () => {

    console.log("Airdrop Hub Saved");

});

/* ==========================================
   ONLINE / OFFLINE
========================================== */

window.addEventListener("offline", () => {

    console.warn("Offline Mode");

});

window.addEventListener("online", () => {

    console.log("Online");

});

const homeBtn=document.getElementById("homeBtn");

const profileBtn=document.getElementById("profileBtn");

const addBottomBtn=document.getElementById("addBottomBtn");

const searchBtn=document.getElementById("searchBtn");

const homePage=document.getElementById("homePage");

const profilePage=document.getElementById("profilePage");

const walletPage=document.getElementById("walletPage");

const allPages=[homePage, profilePage, walletPage];

function showPage(page){

allPages.forEach(p=>{

p.style.display="none";

});

page.style.display="block";

}

homeBtn.onclick=()=>{

showPage(homePage);

}

profileBtn.onclick=()=>{

showPage(profilePage);

}

addBottomBtn.onclick=()=>{

document.getElementById("addProjectBtn").click();

}

searchBtn.onclick=()=>{

document.getElementById("search").focus();

}

/* ==========================================
   HAMBURGER MENU
========================================== */

const menuBtn=document.getElementById("menuBtn");

const closeMenuBtn=document.getElementById("closeMenuBtn");

const sideMenuOverlay=document.getElementById("sideMenuOverlay");

const menuWalletBtn=document.getElementById("menuWalletBtn");

function openMenu(){

sideMenuOverlay.classList.add("active");

}

function closeMenu(){

sideMenuOverlay.classList.remove("active");

}

menuBtn.onclick=openMenu;

closeMenuBtn.onclick=closeMenu;

sideMenuOverlay.addEventListener("click", (e)=>{

if(e.target===sideMenuOverlay){

closeMenu();

}

});

menuWalletBtn.onclick=()=>{

showPage(walletPage);

closeMenu();

}

/* ==========================================
   VERSION
========================================== */

console.log(
`
==========================================
AIRDROP HUB V4.1
Module Version
==========================================

✓ storage.js

✓ helpers.js

✓ dashboard.js

✓ modal.js

✓ project.js

✓ render.js

✓ events.js

✓ app.js

==========================================
`
);
