/* ==========================================
   AIRDROP HUB V4.1
   APP.JS
========================================== */

import { initEvents } from "./event.js";

import { loadProjects, resetDailyTasks, cleanupStaleProjects } from "./storage.js";

import { renderProjects } from "./render.js";

import { updateDashboard } from "./dashboard.js";

import { showLoading, hideLoading, showToast, addNotification, getNotifications, unreadNotificationCount, markAllNotificationsRead, clearNotifications } from "./helpers.js";

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
    changePassword
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

        const msg = `${cleanup.removedCount} stale Waitlist/Pending project(s) auto-removed (no update in 2 months).`;

        showToast(msg, 4000);

        addNotification(msg, "warning");

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

refreshProfilePage();

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

document.body.classList.add("modal-open");

}

function closeMenu(){

sideMenuOverlay.classList.remove("active");

document.body.classList.remove("modal-open");

}

menuBtn.onclick=openMenu;

closeMenuBtn.onclick=closeMenu;

/* ==========================================
   NOTIFICATION CENTER
========================================== */

const notifBtn=document.getElementById("notifBtn");

const notifBadge=document.getElementById("notifBadge");

const notifModal=document.getElementById("notifModal");

const notifList=document.getElementById("notifList");

const notifEmpty=document.getElementById("notifEmpty");

const closeNotifModal=document.getElementById("closeNotifModal");

const notifClearBtn=document.getElementById("notifClearBtn");

function timeAgo(isoString){

    const diffMs=Date.now()-new Date(isoString).getTime();

    const mins=Math.floor(diffMs/60000);

    if(mins<1) return "Baru saja";

    if(mins<60) return `${mins} menit lalu`;

    const hours=Math.floor(mins/60);

    if(hours<24) return `${hours} jam lalu`;

    const days=Math.floor(hours/24);

    return `${days} hari lalu`;

}

const NOTIF_ICON={ error:"fa-solid fa-circle-exclamation", warning:"fa-solid fa-triangle-exclamation", info:"fa-solid fa-circle-info" };

function refreshNotifBadge(){

    const count=unreadNotificationCount();

    if(count>0){

        notifBadge.textContent = count>9 ? "9+" : String(count);
        notifBadge.style.display="flex";

    }else{

        notifBadge.style.display="none";

    }

}

function renderNotifList(){

    const list=getNotifications();

    notifList.innerHTML="";

    if(!list.length){

        notifEmpty.style.display="block";
        return;

    }

    notifEmpty.style.display="none";

    list.forEach((n)=>{

        const item=document.createElement("div");

        item.className="notif-item"+(n.read?"":" unread");

        item.dataset.type=n.type||"info";

        item.innerHTML=`
            <i class="notif-icon ${NOTIF_ICON[n.type]||NOTIF_ICON.info}"></i>
            <div class="notif-body">
                <div class="notif-message"></div>
                <div class="notif-time">${timeAgo(n.createdAt)}</div>
            </div>
        `;

        item.querySelector(".notif-message").textContent=n.message;

        notifList.appendChild(item);

    });

}

notifBtn.onclick=()=>{

    renderNotifList();

    notifModal.style.display="flex";

    document.body.classList.add("modal-open");

    markAllNotificationsRead();

    refreshNotifBadge();

};

function closeNotifModalFn(){

    notifModal.style.display="none";

    document.body.classList.remove("modal-open");

}

closeNotifModal.onclick=closeNotifModalFn;

notifClearBtn.onclick=async()=>{

    const confirmed=await showConfirm("Hapus semua riwayat notifikasi?","Hapus");

    if(confirmed){

        clearNotifications();

        renderNotifList();

        refreshNotifBadge();

    }

};

window.addEventListener("airdrophub:notification", refreshNotifBadge);

refreshNotifBadge();


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

const profileLoggedInView=document.getElementById("profileLoggedInView");

const profileLoggedOutView=document.getElementById("profileLoggedOutView");

const profileEmailDisplay=document.getElementById("profileEmailDisplay");

const profileAvatar=document.getElementById("profileAvatar");

const profileLoginBtn=document.getElementById("profileLoginBtn");

const profileLogoutBtn=document.getElementById("profileLogoutBtn");

const securityCurrentPassword=document.getElementById("securityCurrentPassword");

const securityNewPassword=document.getElementById("securityNewPassword");

const securityError=document.getElementById("securityError");

const securityUpdateBtn=document.getElementById("securityUpdateBtn");

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

    refreshProfilePage();

}

function refreshProfilePage(){

    const user=getCurrentUser();

    if(user){

        profileLoggedInView.style.display="block";
        profileLoggedOutView.style.display="none";

        profileEmailDisplay.textContent=user.email;
        profileAvatar.textContent=user.email.charAt(0).toUpperCase();

    }else{

        profileLoggedInView.style.display="none";
        profileLoggedOutView.style.display="block";

        securityCurrentPassword.value="";
        securityNewPassword.value="";
        securityError.style.display="none";

    }

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

        // Batas waktu 8 detik (nilai yang disarankan) — cukup toleran untuk
        // jaringan 4G yang agak lambat, tapi tombol tetap tidak akan macet selamanya.
        // walau koneksi ke server lambat/gagal total.
        const user = await withUiTimeout(action, 8000);

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
   PROFILE PAGE (Login / Security / Logout)
========================================== */

profileLoginBtn.onclick=()=>{

    showCloudAuthModal();

};

profileLogoutBtn.onclick=async()=>{

    const user=getCurrentUser();

    if(!user) return;

    const confirmed=await showConfirm(`Logout dari ${user.email}? Data tetap tersimpan di cloud.`,"Logout");

    if(confirmed){

        await logoutCloud();

        showToast("Berhasil logout.");

        refreshProfilePage();

    }

};

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

        securityCurrentPassword.value="";
        securityNewPassword.value="";
        securityError.style.display="none";

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
