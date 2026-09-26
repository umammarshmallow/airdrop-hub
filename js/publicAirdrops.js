/* ==========================================================
   PUBLICAIRDROPS.JS
   Etalase airdrop publik di tab Home.

   - Bisa dibaca SIAPA SAJA (termasuk belum login), datanya
     disimpan di Firestore koleksi "publicAirdrops".
   - Cuma akun admin (ADMIN_UID di firebaseConfig.js) yang
     bisa tambah/edit/hapus — proteksi aslinya ada di Firestore
     security rules (server-side), tombolnya cuma disembunyikan
     di sisi tampilan untuk user lain.
   - Tiap kartu ada tombol "+" untuk menyalin airdrop itu ke
     daftar pribadi user (My Project), kalau user sudah login.
   - Kalau Firebase belum dikonfigurasi / lagi offline, otomatis
     fallback ke cache terakhir yang tersimpan di localStorage,
     supaya tab Home tetap ada isinya.
========================================== */

import { initFirebaseApp, getDb, getFirebaseTools, isAdmin, getCurrentUser } from "./cloudSync.js";
import { getProjects } from "./project.js";
import { saveProjects } from "./storage.js";
import { renderProjects } from "./render.js";
import { showToast, escapeHTML, formatUrl, addNotification } from "./helpers.js";
import { showConfirm } from "./dialog.js";
import { t } from "./i18n.js";

const CACHE_KEY = "airdropHub_publicCache";
const COLLECTION = "publicAirdrops";

let airdrops = []; // cache in-memory, hasil fetch/localStorage

const publicSearch = document.getElementById("publicSearch");
const publicAirdropList = document.getElementById("publicAirdropList");
const addAirdropBtn = document.getElementById("addAirdropBtn");

const airdropModal = document.getElementById("airdropModal");
const airdropModalTitle = document.getElementById("airdropModalTitle");
const airdropId = document.getElementById("airdropId");
const airdropName = document.getElementById("airdropName");
const airdropNetwork = document.getElementById("airdropNetwork");
const airdropWebsite = document.getElementById("airdropWebsite");
const airdropTaskType = document.getElementById("airdropTaskType");
const airdropDeadline = document.getElementById("airdropDeadline");
const airdropPriority = document.getElementById("airdropPriority");
const airdropNote = document.getElementById("airdropNote");
const saveAirdropBtn = document.getElementById("saveAirdrop");
const closeAirdropModalBtn = document.getElementById("closeAirdropModal");

/* ==========================================
   LOAD DATA (Firestore, fallback ke cache lokal)
========================================== */

function loadCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCache(list) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(list));
    } catch (e) {
        // localStorage penuh/diblokir — tidak fatal, cukup lewati caching
    }
}

async function fetchPublicAirdrops() {

    const configured = await initFirebaseApp();

    if (!configured) {
        airdrops = loadCache();
        return;
    }

    try {

        const fb = getFirebaseTools();
        const db = getDb();

        const q = fb.query(
            fb.collection(db, COLLECTION),
            fb.orderBy("createdAt", "desc")
        );

        const snap = await fb.getDocs(q);

        airdrops = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        saveCache(airdrops);

    } catch (err) {

        console.warn("[PublicAirdrops] Gagal ambil data, pakai cache:", err);
        airdrops = loadCache();

    }

}

/* ==========================================
   INIT (dipanggil sekali dari app.js saat app dibuka)
========================================== */

export async function initPublicAirdrops() {

    // Tampilkan dulu cache lokal (kalau ada) supaya tidak blank
    // sambil menunggu fetch dari Firestore selesai.
    airdrops = loadCache();
    renderPublicAirdrops();

    await fetchPublicAirdrops();

    renderPublicAirdrops();

    updateAdminUI();

}

/* ==========================================
   TAMPIL/SEMBUNYI KONTROL ADMIN
   Dipanggil ulang tiap status login berubah (lihat app.js).
========================================== */

export function updateAdminUI() {

    addAirdropBtn.style.display = isAdmin() ? "flex" : "none";

    renderPublicAirdrops();

}

/* ==========================================
   RENDER
========================================== */

function myProjectSourceIds() {
    return new Set(
        getProjects()
            .filter(p => p.sourceId)
            .map(p => String(p.sourceId))
    );
}

function taskTypeLabel(value) {
    switch (value) {
        case "Daily": return t("project.daily");
        case "Weekly": return t("project.weekly");
        case "Testnet": return t("project.testnet");
        case "Mainnet": return t("project.mainnet");
        case "One Time": return t("filter.oneTime");
        default: return value;
    }
}

