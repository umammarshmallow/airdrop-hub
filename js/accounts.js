/* ==========================================
   ACCOUNTS.JS
   Daftar akun yang pernah login di perangkat ini
   (dipakai fitur "Pindah Akun") + penyimpanan salinan
   data per akun.

   Yang disimpan di sini HANYA metadata: email, uid, nama
   "slot" sesi Firebase, dan jenis login. Password dan token
   TIDAK pernah disimpan di sini -- sesi login yang sebenarnya
   disimpan Firebase sendiri (IndexedDB), satu slot per akun.

   Modul ini murni localStorage, tanpa Firebase.
========================================== */

import { STORAGE_KEYS } from "./constants.js";

// Nama slot bawaan Firebase. Dipakai untuk akun yang sudah login SEBELUM
// fitur Pindah Akun ada (sesinya tetap di slot lama, jadi tidak perlu
// login ulang setelah update).
export const DEFAULT_APP = "[DEFAULT]";

// Slot kosong untuk keadaan "ada akun tersimpan, tapi belum ada yang aktif".
// Tidak pernah dipakai login, jadi tidak pernah punya sesi.
export const IDLE_APP = "acct_idle";

// Data yang bersifat per-akun (dipindah/diparkir saat pindah akun).
// Home publik, tema, dan bahasa sengaja TIDAK ikut: itu milik perangkat.
const PER_ACCOUNT_KEYS = [
    STORAGE_KEYS.projects,
    STORAGE_KEYS.lastReset,
    STORAGE_KEYS.homeSeen,
    STORAGE_KEYS.pendingHomeUpdates,
    STORAGE_KEYS.notifications
];

/* ==========================================
   DAFTAR AKUN
   { v: 1, activeApp: string|null, accounts: [
       { app, uid, email, provider: "password"|"google", lastUsed }
   ] }
========================================== */

function emptyRegistry() {

    return { v: 1, activeApp: null, accounts: [] };

}

function readRegistry() {

    try {

        const raw = localStorage.getItem(STORAGE_KEYS.accounts);

        if (!raw) return emptyRegistry();

        const data = JSON.parse(raw);

        if (!data || !Array.isArray(data.accounts)) return emptyRegistry();

        return {
            v: 1,
            activeApp: typeof data.activeApp === "string" ? data.activeApp : null,
            accounts: data.accounts.filter(
                (a) => a && typeof a.app === "string" && typeof a.uid === "string" && typeof a.email === "string"
            )
        };

    } catch (error) {

        return emptyRegistry();

    }

}

function writeRegistry(reg) {

    try {

        localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(reg));

    } catch (error) { /* storage penuh/diblokir: abaikan */ }

}

export function getSavedAccounts() {

    // terbaru dipakai di atas
    return readRegistry().accounts.slice().sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));

}

export function getActiveAppName() {

    return readRegistry().activeApp;

}

export function getActiveAccountEntry() {

    const reg = readRegistry();

    return reg.accounts.find((a) => a.app === reg.activeApp) || null;

}

export function findAccountByApp(appName) {

    return readRegistry().accounts.find((a) => a.app === appName) || null;

}

export function findAccountByUid(uid) {

    return readRegistry().accounts.find((a) => a.uid === uid) || null;

}

// Tambah/perbarui akun, lalu jadikan aktif. Kalau uid yang sama sudah ada di
// slot lain, entri lama diganti (sesi terbaru yang dipakai) dan slot lama
// dikembalikan supaya pemanggil bisa menutup sesinya.
export function upsertAccountAndActivate({ app, uid, email, provider }) {

    const reg = readRegistry();

    const replacedApps = [];

    reg.accounts = reg.accounts.filter((a) => {

        // uid sama di slot lain, atau slot ini sebelumnya milik uid lain
        if (a.app !== app && a.uid === uid) { replacedApps.push(a.app); return false; }

        if (a.app === app && a.uid !== uid) return false;

        return true;

    });

    const existing = reg.accounts.find((a) => a.app === app);

    const entry = { app, uid, email, provider, lastUsed: Date.now() };

    if (existing) Object.assign(existing, entry);
    else reg.accounts.push(entry);

    reg.activeApp = app;

    writeRegistry(reg);

    return replacedApps;

}

export function setActiveApp(appName) {

    const reg = readRegistry();

    reg.activeApp = appName;

    const entry = reg.accounts.find((a) => a.app === appName);

    if (entry) entry.lastUsed = Date.now();

    writeRegistry(reg);

}

export function removeAccountEntry(appName) {

    const reg = readRegistry();

    const entry = reg.accounts.find((a) => a.app === appName) || null;

    reg.accounts = reg.accounts.filter((a) => a.app !== appName);

    if (reg.activeApp === appName) reg.activeApp = null;

    writeRegistry(reg);

    return entry;

}

// Nama slot baru yang unik untuk login akun baru.
export function newAppName() {

    return "acct_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

}

/* ==========================================
   SALINAN DATA PER AKUN
   Akun yang sedang aktif memakai key biasa (airdropHub, dst).
   Saat pindah, data akun lama "diparkir" di airdropHub_acct_<uid>,
   dan data akun tujuan dipulihkan dari parkirannya.
========================================== */

function cacheKey(uid) {

    return STORAGE_KEYS.accountCachePrefix + uid;

}

export function saveAccountCache(uid) {

    if (!uid) return;

    const snapshot = {};

    PER_ACCOUNT_KEYS.forEach((key) => {

        const value = localStorage.getItem(key);

        if (value !== null) snapshot[key] = value;

    });

    try {

        localStorage.setItem(cacheKey(uid), JSON.stringify(snapshot));

    } catch (error) { /* storage penuh: abaikan */ }

}

export function clearAccountCache(uid) {

    if (!uid) return;

    localStorage.removeItem(cacheKey(uid));

}

// Mengisi key data aktif dengan data akun tujuan.
// Return true kalau ada salinan (data lokal akun tersebut dipercaya),
// false kalau tidak ada -> data aktif dikosongkan (akun mulai dari nol
// sampai data cloud berhasil ditarik).
export function restoreAccountCache(uid) {

    let snapshot = null;

    try {

        const raw = localStorage.getItem(cacheKey(uid));

        snapshot = raw ? JSON.parse(raw) : null;

    } catch (error) { snapshot = null; }

    PER_ACCOUNT_KEYS.forEach((key) => {

        if (snapshot && typeof snapshot[key] === "string") localStorage.setItem(key, snapshot[key]);
        else localStorage.removeItem(key);

    });

    if (!snapshot) localStorage.setItem(STORAGE_KEYS.projects, "[]");

    return !!snapshot;

}

/* ==========================================
   PENJAGA PUSH
   Aktif kalau data lokal akun BELUM terverifikasi dari cloud
   (mis. pindah ke akun tanpa salinan lokal). Selama aktif,
   perubahan lokal TIDAK di-upload, supaya data cloud akun itu
   tidak tertimpa data kosong kalau penarikan data gagal/timeout.
========================================== */

export function setPullGuard(uid) {

    try { localStorage.setItem(STORAGE_KEYS.pullGuard, uid); } catch (error) { /* abaikan */ }

}

export function clearPullGuard(uid) {

    if (localStorage.getItem(STORAGE_KEYS.pullGuard) === uid) {

        localStorage.removeItem(STORAGE_KEYS.pullGuard);

    }

}

export function isPullGuarded(uid) {

    return !!uid && localStorage.getItem(STORAGE_KEYS.pullGuard) === uid;

}
