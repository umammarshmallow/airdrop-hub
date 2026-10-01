/* ==========================================
   CLOUD SYNC.JS
   Sinkronisasi data (projects) ke
   Firebase Firestore, login pakai Email/Password
   (supaya UID sama di semua device -> data nyambung).

   Cara kerja:
   - Kalau firebaseConfig.js belum diisi -> otomatis
     nonaktif, aplikasi tetap jalan normal via localStorage.
     SDK Firebase (dari gstatic.com) TIDAK di-download
     sama sekali dalam kasus ini.
   - Kalau sudah dikonfigurasi -> SDK Firebase baru diambil
     saat initFirebaseApp() dipanggil (lazy load, bukan di
     top-level file), lalu user harus login/daftar dengan
     email, data localStorage ditarik/ditimpa dari cloud,
     dan didorong ke cloud tiap kali disimpan.
   - Kalau device sedang offline / gagal konek, aplikasi
     tetap jalan normal pakai data lokal (tidak pernah blocking).
========================================== */

import { firebaseConfig } from "./firebaseConfig.js";
import { addNotification } from "./notifications.js";
import { t } from "./i18n.js";
import { statusLabel } from "./formatters.js";
import { STORAGE_KEYS, FIRESTORE } from "./constants.js";

// Set true saat development untuk melihat log status koneksi cloud sync.
const DEBUG = false;

// Fungsi-fungsi dari Firebase SDK, baru diisi setelah
// loadFirebaseSDK() berhasil (lazy, dynamic import).
let firebase = null;

let auth = null;
let db = null;
let currentUid = null;
let ready = false;
let pushTimer = null;
let homePushTimer = null;

// true hanya kalau doc user (airdropHubUsers/{uid}) punya field role: "admin".
// Diisi manual oleh developer lewat Firebase Console -- lihat catatan di
// bagian pullFromCloud().
let currentUserRole = "user";

export function isAdmin() {
    return currentUserRole === "admin";
}

function isConfigured() {
    return (
        firebaseConfig &&
        firebaseConfig.apiKey &&
        !firebaseConfig.apiKey.startsWith("GANTI_")
    );
}

export function isCloudSyncEnabled() {
    return ready;
}

export function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

function userDocRef() {
    return firebase.doc(db, FIRESTORE.usersCollection, currentUid);
}

function homeDocRef() {
    return firebase.doc(db, FIRESTORE.homeCollection, FIRESTORE.homeDocId);
}

/* ==========================================
   LAZY LOAD SDK FIREBASE
   Baru fetch modul dari gstatic.com saat benar-benar
   dibutuhkan, bukan setiap kali app dibuka.
========================================== */

async function loadFirebaseSDK() {

    if (firebase) return firebase; // sudah pernah di-load sebelumnya

    const [appMod, authMod, firestoreMod] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js")
    ]);

    firebase = {
        initializeApp: appMod.initializeApp,
        getAuth: authMod.getAuth,
        onAuthStateChanged: authMod.onAuthStateChanged,
        signInWithEmailAndPassword: authMod.signInWithEmailAndPassword,
        createUserWithEmailAndPassword: authMod.createUserWithEmailAndPassword,
        signOut: authMod.signOut,
        sendPasswordResetEmail: authMod.sendPasswordResetEmail,
        updatePassword: authMod.updatePassword,
        deleteUser: authMod.deleteUser,
        EmailAuthProvider: authMod.EmailAuthProvider,
        reauthenticateWithCredential: authMod.reauthenticateWithCredential,
        getFirestore: firestoreMod.getFirestore,
        doc: firestoreMod.doc,
        getDoc: firestoreMod.getDoc,
        setDoc: firestoreMod.setDoc,
        deleteDoc: firestoreMod.deleteDoc,
        serverTimestamp: firestoreMod.serverTimestamp
    };

    return firebase;

}

/* ==========================================
   INIT APP (tidak login, cuma siapkan koneksi)
========================================== */

export async function initFirebaseApp() {

    if (!isConfigured()) {
        if (DEBUG) console.log("[CloudSync] firebaseConfig.js belum diisi, jalan mode offline.");
        return false;
    }

    const fb = await loadFirebaseSDK();

    const app = fb.initializeApp(firebaseConfig);
    auth = fb.getAuth(app);
    db = fb.getFirestore(app);

    return true;

}

