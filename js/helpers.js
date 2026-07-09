/* ==========================================
   HELPERS.JS
========================================== */

/* ==========================
FORMAT URL
========================== */

export function formatUrl(url = "") {

    url = url.trim();

    if (url === "") return "#";

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return "https://" + url;

}

/* ==========================
TOAST
========================== */

export function showToast(message, duration = 2000) {

    const toast = document.getElementById("toast");
    const text = document.getElementById("toastText");

    if (!toast || !text) return;

    text.textContent = message;

    toast.style.display = "block";

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.style.display = "none";

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

/* ==========================
CLEAR ADD FORM
========================== */

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

/* ==========================
VALIDASI PROJECT
========================== */

export function validateProject(project) {

    if (!project.name.trim()) {

        alert("Nama project wajib diisi.");

        return false;

    }

    if (!project.network.trim()) {

        alert("Network wajib diisi.");

        return false;

    }

    return true;

}

/* ==========================
SORT PROJECT
========================== */

export function sortProjects(projects) {

    const statusOrder = {

        Active: 1,
        Waitlist: 2,
        Pending: 3,
        Complete: 4

    };

    return [...projects].sort((a, b) => {

        /* Urutan Status
           Active
           Waitlist
           Pending
           Complete
        */

        const statusA = statusOrder[a.status] ?? 999;
        const statusB = statusOrder[b.status] ?? 999;

        if (statusA !== statusB) {

            return statusA - statusB;

        }

        /* Dalam setiap status urut A-Z */

        return a.name.localeCompare(
            b.name,
            "id",
            {
                sensitivity: "base"
            }
        );

    });

}

/* ==========================
STATUS COLOR
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
