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

    /* ==========================
       ADD PROJECT
    ========================== */

    saveProjectBtn.addEventListener("click", () => {

        const success = addProject({

            name: document.getElementById("name").value,

            network: document.getElementById("network").value,

            website: document.getElementById("website").value,

            taskType: document.getElementById("taskType").value,

            deadline: document.getElementById("deadline").value,

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

    updateProjectBtn.addEventListener("click", () => {

        const success = updateProject({

            id: document.getElementById("editId").value,

            name: document.getElementById("editName").value,

            network: document.getElementById("editNetwork").value,

            website: document.getElementById("editWebsite").value,

            taskType: document.getElementById("editTaskType").value,

            deadline: document.getElementById("editDeadline").value,

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

            menu.querySelectorAll("div").forEach(i => {
                i.classList.remove("selected");
            });

            item.classList.add("selected");

            const value = item.dataset.value;
            const target = item.dataset.target;

            const select = document.getElementById(target);

            select.value = value;

            /* Trigger event lama */
            select.dispatchEvent(new Event("change"));

            /* Ganti tulisan tombol */
            const label = button.querySelector(".label");

            if(label){

                label.textContent = item.innerText;

            }

            dropdown.classList.remove("active");

        });

    });

});

document.addEventListener("click", () => {

    dropdowns.forEach(dropdown => {

        dropdown.classList.remove("active");

    });

});
