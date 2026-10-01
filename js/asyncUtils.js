/* ==========================================
   ASYNCUTILS.JS
   Utilitas async kecil yang dipakai bersama
   oleh authUI.js, forgotPassword.js, dan
   profilePage.js.
========================================== */

/* Batasi lama tunggu sebuah promise. Kalau lewat dari `ms`,
   promise ditolak dengan Error("TIMEOUT") supaya tombol di UI
   tidak macet selamanya saat koneksi lambat/gagal total. */
export function withUiTimeout(promise, ms) {

    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms))
    ]);

}
