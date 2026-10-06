/* ==========================================
   PROJECT.JS

   Dua "store" terpisah:
   - myProjectStore  -> data privat, milik masing-masing user,
                        bisa diedit/dihapus bebas oleh pemiliknya.
   - homeProjectStore -> data publik (Home), semua orang boleh
                        lihat, tapi hanya admin (role="admin" di
                        Firestore) yang boleh tambah/edit/hapus.

   Halaman aktif (mode) menentukan store mana yang dipakai oleh
   getProjects()/addProject()/dst, supaya render.js & event.js
   tidak perlu tahu detail Home vs My Project.
========================================== */

import {
    loadProjects,
    saveProjects,
    loadHomeProjects,
    saveHomeProjects
} from "./storage.js";

import { isAdmin } from "./cloudSync.js";
import { DEFAULT_MISSION, resolveMission, findHomeCopies } from "./projectSchema.js";

import { validateProject, isTaskDueToday, isDeadlineToday } from "./projectRules.js";
import { showToast } from "./uiFeedback.js";
import { t } from "./i18n.js";

import { showConfirm } from "./dialog.js";

import {
    closeAddModal,
    closeEditModal,
    fillEditForm,
    openEditModal
} from "./modal.js";

/* ==========================================
   SINKRONISASI EDIT HOME -> MY PROJECT
   Salinan project di My Project ditandai dengan field
   homeId (id project aslinya di Home).
   - Admin: saat menyimpan edit Home, field yang DIUBAH diterapkan
     otomatis ke salinannya di My Project (tanpa notifikasi, karena
     admin sendiri yang mengedit).
   - User: otomatis untuk "Misi Baru" (check-in Weekly/Monthly/One Time),
     Funding, Website, dan Link Invite (dua terakhir tanpa notifikasi),
     lewat antrean (lihat applyPendingHomeUpdates di
     storage.js). Perubahan lain lewat notifikasi dengan tombol
     "Perbarui"; field yang diubah diambil dari Home versi terbaru.
   Perubahan pribadi di field lain tetap aman.
========================================== */

const HOME_SYNC_FIELDS = [
    "name",
    "network",
    "website",
    "websiteInvite",
    "taskType",
    "checkIn",
    "mission",
    "deadline",
    "funding",
    "priority",
    "status",
    "note"
];

/* ==========================================
   FACTORY STORE
========================================== */

