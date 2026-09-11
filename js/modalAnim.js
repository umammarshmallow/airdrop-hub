/* ==========================================
   MODALANIM.JS
   Helper buka/tutup .modal dengan transisi
   fade + scale-in, dipakai bareng oleh
   modal.js (Add/Edit Project) & dialog.js
   (custom alert/confirm) biar tidak duplikat.
========================================== */

const TRANSITION_MS = 220;

export function openModalEl(el) {

    el.classList.add("show");

    // paksa reflow supaya class "in" ditambahkan di frame
    // berikutnya, jadi browser sempat animasikan transisinya
    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            el.classList.add("in");

        });

    });

}

export function closeModalEl(el) {

    el.classList.remove("in");

    setTimeout(() => {

        el.classList.remove("show");

    }, TRANSITION_MS);

}
