/* ==========================================
   AIRDROP HUB V4.1
   APP.JS
========================================== */

import { initEvents } from "./event.js";

import { loadProjects, resetDailyTasks, cleanupStaleProjects, exportBackup, importBackup } from "./storage.js";

import { renderProjects } from "./render.js";

import { updateDashboard } from "./dashboard.js";

import { showLoading, hideLoading, showToast } from "./helpers.js";

import { setProjects } from "./project.js";

import { initWallet } from "./wallet.js";

import { initDialog, showAlert, showConfirm } from "./dialog.js";

import {
    initFirebaseApp,
    waitForPersistedSession,
    loginWithEmail,
    registerWithEmail,
    logoutCloud,
    isCloudSyncEnabled,
    getCurrentUser
} from "./cloudSync.js";

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

document.addEventListener("DOMContentLoaded", async () => {

    showLoading();

    initDialog();

    try {

        // Siapkan koneksi Firebase (kalau sudah dikonfigurasi) & cek
        // apakah user sudah pernah login sebelumnya di device ini.
        const configured = initFirebaseApp();

        if (configured) {

            const existingUser = await waitForPersistedSession();

            if (existingUser) {

                showToast("Cloud sync aktif — login sebagai " + existingUser.email, 2500);
                updateAccountMenuLabel(existingUser.email);

            } else {

                showCloudAuthModal();
                updateAccountMenuLabel(null);

            }

        }

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
                `${cleanup.removedCount} stale Waitlist/Pending project(s) auto-removed (no update in 2 months).`,
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
               `${cleanup.removedCount} stale Waitlist/Pending project(s) auto-removed (no update in 2 months).`,
               4000
           );

       }

}, 60000);

    } catch (error) {

        console.error(error);

        showToast("Something went wrong while loading the app.", 4000, "error");

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

const bottomNavButtons=[homeBtn, searchBtn, addBottomBtn, profileBtn];

function setActiveNav(activeBtn){

bottomNavButtons.forEach(btn=>{

btn.classList.remove("active");

});

if(activeBtn){

activeBtn.classList.add("active");

}

}

function showPage(page){

allPages.forEach(p=>{

p.style.display="none";

});

page.style.display="block";

}

homeBtn.onclick=()=>{

showPage(homePage);

setActiveNav(homeBtn);

}

profileBtn.onclick=()=>{

showPage(profilePage);

setActiveNav(profileBtn);

}

addBottomBtn.onclick=()=>{

document.getElementById("addProjectBtn").click();

}

searchBtn.onclick=()=>{

showPage(homePage);

setActiveNav(homeBtn);

document.getElementById("search").focus();

}

// Halaman Home aktif secara default saat pertama kali dibuka
setActiveNav(homeBtn);

/* ==========================================
   HAMBURGER MENU
========================================== */

const menuBtn=document.getElementById("menuBtn");

const closeMenuBtn=document.getElementById("closeMenuBtn");

const sideMenuOverlay=document.getElementById("sideMenuOverlay");

const menuWalletBtn=document.getElementById("menuWalletBtn");

const closeWalletPageBtn=document.getElementById("closeWalletPageBtn");

const bottomNav=document.querySelector(".bottom-nav");

function openWalletPage(){

showPage(walletPage);

setActiveNav(null);

bottomNav.style.display="none";

}

function closeWalletPage(){

showPage(homePage);

setActiveNav(homeBtn);

bottomNav.style.display="flex";

}

function openMenu(){

sideMenuOverlay.classList.add("active");

}

function closeMenu(){

sideMenuOverlay.classList.remove("active");

}

menuBtn.onclick=openMenu;

closeMenuBtn.onclick=closeMenu;

/* ==========================================
   BACKUP & RESTORE
========================================== */

const menuExportBtn=document.getElementById("menuExportBtn");

const menuImportBtn=document.getElementById("menuImportBtn");

const importFileInput=document.getElementById("importFileInput");

menuExportBtn.onclick=()=>{

    const json=exportBackup();

    const blob=new Blob([json],{type:"application/json"});

    const url=URL.createObjectURL(blob);

    const today=new Date().toISOString().slice(0,10);

    const link=document.createElement("a");

    link.href=url;

    link.download=`airdrophub-backup-${today}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast("Backup berhasil diunduh");

    closeMenu();

};

menuImportBtn.onclick=()=>{

    importFileInput.click();

};

importFileInput.onchange=async()=>{

    const file=importFileInput.files[0];

    if(!file) return;

    const confirmed=await showConfirm(
        "Import akan MENIMPA seluruh data project & wallet yang ada saat ini dengan isi file backup. Lanjutkan?",
        "Import"
    );

    if(!confirmed){

        importFileInput.value="";

        return;

    }

    try{

        const text=await file.text();

        await importBackup(text);

        showToast("Data berhasil dipulihkan, memuat ulang...");

        setTimeout(()=>location.reload(),900);

    }catch(error){

        console.error("Gagal import backup:",error);

        await showAlert("Gagal import: file backup tidak valid atau rusak.");

    }

    importFileInput.value="";

};

/* ==========================================
   CLOUD AUTH (Login / Daftar / Logout)
========================================== */

const cloudAuthModal=document.getElementById("cloudAuthModal");

const cloudAuthEmail=document.getElementById("cloudAuthEmail");

const cloudAuthPassword=document.getElementById("cloudAuthPassword");

const cloudAuthError=document.getElementById("cloudAuthError");

const cloudAuthSkip=document.getElementById("cloudAuthSkip");

const cloudAuthLoginBtn=document.getElementById("cloudAuthLoginBtn");

const cloudAuthRegisterLink=document.getElementById("cloudAuthRegisterLink");

const menuAccountBtn=document.getElementById("menuAccountBtn");

const menuAccountLabel=document.getElementById("menuAccountLabel");

let cloudAuthMode="login"; // "login" atau "register"

function showCloudAuthModal(){

    cloudAuthError.style.display="none";

    cloudAuthModal.style.display="flex";

    document.body.classList.add("modal-open");

}

function closeCloudAuthModal(){

    cloudAuthModal.style.display="none";

    document.body.classList.remove("modal-open");

}

function setCloudAuthError(message){

    cloudAuthError.textContent=message;

    cloudAuthError.style.display="block";

}

function updateAccountMenuLabel(email){

    menuAccountLabel.textContent = email ? email : "Login Cloud Sync";

}

function friendlyAuthError(error){

    const code = error && error.code ? error.code : "";

    if(code.includes("invalid-email")) return "Format email tidak valid.";

    if(code.includes("user-not-found") || code.includes("invalid-credential")) return "Email/password salah atau belum terdaftar.";

    if(code.includes("wrong-password")) return "Password salah.";

    if(code.includes("email-already-in-use")) return "Email ini sudah terdaftar, coba Login.";

    if(code.includes("weak-password")) return "Password minimal 6 karakter.";

    return "Gagal login/daftar, coba lagi.";

}

cloudAuthRegisterLink.onclick=(e)=>{

    e.preventDefault();

    cloudAuthMode = cloudAuthMode==="login" ? "register" : "login";

    cloudAuthLoginBtn.textContent = cloudAuthMode==="login" ? "Login" : "Daftar";

    cloudAuthRegisterLink.textContent = cloudAuthMode==="login" ? "Daftar sekarang" : "Login di sini";

    cloudAuthRegisterLink.previousSibling.textContent = cloudAuthMode==="login" ? "Belum punya akun? " : "Sudah punya akun? ";

    cloudAuthError.style.display="none";

};

cloudAuthSkip.onclick=()=>{

    closeCloudAuthModal();

    showToast("Mode offline — data hanya tersimpan di device ini.", 3000, "warning");

};

cloudAuthLoginBtn.onclick=async()=>{

    const email=cloudAuthEmail.value.trim();

    const password=cloudAuthPassword.value;

    if(!email || !password){

        setCloudAuthError("Email & password wajib diisi.");

        return;

    }

    cloudAuthLoginBtn.disabled=true;

    cloudAuthLoginBtn.textContent="Memproses...";

    try{

        const user = cloudAuthMode==="login"
            ? await loginWithEmail(email,password)
            : await registerWithEmail(email,password);

        closeCloudAuthModal();

        updateAccountMenuLabel(user.email);

        showToast("Berhasil login, memuat data...");

        setTimeout(()=>location.reload(),700);

    }catch(error){

        console.error("[CloudAuth]",error);

        setCloudAuthError(friendlyAuthError(error));

    }

    cloudAuthLoginBtn.disabled=false;

    cloudAuthLoginBtn.textContent = cloudAuthMode==="login" ? "Login" : "Daftar";

};

menuAccountBtn.onclick=async()=>{

    const user=getCurrentUser();

    if(!user){

        closeMenu();

        showCloudAuthModal();

        return;

    }

    const confirmed=await showConfirm(`Logout dari ${user.email}? Data tetap tersimpan di cloud.`,"Logout");

    if(confirmed){

        await logoutCloud();

        closeMenu();

        showToast("Berhasil logout.");

        updateAccountMenuLabel(null);

    }

};

sideMenuOverlay.addEventListener("click", (e)=>{

if(e.target===sideMenuOverlay){

closeMenu();

}

});

menuWalletBtn.onclick=()=>{

openWalletPage();

closeMenu();

}

closeWalletPageBtn.onclick=()=>{

closeWalletPage();

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
