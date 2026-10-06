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
import { normalizeProject, migrateTaskFields } from "./projectSchema.js";

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

// Email sudah diverifikasi? (akun Google otomatis terverifikasi)
export function isEmailVerified(user = getCurrentUser()) {
    return !!(user && user.emailVerified);
}

// true kalau akun punya password (login email); akun Google-only tidak.
export function hasPasswordLogin(user = getCurrentUser()) {
    return !!(user && user.providerData.some((p) => p.providerId === "password"));
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
        reauthenticateWithPopup: authMod.reauthenticateWithPopup,
        sendEmailVerification: authMod.sendEmailVerification,
        reload: authMod.reload,
        GoogleAuthProvider: authMod.GoogleAuthProvider,
        signInWithPopup: authMod.signInWithPopup,
        getAdditionalUserInfo: authMod.getAdditionalUserInfo,
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

                // Akun yang belum verifikasi: cek ulang ke server dulu (user
                // mungkin baru klik link di email), dan JANGAN aktifkan cloud
                // sebelum terverifikasi.
                if (!user.emailVerified) await refreshVerification(user);

                if (user.emailVerified) {

                    currentUid = user.uid;
                    ready = true;

                    await pullFromCloud();

                }

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

// Memuat ulang data akun dari server supaya status emailVerified terbaru
// (dan token baru, karena aturan Firestore membaca klaim email_verified).
async function refreshVerification(user) {

    try {

        await firebase.reload(user);

        if (user.emailVerified) await user.getIdToken(true);

    } catch (error) {

        console.warn("[CloudSync] Gagal cek status verifikasi email:", error);

    }

}

// Mengaktifkan sinkronisasi cloud untuk akun yang sudah terverifikasi.
// newAccount=true: akun baru -> unggah data lokal yang ada sekarang.
async function activateCloud(user, newAccount) {

    currentUid = user.uid;
    ready = true;

    if (newAccount) {

        await pushToCloud(true);

    } else {

        await pullFromCloud();

    }

}

export async function loginWithEmail(email, password) {

    const cred = await firebase.signInWithEmailAndPassword(auth, email, password);

    // Belum verifikasi: login berhasil tapi cloud TIDAK diaktifkan.
    if (!cred.user.emailVerified) await refreshVerification(cred.user);

    if (cred.user.emailVerified) await activateCloud(cred.user, false);

    return cred.user;

}

export async function registerWithEmail(email, password, lang) {

    const cred = await firebase.createUserWithEmailAndPassword(auth, email, password);

    // Kirim email verifikasi; cloud baru aktif setelah link diklik.
    await sendVerificationEmail(lang, cred.user);

    return cred.user;

}

// Kirim (ulang) email verifikasi ke akun yang sedang login.
export async function sendVerificationEmail(lang, user = getCurrentUser()) {

    if (!auth || !firebase || !user) throw new Error("NOT_LOGGED_IN");

    auth.languageCode = lang === "id" ? "id" : "en";

    await firebase.sendEmailVerification(user);

}

// Dipanggil tombol "Saya sudah verifikasi". Mengembalikan true kalau
// emailnya sudah terverifikasi (dan cloud sudah diaktifkan).
export async function checkEmailVerified() {

    const user = getCurrentUser();

    if (!user) throw new Error("NOT_LOGGED_IN");

    await refreshVerification(user);

    if (!user.emailVerified) return false;

    // Akun yang baru dibuat belum punya dokumen cloud -> unggah data lokal
    // (sama seperti perilaku daftar sebelumnya). Akun lama -> tarik dari cloud.
    let hasDoc = false;

    try {

        const snap = await firebase.getDoc(firebase.doc(db, FIRESTORE.usersCollection, user.uid));

        hasDoc = snap.exists();

    } catch (error) { /* gagal cek -> anggap sudah ada, aman: pull tidak menimpa cloud */ hasDoc = true; }

    await activateCloud(user, !hasDoc);

    return true;

}

// Login / daftar dengan akun Google. Email Google sudah terverifikasi.
export async function loginWithGoogle() {

    const provider = new firebase.GoogleAuthProvider();

    const cred = await firebase.signInWithPopup(auth, provider);

    const info = firebase.getAdditionalUserInfo(cred);

    await activateCloud(cred.user, !!(info && info.isNewUser));

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

    if (hasPasswordLogin(user)) {

        const credential = firebase.EmailAuthProvider.credential(user.email, currentPassword);

        await firebase.reauthenticateWithCredential(user, credential);

    } else {

        // akun Google tidak punya password -> verifikasi ulang lewat popup Google
        await firebase.reauthenticateWithPopup(user, new firebase.GoogleAuthProvider());

    }

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
   (id -> nama, status, chain, deadline, prioritas, jenis task,
   hash catatan). Setiap Home ditarik dari cloud, snapshot
   dibandingkan dengan data terbaru:
   - id baru            -> notifikasi "project baru"
   - id hilang          -> notifikasi "project dihapus"
   - status berubah     -> notifikasi "status project berubah"
   - misi berubah       -> salinan di My Project diperbarui otomatis;
                           notifikasi hanya jika menjadi "Misi Baru"
   - funding berubah    -> salinan di My Project diperbarui otomatis
                           (sama seperti misi); notifikasi hanya pemberitahuan
   - nama berubah       -> notifikasi "project ganti nama"
   - chain/deadline/funding/prioritas/jenis task/catatan berubah
                        -> notifikasi "project diperbarui" (+ daftar field)
   Notifikasi per-project (status/nama/edit) membawa meta
   { action: "syncHomeEdit" } -> tombol "Perbarui" di Notification
   Center. Field yang diterapkan otomatis (funding) tidak ikut tombol:
   kalau hanya field itu yang berubah, notifikasi tanpa tombol sama sekali.
   Notifikasi ringkasan (> 3 project) tidak punya tombol.
   Snapshot lama (hanya nama & status) tetap aman: field yang
   belum tercatat di snapshot dilewati, tidak dianggap berubah.
   Pembukaan pertama (belum ada snapshot) hanya menyimpan
   baseline supaya user baru tidak dibanjiri notifikasi.
   Admin tidak dinotifikasi atas perubahannya sendiri.
========================================== */

const HOME_NOTIF_GROUP_LIMIT = 3;

// Hash ringan untuk catatan: cukup untuk mendeteksi "berubah atau tidak"
// tanpa menyimpan seluruh isi catatan di localStorage.
function hashText(text) {

    let hash = 5381;

    for (let i = 0; i < text.length; i++) {

        hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;

    }

    return String(hash);

}

function snapshotHome(rawProjects) {

    const map = {};

    try {

        const list = JSON.parse(rawProjects || "[]");

        if (Array.isArray(list)) {

            list.forEach((raw) => {

                // data Home di cloud bisa masih skema lama (taskType Daily/Weekly/...)
                const p = normalizeProject(raw);

                if (p && p.id != null) {

                    map[p.id] = {
                        name: String(p.name || ""),
                        status: String(p.status || ""),
                        network: String(p.network || ""),
                        deadline: String(p.deadline || ""),
                        funding: String(p.funding || ""),
                        priority: String(p.priority || ""),
                        taskType: String(p.taskType || ""),
                        checkIn: String(p.checkIn || ""),
                        mission: String(p.mission || "None"),
                        noteHash: hashText(String(p.note || ""))
                    };

                }

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

// Antrean perubahan otomatis (misi & funding): diterapkan ke My Project
// nanti (setelah data My Project selesai ditarik dari cloud supaya tidak
// tertimpa).
function queueAutoUpdates(updates) {

    try {

        const raw = localStorage.getItem(STORAGE_KEYS.pendingHomeUpdates);

        const queue = raw ? JSON.parse(raw) : [];

        localStorage.setItem(
            STORAGE_KEYS.pendingHomeUpdates,
            JSON.stringify((Array.isArray(queue) ? queue : []).concat(updates))
        );

    } catch (error) { /* antrean gagal disimpan -> abaikan */ }

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
    const removed = [];
    const renamed = [];
    const changed = [];
    const edited = [];
    const missionNew = [];
    const autoUpdates = [];

    // field selain nama & status yang dipantau -> kunci i18n label-nya
    // [key snapshot, kunci i18n label, nama field project untuk tombol "Perbarui"]
    const EDIT_FIELDS = [
        ["network", "notif.fieldChain", "network"],
        ["deadline", "notif.fieldDeadline", "deadline"],
        ["funding", "notif.fieldFunding", "funding"],
        ["priority", "notif.fieldPriority", "priority"],
        ["taskType", "notif.fieldTaskType", "taskType"],
        ["checkIn", "notif.fieldCheckIn", "checkIn"],
        ["noteHash", "notif.fieldNote", "note"]
    ];

    // field project yang diterapkan otomatis ke salinan user (tanpa tombol
    // "Perbarui") -- dikecualikan dari meta notifikasi.
    const AUTO_SYNC_FIELDS = ["funding"];

    // Meta notifikasi -> memunculkan tombol "Perbarui" (kalau user punya
    // salinan project ini di My Project). oldName/oldNetwork dipakai untuk
    // mencocokkan salinan lama yang belum bertanda homeId.
    const syncMeta = (id, before, fields) => ({
        action: "syncHomeEdit",
        homeId: Number(id),
        fields,
        oldName: before.name,
        oldNetwork: before.network
    });

    Object.keys(current).forEach((id) => {

        const now = current[id];
        let before = previous[id];

        if (!before) {

            added.push(now);

            return;

        }

        // Snapshot dari versi lama menyimpan taskType skema lama (mis. "Daily"):
        // migrasikan dulu supaya perubahan skema tidak dianggap edit admin.
        // Snapshot yang lebih tua lagi (tanpa taskType) dilewati saja.
        if (before && before.taskType !== undefined && before.checkIn === undefined) {

            before = { ...before, ...migrateTaskFields(before.taskType) };

        }

        // before.<field> === undefined berarti snapshot lama belum mencatat
        // field itu -> dilewati supaya tidak dianggap "berubah" semua.
        if (before.status !== now.status) {

            changed.push({ ...now, meta: syncMeta(id, before, ["status"]) });

        }

        if (before.name !== now.name) {

            renamed.push({
                oldName: before.name,
                newName: now.name,
                meta: syncMeta(id, before, ["name"])
            });

        }

        const diff = EDIT_FIELDS.filter(
            ([key]) => before[key] !== undefined && before[key] !== now[key]
        );

        // Misi & Funding: tidak ada tombol "Perbarui" -- salinan di My Project
        // diperbarui otomatis lewat antrean (lihat applyPendingHomeUpdates di
        // storage.js). Notifikasi hanya memberi tahu (misi: hanya kalau menjadi
        // "Misi Baru"; funding: lewat notifikasi "project diperbarui" di bawah).
        const missionChanged = before.mission !== undefined && before.mission !== now.mission;
        const fundingChanged = diff.some(([key]) => key === "funding");

        if (missionChanged || fundingChanged) {

            const update = {
                homeId: Number(id),
                hints: [
                    { name: before.name, network: before.network },
                    { name: now.name, network: now.network }
                ]
            };

            if (missionChanged) update.mission = now.mission;
            if (fundingChanged) update.funding = now.funding;

            autoUpdates.push(update);

            if (missionChanged && now.mission === "New") missionNew.push(now);

        }

        if (diff.length) {

            // field yang berlaku otomatis tidak ikut tombol "Perbarui";
            // kalau tidak ada field tersisa, notifikasi tanpa tombol.
            const manualFields = diff
                .filter(([, , syncKey]) => !AUTO_SYNC_FIELDS.includes(syncKey))
                .map(([, , syncKey]) => syncKey);

            edited.push({
                name: now.name,
                fields: diff.map(([, labelKey]) => t(labelKey)),
                meta: manualFields.length ? syncMeta(id, before, manualFields) : undefined
            });

        }

    });

    Object.keys(previous).forEach((id) => {

        if (!current[id]) removed.push(previous[id]);

    });

    if (added.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeNewMany").replace("{count}", added.length), "info");

    } else {

        added.forEach((p) => addNotification(t("notif.homeNew").replace("{name}", p.name), "info"));

    }

    if (removed.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeRemovedMany").replace("{count}", removed.length), "info");

    } else {

        removed.forEach((p) => addNotification(t("notif.homeRemoved").replace("{name}", p.name), "info"));

    }

    if (changed.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeStatusMany").replace("{count}", changed.length), "info");

    } else {

        changed.forEach((p) => addNotification(
            t("notif.homeStatus").replace("{name}", p.name).replace("{status}", statusLabel(p.status)),
            "info",
            p.meta
        ));

    }

    if (autoUpdates.length) queueAutoUpdates(autoUpdates);

    if (missionNew.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeMissionNewMany").replace("{count}", missionNew.length), "info");

    } else {

        missionNew.forEach((p) => addNotification(t("notif.homeMissionNew").replace("{name}", p.name), "info"));

    }

    if (renamed.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeRenamedMany").replace("{count}", renamed.length), "info");

    } else {

        renamed.forEach((p) => addNotification(
            t("notif.homeRenamed").replace("{old}", p.oldName).replace("{new}", p.newName),
            "info",
            p.meta
        ));

    }

    if (edited.length > HOME_NOTIF_GROUP_LIMIT) {

        addNotification(t("notif.homeEditedMany").replace("{count}", edited.length), "info");

    } else {

        edited.forEach((p) => addNotification(
            t("notif.homeEdited").replace("{name}", p.name).replace("{fields}", p.fields.join(", ")),
            "info",
            p.meta
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
