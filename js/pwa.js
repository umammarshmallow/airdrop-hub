/* ==========================================
   PWA.JS
   "Add to Phone" (install prompt) dan
   registrasi service worker.
========================================== */

import { showToast } from "./uiFeedback.js";
import { t } from "./i18n.js";

const installAppBtn = document.getElementById("installAppBtn");

let deferredInstallPrompt = null;

const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

function initInstallPrompt() {

    if (!isStandalone && installAppBtn) {

        if (isIOS) {

            installAppBtn.style.display = "flex";

        }

        window.addEventListener("beforeinstallprompt", (e) => {

            e.preventDefault();

            deferredInstallPrompt = e;

            installAppBtn.style.display = "flex";

        });

    }

    window.addEventListener("appinstalled", () => {

        if (installAppBtn) installAppBtn.style.display = "none";

        deferredInstallPrompt = null;

        showToast(t("toast.installSuccess"));

    });

    if (installAppBtn) {

        installAppBtn.addEventListener("click", async () => {

            if (deferredInstallPrompt) {

                deferredInstallPrompt.prompt();

                await deferredInstallPrompt.userChoice;

                deferredInstallPrompt = null;

            } else if (isIOS) {

                showToast(t("toast.installIOS"), 4000, "success");

            } else {

                showToast(t("toast.installUnavailable"), 3000, "error");

            }

        });

    }

}

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("sw.js").catch(() => {});

    });

}

export function initPwa() {

    initInstallPrompt();

    registerServiceWorker();

}
