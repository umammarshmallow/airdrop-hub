/* ==========================================
   EVENTS.JS
========================================== */

import { addProject, updateProject } from "./project.js";
import { renderProjects } from "./render.js";
import { initModal } from "./modal.js";

/* ==========================================
   ELEMENT
========================================== */

const search = document.getElementById("search");
const sortBy = document.getElementById("sortBy");
sortBy.addEventListener("change", renderProjects);
const filterStatus = document.getElementById("filterStatus");
const filterTask = document.getElementById("filterTask");
const filterCheckIn = document.getElementById("filterCheckIn");
const quickFilter = document.getElementById("quickFilter");
const saveProjectBtn = document.getElementById("saveProject");
const updateProjectBtn = document.getElementById("updateProject");

/* ==========================================
   INIT
========================================== */

export function initEvents() {

    initModal();

    /* ==========================
       SEARCH
    ========================== */

    search.addEventListener(
        "input",
        renderProjects
    );

    /* ==========================
       FILTER
    ========================== */

    filterStatus.addEventListener(
        "change",
        renderProjects
    );

    filterTask.addEventListener(
        "change",
        renderProjects
    );

    filterCheckIn.addEventListener(
        "change",
        renderProjects
    );

    quickFilter.addEventListener(
        "change",
        renderProjects
    );

    /* ==========================
       ADD PROJECT
    ========================== */

    saveProjectBtn.addEventListener("click", async () => {

        const success = await addProject({

            name: document.getElementById("name").value,

            network: document.getElementById("network").value,

            website: document.getElementById("website").value,

            websiteInvite: document.getElementById("websiteInvite").value,

            taskType: document.getElementById("taskType").value,

            checkIn: document.getElementById("checkIn").value,

            mission: document.getElementById("mission").value,

            resetTime: document.getElementById("resetTime").value,

            deadline: document.getElementById("deadline").value,

            funding: document.getElementById("funding").value,

            priority: document.getElementById("priority").value,

            status: document.getElementById("status").value,

            note: document.getElementById("note").value

        });

        if (success) {

            renderProjects();

        }

    });

    /* ==========================
       UPDATE PROJECT
    ========================== */

    updateProjectBtn.addEventListener("click", async () => {

        const success = await updateProject({

            id: document.getElementById("editId").value,

            name: document.getElementById("editName").value,

            network: document.getElementById("editNetwork").value,

            website: document.getElementById("editWebsite").value,

            websiteInvite: document.getElementById("editWebsiteInvite").value,

            taskType: document.getElementById("editTaskType").value,

            checkIn: document.getElementById("editCheckIn").value,

            // undefined = kolom Misi tidak tersedia (bukan edit Home oleh admin)
            mission: document.getElementById("editMissionField").dataset.allowed === "1"
                ? document.getElementById("editMission").value
                : undefined,

            resetTime: document.getElementById("editResetTime").value,

            deadline: document.getElementById("editDeadline").value,

            funding: document.getElementById("editFunding").value,

            priority: document.getElementById("editPriority").value,

            status: document.getElementById("editStatus").value,

            note: document.getElementById("editNote").value

        });

        if (success) {

            renderProjects();

        }

    });

    /* ==========================
       FIRST LOAD
    ========================== */

    renderProjects();

}

/* =====================================================
   CUSTOM DROPDOWN
===================================================== */

const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach(dropdown => {

    const button = dropdown.querySelector(".dropbtn");
    const menu = dropdown.querySelector(".dropdown-content");

    button.addEventListener("click", e => {

        e.stopPropagation();

        dropdowns.forEach(d => {

            if (d !== dropdown)
                d.classList.remove("active");

        });

        dropdown.classList.toggle("active");

    });

    menu.querySelectorAll("div").forEach(item => {

        item.addEventListener("click", () => {

            selectDropdownItem(dropdown, item);

            dropdown.classList.remove("active");

        });

    });

});

function selectDropdownItem(dropdown, item) {

    const menu = dropdown.querySelector(".dropdown-content");
    const button = dropdown.querySelector(".dropbtn");
    const label = button.querySelector(".label");

    menu.querySelectorAll("div").forEach(i => {
        i.classList.remove("selected");
    });

    item.classList.add("selected");

    const value = item.dataset.value;
    const target = item.dataset.target;

    if (target === "filterStatus" || target === "filterTask" || target === "filterCheckIn") {
        clearQuickFilter();
    }

    const select = document.getElementById(target);

    select.value = value;

    /* Trigger event lama */
    select.dispatchEvent(new Event("change"));

    if (label) {
        label.textContent = item.innerText;
    }

    if (target === "filterStatus") {
        syncFlowStepHighlight(value);
    }

}

