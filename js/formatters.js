/* ==========================================
   FORMATTERS.JS
   Fungsi murni untuk mengubah data menjadi
   teks/URL/kelas siap tampil: URL, escape HTML,
   tanggal, dan label/kelas status project.
========================================== */

import { t } from "./i18n.js";

/* ==========================
FORMAT URL (website project)
Alamat website yang disimpan user boleh ditulis tanpa
skema (mis. "example.com"), jadi perlu dilengkapi jadi URL
yang valid sebelum dipakai sebagai href.

Kenapa harus lewat allowlist skema yang eksplisit (bukan
sekadar "kalau belum ada http, tambahin https"):
skema seperti "javascript:" atau "data:" bisa dipakai untuk
menjalankan kode kalau nilainya lolos begitu saja dipasang
ke atribut href. Jadi kita SELALU pastikan hasil akhirnya
berskema http/https, apa pun input mentahnya.
========================== */

const ALLOWED_URL_SCHEMES = ["http:", "https:"];

export function formatUrl(url = "") {

    url = url.trim();

    if (url === "") return "#";

    // Coba anggap input sudah URL lengkap (ada skema eksplisit,
    // termasuk yang berbahaya seperti javascript:/data:).
    try {

        const parsed = new URL(url);

        if (ALLOWED_URL_SCHEMES.includes(parsed.protocol)) {

            return parsed.href;

        }

        // Skema tidak diizinkan (mis. javascript:, data:) -> jangan
        // dipakai mentah-mentah, coba lagi anggap ini domain biasa.

    } catch (error) {

        // Bukan URL lengkap yang valid (kemungkinan besar cuma
        // domain, mis. "example.com") -> lanjut ke fallback di bawah.

    }

    // Fallback: perlakukan sebagai domain tanpa skema, paksa https.
    try {

        const parsed = new URL("https://" + url.replace(/^\/+/, ""));

        return parsed.href;

    } catch (error) {

        // Input tidak bisa dibentuk jadi URL valid sama sekali.
        return "#";

    }

}

/* ==========================
ESCAPE HTML
Menetralkan tanda kurung < > & kutip pada teks yang
berasal dari input user (nama project, catatan, dll)
sebelum ditempel lewat innerHTML, supaya
tidak bisa disusupi tag/atribut/script asing (XSS).
========================== */

export function escapeHTML(value) {

    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}

/* ==========================
FORMAT DATE
========================== */

export function formatDate(timestamp) {

    if (!timestamp) return "-";

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-US", {

        day: "numeric",
        month: "short",
        year: "numeric"

    });

}

/* ==========================
STATUS COLOR (kelas CSS)
========================== */

export function statusClass(status) {

    switch (status) {

        case "Active":
            return "active";

        case "Pending":
            return "pending";

        case "Waitlist":
            return "waitlist";

        case "Complete":
            return "complete";

        default:
            return "";

    }

}

/* ==========================
STATUS LABEL (untuk ditampilkan)
========================== */

// Satu-satunya sumber label status (kartu project, notifikasi Home, dll).
// Teksnya memakai key yang sama dengan dropdown status di form dan filter.
const STATUS_LABEL_KEYS = {
    Active: "opt.status.active",
    Pending: "opt.status.pending",
    Waitlist: "opt.status.waitlist",
    Complete: "opt.status.complete"
};

export function statusLabel(status) {

    const key = STATUS_LABEL_KEYS[status];

    // status tak dikenal ditampilkan apa adanya
    return key ? t(key) : status;

}
