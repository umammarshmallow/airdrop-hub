// ==========================================
// HELPERS
// ==========================================

/**
 * Menambahkan https:// jika URL belum memiliki protocol
 */
export function formatUrl(url) {

    if (!url) return "";

    url = url.trim();

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return "https://" + url;

}

/**
 * Generate ID unik
 */
export function generateId() {

    return Date.now();

}

/**
 * Menampilkan toast notification
 */
export function showToast(message, duration = 2000) {

    const toast = document.getElementById("toast");

    const toastText = document.getElementById("toastText");

    toastText.textContent = message;

    toast.style.display = "block";

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.style.display = "none";

    }, duration);

}

/**
 * Menampilkan loading
 */
export function showLoading() {

    const loading = document.getElementById("loading");

    loading.style.display = "flex";

}

/**
 * Menyembunyikan loading
 */
export function hideLoading() {

    const loading = document.getElementById("loading");

    loading.style.display = "none";

}

/**
 * Konfirmasi sebelum menghapus
 */
export function confirmDelete() {

    return confirm("Hapus project ini?");

}

/**
 * Membersihkan form tambah project
 */
export function clearAddForm() {

    document.getElementById("name").value = "";

    document.getElementById("network").value = "";

    document.getElementById("website").value = "";

    document.getElementById("deadline").value = "";

    document.getElementById("note").value = "";

    document.getElementById("taskType").selectedIndex = 0;

    document.getElementById("priority").selectedIndex = 0;

    document.getElementById("status").selectedIndex = 0;

}

/**
 * Format tanggal
 */
export function formatDate(date) {

    if (!date) {

        return "-";

    }

    return date;

}

/**
 * Prioritas untuk sorting
 */
export function getPriorityValue(priority) {

    switch (priority) {

        case "High":
            return 1;

        case "Medium":
            return 2;

        case "Low":
            return 3;

        default:
            return 99;

    }

}

/**
 * Urutan status
 */
export function getStatusOrder(status) {

    switch (status) {

        case "Active":
            return 1;

        case "Pending":
            return 2;

        case "Waitlist":
            return 3;

        case "Complete":
            return 4;

        default:
            return 99;

    }

}

/**
 * Membuka website project
 */
export function openWebsite(url) {

    const safeUrl = formatUrl(url);

    if (!safeUrl) {

        return;

    }

    window.open(
        safeUrl,
        "_blank"
    );

}

/**
 * Validasi project
 */
export function validateProject(project) {

    if (!project.name.trim()) {

        alert("Nama project wajib diisi");

        return false;

    }

    if (!project.network.trim()) {

        alert("Network wajib diisi");

        return false;

    }

    return true;

}
