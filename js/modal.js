// ==========================================
// MODAL
// ==========================================

const projectModal = document.getElementById("projectModal");

const editModal = document.getElementById("editModal");

const addProjectBtn = document.getElementById("addProjectBtn");

const closeModalBtn = document.getElementById("closeModal");

const closeEditModalBtn = document.getElementById("closeEditModal");

// ==========================================
// OPEN MODAL
// ==========================================

export function openAddModal() {

    projectModal.style.display = "flex";

}

export function openEditModal() {

    editModal.style.display = "flex";

}

// ==========================================
// CLOSE MODAL
// ==========================================

export function closeAddModal() {

    projectModal.style.display = "none";

}

export function closeEditModal() {

    editModal.style.display = "none";

}

// ==========================================
// CLOSE ALL MODAL
// ==========================================

export function closeAllModal() {

    closeAddModal();

    closeEditModal();

}

// ==========================================
// INIT MODAL
// ==========================================

export function initModal() {

    // Tombol tambah project

    addProjectBtn.addEventListener("click", () => {

        openAddModal();

    });

    // Tombol batal tambah project

    closeModalBtn.addEventListener("click", () => {

        closeAddModal();

    });

    // Tombol batal edit project

    closeEditModalBtn.addEventListener("click", () => {

        closeEditModal();

    });

    // Klik area luar modal

    window.addEventListener("click", (event) => {

        if (event.target === projectModal) {

            closeAddModal();

        }

        if (event.target === editModal) {

            closeEditModal();

        }

    });

    // Tombol ESC

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeAllModal();

        }

    });

  }
