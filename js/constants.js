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
    rememberEmail: "airdrophub_remember_email",

    // Daftar akun yang pernah login di perangkat ini (untuk "Pindah Akun").
    // Hanya metadata (email, uid, nama slot sesi) -- TANPA password/token.
    // Sesi login sebenarnya disimpan Firebase sendiri per akun.
    accounts: "airdropHub_accounts",

    // Awalan key salinan data per akun (airdropHub_acct_<uid>) -- tempat
    // "parkir" data My Project akun yang sedang tidak dipakai.
    accountCachePrefix: "airdropHub_acct_",

    // Penanda: data lokal akun ini BELUM terverifikasi dari cloud, jadi
    // jangan di-upload dulu (mencegah menimpa data cloud dengan data kosong).
    pullGuard: "airdropHub_pullGuard"

});

// Batas jumlah akun tersimpan per perangkat.
export const MAX_SAVED_ACCOUNTS = 5;

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

// Alamat email penerima feedback/saran (tombol "Feedback & Saran" di Settings).
export const FEEDBACK_EMAIL = "airdrophub.support@gmail.com";

// Dompet untuk "Kirim Apresiasi untuk Dev" di menu Pengaturan.
// Penerimaan: USDT lewat jaringan BNB Smart Chain (BEP-20).
// PENTING: kalau alamat diganti, QR di js/appreciationQr.js juga harus dibuat
// ulang. Selama QR belum cocok dengan alamat ini, QR otomatis disembunyikan
// (alamat teks tetap tampil) supaya tidak ada QR yang mengarah ke alamat lama.
// Kalau alamat tidak berformat 0x + 40 karakter heksadesimal, menunya disembunyikan.
export const APPRECIATION_WALLET = {
    address: "0x8c9971b411D9EB89aafd7D5aAe4a23C7B8619eA2",
    asset: "USDT",
    network: "BNB Smart Chain (BEP-20)",
    explorerUrl: "https://bscscan.com/address/"
};
