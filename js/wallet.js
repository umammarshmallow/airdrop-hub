/* ==========================================
   WALLET.JS
========================================== */

import { showToast } from "./helpers.js";

const STORAGE_KEY = "airdropHub_wallets";

const CHAIN_ICONS = {

    "Ethereum": "🔷",
    "Solana": "🟣",
    "BNB": "🟡",
    "Gram (TON)": "💎",
    "Lainnya": "🔗"

};

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

        console.error("Gagal membaca wallet:", error);

        return [];

    }

}

let wallets = load();

function save() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(wallets)
        );

    } catch (error) {

        console.error("Gagal menyimpan wallet:", error);

    }

}

export function getWallets() {

    return wallets;

}

/* ==========================================
   ADD WALLET
========================================== */

export function addWallet(data) {

    const address = data.address.trim();

    const chain = data.chain.trim();

    if (!chain) {

        alert("Chain wajib dipilih.");

        return false;

    }

    if (!address) {

        alert("Address wallet wajib diisi.");

        return false;

    }

    wallets.push({

        id: Date.now(),

        chain: chain,

        address: address,

        note: data.note.trim()

    });

    save();

    showToast("Wallet berhasil ditambahkan.");

    return true;

}

/* ==========================================
   DELETE WALLET
========================================== */

export function deleteWallet(id) {

    if (!confirm("Hapus wallet ini?")) {

        return false;

    }

    wallets = wallets.filter(

        wallet => wallet.id !== Number(id)

    );

    save();

    showToast("Wallet berhasil dihapus.");

    return true;

}

/* ==========================================
   RENDER
========================================== */

const walletList = document.getElementById("walletList");

export function renderWallets() {

    if (wallets.length === 0) {

        walletList.innerHTML = `
            <div class="empty">
                Belum ada wallet.
            </div>
        `;

        return;

    }

    let html = "";

    wallets.forEach(wallet => {

        const icon = CHAIN_ICONS[wallet.chain] || "🔗";

        html += `
        <div class="simple-card">

            <div class="simple-card-info">

                <p><b>${icon} ${wallet.chain || "-"}</b></p>

                <p>${wallet.address}</p>

                <p>${wallet.note || "-"}</p>

            </div>

            <button
                class="btn-red"
                data-action="delete"
                data-id="${wallet.id}">

                🗑 Delete

            </button>

        </div>
        `;

    });

    walletList.innerHTML = html;

}

walletList.addEventListener("click", (e) => {

    const button = e.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    if (action === "delete") {

        const success = deleteWallet(id);

        if (success) {

            renderWallets();

        }

    }

});

/* ==========================================
   MODAL ADD WALLET
========================================== */

const walletModal = document.getElementById("walletModal");
const addWalletBtn = document.getElementById("addWalletBtn");
const closeWalletModalBtn = document.getElementById("closeWalletModal");
const saveWalletBtn = document.getElementById("saveWallet");

function openWalletModal() {

    document.getElementById("walletChain").selectedIndex = 0;

    document.getElementById("walletAddress").value = "";

    document.getElementById("walletNote").value = "";

    walletModal.style.display = "flex";

    document.body.classList.add("modal-open");

}

function closeWalletModal() {

    walletModal.style.display = "none";

    document.body.classList.remove("modal-open");

}

addWalletBtn.addEventListener("click", openWalletModal);

closeWalletModalBtn.addEventListener("click", closeWalletModal);

window.addEventListener("click", (e) => {

    if (e.target === walletModal) {

        closeWalletModal();

    }

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeWalletModal();

    }

});

saveWalletBtn.addEventListener("click", () => {

    const success = addWallet({

        chain: document.getElementById("walletChain").value,

        address: document.getElementById("walletAddress").value,

        note: document.getElementById("walletNote").value

    });

    if (success) {

        closeWalletModal();

        renderWallets();

    }

});

/* ==========================================
   INIT
========================================== */

export function initWallet() {

    renderWallets();

}