/* ==========================================
   CEK SESI YANG SUDAH LOGIN SEBELUMNYA
   (Firebase otomatis menyimpan sesi di browser,
   jadi user tidak perlu login ulang tiap buka app)
========================================== */

function withTimeout(promise, ms, fallbackValue) {

    return Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => resolve(fallbackValue), ms))
    ]);

}

export function waitForPersistedSession(onLateResolve) {

    if (!auth) return Promise.resolve(null);

    return new Promise((resolve) => {

        let timedOut = false;

        const unsubscribe = firebase.onAuthStateChanged(auth, async (user) => {

            unsubscribe();

            if (user) {

                currentUid = user.uid;
                ready = true;

                await pullFromCloud();

            }

            if (timedOut) {

                // Sesi asli baru terkonfirmasi SETELAH batas waktu tunggu
                // sudah lewat. Jangan dibuang begitu saja (itu penyebab
                // user dipaksa login ulang padahal sebenarnya masih login) —
                // proses diam-diam lewat callback ini.
                if (user && typeof onLateResolve === "function") onLateResolve(user);

                return;

            }

            resolve(user);

        });

        // Jangan tahan tampilan app terlalu lama hanya buat cek sesi login,
        // tapi beri waktu cukup longgar (koneksi lambat/device lemot tidak
        // langsung dianggap "belum login").
        setTimeout(() => {

            timedOut = true;
            resolve(null);

        }, 8000);

    });

}

/* ==========================================
   LOGIN / DAFTAR / LOGOUT
========================================== */

export async function loginWithEmail(email, password) {

    const cred = await firebase.signInWithEmailAndPassword(auth, email, password);

    currentUid = cred.user.uid;
    ready = true;

    await pullFromCloud();

    return cred.user;

}

export async function registerWithEmail(email, password) {

    const cred = await firebase.createUserWithEmailAndPassword(auth, email, password);

    currentUid = cred.user.uid;
    ready = true;

    // Akun baru -> belum ada data di cloud, upload data lokal yang ada sekarang.
    await pushToCloud(true);

    return cred.user;

}

export async function logoutCloud() {

    if (auth) await firebase.signOut(auth);

    ready = false;
    currentUid = null;
    currentUserRole = "user";

}

/* ==========================================
   LUPA PASSWORD
   Pakai fitur bawaan Firebase: kirim email berisi link
   reset password. User klik link, isi password baru di
   halaman Firebase, lalu login lagi seperti biasa.
========================================== */

export async function sendResetEmail(email, lang) {

    if (!auth || !firebase) throw new Error("NOT_CONFIGURED");

    // bahasa email template (id / en)
    auth.languageCode = lang === "id" ? "id" : "en";

    await firebase.sendPasswordResetEmail(auth, email);

}

/* ==========================================
   GANTI PASSWORD
========================================== */

export async function changePassword(currentPassword, newPassword) {

    const user = auth ? auth.currentUser : null;

    if (!user) throw new Error("NOT_LOGGED_IN");

    const credential = firebase.EmailAuthProvider.credential(user.email, currentPassword);

    await firebase.reauthenticateWithCredential(user, credential);

    await firebase.updatePassword(user, newPassword);

}

/* ==========================================
   HAPUS AKUN (PERMANEN)
   Butuh reauthenticate (password saat ini) sama seperti
   ganti password -- Firebase menolak operasi sensitif kalau
   sesi login sudah "terlalu lama", jadi verifikasi dulu.
   Urutan: hapus dokumen Firestore user -> hapus akun Auth ->
   baru bersihkan localStorage & state lokal di device ini.
========================================== */

export async function deleteAccountCloud(currentPassword) {

    const user = auth ? auth.currentUser : null;

    if (!user) throw new Error("NOT_LOGGED_IN");

    const credential = firebase.EmailAuthProvider.credential(user.email, currentPassword);

    await firebase.reauthenticateWithCredential(user, credential);

    try {

        await firebase.deleteDoc(userDocRef());

    } catch (error) {

        // Best-effort -- kalau gagal (mis. offline), tetap lanjut hapus
        // akun Auth-nya supaya user tidak stuck tidak bisa hapus akun.
        console.warn("[CloudSync] Gagal hapus dokumen cloud user (lanjut hapus akun):", error);

    }

    await firebase.deleteUser(user);

    ready = false;
    currentUid = null;
    currentUserRole = "user";

    // Akun sudah dihapus permanen -> device ini juga harus bersih dari
    // data privat akun tersebut.
    localStorage.removeItem(STORAGE_KEYS.projects);
    localStorage.removeItem(STORAGE_KEYS.lastReset);

}

