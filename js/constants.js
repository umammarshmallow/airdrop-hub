/* ==========================================
   CONSTANTS.JS
   Satu-satunya tempat untuk nama key
   localStorage, nama koleksi Firestore, dan
   nama custom event yang dipakai lintas modul.

   PENTING: NILAI STRING DI SINI JANGAN DIUBAH.
   Key localStorage sudah tersimpan di perangkat
   pengguna, dan nama koleksi Firestore sudah
   berisi data. Mengubah nilainya membuat data
   lama "hilang" dari sudut pandang aplikasi.
   (Gaya huruf yang tidak seragam, mis.
   "airdrophub_remember_email", memang warisan.)
========================================== */

/* ==========================================
   LOCALSTORAGE
========================================== */

export const STORAGE_KEYS = Object.freeze({

    // "My Project" -> data privat milik masing-masing user (per-uid di cloud).
    projects: "airdropHub",

    // "Home" -> data publik/shared, bisa dibaca semua orang, tapi
    // hanya admin (role="admin") yang boleh menyimpan perubahan ke cloud.
    homeProjects: "airdropHub_home",

    // Tanggal reset task harian terakhir (My Project).
    lastReset: "airdropHub_lastReset",

    // Snapshot Home terakhir yang sudah "dilihat" user,
    // dipakai untuk mendeteksi perubahan Home dari admin.
    homeSeen: "airdropHub_homeSeen",

    // Antrean perubahan Home yang diterapkan otomatis (Misi & Funding) dan
    // menunggu diterapkan ke salinan di My Project (diterapkan setelah data
    // My Project selesai ditarik). Nilai key sengaja tidak diubah supaya
    // antrean lama tetap terbaca.
    pendingHomeUpdates: "airdropHub_pendingMissions",

    // Riwayat Notification Center.
    notifications: "airdropHub_notifications",

    // Preferensi tampilan.
    theme: "airdropHub_theme",
    lang: "airdropHub_lang",

    // Email yang diingat untuk "Remember me" di form login.
    rememberEmail: "airdrophub_remember_email"

});

/* ==========================================
   FIRESTORE
========================================== */

export const FIRESTORE = Object.freeze({

    // Dokumen per-user: airdropHubUsers/{uid} (data privat + field role).
    usersCollection: "airdropHubUsers",

    // Doc publik (dibaca semua orang) tempat data Home disimpan.
    homeCollection: "airdropHubGlobal",
    homeDocId: "home"

});

/* ==========================================
   CUSTOM EVENT (window)
========================================== */

export const EVENTS = Object.freeze({

    // Dipicu setiap kali daftar notifikasi berubah.
    notification: "airdrophub:notification"

});
