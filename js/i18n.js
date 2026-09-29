/* ==========================================
   I18N.JS
   Bahasa: English (en) & Indonesia (id)
========================================== */

const LANG_KEY = "airdropHub_lang";

const dict = {

    en: {
        "status.tracking": "Tracking active",
        "nav.home": "Home",
        "nav.search": "Search",
        "nav.add": "Add",
        "nav.profile": "My Project",

        "settings.title": "Settings",
        "settings.darkMode": "Dark Mode",
        "settings.lightMode": "Light Mode",
        "settings.language": "Language",
        "settings.installApp": "Add to Phone",

        "overview.title": "Overview",
        "overview.todayTask": "Today's Task",
        "overview.deadlineToday": "Deadline Today",
        "overview.waitlist": "Waitlist",
        "overview.pending": "Pending",
        "overview.active": "Active",
        "overview.completed": "Completed",

        "search.placeholder": "Search projects by name or chain...",

        "filter.status": "Status",
        "filter.taskType": "Task Type",
        "filter.sort": "Sort",
        "filter.allStatus": "All Status",
        "filter.allTasks": "All Tasks",
        "filter.oneTime": "One Time",
        "filter.default": "Default",
        "filter.nearestDeadline": "Nearest Deadline",
        "filter.newestProject": "Newest Project",

        "projects.title": "Projects",
        "projects.empty": "No projects yet. Tap \"Add Project\" below to start tracking.",
        "projects.emptyFiltered": "No projects match your filters.",

        "profile.title": "Profile",
        "profile.cloudSyncActive": "Cloud sync active",
        "profile.security": "Security",
        "profile.securityDesc": "Enter your old password & a new password to change your account password.",
        "profile.currentPassword": "Current Password",
        "profile.currentPasswordPh": "Current password",
        "profile.newPassword": "New Password",
        "profile.newPasswordPh": "Minimum 6 characters",
        "profile.updatePassword": "Update Password",
        "profile.logout": "Log out",
        "profile.switchAccount": "Switch Account",
        "profile.dangerZoneTitle": "Danger Zone",
        "profile.dangerZoneDesc": "Deleting your account permanently removes it and every project you saved, from the cloud and this device. This cannot be undone.",
        "profile.deleteAccountPasswordPh": "Enter your password to confirm",
        "profile.deleteAccount": "Delete Account",
        "profile.notLoggedIn": "Not Logged In",
        "profile.loginDesc": "Login so your project data syncs automatically across devices.",
        "profile.loginRegister": "Login / Register",

        "project.add": "Add Project",
        "project.edit": "Edit Project",
        "project.name": "Project Name",
        "project.namePh": "e.g. LayerZero",
        "project.chain": "Chain",
        "project.chooseChain": "Choose chain",
        "project.website": "Website",
        "project.websiteInvite": "Invite Website",
        "project.websiteInvitePh": "https://... (invite link)",
        "project.destinationHome": "Will be saved to: Home (public)",
        "project.destinationMyProject": "Will be saved to: My Project (private)",
        "project.taskType": "Task Type",
        "project.deadline": "Deadline",
        "project.priority": "Priority",
        "project.status": "Status",
        "project.notes": "Notes",
        "project.notesPh": "Optional notes...",
        "project.save": "Save",
        "project.update": "Update",
        "project.cancel": "Cancel",
        "project.daily": "Daily",
        "project.weekly": "Weekly",
        "project.testnet": "Testnet",
        "project.mainnet": "Mainnet",
        "project.oneTime": "One Time",
        "project.low": "Low",
        "project.medium": "Medium",
        "project.high": "High",
        "project.waitlist": "Waitlist",
        "project.active": "Active",
        "project.pending": "Pending",
        "project.complete": "Completed",
        "project.nameRequired": "Project name is required.",
        "project.chainRequired": "Chain is required.",
        "project.addedSuccess": "Project added successfully.",
        "project.updatedSuccess": "Project updated successfully.",
        "project.deletedSuccess": "Project deleted successfully.",
        "project.deleteConfirm": "Delete this project? This action cannot be undone.",
        "project.task": "Task",
        "project.website.title": "Website",
        "project.websiteInvite.title": "Invite Link",
        "project.addToMyProject": "Add to My Project",
        "project.markDone": "Mark done",
        "project.doneCompleted": "Completed",
        "project.viewDetails": "View details",
        "project.hideDetails": "Hide details",
        "project.editBtn": "Edit",
        "project.deleteBtn": "Delete",
        "project.added": "Added",
        "project.lastUpdated": "Last updated",

        "chain.other": "Other",
        "opt.chain.other": "Other",
        "opt.priority.low": "Low",
        "opt.priority.medium": "Medium",
        "opt.priority.high": "High",
        "opt.status.waitlist": "Waitlist",
        "opt.status.active": "Active",
        "opt.status.pending": "Pending",
        "opt.status.complete": "Completed",

        "notif.title": "Notifications",
        "notif.empty": "No notifications yet.",
        "notif.clearAll": "Clear All",
        "notif.clearConfirm": "Clear all notification history?",
        "notif.clearBtn": "Clear",
        "notif.homeNew": "New project added to Home: {name}",
        "notif.homeNewMany": "{count} new projects were added to Home.",
        "notif.homeStatus": "{name} status changed to {status}.",
        "notif.homeStatusMany": "{count} projects in Home had their status updated.",

        "cloud.title": "Sync Account",
        "cloud.welcome": "Welcome Back!",
        "cloud.welcomeDesc": "Login so your project data syncs automatically across devices.",
        "cloud.createTitle": "Create Account",
        "cloud.createDesc": "Register to back up and sync your projects across devices.",
        "cloud.tabRegister": "Register",
        "cloud.remember": "Remember me",
        "cloud.or": "Or",
        "cloud.desc": "Login so your project data syncs automatically across devices.",
        "cloud.email": "Email",
        "cloud.emailPh": "email@you.com",
        "cloud.password": "Password",
        "cloud.passwordPh": "Minimum 6 characters",
        "cloud.skip": "Later",
        "cloud.login": "Login",
        "cloud.noAccount": "Don't have an account?",
        "cloud.registerNow": "Register now",
        "cloud.activeAs": "Cloud sync active — logged in as",
        "cloud.offlineMode": "Offline mode — data is only stored on this device.",
        "cloud.loginSuccess": "Login successful, loading data...",
        "cloud.logoutSuccess": "Logged out successfully.",
        "cloud.logoutConfirm": "Logout from",
        "cloud.logoutConfirmSuffix": "? Data stays saved in the cloud.",
        "cloud.passwordChanged": "Password changed successfully.",

        "cloud.processing": "Processing...",
        "cloud.fieldsRequired": "Email & password are required.",
        "cloud.timeout": "Connection to the server is slow or failed. Check your network and try again.",
        "cloud.err.invalidEmail": "Invalid email format.",
        "cloud.err.invalidCredential": "Wrong email/password, or the account isn't registered.",
        "cloud.err.wrongPassword": "Wrong password.",
        "cloud.err.emailInUse": "This email is already registered, try Login.",
        "cloud.err.weakPassword": "Password must be at least 6 characters.",
        "cloud.err.generic": "Login/registration failed, try again.",
        "cloud.switchConfirm": "Switch account from {email}? You'll be logged out, then you can log in to another account.",
        "security.fieldsRequired": "All fields are required.",
        "security.minLength": "New password must be at least 6 characters.",
        "security.failed": "Failed to change the password.",
        "security.timeout": "Connection is slow or failed, try again.",
        "security.wrongCurrent": "Current password is incorrect.",
        "security.weakNew": "New password is too weak.",
        "delete.passwordRequired": "Enter your password to confirm.",
        "delete.confirm": "Account {email} and ALL its projects will be permanently deleted from the cloud & this device. This cannot be undone.",
        "delete.deleting": "Deleting...",
        "delete.success": "Account deleted successfully.",
        "delete.failed": "Failed to delete the account.",
        "delete.wrongPassword": "Wrong password.",
        "delete.recentLogin": "Your session is too old. Enter your password again and retry.",
        "sync.fetchFailed": "Failed to fetch data from the cloud. The app is using the data on this device.",
        "sync.saveFailed": "Failed to save changes to the cloud. Your data is still safe on this device.",
        "sync.homeSaveFailed": "Failed to save Home changes to the cloud.",
        "notif.loginWarning": "Your data is only saved on this device. If you clear browser data or switch devices without logging in, everything will be lost. Login to enable cloud backup.",

        "cloud.forgot": "Forgot password?",
        "forgot.title": "Forgot Password",
        "forgot.step1Desc": "Enter your account email. We'll send a link to reset your password.",
        "forgot.sentDesc": "If this email is registered, a reset link has been sent to",
        "forgot.checkSpam": "Check your inbox (and spam folder), open the link, set a new password, then log in.",
        "forgot.back": "Back",
        "forgot.sendLink": "Send Reset Link",
        "forgot.backToLogin": "Back to Login",
        "forgot.emailRequired": "Email is required.",
        "forgot.invalidEmail": "Invalid email format.",
        "forgot.tooMany": "Too many requests. Try again later.",
        "forgot.failed": "Failed to send the email, try again.",
        "forgot.notConfigured": "Cloud sync isn't configured on this build.",

        "dialog.ok": "OK",
        "dialog.cancel": "Cancel",
        "dialog.delete": "Delete",

        "loading.text": "LOADING...",
        "footer.text": "AIRDROP HUB · BUILT FOR FARMERS",

        "toast.appLoadError": "Something went wrong while loading the app.",
        "toast.notifEnabled": "Notifications enabled.",
        "toast.notifDisabled": "Notifications disabled.",
        "toast.installIOS": "In Safari, tap Share, then \"Add to Home Screen\".",
        "toast.installUnavailable": "Your browser doesn't support installing this app.",
        "toast.installSuccess": "App installed to your home screen."
    },

    id: {
        "status.tracking": "Pelacakan aktif",
        "nav.home": "Beranda",
        "nav.search": "Cari",
        "nav.add": "Tambah",
        "nav.profile": "Proyek Saya",

        "settings.title": "Pengaturan",
        "settings.darkMode": "Mode Gelap",
        "settings.lightMode": "Mode Terang",
        "settings.language": "Bahasa",
        "settings.installApp": "Tambahkan ke HP",

        "overview.title": "Ringkasan",
        "overview.todayTask": "Tugas Hari Ini",
        "overview.deadlineToday": "Deadline Hari Ini",
        "overview.waitlist": "Waitlist",
        "overview.pending": "Pending",
        "overview.active": "Aktif",
        "overview.completed": "Selesai",

        "search.placeholder": "Cari project berdasarkan nama atau chain...",

        "filter.status": "Status",
        "filter.taskType": "Jenis Tugas",
        "filter.sort": "Urutkan",
        "filter.allStatus": "Semua Status",
        "filter.allTasks": "Semua Tugas",
        "filter.oneTime": "Sekali Saja",
        "filter.default": "Default",
        "filter.nearestDeadline": "Deadline Terdekat",
        "filter.newestProject": "Project Terbaru",

        "projects.title": "Project",
        "projects.empty": "Belum ada project. Tekan \"Add Project\" di bawah untuk mulai melacak.",
        "projects.emptyFiltered": "Tidak ada project yang cocok dengan filter kamu.",

        "profile.title": "Profil",
        "profile.cloudSyncActive": "Cloud sync aktif",
        "profile.security": "Keamanan",
        "profile.securityDesc": "Masukkan password lama & password baru untuk mengganti password akun.",
        "profile.currentPassword": "Password Saat Ini",
        "profile.currentPasswordPh": "Password saat ini",
        "profile.newPassword": "Password Baru",
        "profile.newPasswordPh": "Minimal 6 karakter",
        "profile.updatePassword": "Update Password",
        "profile.logout": "Keluar",
        "profile.switchAccount": "Pindah Akun",
        "profile.dangerZoneTitle": "Zona Berbahaya",
        "profile.dangerZoneDesc": "Menghapus akun akan menghapus akun ini beserta semua project yang tersimpan, secara permanen dari cloud maupun device ini. Tindakan ini tidak bisa dibatalkan.",
        "profile.deleteAccountPasswordPh": "Masukkan password untuk konfirmasi",
        "profile.deleteAccount": "Hapus Akun",
        "profile.notLoggedIn": "Belum Login",
        "profile.loginDesc": "Login supaya data project kamu tersinkron otomatis di semua device.",
        "profile.loginRegister": "Login / Daftar",

        "project.add": "Tambah Project",
        "project.edit": "Edit Project",
        "project.name": "Nama Project",
        "project.namePh": "cth. LayerZero",
        "project.chain": "Chain",
        "project.chooseChain": "Pilih chain",
        "project.website": "Website",
        "project.websiteInvite": "Website Invite",
        "project.websiteInvitePh": "https://... (link invite)",
        "project.destinationHome": "Akan disimpan ke: Home (publik)",
        "project.destinationMyProject": "Akan disimpan ke: My Project (privat)",
        "project.taskType": "Jenis Tugas",
        "project.deadline": "Deadline",
        "project.priority": "Prioritas",
        "project.status": "Status",
        "project.notes": "Catatan",
        "project.notesPh": "Catatan opsional...",
        "project.save": "Simpan",
        "project.update": "Update",
        "project.cancel": "Batal",
        "project.daily": "Harian",
        "project.weekly": "Mingguan",
        "project.testnet": "Testnet",
        "project.mainnet": "Mainnet",
        "project.oneTime": "Sekali Saja",
        "project.low": "Rendah",
        "project.medium": "Sedang",
        "project.high": "Tinggi",
        "project.waitlist": "Waitlist",
        "project.active": "Aktif",
        "project.pending": "Pending",
        "project.complete": "Selesai",
        "project.nameRequired": "Nama project wajib diisi.",
        "project.chainRequired": "Chain wajib diisi.",
        "project.addedSuccess": "Project berhasil ditambahkan.",
        "project.updatedSuccess": "Project berhasil diperbarui.",
        "project.deletedSuccess": "Project berhasil dihapus.",
        "project.deleteConfirm": "Hapus project ini? Tindakan ini tidak bisa dibatalkan.",
        "project.task": "Tugas",
        "project.website.title": "Website",
        "project.websiteInvite.title": "Link Invite",
        "project.addToMyProject": "Tambah ke My Project",
        "project.markDone": "Tandai selesai",
        "project.doneCompleted": "Selesai",
        "project.viewDetails": "Lihat detail",
        "project.hideDetails": "Sembunyikan detail",
        "project.editBtn": "Edit",
        "project.deleteBtn": "Hapus",
        "project.added": "Ditambahkan",
        "project.lastUpdated": "Terakhir diperbarui",

        "chain.other": "Lainnya",
        "opt.chain.other": "Lainnya",
        "opt.priority.low": "Rendah",
        "opt.priority.medium": "Sedang",
        "opt.priority.high": "Tinggi",
        "opt.status.waitlist": "Waitlist",
        "opt.status.active": "Aktif",
        "opt.status.pending": "Pending",
        "opt.status.complete": "Selesai",

        "notif.title": "Notifikasi",
        "notif.empty": "Belum ada notifikasi.",
        "notif.clearAll": "Hapus Semua",
        "notif.clearConfirm": "Hapus semua riwayat notifikasi?",
        "notif.clearBtn": "Hapus",
        "notif.homeNew": "Project baru ditambahkan di Home: {name}",
        "notif.homeNewMany": "{count} project baru ditambahkan di Home.",
        "notif.homeStatus": "Status {name} berubah menjadi {status}.",
        "notif.homeStatusMany": "{count} project di Home diperbarui statusnya.",

        "cloud.title": "Sync Akun",
        "cloud.welcome": "Selamat Datang Kembali!",
        "cloud.welcomeDesc": "Login agar data project kamu tersinkron otomatis di semua perangkat.",
        "cloud.createTitle": "Buat Akun",
        "cloud.createDesc": "Daftar untuk backup dan sinkronisasi project kamu di semua perangkat.",
        "cloud.tabRegister": "Daftar",
        "cloud.remember": "Ingat saya",
        "cloud.or": "Atau",
        "cloud.desc": "Login supaya data project kamu tersinkron otomatis di semua device.",
        "cloud.email": "Email",
        "cloud.emailPh": "email@kamu.com",
        "cloud.password": "Password",
        "cloud.passwordPh": "Minimal 6 karakter",
        "cloud.skip": "Nanti saja",
        "cloud.login": "Login",
        "cloud.noAccount": "Belum punya akun?",
        "cloud.registerNow": "Daftar sekarang",
        "cloud.activeAs": "Cloud sync aktif — login sebagai",
        "cloud.offlineMode": "Mode offline — data hanya tersimpan di device ini.",
        "cloud.loginSuccess": "Berhasil login, memuat data...",
        "cloud.logoutSuccess": "Berhasil logout.",
        "cloud.logoutConfirm": "Logout dari",
        "cloud.logoutConfirmSuffix": "? Data tetap tersimpan di cloud.",
        "cloud.passwordChanged": "Password berhasil diubah.",

        "cloud.processing": "Memproses...",
        "cloud.fieldsRequired": "Email & password wajib diisi.",
        "cloud.timeout": "Koneksi ke server lambat/gagal. Periksa jaringan lalu coba lagi.",
        "cloud.err.invalidEmail": "Format email tidak valid.",
        "cloud.err.invalidCredential": "Email/password salah atau belum terdaftar.",
        "cloud.err.wrongPassword": "Password salah.",
        "cloud.err.emailInUse": "Email ini sudah terdaftar, coba Login.",
        "cloud.err.weakPassword": "Password minimal 6 karakter.",
        "cloud.err.generic": "Gagal login/daftar, coba lagi.",
        "cloud.switchConfirm": "Pindah akun dari {email}? Kamu akan logout, lalu bisa login ke akun lain.",
        "security.fieldsRequired": "Semua field wajib diisi.",
        "security.minLength": "Password baru minimal 6 karakter.",
        "security.failed": "Gagal mengubah password.",
        "security.timeout": "Koneksi lambat/gagal, coba lagi.",
        "security.wrongCurrent": "Password saat ini salah.",
        "security.weakNew": "Password baru terlalu lemah.",
        "delete.passwordRequired": "Masukkan password untuk konfirmasi.",
        "delete.confirm": "Akun {email} dan SEMUA project di dalamnya akan dihapus permanen dari cloud & device ini. Tindakan ini tidak bisa dibatalkan.",
        "delete.deleting": "Menghapus...",
        "delete.success": "Akun berhasil dihapus.",
        "delete.failed": "Gagal menghapus akun.",
        "delete.wrongPassword": "Password salah.",
        "delete.recentLogin": "Sesi login sudah lama, masukkan password lagi lalu coba ulang.",
        "sync.fetchFailed": "Gagal mengambil data dari cloud. Aplikasi tetap memakai data di device ini.",
        "sync.saveFailed": "Gagal menyimpan perubahan ke cloud. Data tetap aman di device ini.",
        "sync.homeSaveFailed": "Gagal menyimpan perubahan Home ke cloud.",
        "notif.loginWarning": "Datamu hanya tersimpan di device ini. Kalau data browser dihapus atau pindah device tanpa login, semuanya akan hilang. Login untuk mengaktifkan backup cloud.",

        "cloud.forgot": "Lupa password?",
        "forgot.title": "Lupa Password",
        "forgot.step1Desc": "Masukkan email akunmu. Kami akan mengirim link untuk reset password.",
        "forgot.sentDesc": "Jika email ini terdaftar, link reset sudah dikirim ke",
        "forgot.checkSpam": "Cek inbox (dan folder spam), buka link-nya, buat password baru, lalu login.",
        "forgot.back": "Kembali",
        "forgot.sendLink": "Kirim Link Reset",
        "forgot.backToLogin": "Kembali ke Login",
        "forgot.emailRequired": "Email wajib diisi.",
        "forgot.invalidEmail": "Format email tidak valid.",
        "forgot.tooMany": "Terlalu banyak permintaan. Coba lagi nanti.",
        "forgot.failed": "Gagal mengirim email, coba lagi.",
        "forgot.notConfigured": "Cloud sync belum dikonfigurasi di build ini.",

        "dialog.ok": "OK",
        "dialog.cancel": "Batal",
        "dialog.delete": "Hapus",

        "loading.text": "MEMUAT...",
        "footer.text": "AIRDROP HUB · DIBUAT UNTUK FARMER",

        "toast.appLoadError": "Terjadi kesalahan saat memuat aplikasi.",
        "toast.notifEnabled": "Notifikasi diaktifkan.",
        "toast.notifDisabled": "Notifikasi dimatikan.",
        "toast.installIOS": "Di Safari, ketuk tombol Share, lalu pilih \"Add to Home Screen\".",
        "toast.installUnavailable": "Browser kamu tidak mendukung instalasi aplikasi ini.",
        "toast.installSuccess": "Aplikasi berhasil ditambahkan ke layar HP."
    }

};

export function getLang() {

    const raw = localStorage.getItem(LANG_KEY);

    return raw === "id" ? "id" : "en";

}

export function setLang(lang) {

    localStorage.setItem(LANG_KEY, lang === "id" ? "id" : "en");

}

export function t(key) {

    const lang = getLang();

    return (dict[lang] && dict[lang][key]) || dict.en[key] || key;

}

/* ==========================================
   APPLY TRANSLATIONS TO STATIC DOM
========================================== */

export function applyStaticTranslations() {

    document.querySelectorAll("[data-i18n]").forEach(el => {

        el.textContent = t(el.getAttribute("data-i18n"));

    });

    document.querySelectorAll("[data-i18n-ph]").forEach(el => {

        el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));

    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {

        el.setAttribute("title", t(el.getAttribute("data-i18n-title")));

    });

    document.documentElement.lang = getLang();

}