function makeProjectStore(loadFn, saveFn, canMutate, deniedMessage, addedMessage = "Project added successfully.") {

    let projects = loadFn();

    function persist() {
        saveFn(projects);
    }

    function checkPermission() {

        if (canMutate && !canMutate()) {

            showToast(deniedMessage, 3000, "error");

            return false;

        }

        return true;

    }

    // Mencari salinan project Home di store ini (lihat findHomeCopies).
    function findCopies(homeId, hints) {

        return findHomeCopies(projects, homeId, hints);

    }

    function applyFieldsToCopies(targets, homeId, fields, source) {

        targets.forEach(project => {

            fields.forEach(field => {
                project[field] = source[field];
            });

            // misi hanya berlaku untuk check-in tertentu; misi baru juga
            // mengaktifkan lagi project supaya masuk Today's Task
            project.mission = resolveMission(project.checkIn, project.mission);

            if (fields.includes("mission") && project.mission === "New") {
                project.dailyDone = false;
            }

            project.homeId = homeId;

            project.updatedAt = Date.now();

            project.staleWarned = false;

        });

        persist();

    }

    return {

        getProjects() {
            return projects;
        },

        setProjects(newProjects) {
            projects = newProjects;
        },

        // silent=true dipakai saat project ditambahkan otomatis sebagai
        // salinan (data sudah divalidasi, modal sudah ditutup, dan toast
        // sudah ditampilkan oleh penambahan utamanya).
        // homeId: id project asli di Home, supaya edit di Home bisa
        // diteruskan ke salinan ini (lihat applyHomeEdit).
        async addProject(data, { silent = false, homeId = null } = {}) {

            if (!checkPermission()) return false;

            if (!silent && !(await validateProject(data))) {

                return false;

            }

            projects.push({

                id: Date.now(),

                name: data.name.trim(),

                network: data.network.trim(),

                website: data.website.trim(),

                websiteInvite: (data.websiteInvite || "").trim(),

                taskType: data.taskType,

                checkIn: data.checkIn,

                mission: resolveMission(data.checkIn, data.mission),

                deadline: data.deadline,

                funding: (data.funding || "").trim(),

                priority: data.priority,

                status: data.status,

                note: data.note.trim(),

                dailyDone: false,

                createdAt: Date.now(),

                updatedAt: Date.now(),

                // penanda salinan dari Home (id project aslinya)
                ...(homeId != null ? { homeId } : {})

            });

            persist();

            if (!silent) {

                closeAddModal();

                showToast(addedMessage);

            }

            return true;

        },

        async deleteProject(id) {

            if (!checkPermission()) return false;

            const confirmed = await showConfirm(
                "Delete this project? This action cannot be undone."
            );

            if (!confirmed) {

                return false;

            }

            projects = projects.filter(
                project => project.id !== Number(id)
            );

            persist();

            showToast("Project deleted successfully.");

            return true;

        },

        editProject(id) {

            if (!checkPermission()) return;

            const project = projects.find(
                project => project.id === Number(id)
            );

            if (!project) return;

            // kolom Misi hanya muncul saat admin mengedit project Home
            fillEditForm(project, { showMission: !!canMutate && isAdmin() });

            openEditModal();

        },

        async updateProject(data) {

            if (!checkPermission()) return false;

            const project = projects.find(
                project => project.id === Number(data.id)
            );

            if (!project) {

                return false;

            }

            project.name = data.name.trim();

            project.network = data.network.trim();

            project.website = data.website.trim();

            project.websiteInvite = (data.websiteInvite || "").trim();

            project.taskType = data.taskType;

            project.checkIn = data.checkIn;

            project.mission = resolveMission(data.checkIn, data.mission, project.mission);

            project.deadline = data.deadline;

            project.funding = (data.funding || "").trim();

            project.priority = data.priority;

            project.status = data.status;

            project.note = data.note.trim();

            project.updatedAt = Date.now();

            project.staleWarned = false;

            if (!(await validateProject(project))) {

                return false;

            }

            persist();

            closeEditModal();

            showToast("Project updated successfully.");

            return true;

        },

        // Meneruskan edit project Home ke salinannya di My Project (admin,
        // otomatis). Hanya field yang berbeda antara before dan after.
        applyHomeEdit(homeId, before, after) {

            // proyek lama belum punya misi -> dianggap "None" supaya bukan perubahan
            const valueOf = (project, field) =>
                String(project[field] ?? (field === "mission" ? DEFAULT_MISSION : ""));

            const changedFields = HOME_SYNC_FIELDS.filter(
                field => valueOf(before, field) !== valueOf(after, field)
            );

            if (!changedFields.length) return false;

            const targets = findCopies(homeId, [
                { name: before.name, network: before.network }
            ]);

            if (!targets.length) return false;

            applyFieldsToCopies(targets, homeId, changedFields, after);

            return true;

        },

        // Ada salinan project Home ini di store?
        hasHomeCopy(homeId, hints) {
            return findCopies(homeId, hints).length > 0;
        },

        // Menerapkan field tertentu dari project Home (versi terbaru) ke
        // salinannya. Dipakai tombol "Perbarui" di notifikasi (user).
        // Mengembalikan jumlah salinan yang diperbarui.
        syncFromHome(homeId, fields, home, hints) {

            const validFields = (fields || []).filter(
                field => HOME_SYNC_FIELDS.includes(field)
            );

            const targets = findCopies(homeId, hints);

            if (!validFields.length || !targets.length) return 0;

            applyFieldsToCopies(targets, homeId, validFields, home);

            return targets.length;

        },

        markDailyDone(id) {

            if (!checkPermission()) return false;

            const project = projects.find(
                project => project.id === Number(id)
            );

            if (!project) return false;

            project.dailyDone = true;

            // menyelesaikan project = misi baru dianggap tuntas
            // (kalau tidak, besok muncul lagi karena dailyDone di-reset harian)
            if (project.mission === "New") project.mission = DEFAULT_MISSION;

            project.updatedAt = Date.now();

            persist();

            return true;

        },

        filterProjects(keyword = "", status = "All", task = "All", quickFilter = "None", checkIn = "All") {

            keyword = keyword.toLowerCase();

            return projects.filter(project => {

                const keywordMatch =
                    project.name.toLowerCase().includes(keyword)
                    ||
                    project.network.toLowerCase().includes(keyword);

                const statusMatch =
                    status === "All"
                    ||
                    project.status === status;

                const taskMatch =
                    task === "All"
                    ||
                    project.taskType === task;

                const checkInMatch =
                    checkIn === "All"
                    ||
                    project.checkIn === checkIn;

                const quickFilterMatch =
                    quickFilter === "None"
                    ||
                    (quickFilter === "TodayTask" && isTaskDueToday(project))
                    ||
                    (quickFilter === "DeadlineToday" && isDeadlineToday(project));

                return (
                    keywordMatch &&
                    statusMatch &&
                    taskMatch &&
                    checkInMatch &&
                    quickFilterMatch
                );

            });

        }

    };

}

