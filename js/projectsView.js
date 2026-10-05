/* ==========================================
   PROJECTSVIEW.JS
   Menyegarkan daftar project di layar:
   reset harian, auto-cleanup project stale,
   dan tarik ulang data Home dari cloud.
========================================== */

import {
    loadProjects,
    loadHomeProjects,
    applyPendingMissions,
    resetDailyTasks,
    cleanupStaleProjects,
    checkStaleWarnings
} from "./storage.js";

import { renderProjects } from "./render.js";
import { showToast } from "./uiFeedback.js";
import { addNotification } from "./notifications.js";
import { setProjects, setHomeProjects, getMode } from "./project.js";
import { pullHomeFromCloud } from "./cloudSync.js";
import { updateAddButtonVisibility } from "./nav.js";

export function refreshProjectsView(showStaleToast = true) {

    let projects = loadProjects();

    // Terapkan misi baru dari Home (kalau ada) ke salinan project ini
    projects = applyPendingMissions(projects);

    // Reset task harian bila hari sudah berganti
    projects = resetDailyTasks(projects);

    // Tandai + kirim notifikasi utk project yg akan dihapus otomatis besok (H-1)
    const aboutToDelete = checkStaleWarnings(projects);

    // Hapus otomatis project Waitlist/Pending yang tidak diupdate 2 bulan
    const cleanup = cleanupStaleProjects(projects);

    projects = cleanup.projects;

    // Sinkronkan data project di seluruh aplikasi (khusus My Project --
    // Home tidak ikut direset/dibersihkan otomatis, itu data admin).
    setProjects(projects);

    // NOTE: updateDashboard() SENGAJA tidak dipanggil di sini dengan
    // data My Project secara langsung -- itu bisa menimpa Overview Home
    // (race condition animasi angka saat renderProjects() di bawah juga
    // memanggil updateDashboard(), tapi dengan data mode yang aktif).
    // renderProjects() di bawah ini sudah menangani update dashboard
    // dengan benar sesuai mode (Home/My Project) yang sedang dilihat.

    // Render ulang
    renderProjects();

    if (showStaleToast && aboutToDelete.length > 0) {

        aboutToDelete.forEach(project => {

            addNotification(
                `"${project.name}" will be auto-removed tomorrow (no update in ~2 months). Edit it to keep it.`,
                "warning",
                { action: "editProject", projectId: project.id }
            );

        });

    }

    if (showStaleToast && cleanup.removedCount > 0) {

        const msg = `${cleanup.removedCount} stale Waitlist/Pending project(s) auto-removed (no update in 2 months).`;

        showToast(msg, 4000);

        addNotification(msg, "warning");

    }

}

// Tarik data Home publik dari cloud (bisa dipanggil ulang setelah
// status login/role berubah, misalnya setelah login sebagai admin).
export async function refreshHomeView() {

    await pullHomeFromCloud();

    setHomeProjects(loadHomeProjects());

    if (getMode() === "home") renderProjects();

    updateAddButtonVisibility();

}