function priorityLabel(value) {
    switch (value) {
        case "Low": return t("project.low");
        case "Medium": return t("project.medium");
        case "High": return t("project.high");
        default: return value;
    }
}

export function renderPublicAirdrops() {

    const keyword = (publicSearch.value || "").toLowerCase();

    const filtered = airdrops.filter(a =>
        (a.name || "").toLowerCase().includes(keyword) ||
        (a.network || "").toLowerCase().includes(keyword)
    );

    if (filtered.length === 0) {

        publicAirdropList.innerHTML = `<div class="empty">${
            airdrops.length === 0
                ? t("home.empty")
                : t("projects.emptyFiltered")
        }</div>`;

        publicAirdropList.removeAttribute("aria-busy");

        return;

    }

    const admin = isAdmin();
    const loggedIn = !!getCurrentUser();
    const savedIds = myProjectSourceIds();

    let html = "";

    filtered.forEach((a) => {

        const alreadyAdded = savedIds.has(String(a.id));

        html += `
        <div class="project-card" data-status="Active">

            <div class="project-title">

                <h3>${escapeHTML(a.name)}</h3>

                <div class="title-actions">

                    <a
                        class="icon-btn icon-btn-blue"
                        href="${escapeHTML(formatUrl(a.website))}"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="${t("project.website.title")}">
                        <i class="fa-solid fa-globe" aria-hidden="true"></i>
                    </a>

                    <button
                        class="icon-btn icon-btn-save ${alreadyAdded ? "added" : ""}"
                        data-action="addToMy"
                        data-id="${escapeHTML(a.id)}"
                        title="${alreadyAdded ? t("home.added") : t("home.addToMy")}"
                        ${alreadyAdded ? "disabled" : ""}>
                        <i class="fa-solid ${alreadyAdded ? "fa-check" : "fa-plus"}" aria-hidden="true"></i>
                    </button>

                </div>

            </div>

            <button class="detail-toggle" data-action="toggle" data-id="${escapeHTML(a.id)}">
                <span>${t("project.viewDetails")}</span>
                <i class="fa-solid fa-chevron-down detail-arrow" aria-hidden="true"></i>
            </button>

            <div class="project-detail" id="public-detail-${escapeHTML(a.id)}">

                <div class="chip-group">
                    <span class="chip"><i class="fa-solid fa-link" aria-hidden="true"></i> ${escapeHTML(a.network || "-")}</span>
                </div>

                <div class="info-grid">

                    <div class="info-tile">
                        <i class="fa-solid fa-list-check info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.task")}</div>
                            <div class="info-value">${taskTypeLabel(a.taskType)}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="fa-solid fa-flag info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.priority")}</div>
                            <div class="info-value">${priorityLabel(a.priority)}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="fa-solid fa-calendar info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.deadline")}</div>
                            <div class="info-value">${a.deadline || "-"}</div>
                        </div>
                    </div>

                </div>

                <div class="note">${a.note ? escapeHTML(String(a.note).trim()) : "-"}</div>

                ${admin ? `
                <div class="admin-only-actions">
                    <button class="btn-gray" data-action="editAirdrop" data-id="${escapeHTML(a.id)}">
                        <i class="fa-solid fa-pen" aria-hidden="true"></i> ${t("project.editBtn")}
                    </button>
                    <button class="btn-red" data-action="deleteAirdrop" data-id="${escapeHTML(a.id)}">
                        <i class="fa-solid fa-trash" aria-hidden="true"></i> ${t("project.deleteBtn")}
                    </button>
                </div>
                ` : ""}

            </div>

        </div>
        `;

    });

    publicAirdropList.innerHTML = html;
    publicAirdropList.removeAttribute("aria-busy");

}

/* ==========================================
   SEARCH (client-side, atas cache yang sudah ada)
========================================== */

publicSearch.addEventListener("input", renderPublicAirdrops);

/* ==========================================
   TAMBAHKAN KE MY PROJECT
========================================== */

