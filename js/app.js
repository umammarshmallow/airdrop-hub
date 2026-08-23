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
    getCurrentUser,
    changePassword,
    listCloudBackups,
    restoreFromCloudBackup
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

function refreshProjectsView(showStaleToast = true) {

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

    if (showStaleToast && cleanup.removedCount > 0) {

        showToast(
            `${cleanup.removedCount} stale Waitlist/Pending project(s) auto-removed (no update in 2 months).`,
            4000
        );

    }

}

// Cloud sync jalan di background, TIDAK menahan tampilnya app.
// Kalau ternyata user sudah login & ada data cloud, tampilan
// otomatis di-refresh diam-diam begitu data cloud selesai ditarik.
async function runCloudSyncInBackground(configured) {

    if (!configured) return;

    try {

        const existingUser = await waitForPersistedSession();

        if (existingUser) {

            showToast("Cloud sync aktif — login sebagai " + existingUser.email, 2500);
            updateAccountMenuLabel(existingUser.email);

            // Data lokal mungkin baru saja ditimpa oleh data cloud, refresh tampilan.
            refreshProjectsView(false);

        } else {

            showCloudAuthModal();
            updateAccountMenuLabel(null);

        }

    } catch (error) {

        console.warn("[CloudSync] Gagal sync di background, tetap pakai data lokal:", error);

    }

}

document.addEventListener("DOMContentLoaded", async () => {

    showLoading();

    initDialog();

    try {

        // Siapkan koneksi Firebase (kalau sudah dikonfigurasi), tapi JANGAN
        // ditunggu (await) di sini — biar app langsung tampil pakai data
        // lokal dulu, cloud sync menyusul di belakang layar.
        const configured = initFirebaseApp();

        runCloudSyncInBackground(configured);

        /* memastikan data localStorage terbaca */

        refreshProjectsView();

        /* semua event */

        initEvents();

        // Render halaman Wallet
        initWallet();

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

    closeMenu();

    openRestoreModal();

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
   RESTORE DATA MODAL (pilih cloud backup / file)
========================================== */

const restoreModal=document.getElementById("restoreModal");

const restoreCloudSection=document.getElementById("restoreCloudSection");

const restoreCloudList=document.getElementById("restoreCloudList");

const restoreCloudEmpty=document.getElementById("restoreCloudEmpty");

const restoreFromFileBtn=document.getElementById("restoreFromFileBtn");

const closeRestoreModal=document.getElementById("closeRestoreModal");

function formatBackupDate(dateKey){

    const d=new Date(dateKey+"T00:00:00");

    const todayKey=new Date().toISOString().slice(0,10);

    if(dateKey===todayKey) return "Hari ini";

    return d.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});

}

async function openRestoreModal(){

    restoreModal.style.display="flex";

    document.body.classList.add("modal-open");

    restoreCloudSection.style.display="none";

    restoreCloudEmpty.style.display="block";

    restoreCloudEmpty.textContent="Memuat cloud backup...";

    restoreCloudList.innerHTML="";

    const user=getCurrentUser();

    if(!user){

        restoreCloudEmpty.textContent="Login dulu (menu Account) untuk memakai cloud backup otomatis.";

        return;

    }

    const backups=await listCloudBackups();

    if(!backups.length){

        restoreCloudEmpty.textContent="Belum ada cloud backup. Backup otomatis akan tersedia setelah kamu login & buka app besok.";

        return;

    }

    restoreCloudEmpty.style.display="none";

    restoreCloudSection.style.display="block";

    backups.forEach((b)=>{

        const item=document.createElement("div");

        item.className="cloud-backup-item";

        const label=document.createElement("span");

        label.textContent=formatBackupDate(b.id);

        const btn=document.createElement("button");

        btn.textContent="Restore";

        btn.onclick=async()=>{

            const confirmed=await showConfirm(
                `Restore data ke kondisi "${formatBackupDate(b.id)}"? Data saat ini akan ditimpa.`,
                "Restore"
            );

            if(!confirmed) return;

            btn.disabled=true;

            btn.textContent="...";

            try{

                await withUiTimeout(restoreFromCloudBackup(b.id), 8000);

                closeRestoreModalFn();

                showToast("Data berhasil dipulihkan, memuat ulang...");

                setTimeout(()=>location.reload(),700);

            }catch(error){

                console.error("[Restore]",error);

                await showAlert("Gagal restore, coba lagi.");

                btn.disabled=false;

                btn.textContent="Restore";

            }

        };

        item.appendChild(label);

        item.appendChild(btn);

        restoreCloudList.appendChild(item);

    });

}

function closeRestoreModalFn(){

    restoreModal.style.display="none";

    document.body.classList.remove("modal-open");

}

closeRestoreModal.onclick=closeRestoreModalFn;

restoreFromFileBtn.onclick=()=>{

    closeRestoreModalFn();

    importFileInput.click();

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

function updateAccountMenuLabel(){

    // Item menu "Account" sekarang statis — status login ditampilkan
    // langsung di dalam modal Profile & Security saat dibuka.

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

function withUiTimeout(promise, ms) {

    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms))
    ]);

}

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

        const action = cloudAuthMode==="login"
            ? loginWithEmail(email,password)
            : registerWithEmail(email,password);

        // Batas waktu 10 detik — tombol tidak boleh macet selamanya
        // walau koneksi ke server lambat/gagal total.
        const user = await withUiTimeout(action, 5000);

        closeCloudAuthModal();

        updateAccountMenuLabel(user.email);

        showToast("Berhasil login, memuat data...");

        setTimeout(()=>location.reload(),700);

        return;

    }catch(error){

        console.error("[CloudAuth]",error);

        if(error.message==="TIMEOUT"){

            setCloudAuthError("Koneksi ke server lambat/gagal. Periksa jaringan lalu coba lagi.");

        }else{

            setCloudAuthError(friendlyAuthError(error));

        }

    }

    cloudAuthLoginBtn.disabled=false;

    cloudAuthLoginBtn.textContent = cloudAuthMode==="login" ? "Login" : "Daftar";

};

