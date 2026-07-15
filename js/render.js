/* ==========================================
   RENDER.JS
========================================== */

import { formatUrl, sortProjects, statusClass } from "./helpers.js";
import { updateDashboard } from "./dashboard.js";
import {
    filterProjects,
    changeStatus,
    deleteProject,
    editProject,
    getProjects
} from "./project.js";
import { saveProjects } from "./storage.js";

/* ==========================================
   ELEMENT
========================================== */

const projectList = document.getElementById("projectList");
const search = document.getElementById("search");
const sortBy = document.getElementById("sortBy");
const filterStatus = document.getElementById("filterStatus");
const filterTask = document.getElementById("filterTask");

/* ==========================================
   RENDER
========================================== */

export function renderProjects() {

    const filtered = filterProjects(
        search.value,
        filterStatus.value,
        filterTask.value
    );

    const projects = sortProjects(
    filtered,
    sortBy.value
);

    updateDashboard(getProjects());

    if (projects.length === 0) {

        projectList.innerHTML = `
            <div class="empty">
                Belum ada project.
            </div>
        `;

        return;
    }

    let html = "";

    projects.forEach(project => {

        html += `
        <div class="project-card">

            <div class="project-title">

                <h3>${project.name}</h3>

                <span class="badge ${statusClass(project.status)}">

                    ${project.status}

                </span>

            </div>

            <div class="project-info">

                <p>
                    <b>Network</b><br>
                    ${project.network}
                </p>

                <p>
                    <b>Task</b><br>
                    ${project.taskType}
                </p>

                <p>
                    <b>Priority</b><br>
                    ${project.priority}
                </p>

                <p>
                    <b>Deadline</b><br>
                    ${project.deadline || "-"}
                </p>

            </div>

            <div class="note">

                ${project.note || "-"}

            </div>

            <div class="link-group">

                <a
                    href="${formatUrl(project.website)}"
                    target="_blank">

                    🌐 Website

                </a>

            </div>

            <div class="project-action">

                ${project.status === "Active"
                    ? `
                        <button
                            class="daily-check-btn"
                            data-action="daily"
                            data-id="${project.id}"
                            ${project.dailyDone ? "disabled" : ""}
                        >
                            ${project.dailyDone ? "✔ Completed" : "✓ Checklist"}
                        </button>
                   `
                   : ""
                }
                
                <button

                    class="btn-gray"
                    data-action="edit"
                    data-id="${project.id}">

                    ✏️ Edit

                </button>

                <button
                    class="btn-red"
                    data-action="delete"
                    data-id="${project.id}">

                    🗑 Delete

                </button>

            </div>

        </div>
        `;

    });

    projectList.innerHTML = html;

}

/* ==========================================
   EVENT DELEGATION
========================================== */

projectList.addEventListener("click", (e) => {

    const button = e.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    switch (action) {

        case "status":

            changeStatus(
                id,
                button.dataset.status
            );

            renderProjects();

            break;

        case "daily":

            const project = getProjects().find(
            p => p.id === id
            );

            if (!project) return;

            project.dailyDone = true;

            saveProjects(getProjects());

            renderProjects();

            break;
       
       case "edit":

            editProject(id);

            break;

        case "delete":

            deleteProject(id);

            renderProjects();

            break;

    }
   
    sortBy.addEventListener(
    "change",
    renderProjects
);

});
