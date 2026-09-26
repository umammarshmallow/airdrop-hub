/* ==========================================
   FIREBASE CONFIG
   Ambil nilai ini dari:
   Firebase Console > Project Settings > General
   > Your apps > SDK setup and configuration
   ========================================== */

export const firebaseConfig = {
    apiKey: "AIzaSyB67OfbQb8MzC2V4ln4jIgGOdc-uqxHUVE",
    authDomain: "airdrop-hub-f40ba.firebaseapp.com",
    databaseURL: "https://airdrop-hub-f40ba-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "airdrop-hub-f40ba",
    storageBucket: "airdrop-hub-f40ba.firebasestorage.app",
    messagingSenderId: "198163092739",
    appId: "1:198163092739:web:dd99560373e08f3792c536",
    measurementId: "G-Z73MXBXETQ"
};

/*
   Selama apiKey masih diawali "GANTI_", cloud sync otomatis
   dinonaktifkan dan aplikasi tetap berjalan normal memakai
   localStorage seperti biasa (mode offline).
*/

/*
   UID AKUN ADMIN (buat fitur Home — etalase airdrop publik
   yang cuma bisa diedit oleh 1 akun tertentu).

   Cara ambil UID kamu:
   Firebase Console > pilih project > menu "Authentication"
   (di sidebar kiri) > tab "Users" > kolom "User UID" pada
   baris akun kamu > klik buat copy.

   Selama masih "GANTI_UID_ADMIN_DISINI", tombol admin
   (Add/Edit/Delete airdrop di Home) tidak akan muncul untuk
   siapapun — aplikasi tetap jalan normal, cuma fitur admin-nya
   nonaktif.
*/
export const ADMIN_UID = "0yAFFxBJOBP9kyODm1SOIIDj1oj2";