/* ==========================================
   PULL (cloud -> localStorage)
========================================== */

export async function pullFromCloud() {

    if (!ready) return;

    try {

        const snap = await withTimeout(firebase.getDoc(userDocRef()), 6000, null);

        if (snap === null) {

            console.warn("[CloudSync] Timeout ambil data cloud, pakai data lokal dulu.");
            addNotification("Sinkronisasi cloud lambat/timeout — memakai data lokal untuk sementara.", "warning");
            return;

        }

        if (snap.exists()) {

            const cloud = snap.data();

            if (typeof cloud.projects === "string") localStorage.setItem(STORAGE_KEYS.projects, cloud.projects);
            if (typeof cloud.lastReset === "string") localStorage.setItem(STORAGE_KEYS.lastReset, cloud.lastReset);

            // Role admin diatur manual di Firestore Console, di dokumen
            // airdropHubUsers/{uid}, dengan menambah field role: "admin".
            currentUserRole = cloud.role === "admin" ? "admin" : "user";

        } else {

            // Belum ada dokumen cloud untuk akun ini. JANGAN upload apa pun
            // yang kebetulan masih tersisa di localStorage device ini --
            // itu bisa saja sisa akun lain yang login lebih dulu di device
            // yang sama (mis. logout lalu login ke akun berbeda), sehingga
            // datanya bakal ke-upload salah ke akun yang sedang login
            // sekarang. My Project murni privat per-akun, jadi akun yang
            // belum punya data cloud harus mulai dari benar-benar kosong.
            localStorage.setItem(STORAGE_KEYS.projects, "[]");
            localStorage.removeItem(STORAGE_KEYS.lastReset);

            await pushToCloud(true);

        }

    } catch (error) {

        console.warn("[CloudSync] Gagal ambil data cloud, pakai data lokal:", error);
        addNotification(t("sync.fetchFailed"), "error");

    }

}

/* ==========================================
   PUSH (localStorage -> cloud)
   Default: di-debounce 600ms biar tidak spam write
   saat ada banyak perubahan beruntun.
   immediate=true: langsung kirim & ditunggu (dipakai
   setelah import backup / register, sebelum reload).
========================================== */

export function pushToCloud(immediate = false) {

    if (!ready) return Promise.resolve();

    const doPush = async () => {

        try {

            // merge:true -> supaya field "role" (diisi manual admin lewat
            // Firestore Console) TIDAK ikut kehapus tiap kali user
            // menyimpan project.
            await firebase.setDoc(userDocRef(), {
                projects: localStorage.getItem(STORAGE_KEYS.projects) || "[]",
                lastReset: localStorage.getItem(STORAGE_KEYS.lastReset) || "",
                updatedAt: firebase.serverTimestamp()
            }, { merge: true });

        } catch (error) {

            console.warn("[CloudSync] Gagal simpan ke cloud (data tetap aman di device ini):", error);
            addNotification(t("sync.saveFailed"), "error");

        }

    };

    if (immediate) {
        clearTimeout(pushTimer);
        return doPush();
    }

    clearTimeout(pushTimer);
    pushTimer = setTimeout(doPush, 600);

    return Promise.resolve();

}

/* ==========================================
   HOME (public, admin-only)
   - pullHomeFromCloud: siapa saja boleh baca, bahkan
     yang belum login (asal Firestore Rules mengizinkan
     "allow read: if true;" untuk dokumen ini).
   - pushHomeToCloud: hanya dijalankan kalau isAdmin() true.
     Ini cuma penjaga di sisi client -- penegakan yang
     SESUNGGUHNYA tetap wajib lewat Firestore Security Rules
     di sisi server, karena kode di browser selalu bisa
     dilihat/diubah orang lain lewat devtools.
========================================== */

