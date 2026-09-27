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

        "cloud.title": "Sync Account",
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

        "cloud.title": "Sync Akun",
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