function addToMyProject(a) {

    if (!getCurrentUser()) {

        showToast(t("home.loginRequired"));
        window.dispatchEvent(new CustomEvent("airdrophub:requestLogin"));
        return;

    }

    const savedIds = myProjectSourceIds();

    if (savedIds.has(String(a.id))) {
        return; // sudah pernah ditambahkan
    }

    getProjects().push({
        id: Date.now(),
        name: a.name || "",
        network: a.network || "",
        wallet: "",
        website: a.website || "",
        taskType: a.taskType || "One Time",
        deadline: a.deadline || "",
        priority: a.priority || "Low",
        status: "Waitlist",
        note: a.note || "",
        dailyDone: false,
        sourceId: String(a.id),
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    saveProjects(getProjects());

    renderProjects();
    renderPublicAirdrops();

    showToast(t("home.addedToMy"));

}

/* ==========================================
   EVENT DELEGATION — list publik
========================================== */

publicAirdropList.addEventListener("click", async (e) => {

    const button = e.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    const item = airdrops.find(a => String(a.id) === String(id));

    switch (action) {

        case "toggle": {

            const detail = document.getElementById(`public-detail-${id}`);

            if (!detail) return;

            const willOpen = !detail.classList.contains("open");

            document.querySelectorAll("#publicAirdropList .project-detail.open").forEach(openDetail => {

                if (openDetail === detail) return;

                openDetail.classList.remove("open");

                const otherToggle = openDetail.closest(".project-card").querySelector(".detail-toggle");

                if (otherToggle) {
                    otherToggle.classList.remove("open");
                    otherToggle.querySelector("span").textContent = t("project.viewDetails");
                }

            });

            detail.classList.toggle("open", willOpen);
            button.classList.toggle("open", willOpen);
            button.querySelector("span").textContent = willOpen ? t("project.hideDetails") : t("project.viewDetails");

            break;

        }

        case "addToMy":

            if (item) addToMyProject(item);

            break;

        case "editAirdrop":

            if (item) openAirdropModal(item);

            break;

        case "deleteAirdrop":

            if (!item) return;

            const confirmed = await showConfirm(t("home.deleteConfirm"));

            if (!confirmed) return;

            try {

                const fb = getFirebaseTools();
                const db = getDb();

                await fb.deleteDoc(fb.doc(db, COLLECTION, item.id));

                airdrops = airdrops.filter(a => String(a.id) !== String(item.id));

                saveCache(airdrops);
                renderPublicAirdrops();

                showToast(t("home.deleted"));

            } catch (err) {

                console.error("[PublicAirdrops] Gagal hapus:", err);
                showToast(t("home.saveFailed"));

            }

            break;

    }

});

/* ==========================================
   MODAL ADMIN: TAMBAH / EDIT
========================================== */

function openAirdropModal(item) {

    airdropId.value = item ? item.id : "";
    airdropModalTitle.textContent = item ? t("project.edit") : t("home.addAirdrop");

    airdropName.value = item ? item.name || "" : "";
    airdropNetwork.value = item ? item.network || "" : "";
    airdropWebsite.value = item ? item.website || "" : "";
    airdropTaskType.value = item ? item.taskType || "One Time" : "One Time";
    airdropDeadline.value = item ? item.deadline || "" : "";
    airdropPriority.value = item ? item.priority || "Low" : "Low";
    airdropNote.value = item ? item.note || "" : "";

    airdropModal.classList.add("show");

    requestAnimationFrame(() => requestAnimationFrame(() => {
        airdropModal.classList.add("in");
    }));

}

function closeAirdropModal() {

    airdropModal.classList.remove("in");

    setTimeout(() => airdropModal.classList.remove("show"), 200);

}

addAirdropBtn.addEventListener("click", () => openAirdropModal(null));

closeAirdropModalBtn.addEventListener("click", closeAirdropModal);

saveAirdropBtn.addEventListener("click", async () => {

    const name = airdropName.value.trim();
    const network = airdropNetwork.value;

    if (!name || !network) {

        showToast(t("home.fillRequired"));
        return;

    }

    const data = {
        name,
        network,
        website: airdropWebsite.value.trim(),
        taskType: airdropTaskType.value,
        deadline: airdropDeadline.value,
        priority: airdropPriority.value,
        note: airdropNote.value.trim(),
        updatedAt: Date.now()
    };

    const fb = getFirebaseTools();
    const db = getDb();
    const editingId = airdropId.value;

    try {

        if (editingId) {

            await fb.updateDoc(fb.doc(db, COLLECTION, editingId), data);

            const idx = airdrops.findIndex(a => String(a.id) === String(editingId));

            if (idx > -1) airdrops[idx] = { ...airdrops[idx], ...data };

        } else {

            data.createdAt = Date.now();

            const ref = await fb.addDoc(fb.collection(db, COLLECTION), data);

            airdrops.unshift({ id: ref.id, ...data });

        }

        saveCache(airdrops);
        renderPublicAirdrops();
        closeAirdropModal();

        showToast(t("home.saved"));

    } catch (err) {

        console.error("[PublicAirdrops] Gagal simpan:", err);
        showToast(t("home.saveFailed"));
        addNotification("Gagal menyimpan airdrop ke cloud. Cek koneksi atau aturan keamanan Firestore.", "error");

    }

});
