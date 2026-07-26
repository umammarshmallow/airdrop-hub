/* ==========================================
   RENDER.JS
========================================== */

import { formatUrl, sortProjects, statusClass, formatDate } from "./helpers.js";
import { updateDashboard } from "./dashboard.js";
import {
    filterProjects,
    deleteProject,
    editProject,
    getProjects
} from "./project.js";
import { saveProjects } from "./storage.js";
import { getWallets } from "./wallet.js";

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

        const linkedWallet = getWallets().find(
            wallet => String(wallet.id) === String(project.wallet)
        );

        html += `
        <div class="project-card">

            <div class="project-title">

                <h3>${project.name}</h3>

                <div class="title-actions">

                    <span class="badge ${statusClass(project.status)}">

                        ${project.status}

                    </span>

                    <a
                        class="icon-btn icon-btn-blue"
                        href="${formatUrl(project.website)}"
                        target="_blank"
                        title="Website">

                        <i class="ti ti-world" aria-hidden="true"></i>

                    </a>

                    ${project.status === "Active"
                        ? `
                            <button
                                class="icon-btn icon-btn-green"
                                data-action="daily"
                                data-id="${project.id}"
                                ${project.dailyDone ? "disabled" : ""}
                                title="${project.dailyDone ? "Completed" : "Checklist"}">

                                <i class="ti ${project.dailyDone ? "ti-checks" : "ti-check"}" aria-hidden="true"></i>

                            </button>
                       `
                       : ""
                    }

                </div>

            </div>

            <button
                class="detail-toggle"
                data-action="toggle"
                data-id="${project.id}">

                <span>Lihat detail</span>
                <i class="ti ti-chevron-down detail-arrow" aria-hidden="true"></i>

            </button>

            <div class="project-detail" id="detail-${project.id}">

                <div class="chip-group">

                    <span class="chip"><i class="ti ti-link" aria-hidden="true"></i> ${project.network}</span>

                    <span class="chip ${linkedWallet ? "" : "chip-muted"}">
                        <i class="ti ti-wallet" aria-hidden="true"></i> ${linkedWallet ? linkedWallet.address : "Belum ada wallet"}
                    </span>

                </div>

                <div class="info-grid">

                    <div class="info-tile">
                        <i class="ti ti-list-check info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">Task</div>
                            <div class="info-value">${project.taskType}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="ti ti-flag info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">Priority</div>
                            <div class="info-value">${project.priority}</div>
                        </div>
                    </div>

                    <div class="info-tile info-tile-full">
                        <i class="ti ti-calendar info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">Deadline</div>
                            <div class="info-value">${project.deadline || "-"}</div>
                        </div>
                    </div>

                </div>

                <div class="note">

                    ${project.note || "-"}

                </div>

                <div class="project-action">

                    <button

                        class="btn-gray"
                        data-action="edit"
                        data-id="${project.id}">

                        <i class="ti ti-edit" aria-hidden="true"></i> Edit

                    </button>

                    <button
                        class="btn-red"
                        data-action="delete"
                        data-id="${project.id}">

                        <i class="ti ti-trash" aria-hidden="true"></i> Delete

                    </button>

                </div>

                <div class="project-meta">
                    Ditambahkan ${formatDate(project.createdAt)} · Update terakhir ${formatDate(project.updatedAt)}
                </div>

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

        case "toggle":

            const detail = document.getElementById(`detail-${id}`);

            if (!detail) return;

            const willOpen = !detail.classList.contains("open");

            // Tutup semua detail lain yang sedang terbuka
            document.querySelectorAll(".project-detail.open").forEach(openDetail => {

                if (openDetail === detail) return;

                openDetail.classList.remove("open");

                const otherToggle = openDetail
                    .closest(".project-card")
                    .querySelector(".detail-toggle");

                if (otherToggle) {

                    otherToggle.classList.remove("open");

                    otherToggle.querySelector("span").textContent = "Lihat detail";

                }

            });

            detail.classList.toggle("open", willOpen);

            button.classList.toggle("open", willOpen);

            button.querySelector("span").textContent =
                willOpen ? "Sembunyikan detail" : "Lihat detail";

            break;

        case "daily":

            const project = getProjects().find(
            p => p.id === id
            );

            if (!project) return;

            project.dailyDone = true;

            project.updatedAt = Date.now();

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

});