/* ==========================================
   NOTIFIKASI PERUBAHAN HOME
   Admin tidak "mengirim" apa pun secara manual: tiap
   user menyimpan snapshot terakhir Home yang pernah dilihat
   (id -> nama & status). Setiap Home ditarik dari cloud,
   snapshot dibandingkan dengan data terbaru:
   - id baru            -> notifikasi "project baru"
   - status berubah     -> notifikasi "status project berubah"
   Pembukaan pertama (belum ada snapshot) hanya menyimpan
   baseline supaya user baru tidak dibanjiri notifikasi.
   Admin tidak dinotifikasi atas perubahannya sendiri.
========================================== */

const HOME_NOTIF_GROUP_LIMIT = 3;

function snapshotHome(rawProjects) {

    const map = {};

    try {

        const list = JSON.parse(rawProjects || "[]");

        if (Array.isArray(list)) {

            list.forEach((p) => {

                if (p && p.id != null) map[p.id] = { name: String(p.name || ""), status: String(p.status || "") };

            });

        }

    } catch (error) { /* data rusak -> anggap kosong */ }

    return map;

}

function saveHomeSeen(rawProjects) {

    try {

        localStorage.setItem(STORAGE_KEYS.homeSeen, JSON.stringify(snapshotHome(rawProjects)));

    } catch (error) { /* storage penuh/diblokir: abaikan */ }

}

function announceHomeChanges(rawProjects) {

    const current = snapshotHome(rawProjects);

    let previous = null;

    try {

        const raw = localStorage.getItem(STORAGE_KEYS.homeSeen);

        previous = raw ? JSON.parse(raw) : null;

    } catch (error) { previous = null; }

    // baseline pertama, atau admin (perubahan itu dibuatnya sendiri)
    if (!previous || isAdmin()) {

        saveHomeSeen(rawProjects);

        return;

    }

    const added = [];
    const changed = [];

    Object.keys(current).forEach((id) => {

        if (!previous[id]) added.push(current[id]);

        else if (previous[id].status !== current[id].status) changed.push(current[id]);

    });

    if (added.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeNewMany").replace("{count}", added.length), "info");

    } else {

        added.forEach((p) => addNotification(t("notif.homeNew").replace("{name}", p.name), "info"));

    }

    if (changed.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeStatusMany").replace("{count}", changed.length), "info");

    } else {

        changed.forEach((p) => addNotification(
            t("notif.homeStatus").replace("{name}", p.name).replace("{status}", statusLabel(p.status)),
            "info"
        ));

    }

    saveHomeSeen(rawProjects);

}

export async function pullHomeFromCloud() {

    if (!db) return;

    try {

        const snap = await withTimeout(firebase.getDoc(homeDocRef()), 6000, null);

        if (snap === null) {
            if (DEBUG) console.warn("[CloudSync] Timeout ambil data Home dari cloud.");
            return;
        }

        if (snap.exists()) {

            const cloud = snap.data();

            if (typeof cloud.projects === "string") {

                try { announceHomeChanges(cloud.projects); } catch (error) { console.warn("[CloudSync] Gagal cek perubahan Home:", error); }

                localStorage.setItem(STORAGE_KEYS.homeProjects, cloud.projects);

            }

        }

    } catch (error) {

        console.warn("[CloudSync] Gagal ambil data Home dari cloud, pakai cache lokal:", error);

    }

}

export function pushHomeToCloud(immediate = false) {

    if (!ready || !isAdmin()) return Promise.resolve();

    const doPush = async () => {

        try {

            await firebase.setDoc(homeDocRef(), {
                projects: localStorage.getItem(STORAGE_KEYS.homeProjects) || "[]",
                updatedAt: firebase.serverTimestamp()
            }, { merge: true });

            // perubahan ini dibuat admin sendiri -> tidak perlu jadi notifikasi di device-nya
            saveHomeSeen(localStorage.getItem(STORAGE_KEYS.homeProjects) || "[]");

        } catch (error) {

            console.warn("[CloudSync] Gagal simpan data Home ke cloud:", error);
            addNotification(t("sync.homeSaveFailed"), "error");

        }

    };

    if (immediate) {
        clearTimeout(homePushTimer);
        return doPush();
    }

    clearTimeout(homePushTimer);
    homePushTimer = setTimeout(doPush, 600);

    return Promise.resolve();

}
