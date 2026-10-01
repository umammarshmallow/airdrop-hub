/* ==========================================
   AUTHUI.JS
   Modal Login / Daftar (cloud sync).
   Alur lupa password ada di forgotPassword.js,
   halaman profil/keamanan di profilePage.js.
========================================== */

import { openModalEl, closeModalEl } from "./modalAnim.js";
import { showToast } from "./uiFeedback.js";
import { loginWithEmail, registerWithEmail } from "./cloudSync.js";
import { withUiTimeout } from "./asyncUtils.js";
import { t } from "./i18n.js";
import { STORAGE_KEYS } from "./constants.js";

/* ==========================================
   ELEMENT
========================================== */

const cloudAuthModal = document.getElementById("cloudAuthModal");
const cloudAuthEmail = document.getElementById("cloudAuthEmail");
const cloudAuthPassword = document.getElementById("cloudAuthPassword");
const cloudAuthError = document.getElementById("cloudAuthError");
const cloudAuthSkip = document.getElementById("cloudAuthSkip");
const cloudAuthLoginBtn = document.getElementById("cloudAuthLoginBtn");
const cloudAuthRemember = document.getElementById("cloudAuthRemember");
const cloudAuthEye = document.getElementById("cloudAuthEye");

const authTabLogin = document.getElementById("authTabLogin");
const authTabRegister = document.getElementById("authTabRegister");
const authTabPill = document.getElementById("authTabPill");

let cloudAuthMode = "login"; // "login" atau "register"

/* ==========================================
   MODE (Login / Register)
========================================== */

export function setCloudAuthMode(mode) {

    cloudAuthMode = mode;

    const isLogin = cloudAuthMode === "login";

    cloudAuthLoginBtn.textContent = isLogin ? t("cloud.login") : t("cloud.tabRegister");

    // tab Login / Register + geser pill-nya
    authTabLogin.classList.toggle("active", isLogin);
    authTabRegister.classList.toggle("active", !isLogin);
    authTabPill.style.transform = isLogin ? "translateX(0)" : "translateX(100%)";

    document.getElementById("cloudAuthTitle").textContent = t(isLogin ? "cloud.welcome" : "cloud.createTitle");
    document.getElementById("cloudAuthDesc").textContent = t(isLogin ? "cloud.welcomeDesc" : "cloud.createDesc");

    cloudAuthPassword.setAttribute("autocomplete", isLogin ? "current-password" : "new-password");

    cloudAuthError.style.display = "none";

    // "Lupa password?" cuma relevan di mode login
    document.getElementById("cloudAuthForgotLink").style.visibility = isLogin ? "visible" : "hidden";

}

// Dipanggil saat bahasa berganti: teks modal mengikuti mode yang sedang aktif.
export function refreshCloudAuthTexts() {

    setCloudAuthMode(cloudAuthMode);

}

/* ==========================================
   OPEN / CLOSE
========================================== */

export function showCloudAuthModal() {

    cloudAuthError.style.display = "none";

    // selalu mulai dengan password tersembunyi
    setPasswordVisible(false);

    // isi otomatis email yang diingat (kalau "Remember me" dicentang sebelumnya)
    try {

        const savedEmail = localStorage.getItem(STORAGE_KEYS.rememberEmail);

        if (savedEmail && !cloudAuthEmail.value) {

            cloudAuthEmail.value = savedEmail;
            cloudAuthRemember.checked = true;

        }

    } catch (error) { /* storage diblokir: abaikan */ }

    openModalEl(cloudAuthModal);

    document.body.classList.add("modal-open");

}

export function closeCloudAuthModal() {

    closeModalEl(cloudAuthModal);

    document.body.classList.remove("modal-open");

}

// Email yang sedang diketik di form login (dipakai form lupa password).
export function getCloudAuthEmail() {

    return cloudAuthEmail.value.trim();

}

/* ==========================================
   ERROR
========================================== */

function setCloudAuthError(message) {

    cloudAuthError.textContent = message;

    cloudAuthError.style.display = "block";

}

function friendlyAuthError(error) {

    const code = error && error.code ? error.code : "";

    if (code.includes("invalid-email")) return t("cloud.err.invalidEmail");

    if (code.includes("user-not-found") || code.includes("invalid-credential")) return t("cloud.err.invalidCredential");

    if (code.includes("wrong-password")) return t("cloud.err.wrongPassword");

    if (code.includes("email-already-in-use")) return t("cloud.err.emailInUse");

    if (code.includes("weak-password")) return t("cloud.err.weakPassword");

    return t("cloud.err.generic");

}

/* ==========================================
   SHOW / HIDE PASSWORD
   ikon mata mengikuti kondisi saat ini:
   mata dicoret = password tersembunyi,
   mata terbuka = password terlihat
========================================== */

function setPasswordVisible(show) {

    cloudAuthPassword.type = show ? "text" : "password";

    cloudAuthEye.innerHTML = show
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';

}

/* ==========================================
   SUBMIT LOGIN / REGISTER
========================================== */

function initSubmit(onAuthenticated) {

    cloudAuthLoginBtn.addEventListener("click", async () => {

        const email = cloudAuthEmail.value.trim();

        const password = cloudAuthPassword.value;

        if (!email || !password) {

            setCloudAuthError(t("cloud.fieldsRequired"));

            return;

        }

        cloudAuthLoginBtn.disabled = true;

        cloudAuthLoginBtn.textContent = t("cloud.processing");

        try {

            const action = cloudAuthMode === "login"
                ? loginWithEmail(email, password)
                : registerWithEmail(email, password);

            // Batas waktu 8 detik: cukup toleran untuk jaringan 4G yang agak
            // lambat, tapi tombol tetap tidak akan macet selamanya walau
            // koneksi ke server lambat/gagal total.
            const user = await withUiTimeout(action, 8000);

            try {

                if (cloudAuthRemember.checked) localStorage.setItem(STORAGE_KEYS.rememberEmail, email);
                else localStorage.removeItem(STORAGE_KEYS.rememberEmail);

            } catch (error) { /* storage diblokir: abaikan */ }

            closeCloudAuthModal();

            if (typeof onAuthenticated === "function") onAuthenticated(user);

            showToast(t("cloud.loginSuccess"));

            setTimeout(() => location.reload(), 700);

            return;

        } catch (error) {

            console.error("[CloudAuth]", error);

            if (error.message === "TIMEOUT") {

                setCloudAuthError(t("cloud.timeout"));

            } else {

                setCloudAuthError(friendlyAuthError(error));

            }

        }

        cloudAuthLoginBtn.disabled = false;

        cloudAuthLoginBtn.textContent = cloudAuthMode === "login" ? t("cloud.login") : t("cloud.tabRegister");

    });

}

/* ==========================================
   INIT
   onAuthenticated: callback opsional yang dipanggil
   setelah login/daftar berhasil (mis. refresh halaman profil).
========================================== */

export function initAuthUI({ onAuthenticated } = {}) {

    authTabLogin.addEventListener("click", () => setCloudAuthMode("login"));

    authTabRegister.addEventListener("click", () => setCloudAuthMode("register"));

    cloudAuthEye.addEventListener("click", () => setPasswordVisible(cloudAuthPassword.type === "password"));

    cloudAuthSkip.addEventListener("click", () => {

        closeCloudAuthModal();

        showToast(t("cloud.offlineMode"), 3000, "warning");

    });

    initSubmit(onAuthenticated);

}