/* ==========================================
   INSTANCE STORE
========================================== */

export const myProjectStore = makeProjectStore(
    loadProjects,
    saveProjects,
    null,
    "",
    "Project added to My Project."
);

export const homeProjectStore = makeProjectStore(
    loadHomeProjects,
    saveHomeProjects,
    isAdmin,
    "Only admin can add/edit/delete Home projects.",
    "Project added to Home."
);

/* ==========================================
   MODE AKTIF (halaman mana yang sedang dilihat)
========================================== */

let currentMode = "home"; // "home" | "myproject"

export function setMode(mode) {
    currentMode = mode;
}

export function getMode() {
    return currentMode;
}

export function isHomeMode() {
    return currentMode === "home";
}

function activeStore() {
    return currentMode === "home" ? homeProjectStore : myProjectStore;
}

/* ==========================================
   FACADE -- dipakai oleh render.js / event.js / projectsView.js / nav.js
   (mengikuti mode yang sedang aktif)
========================================== */

// Sudah ada salinan project Home ini di My Project viewer? Dicek lewat
// homeId; salinan lama yang belum bertanda dicocokkan lewat nama + chain.
export function isHomeProjectCopied(homeProject) {

    if (!homeProject) return false;

    return myProjectStore.hasHomeCopy(Number(homeProject.id), [
        { name: homeProject.name, network: homeProject.network }
    ]);

}

// Menyalin project Home (publik) menjadi entri baru di My Project
// (privat) milik viewer. Dipakai oleh ikon "+" pada kartu Home.
// Satu project Home hanya bisa disalin 1x -- kalau sudah ada, ditolak.
export function copyHomeProjectToMyProject(id) {

    const source = homeProjectStore.getProjects().find(
        project => project.id === Number(id)
    );

    if (!source) return false;

    if (isHomeProjectCopied(source)) {

        showToast(t("project.alreadyInMyProject"), 3000, "error");

        return false;

    }

    return myProjectStore.addProject({
        name: source.name,
        network: source.network,
        website: source.website,
        websiteInvite: source.websiteInvite || "",
        taskType: source.taskType,
        checkIn: source.checkIn,
        mission: source.mission,
        deadline: source.deadline,
        funding: source.funding || "",
        priority: source.priority,
        status: source.status,
        note: source.note
    }, { homeId: source.id });

}

