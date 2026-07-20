/* ==========================================
   CHAIN.JS
========================================== */

import { showToast } from "./helpers.js";

const STORAGE_KEY = "airdropHub_chains";

/* ==========================================
   DATA
========================================== */

function load() {

    try {

        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) return [];

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        console.error("Gagal membaca chain:", error);

        return [];

    }

}

let chains = load();

function save() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(chains)
        );

    } catch (error) {

        console.error("Gagal menyimpan chain:", error);

    }

}

export function getChains() {

    return chains;

}

/* ==========================================
   ADD CHAIN
========================================== */

export function addChain(data) {

    const name = data.name.trim();

    if (!name) {

        alert("Nama chain wajib diisi.");

        return false;

    }

    chains.push({

        id: Date.now(),

        name: name

    });

    save();

    showToast("Chain berhasil ditambahkan.");

    return true;

}

/* ==========================================
   DELETE CHAIN
========================================== */

export function deleteChain(id) {

    if (!confirm("Hapus chain ini?")) {

        return false;

    }

    chains = chains.filter(

        chain => chain.id !== Number(id)

    );

    save();

    showToast("Chain berhasil dihapus.");

    return true;

}

/* ==========================================
   RENDER
========================================== */

const chainList = document.getElementById("chainList");

export function renderChains() {

    if (chains.length === 0) {

        chainList.innerHTML = `
            <div class="empty">
                Belum ada chain.
            </div>
        `;

        return;

    }

    let html = "";

    chains.forEach(chain => {

        html += `
        <div class="simple-card">

            <div class="simple-card-info">

                <p><b>${chain.name}</b></p>

            </div>

            <button
                class="btn-red"
                data-action="delete"
                data-id="${chain.id}">

                🗑 Delete

            </button>

        </div>
        `;

    });

    chainList.innerHTML = html;

}

chainList.addEventListener("click", (e) => {

    const button = e.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    if (action === "delete") {

        const success = deleteChain(id);

        if (success) {

            renderChains();

        }

    }

});

/* ==========================================
   MODAL ADD CHAIN
========================================== */

const chainModal = document.getElementById("chainModal");
const addChainBtn = document.getElementById("addChainBtn");
const closeChainModalBtn = document.getElementById("closeChainModal");
const saveChainBtn = document.getElementById("saveChain");

function openChainModal() {

    document.getElementById("chainName").value = "";

    chainModal.style.display = "flex";

    document.body.classList.add("modal-open");

}

function closeChainModal() {

    chainModal.style.display = "none";

    document.body.classList.remove("modal-open");

}

addChainBtn.addEventListener("click", openChainModal);

closeChainModalBtn.addEventListener("click", closeChainModal);

window.addEventListener("click", (e) => {

    if (e.target === chainModal) {

        closeChainModal();

    }

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeChainModal();

    }

});

saveChainBtn.addEventListener("click", () => {

    const success = addChain({

        name: document.getElementById("chainName").value

    });

    if (success) {

        closeChainModal();

        renderChains();

    }

});

/* ==========================================
   INIT
========================================== */

export function initChain() {

    renderChains();

}
