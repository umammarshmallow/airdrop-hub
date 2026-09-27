/* ==========================================
   AIRDROP HUB V4.1
   APP.JS
========================================== */

import { initEvents, resetAllFilters } from "./event.js";

import { loadProjects, resetDailyTasks, cleanupStaleProjects, checkStaleWarnings } from "./storage.js";

import { renderProjects } from "./render.js";

import { showLoading, hideLoading, showToast, addNotification, getNotifications, unreadNotificationCount, markAllNotificationsRead, clearNotifications, dismissNotificationsByAction } from "./helpers.js";

import { openModalEl, closeModalEl } from "./modalAnim.js";

import { setProjects, setHomeProjects, editProject, setMode, getMode } from "./project.js";

import { initFuzzyText } from "./fuzzyText.js";

import { initDialog, showAlert, showConfirm } from "./dialog.js";

import { getLang, setLang, applyStaticTranslations, t } from "./i18n.js";

import {
    initFirebaseApp,
    waitForPersistedSession,
    loginWithEmail,
    registerWithEmail,
    logoutCloud,
    isCloudSyncEnabled,
    getCurrentUser,
    changePassword,
    deleteAccountCloud,
    pullHomeFromCloud
} from "./cloudSync.js";
import { loadHomeProjects } from "./storage.js";

/* ==========================================
   INITIALIZE APPLICATION
========================================== */

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        // Dulu logic di sini ditulis ulang terpisah dari
        // refreshProjectsView() sehingga auto-delete project
        // stale bisa terjadi tanpa notifikasi ke user.
        // Sekarang disatukan supaya toast/notifikasi selalu muncul.
        refreshProjectsView();

    }

});

function refreshProjectsView(showStaleToast = true) {

    let projects = loadProjects();

    // Reset task harian bila hari sudah berganti
    projects = resetDailyTasks(projects);

    // Tandai + kirim notifikasi utk project yg akan dihapus otomatis besok (H-1)
    const aboutToDelete = checkStaleWarnings(projects);

    // Hapus otomatis project Waitlist/Pending yang tidak diupdate 2 bulan
    const cleanup = cleanupStaleProjects(projects);

    projects = cleanup.projects;

    // Sinkronkan data project di seluruh aplikasi (khusus My Project --
    // Home tidak ikut direset/dibersihkan otomatis, itu data admin).
    setProjects(projects);

    // NOTE: updateDashboard() SENGAJA tidak dipanggil di sini dengan
    // data My Project secara langsung -- itu bisa menimpa Overview Home
    // (race condition animasi angka saat renderProjects() di bawah juga
    // memanggil updateDashboard(), tapi dengan data mode yang aktif).
    // renderProjects() di bawah ini sudah menangani update dashboard
    // dengan benar sesuai mode (Home/My Project) yang sedang dilihat.

    // Render ulang
    renderProjects();

    if (showStaleToast && aboutToDelete.length > 0) {

        aboutToDelete.forEach(project => {

            addNotification(
                `"${project.name}" will be auto-removed tomorrow (no update in ~2 months). Edit it to keep it.`,
                "warning",
                { action: "editProject", projectId: project.id }
            );

        });

    }

    if (showStaleToast && cleanup.removedCount > 0) {

        const msg = `${cleanup.removedCount} stale Waitlist/Pending project(s) auto-removed (no update in 2 months).`;

        showToast(msg, 4000);

        addNotification(msg, "warning");

    }

}