export function getProjects() {
    return activeStore().getProjects();
}

// Tujuan simpan project baru ditentukan oleh ROLE, bukan halaman
// yang sedang dibuka: admin -> Home (publik), user lain -> My
// Project (privat). Ini supaya tombol Add konsisten dari mode manapun.
// Khusus admin: project yang masuk ke Home juga otomatis disalin ke
// My Project miliknya, jadi tidak perlu menekan tombol "+" lagi.
export async function addProject(data) {

    if (!isAdmin()) return myProjectStore.addProject(data);

    const success = await homeProjectStore.addProject(data);

    if (success) {

        // id project yang baru masuk Home = elemen terakhir
        const homeList = homeProjectStore.getProjects();

        await myProjectStore.addProject(data, {
            silent: true,
            homeId: homeList[homeList.length - 1].id
        });

    }

    return success;

}

export function deleteProject(id) {
    return activeStore().deleteProject(id);
}

export function editProject(id) {
    return activeStore().editProject(id);
}

// Khusus admin di halaman Home: edit project Home juga diteruskan otomatis
// ke salinannya di My Project milik admin (hanya field yang diubah), tanpa
// notifikasi karena admin sendiri yang mengedit.
export async function updateProject(data) {

    if (!(isHomeMode() && isAdmin())) return activeStore().updateProject(data);

    const homeId = Number(data.id);

    const found = homeProjectStore.getProjects().find(
        project => project.id === homeId
    );

    // salin dulu, karena updateProject mengubah objek aslinya
    const before = found ? { ...found } : null;

    const success = await homeProjectStore.updateProject(data);

    if (success && before) {

        const after = homeProjectStore.getProjects().find(
            project => project.id === homeId
        );

        if (after) myProjectStore.applyHomeEdit(homeId, before, after);

    }

    return success;

}

// Petunjuk pencarian salinan lama (tanpa homeId): nama + chain saat
// notifikasi dibuat, dan nama + chain Home saat ini.
function homeCopyHints(meta, home) {

    return [
        { name: meta.oldName, network: meta.oldNetwork },
        { name: home.name, network: home.network }
    ];

}

function findHomeProject(meta) {

    return homeProjectStore.getProjects().find(
        project => project.id === Number(meta.homeId)
    );

}

// Tombol "Perbarui" di notifikasi hanya tampil kalau project Home-nya
// masih ada DAN user punya salinannya di My Project.
export function canSyncHomeEdit(meta) {

    if (!meta || meta.done) return false;

    const home = findHomeProject(meta);

    if (!home) return false;

    return myProjectStore.hasHomeCopy(Number(meta.homeId), homeCopyHints(meta, home));

}

// Mengembalikan: "ok" | "noHome" | "noCopy"
export function syncHomeEdit(meta) {

    const home = findHomeProject(meta);

    if (!home) return "noHome";

    const updated = myProjectStore.syncFromHome(
        Number(meta.homeId),
        meta.fields,
        home,
        homeCopyHints(meta, home)
    );

    return updated > 0 ? "ok" : "noCopy";

}

export function filterProjects(keyword, status, task, quickFilter, checkIn) {
    return activeStore().filterProjects(keyword, status, task, quickFilter, checkIn);
}

export function markDailyDone(id) {
    return activeStore().markDailyDone(id);
}

// Dipakai khusus oleh refreshProjectsView() (reset harian/auto-cleanup),
// yang memang hanya berlaku untuk data privat My Project -- Home adalah
// data terkurasi admin, jadi tidak ikut direset/dibersihkan otomatis.
export function setProjects(newProjects) {
    myProjectStore.setProjects(newProjects);
}

// Dipakai setelah pullHomeFromCloud() supaya in-memory store Home
// ikut ter-update dari hasil pull cloud terbaru.
export function setHomeProjects(newProjects) {
    homeProjectStore.setProjects(newProjects);
}