/* ==========================================
   ACCOUNT ACCORDION (Profile / Security / Logout)
========================================== */

const menuAccountToggle=document.getElementById("menuAccountToggle");

const menuAccountSubmenu=document.getElementById("menuAccountSubmenu");

const menuProfileBtn=document.getElementById("menuProfileBtn");

const menuSecurityBtn=document.getElementById("menuSecurityBtn");

const menuLogoutBtn=document.getElementById("menuLogoutBtn");

menuAccountToggle.onclick=()=>{

    const isOpen = menuAccountSubmenu.classList.toggle("open");

    menuAccountToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

};

/* -------- PROFILE MODAL -------- */

const profileModal=document.getElementById("profileModal");

const profileLoggedInView=document.getElementById("profileLoggedInView");

const profileLoggedOutView=document.getElementById("profileLoggedOutView");

const profileEmailDisplay=document.getElementById("profileEmailDisplay");

const closeProfileModal=document.getElementById("closeProfileModal");

const profileLoginBtn=document.getElementById("profileLoginBtn");

menuProfileBtn.onclick=()=>{

    closeMenu();

    const user=getCurrentUser();

    if(user){

        profileLoggedInView.style.display="block";
        profileLoggedOutView.style.display="none";
        profileEmailDisplay.value=user.email;
        profileLoginBtn.style.display="none";

    }else{

        profileLoggedInView.style.display="none";
        profileLoggedOutView.style.display="block";
        profileLoginBtn.style.display="inline-block";

    }

    profileModal.style.display="flex";

    document.body.classList.add("modal-open");

};

closeProfileModal.onclick=()=>{

    profileModal.style.display="none";

    document.body.classList.remove("modal-open");

};

profileLoginBtn.onclick=()=>{

    profileModal.style.display="none";

    document.body.classList.remove("modal-open");

    showCloudAuthModal();

};

/* -------- SECURITY MODAL -------- */

const securityModal=document.getElementById("securityModal");

const securityLoggedInView=document.getElementById("securityLoggedInView");

const securityLoggedOutView=document.getElementById("securityLoggedOutView");

const securityCurrentPassword=document.getElementById("securityCurrentPassword");

const securityNewPassword=document.getElementById("securityNewPassword");

const securityError=document.getElementById("securityError");

const securityUpdateBtn=document.getElementById("securityUpdateBtn");

const closeSecurityModal=document.getElementById("closeSecurityModal");

const closeSecurityModalAlt=document.getElementById("closeSecurityModalAlt");

function closeSecurityModalFn(){

    securityModal.style.display="none";

    document.body.classList.remove("modal-open");

    securityCurrentPassword.value="";

    securityNewPassword.value="";

    securityError.style.display="none";

}

menuSecurityBtn.onclick=()=>{

    closeMenu();

    const user=getCurrentUser();

    securityLoggedInView.style.display = user ? "block" : "none";

    securityLoggedOutView.style.display = user ? "none" : "block";

    securityModal.style.display="flex";

    document.body.classList.add("modal-open");

};

closeSecurityModal.onclick=closeSecurityModalFn;

closeSecurityModalAlt.onclick=closeSecurityModalFn;

securityUpdateBtn.onclick=async()=>{

    const current=securityCurrentPassword.value;

    const next=securityNewPassword.value;

    if(!current || !next){

        securityError.textContent="Semua field wajib diisi.";
        securityError.style.display="block";

        return;

    }

    if(next.length<6){

        securityError.textContent="Password baru minimal 6 karakter.";
        securityError.style.display="block";

        return;

    }

    securityUpdateBtn.disabled=true;

    securityUpdateBtn.textContent="Memproses...";

    try{

        await withUiTimeout(changePassword(current,next), 8000);

        closeSecurityModalFn();

        showToast("Password berhasil diubah.");

    }catch(error){

        console.error("[Security]",error);

        let msg="Gagal mengubah password.";

        if(error.message==="TIMEOUT") msg="Koneksi lambat/gagal, coba lagi.";
        else if(error.code && error.code.includes("wrong-password")) msg="Password saat ini salah.";
        else if(error.code && error.code.includes("weak-password")) msg="Password baru terlalu lemah.";

        securityError.textContent=msg;
        securityError.style.display="block";

    }

    securityUpdateBtn.disabled=false;

    securityUpdateBtn.textContent="Update Password";

};

/* -------- LOGOUT -------- */

menuLogoutBtn.onclick=async()=>{

    const user=getCurrentUser();

    closeMenu();

    if(!user){

        showCloudAuthModal();

        return;

    }

    const confirmed=await showConfirm(`Logout dari ${user.email}? Data tetap tersimpan di cloud.`,"Logout");

    if(confirmed){

        await logoutCloud();

        showToast("Berhasil logout.");

        showCloudAuthModal();

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