// Cloud sync jalan di background, TIDAK menahan tampilnya app.
// Kalau ternyata user sudah login & ada data cloud, tampilan
// otomatis di-refresh diam-diam begitu data cloud selesai ditarik.
async function runCloudSyncInBackground() {

    try {

        // SDK Firebase baru di-download di sini (lazy), dan hanya
        // kalau firebaseConfig.js memang sudah diisi.
        const configured = await initFirebaseApp();

        if (!configured) return;

        // Home publik: tarik sekali di sini supaya tampil juga untuk
        // pengunjung yang belum/tidak login.
        await refreshHomeView();

        const existingUser = await waitForPersistedSession((lateUser) => {

            // Ternyata user memang masih login, cuma konfirmasinya
            // dari Firebase telat sedikit. Update tampilan diam-diam,
            // dan kalau modal login sempat kebuka karena dianggap
            // "belum login" tadi, tutup lagi sekarang.
            showToast("Cloud sync aktif — login sebagai " + lateUser.email, 2500);
            updateAccountMenuLabel(lateUser.email);

            dismissNotificationsByAction("login");
            refreshNotifBadge();

            refreshProjectsView(false);

            closeCloudAuthModal();

        });

        if (existingUser) {

            showToast("Cloud sync aktif — login sebagai " + existingUser.email, 2500);
            updateAccountMenuLabel(existingUser.email);

            // Sudah login, peringatan "belum login" sebelumnya (kalau ada) sudah tidak relevan
            dismissNotificationsByAction("login");
            refreshNotifBadge();

            // Data lokal mungkin baru saja ditimpa oleh data cloud, refresh tampilan.
            refreshProjectsView(false);

        } else {

            showCloudAuthModal();
            updateAccountMenuLabel(null);

            // Peringatan risiko kehilangan data cukup dikirim sekali,
            // tidak diulang tiap kali app dibuka
            const alreadyWarned = getNotifications().some(
                (n) => n.meta && n.meta.action === "login"
            );

            if (!alreadyWarned) {

                addNotification(
                    "Your data is only saved on this device. If you clear browser data or switch devices without logging in, everything will be lost. Login to enable cloud backup.",
                    "warning",
                    { action: "login" }
                );

                refreshNotifBadge();

            }

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
        // lokal dulu, cloud sync (termasuk download SDK-nya) menyusul
        // di belakang layar.
        runCloudSyncInBackground();

        /* memastikan data localStorage terbaca */

        refreshProjectsView();

        /* semua event */

        initEvents();

        // Efek fuzzy pada wordmark "Hub"
        const hubCanvas = document.getElementById("hubFuzzyText");
        if (hubCanvas) initFuzzyText(hubCanvas, "Hub");

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
   ONLINE / OFFLINE
========================================== */

window.addEventListener("offline", () => {

    console.warn("Offline Mode");

});

const homeBtn=document.getElementById("homeBtn");

const profileBtn=document.getElementById("profileBtn");

const addBottomBtn=document.getElementById("addBottomBtn");

const searchBtn=document.getElementById("searchBtn");

const homePage=document.getElementById("homePage");

const securityPage=document.getElementById("securityPage");

const allPages=[homePage, securityPage];

const bottomNavButtons=[homeBtn, searchBtn, addBottomBtn, profileBtn];

const navIndicator=document.getElementById("navIndicator");

function moveNavIndicator(activeBtn){

if(!navIndicator || !activeBtn) return;

navIndicator.style.width=activeBtn.offsetWidth+"px";
navIndicator.style.transform=`translateX(${activeBtn.offsetLeft}px)`;

}

function setActiveNav(activeBtn){

bottomNavButtons.forEach(btn=>{

btn.classList.remove("active");

});

if(activeBtn){

activeBtn.classList.add("active");

moveNavIndicator(activeBtn);

}

}

function showPage(page){

allPages.forEach(p=>{

p.style.display="none";

p.classList.remove("page-in");

});

page.style.display="block";

// paksa reflow supaya class "page-in" ditambahkan di frame
// berikutnya jadi transisinya sempat dianimasikan browser
requestAnimationFrame(()=>{

requestAnimationFrame(()=>{

page.classList.add("page-in");

});

});

}

// Home = data publik (semua orang boleh lihat, admin-only edit).
// My Project = data privat (masing-masing user, bebas diedit sendiri).
// Tombol Add sekarang selalu aktif di mode manapun: tujuan simpan
// otomatis mengikuti role (admin -> Home, user lain -> My Project),
// bukan lagi halaman yang sedang dibuka. Lihat addProject() di project.js.
function updateAddButtonVisibility(){

addBottomBtn.disabled=false;
addBottomBtn.style.opacity="";
addBottomBtn.style.pointerEvents="";

}

function switchMode(mode, activeBtn){

const modeChanged = getMode()!==mode;

setMode(mode);

if(modeChanged) resetAllFilters();

showPage(homePage);

setActiveNav(activeBtn);

renderProjects();

updateAddButtonVisibility();

}

homeBtn.onclick=()=>{

switchMode("home", homeBtn);

}

profileBtn.onclick=()=>{

switchMode("myproject", profileBtn);

}

addBottomBtn.onclick=()=>{

document.getElementById("addProjectBtn").click();

}

searchBtn.onclick=()=>{

switchMode("home", homeBtn);

document.getElementById("search").focus();

}

// Tarik data Home publik dari cloud (bisa dipanggil ulang setelah
// status login/role berubah, misalnya setelah login sebagai admin).
async function refreshHomeView(){

await pullHomeFromCloud();

setHomeProjects(loadHomeProjects());

if(getMode()==="home") renderProjects();

updateAddButtonVisibility();

}

updateAddButtonVisibility();

// Halaman Home aktif secara default saat pertama kali dibuka
setActiveNav(homeBtn);

// Jaga posisi indikator tetap pas saat ukuran layar berubah
window.addEventListener("resize", ()=>{

const current=bottomNavButtons.find(btn=>btn.classList.contains("active"));

moveNavIndicator(current);

});

/* ==========================================
   HAMBURGER MENU
========================================== */

const menuBtn=document.getElementById("menuBtn");

const closeMenuBtn=document.getElementById("closeMenuBtn");

const sideMenuOverlay=document.getElementById("sideMenuOverlay");

const bottomNav=document.querySelector(".bottom-nav");

const profileSecurityBtn=document.getElementById("profileSecurityBtn");

const closeSecurityPageBtn=document.getElementById("closeSecurityPageBtn");

function openSecurityPage(){

closeMenu();

showPage(securityPage);

setActiveNav(null);

bottomNav.style.display="none";

}

function closeSecurityPage(){

showPage(homePage);

setActiveNav(homeBtn);

bottomNav.style.display="flex";

}

profileSecurityBtn.onclick=openSecurityPage;

closeSecurityPageBtn.onclick=closeSecurityPage;

let navBeforeMenu=null;

function openMenu(highlightProfile){

if(highlightProfile){

navBeforeMenu=bottomNavButtons.find(btn=>btn.classList.contains("active")) || homeBtn;

setActiveNav(profileBtn);

}

openModalEl(sideMenuOverlay);

document.body.classList.add("modal-open");

}

function closeMenu(){

closeModalEl(sideMenuOverlay);

document.body.classList.remove("modal-open");

if(navBeforeMenu){

setActiveNav(navBeforeMenu);

navBeforeMenu=null;

}

}

menuBtn.onclick=()=>openMenu(false);

closeMenuBtn.onclick=closeMenu;

/* ==========================================
   SETTINGS: DARK / LIGHT MODE
========================================== */

const THEME_KEY="airdropHub_theme";

const darkModeToggle=document.getElementById("darkModeToggle");

const themeIcon=document.getElementById("themeIcon");

const themeModeLabel=document.getElementById("themeModeLabel");

function applyTheme(theme){

document.body.classList.toggle("theme-light", theme==="light");

darkModeToggle.checked = theme==="dark";

const themeKey = theme==="dark" ? "settings.darkMode" : "settings.lightMode";

if(themeIcon){

themeIcon.className = theme==="dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";

}

if(themeModeLabel){

themeModeLabel.setAttribute("data-i18n", themeKey);

themeModeLabel.textContent = t(themeKey);

}

}

const savedTheme=localStorage.getItem(THEME_KEY) || "dark";

applyTheme(savedTheme);

darkModeToggle.onchange=()=>{

const theme=darkModeToggle.checked ? "dark" : "light";

localStorage.setItem(THEME_KEY, theme);

applyTheme(theme);

};

/* ==========================================
   SETTINGS: LANGUAGE (ID / EN)
========================================== */

const langSwitch=document.getElementById("langSwitch");

const langButtons=langSwitch.querySelectorAll("[data-lang]");

function applyLang(lang, {refresh=true}={}){

setLang(lang);

langButtons.forEach(btn=>btn.classList.toggle("active", btn.dataset.lang===lang));

applyStaticTranslations();

if(refresh) refreshProjectsView(false);

}

applyLang(getLang(), {refresh:false});

langButtons.forEach(btn=>{

btn.onclick=()=>applyLang(btn.dataset.lang);

});

/* ==========================================
   SETTINGS: ADD TO PHONE (PWA INSTALL)
========================================== */

const installAppBtn=document.getElementById("installAppBtn");

let deferredInstallPrompt=null;

const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true;

const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

if(!isStandalone && installAppBtn){

    if(isIOS){

        installAppBtn.style.display="flex";

    }

    window.addEventListener("beforeinstallprompt", (e)=>{

        e.preventDefault();

        deferredInstallPrompt=e;

        installAppBtn.style.display="flex";

    });

}

window.addEventListener("appinstalled", ()=>{

    installAppBtn.style.display="none";

    deferredInstallPrompt=null;

    showToast(t("toast.installSuccess"));

});

if(installAppBtn){

    installAppBtn.onclick=async ()=>{

        if(deferredInstallPrompt){

            deferredInstallPrompt.prompt();

            await deferredInstallPrompt.userChoice;

            deferredInstallPrompt=null;

        }else if(isIOS){

            showToast(t("toast.installIOS"), 4000, "success");

        }else{

            showToast(t("toast.installUnavailable"), 3000, "error");

        }

    };

}

if("serviceWorker" in navigator){

    window.addEventListener("load", ()=>{

        navigator.serviceWorker.register("sw.js").catch(()=>{});

    });

}

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

        // restart animasi pop setiap kali badge ter-update
        notifBadge.classList.remove("pop");
        void notifBadge.offsetWidth;
        notifBadge.classList.add("pop");

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

        const action = n.meta && n.meta.action;

        let actionBtn = "";

        if(action==="editProject" && n.meta.projectId){

            actionBtn = `<button type="button" class="notif-action-btn" data-notif-action="editProject" data-project-id="${n.meta.projectId}"><i class="fa-solid fa-pen" aria-hidden="true"></i> Edit</button>`;

        } else if(action==="login"){

            actionBtn = `<button type="button" class="notif-action-btn" data-notif-action="login"><i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Login</button>`;

        }

        item.innerHTML=`
            <i class="notif-icon ${NOTIF_ICON[n.type]||NOTIF_ICON.info}"></i>
            <div class="notif-body">
                <div class="notif-message"></div>
                <div class="notif-time">${timeAgo(n.createdAt)}</div>
                ${actionBtn}
            </div>
        `;

        item.querySelector(".notif-message").textContent=n.message;

        notifList.appendChild(item);

    });

}

