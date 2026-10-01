/* ==========================================
   UIFEEDBACK.JS
   Umpan balik sekilas ke user: toast dan
   layar loading.
========================================== */

import { ICON_CHECK, ICON_XMARK } from "./icons.js";

/* ==========================
TOAST
========================== */

export function showToast(message, duration = 2500, type = "success") {

    const toast = document.getElementById("toast");
    const text = document.getElementById("toastText");
    const icon = document.getElementById("toastIcon");

    if (!toast || !text) return;

    text.textContent = message;

    if (icon) {

        icon.innerHTML = type === "error" ? ICON_XMARK : ICON_CHECK;

    }

    toast.classList.toggle("toast-error", type === "error");

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, duration);

}

/* ==========================
LOADING
========================== */

export function showLoading() {

    const loading = document.getElementById("loading");

    if (loading) {

        loading.style.display = "flex";

    }

}

export function hideLoading() {

    const loading = document.getElementById("loading");

    if (loading) {

        loading.style.display = "none";

    }

}
