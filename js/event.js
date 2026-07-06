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