document.addEventListener("click", () => {

    dropdowns.forEach(dropdown => {

        dropdown.classList.remove("active");

    });

});

/* =====================================================
   OVERVIEW STATUS SHORTCUT (klik step Waitlist/Pending/Active/Completed)
===================================================== */

const flowSteps = document.querySelectorAll(".flow-step[data-status]");

const statusDropdown = [...dropdowns].find(d => d.querySelector('[data-target="filterStatus"]'));

function syncFlowStepHighlight(value) {

    flowSteps.forEach(step => {

        step.classList.toggle("active", step.dataset.status === value);

    });

}

flowSteps.forEach(step => {

    step.addEventListener("click", () => {

        if (!statusDropdown) return;

        clearQuickFilter();

        const current = document.getElementById("filterStatus").value;
        const next = current === step.dataset.status ? "All" : step.dataset.status;

        const matchingItem = statusDropdown.querySelector(`[data-value="${next}"]`);

        if (matchingItem) {
            selectDropdownItem(statusDropdown, matchingItem);
        }

    });

});

/* =====================================================
   OVERVIEW QUICK FILTER (klik kartu Today's Task / Deadline Today)
===================================================== */

const quickFilterSelect = document.getElementById("quickFilter");
const quickFilterCards = document.querySelectorAll(".hero-stat[data-quick]");
const taskDropdown = [...dropdowns].find(d => d.querySelector('[data-target="filterTask"]'));

function clearStatusTaskFilters() {

    if (statusDropdown) {

        const allStatusItem = statusDropdown.querySelector('[data-value="All"]');

        if (allStatusItem) selectDropdownItem(statusDropdown, allStatusItem);

    }

    if (taskDropdown) {

        const allTaskItem = taskDropdown.querySelector('[data-value="All"]');

        if (allTaskItem) selectDropdownItem(taskDropdown, allTaskItem);

    }


}

function clearQuickFilter() {

    quickFilterSelect.value = "None";

    quickFilterCards.forEach(card => card.classList.remove("active"));

}

quickFilterCards.forEach(card => {

    card.addEventListener("click", () => {

        const current = quickFilterSelect.value;
        const next = current === card.dataset.quick ? "None" : card.dataset.quick;

        clearStatusTaskFilters();

        quickFilterSelect.value = next;

        quickFilterSelect.dispatchEvent(new Event("change"));

        quickFilterCards.forEach(c => c.classList.toggle("active", c.dataset.quick === next));

    });

});

/* =====================================================
   CHIP FILTER (Task Type)
   Chip hanya tampilan; nilainya tetap lewat dropdown tersembunyi
   dan select tersembunyi dengan target yang sama.
===================================================== */

function setupChipFilter(target, dropdown) {

    const chips = document.querySelectorAll(`.chip-filter[data-target="${target}"]`);
    const select = document.getElementById(target);

    function syncChipHighlight(value) {

        chips.forEach(chip => {
            chip.classList.toggle("selected", chip.dataset.value === value);
        });

        // Auto-scroll chip yang dipilih supaya kelihatan penuh, terutama
        // buat user yang tidak sadar baris chip ini bisa digeser ke samping.
        const selectedChip = [...chips].find(chip => chip.dataset.value === value);

        if (selectedChip) {
            selectedChip.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            });
        }

    }

    chips.forEach(chip => {

        chip.addEventListener("click", () => {

            if (!dropdown) return;

            // chip yang sedang aktif (selain "All") diklik lagi ->
            // nonaktifkan, balik ke "All"
            const isActive = chip.classList.contains("selected");
            const targetValue = (isActive && chip.dataset.value !== "All")
                ? "All"
                : chip.dataset.value;

            const matchingItem = dropdown.querySelector(`[data-value="${targetValue}"]`);

            if (matchingItem) {
                selectDropdownItem(dropdown, matchingItem);
            }

        });

    });

    if (select) {

        select.addEventListener("change", () => {
            syncChipHighlight(select.value);
        });

    }

}

setupChipFilter("filterTask", taskDropdown);

/* =====================================================
   RESET SEMUA FILTER (dipanggil saat pindah menu/mode,
   misal Home -> My Project, supaya filter tidak "nempel")
===================================================== */

export function resetAllFilters() {

    clearQuickFilter();
    clearStatusTaskFilters();

    search.value = "";

    if (sortBy) {
        sortBy.value = "default";

        const sortDropdown = [...dropdowns].find(d => d.querySelector('[data-target="sortBy"]'));

        if (sortDropdown) {
            const defaultItem = sortDropdown.querySelector('[data-value="default"]');
            if (defaultItem) selectDropdownItem(sortDropdown, defaultItem);
        }
    }

}