notifList.addEventListener("click",(e)=>{

    const btn=e.target.closest(".notif-action-btn");

    if(!btn) return;

    const action=btn.dataset.notifAction;

    if(action==="editProject"){

        closeNotifModalFn();
        editProject(btn.dataset.projectId);

    } else if(action==="login"){

        closeNotifModalFn();
        showCloudAuthModal();

    }

});

notifBtn.onclick=()=>{

    renderNotifList();

    openModalEl(notifModal);

    document.body.classList.add("modal-open");

    markAllNotificationsRead();

    refreshNotifBadge();

};

function closeNotifModalFn(){

    closeModalEl(notifModal);

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

const switchAccountBtn=document.getElementById("switchAccountBtn");

const profileLogoutWrap=document.getElementById("profileLogoutWrap");

const securityCurrentPassword=document.getElementById("securityCurrentPassword");

const securityNewPassword=document.getElementById("securityNewPassword");

const securityError=document.getElementById("securityError");

const securityUpdateBtn=document.getElementById("securityUpdateBtn");

const deleteAccountPassword=document.getElementById("deleteAccountPassword");

const deleteAccountError=document.getElementById("deleteAccountError");

const deleteAccountBtn=document.getElementById("deleteAccountBtn");

let cloudAuthMode="login"; // "login" atau "register"

function setCloudAuthMode(mode){

    cloudAuthMode=mode;

    cloudAuthLoginBtn.textContent = cloudAuthMode==="login" ? "Login" : "Daftar";

    cloudAuthRegisterLink.textContent = cloudAuthMode==="login" ? "Daftar sekarang" : "Login di sini";

    cloudAuthRegisterLink.previousSibling.textContent = cloudAuthMode==="login" ? "Belum punya akun? " : "Sudah punya akun? ";

    cloudAuthError.style.display="none";

}

function showCloudAuthModal(){

    cloudAuthError.style.display="none";

    openModalEl(cloudAuthModal);

    document.body.classList.add("modal-open");

}

function closeCloudAuthModal(){

    closeModalEl(cloudAuthModal);

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
        profileLogoutWrap.style.display="block";

        profileEmailDisplay.textContent=user.email;
        profileAvatar.textContent=user.email.charAt(0).toUpperCase();

    }else{

        profileLoggedInView.style.display="none";
        profileLoggedOutView.style.display="block";
        profileLogoutWrap.style.display="none";

        securityCurrentPassword.value="";
        securityNewPassword.value="";
        securityError.style.display="none";

        deleteAccountPassword.value="";
        deleteAccountError.style.display="none";

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

    setCloudAuthMode(cloudAuthMode==="login" ? "register" : "login");

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

    closeMenu();

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

        // Hak admin (kalau ada) hilang setelah logout -> render ulang
        // supaya tombol Edit/Delete/Add di Home ikut disembunyikan lagi.
        renderProjects();

        updateAddButtonVisibility();

    }

};

