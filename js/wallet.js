/* ==========================================
   WALLET.JS
========================================== */

import { showToast } from "./helpers.js";
import { showAlert, showConfirm } from "./dialog.js";

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

export async function addWallet(data) {

    const address = data.address.trim();

    const chain = data.chain.trim();

    if (!chain) {

        await showAlert("Chain wajib dipilih.");

        return false;

    }

    if (!address) {

        await showAlert("Address wallet wajib diisi.");

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

export async function deleteWallet(id) {

    const confirmed = await showConfirm(
        "Yakin ingin menghapus wallet ini? Tindakan ini tidak bisa dibatalkan."
    );

    if (!confirmed) {

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

                <p class="wallet-address-row">
                    <span class="wallet-address-text">${wallet.address}</span>
                    <button
                        class="copy-btn"
                        data-action="copy"
                        data-address="${wallet.address}"
                        title="Copy address">
                        <i class="ti ti-copy" aria-hidden="true"></i>
                    </button>
                </p>

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

walletList.addEventListener("click", async (e) => {

    const button = e.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;

    if (action === "copy") {

        const address = button.dataset.address;

        copyToClipboard(address);

        return;

    }

    const id = Number(button.dataset.id);

    if (action === "delete") {

        const success = await deleteWallet(id);

        if (success) {

            renderWallets();

        }

    }

});

/* ==========================================
   COPY ADDRESS
========================================== */

function copyToClipboard(text) {

    if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(text)
            .then(() => showToast("Address wallet disalin."))
            .catch(() => fallbackCopy(text));

    } else {

        fallbackCopy(text);

    }

}

function fallbackCopy(text) {

    const temp = document.createElement("textarea");

    temp.value = text;

    temp.style.position = "fixed";

    temp.style.opacity = "0";

    document.body.appendChild(temp);

    temp.select();

    try {

        document.execCommand("copy");

        showToast("Address wallet disalin.");

    } catch (error) {

        console.error("Gagal menyalin address:", error);

    }

    document.body.removeChild(temp);

}

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

saveWalletBtn.addEventListener("click", async () => {

    const success = await addWallet({

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
