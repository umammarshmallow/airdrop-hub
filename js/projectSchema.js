/* ==========================================
   PROJECTSCHEMA.JS
   Nilai baku field project + migrasi data lama.

   - taskType : kategori project (Testnet, Mainnet, Social, Node, Other)
   - checkIn  : seberapa sering digarap (Daily, Weekly, Monthly, One Time)

   Dulu hanya ada taskType dengan nilai Daily / Weekly / One Time /
   Testnet / Mainnet. Data lama dimigrasikan otomatis saat dibaca:
   - Daily / Weekly / One Time -> checkIn = nilai itu, taskType = Other
   - Testnet / Mainnet         -> taskType tetap, checkIn = Daily
     (perilaku lama: keduanya memang dihitung harian)
========================================== */

export const TASK_TYPES = ["Testnet", "Mainnet", "Social", "Node", "Other"];

export const CHECK_INS = ["Daily", "Weekly", "Monthly", "One Time"];

// "Misi" (diatur admin di Home): penanda ada misi baru atau tidak.
// Hanya berlaku untuk check-in selain Daily; selain itu selalu "None".
export const MISSIONS = ["New", "None"];

export const MISSION_CHECK_INS = ["Weekly", "Monthly", "One Time"];

export const DEFAULT_MISSION = "None";

// Jam reset status "selesai" untuk check-in Daily (waktu perangkat).
// 00:00 = pergantian hari (perilaku lama), 07:00 = reset jam 7 pagi.
// Check-in selain Daily selalu 00:00 (kolom ini hanya muncul untuk Daily).
export const RESET_TIMES = ["00:00", "07:00"];

export const DEFAULT_RESET_TIME = "00:00";

export const DEFAULT_TASK_TYPE = "Other";

export const DEFAULT_CHECK_IN = "Daily";

// Mengubah nilai taskType LAMA menjadi pasangan { taskType, checkIn } baru.
export function migrateTaskFields(oldTaskType) {

    if (CHECK_INS.includes(oldTaskType)) {

        return { taskType: DEFAULT_TASK_TYPE, checkIn: oldTaskType };

    }

    if (TASK_TYPES.includes(oldTaskType)) {

        return { taskType: oldTaskType, checkIn: DEFAULT_CHECK_IN };

    }

    return { taskType: DEFAULT_TASK_TYPE, checkIn: DEFAULT_CHECK_IN };

}

// Project yang sudah punya checkIn dianggap skema baru; selain itu dimigrasi.
export function normalizeProject(project) {

    if (!project || typeof project !== "object") return project;

    if (CHECK_INS.includes(project.checkIn) && TASK_TYPES.includes(project.taskType)) {

        return project;

    }

    if (CHECK_INS.includes(project.checkIn)) {

        // checkIn sudah ada tapi taskType tidak dikenal
        return { ...project, taskType: DEFAULT_TASK_TYPE };

    }

    return { ...project, ...migrateTaskFields(project.taskType) };

}

// Nilai misi yang akan disimpan. requested === undefined berarti form tidak
// menyediakan kolom misi (mis. edit di My Project) -> pertahankan nilai lama.
export function resolveMission(checkIn, requested, current = DEFAULT_MISSION) {

    if (!MISSION_CHECK_INS.includes(checkIn)) return DEFAULT_MISSION;

    const value = requested === undefined ? current : requested;

    return value === "New" ? "New" : DEFAULT_MISSION;

}

// Nilai jam reset yang akan disimpan. requested === undefined berarti form
// tidak menyediakan kolomnya -> pertahankan nilai lama.
export function resolveResetTime(checkIn, requested, current = DEFAULT_RESET_TIME) {

    if (checkIn !== "Daily") return DEFAULT_RESET_TIME;

    const value = requested === undefined ? current : requested;

    return RESET_TIMES.includes(value) ? value : DEFAULT_RESET_TIME;

}

/* ==========================================
   SALINAN PROJECT HOME DI MY PROJECT
========================================== */

export function sameKey(a, b) {
    return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

// Mencari salinan project Home: lewat homeId dulu; kalau belum ada yang
// tertaut (salinan lama), cocokkan nama + chain dengan salah satu petunjuk
// (hints) -- yang belum tertaut saja.
export function findHomeCopies(projects, homeId, hints) {

    const linked = projects.filter(project => project.homeId === homeId);

    if (linked.length) return linked;

    return projects.filter(project =>
        project.homeId == null
        && hints.some(hint =>
            sameKey(project.name, hint.name)
            && sameKey(project.network, hint.network)
        )
    );

}

// Menerapkan satu perubahan Home yang berlaku otomatis (Misi, Funding,
// Website, dan/atau Link Invite) ke salinannya. Hanya field yang ada di update yang disentuh.
// Misi baru juga mengaktifkan kembali project (dailyDone=false) supaya
// masuk Today's Task. Mengembalikan jumlah salinan yang diubah.
export function applyHomeAutoUpdate(projects, update) {

    const targets = findHomeCopies(projects, update.homeId, update.hints || []);

    targets.forEach(project => {

        if (update.mission !== undefined) {

            project.mission = resolveMission(project.checkIn, update.mission);

            if (project.mission === "New") project.dailyDone = false;

        }

        if (update.funding !== undefined) {

            project.funding = String(update.funding).trim();

        }

        if (update.website !== undefined) {

            project.website = String(update.website).trim();

        }

        if (update.websiteInvite !== undefined) {

            project.websiteInvite = String(update.websiteInvite).trim();

        }

        project.homeId = update.homeId;

    });

    return targets.length;

}