switchAccountBtn.onclick=async()=>{

    const user=getCurrentUser();

    if(!user) return;

    const confirmed=await showConfirm(`Pindah akun dari ${user.email}? Kamu akan logout, lalu bisa login ke akun lain.`,"Pindah Akun");

    if(!confirmed) return;

    await logoutCloud();

    refreshProfilePage();

    renderProjects();

    updateAddButtonVisibility();

    closeMenu();

    setCloudAuthMode("login");

    showCloudAuthModal();

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

deleteAccountBtn.onclick=async()=>{

    const password=deleteAccountPassword.value;

    if(!password){

        deleteAccountError.textContent="Masukkan password untuk konfirmasi.";
        deleteAccountError.style.display="block";

        return;

    }

    const user=getCurrentUser();

    const confirmed=await showConfirm(

        `Akun ${user ? user.email : ""} dan SEMUA project di dalamnya akan dihapus permanen dari cloud & device ini. Tindakan ini tidak bisa dibatalkan.`,

        "Hapus Akun"

    );

    if(!confirmed) return;

    deleteAccountBtn.disabled=true;

    deleteAccountBtn.textContent="Menghapus...";

    try{

        await withUiTimeout(deleteAccountCloud(password), 8000);

        showToast("Akun berhasil dihapus.");

        setTimeout(()=>location.reload(),700);

        return;

    }catch(error){

        console.error("[Security]",error);

        let msg="Gagal menghapus akun.";

        if(error.message==="TIMEOUT") msg="Koneksi lambat/gagal, coba lagi.";
        else if(error.code && error.code.includes("wrong-password")) msg="Password salah.";
        else if(error.code && error.code.includes("requires-recent-login")) msg="Sesi login sudah lama, masukkan password lagi lalu coba ulang.";

        deleteAccountError.textContent=msg;
        deleteAccountError.style.display="block";

    }

    deleteAccountBtn.disabled=false;

    deleteAccountBtn.innerHTML=`<i class="fa-solid fa-trash-can"></i> <span data-i18n="profile.deleteAccount">Delete Account</span>`;

};

sideMenuOverlay.addEventListener("click", (e)=>{

if(e.target===sideMenuOverlay){

closeMenu();

}

});
