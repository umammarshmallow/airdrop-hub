/* ==========================================
   RENDER.JS
========================================== */

import { formatUrl, statusClass, statusLabel, formatDate, escapeHTML } from "./formatters.js";
import { sortProjects } from "./projectRules.js";
import { updateDashboard } from "./dashboard.js";
import {
    filterProjects,
    deleteProject,
    editProject,
    getProjects,
    isHomeMode,
    markDailyDone,
    copyHomeProjectToMyProject
} from "./project.js";
import { isAdmin } from "./cloudSync.js";
import { t } from "./i18n.js";
import { ICON_CHECK, ICON_TRASH } from "./icons.js";

/* ==========================================
   ELEMENT
========================================== */

const projectList = document.getElementById("projectList");
const search = document.getElementById("search");
const sortBy = document.getElementById("sortBy");
const filterStatus = document.getElementById("filterStatus");
const filterTask = document.getElementById("filterTask");
const filterCheckIn = document.getElementById("filterCheckIn");
const quickFilter = document.getElementById("quickFilter");

/* ==========================================
   RENDER
========================================== */

export function renderProjects() {

    // Simpan detail yang sedang terbuka: render ulang otomatis (timer 1 menit,
    // kembali ke tab, sync cloud) mengganti seluruh innerHTML sehingga
    // detail yang sedang dibaca ikut menutup sendiri.
    const openDetailIds = [...projectList.querySelectorAll(".project-detail.open")]
        .map(detail => detail.id);

    const filtered = filterProjects(
        search.value,
        filterStatus.value,
        filterTask.value,
        quickFilter.value,
        filterCheckIn.value
    );

    const projects = sortProjects(
    filtered,
    sortBy.value
);

    updateDashboard(getProjects());

    // Home = publik (siapa saja boleh lihat), tapi Edit/Delete/Tandai-selesai
    // cuma boleh dipakai admin. My Project selalu penuh (milik sendiri).
    const canEdit = !isHomeMode() || isAdmin();

    if (projects.length === 0) {

        projectList.innerHTML = `
            <div class="empty">
                ${t("projects.emptyFiltered")}
            </div>
        `;

        projectList.removeAttribute("aria-busy");

        return;
    }

    const taskTypeLabel = (value) => {
        switch (value) {
            case "Testnet": return t("project.testnet");
            case "Mainnet": return t("project.mainnet");
            case "Social": return t("project.social");
            case "Node": return t("project.node");
            case "Other": return t("project.other");
            default: return value;
        }
    };

    const checkInLabel = (value) => {
        switch (value) {
            case "Daily": return t("project.daily");
            case "Weekly": return t("project.weekly");
            case "Monthly": return t("project.monthly");
            case "One Time": return t("filter.oneTime");
            default: return value;
        }
    };

    const priorityLabel = (value) => {
        switch (value) {
            case "Low": return t("project.low");
            case "Medium": return t("project.medium");
            case "High": return t("project.high");
            default: return value;
        }
    };

    // Ikon globe: user biasa (Home maupun My Project) dibawa ke link Invite
    // kalau diisi; admin selalu ke Website resmi karena dialah yang mengelola
    // kedua link tersebut.
    let html = "";

    projects.forEach((project) => {

        html += `
        <div class="project-card" data-status="${escapeHTML(project.status)}">

            <div class="project-title">

                <h3>${escapeHTML(project.name)}</h3>

                <div class="title-actions">

                    <span class="badge ${statusClass(project.status)}">

                        ${statusLabel(project.status)}

                    </span>

                    <a
                        class="icon-btn icon-btn-blue"
                        href="${escapeHTML(formatUrl(
                            (!isAdmin() && project.websiteInvite) ? project.websiteInvite : project.website
                        ))}"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="${t("project.website.title")}">

                        <i class="fa-solid fa-globe" aria-hidden="true"></i>

                    </a>

                    ${isHomeMode()
                        ? `
                            <button
                                class="icon-btn icon-btn-blue"
                                data-action="copyToMyProject"
                                data-id="${project.id}"
                                title="${t("project.addToMyProject")}">

                                <i class="fa-solid fa-plus" aria-hidden="true"></i>

                            </button>
                       `
                       : ""
                    }

                    ${project.status === "Active" && !isHomeMode() && (project.checkIn === "Daily" || project.mission === "New")
                        ? `
                            <button
                                class="icon-btn icon-btn-green"
                                data-action="daily"
                                data-id="${project.id}"
                                ${project.dailyDone ? "disabled" : ""}
                                title="${project.dailyDone ? t("project.doneCompleted") : t("project.markDone")}">

                                <i class="check-icon">${ICON_CHECK}</i>

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

                <span>${t("project.viewDetails")}</span>
                <i class="fa-solid fa-chevron-down detail-arrow" aria-hidden="true"></i>

            </button>

            <div class="project-detail" id="detail-${project.id}">

                <div class="info-grid">

                    <div class="info-tile">
                        <i class="fa-solid fa-list-check info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.task")}</div>
                            <div class="info-value">${taskTypeLabel(project.taskType)}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="fa-solid fa-rotate info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.checkIn")}</div>
                            <div class="info-value">${checkInLabel(project.checkIn)}${project.checkIn === "Daily" ? " · " + (project.resetTime === "07:00" ? "07:00" : "00:00") : ""}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="fa-solid fa-flag info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.priority")}</div>
                            <div class="info-value">${priorityLabel(project.priority)}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="fa-solid fa-link info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.chain")}</div>
                            <div class="info-value">${escapeHTML(project.network)}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="fa-solid fa-calendar info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.deadline")}</div>
                            <div class="info-value">${project.deadline || "-"}</div>
                        </div>
                    </div>

                    <div class="info-tile">
                        <i class="fa-solid fa-coins info-icon" aria-hidden="true"></i>
                        <div>
                            <div class="info-label">${t("project.funding")}</div>
                            <div class="info-value">${project.funding ? escapeHTML(project.funding) : "-"}</div>
                        </div>
                    </div>

                </div>

                <div class="note">${project.note ? escapeHTML(project.note.trim()) : "-"}</div>

                ${canEdit
                    ? `
                    <div class="project-action">

                        <button

                            class="btn-gray"
                            data-action="edit"
                            data-id="${project.id}">

                            <i class="fa-solid fa-pen" aria-hidden="true"></i> ${t("project.editBtn")}

                        </button>

                        <button
                            class="btn-red"
                            data-action="delete"
                            data-id="${project.id}">

                            <i class="trash-icon">${ICON_TRASH}</i> ${t("project.deleteBtn")}

                        </button>

                    </div>
                    `
                    : ""
                }

                <div class="project-meta">
                    ${t("project.added")} ${formatDate(project.createdAt)} · ${t("project.lastUpdated")} ${formatDate(project.updatedAt)}
                </div>

            </div>

        </div>
        `;

    });

    projectList.innerHTML = html;

    // Buka kembali detail yang tadi terbuka (tanpa animasi supaya tidak berkedip)
    openDetailIds.forEach(detailId => {

        const detail = document.getElementById(detailId);

        if (!detail) return;

        detail.classList.add("open");
        detail.style.animation = "none";

        const toggle = detail.closest(".project-card")?.querySelector(".detail-toggle");

        if (toggle) {

            toggle.classList.add("open");

            const label = toggle.querySelector("span");

            if (label) label.textContent = t("project.hideDetails");

        }

    });

    projectList.removeAttribute("aria-busy");

    observeCardsInView();

}

/* ==========================================
   SCROLL-REVEAL (mirip useInView dari AnimatedList)
   Kartu fade+scale-in saat 50% badannya masuk viewport,
   dan balik pudar kalau di-scroll keluar lagi (triggerOnce:false)
========================================== */

let cardObserver = null;

function observeCardsInView() {

    // observer lama masih menunjuk ke node yang sudah diganti
    // innerHTML, jadi disconnect dulu biar tidak numpuk
    if (cardObserver) cardObserver.disconnect();

    cardObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                entry.target.classList.toggle("in-view", entry.isIntersecting);

            });

        },
        { threshold: 0.5 }
    );

    document.querySelectorAll(".project-card").forEach(card => {

        cardObserver.observe(card);

    });

}

/* ==========================================
   EVENT DELEGATION
========================================== */

projectList.addEventListener("click", async (e) => {

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

                    otherToggle.querySelector("span").textContent = t("project.viewDetails");

                }

            });

            detail.classList.toggle("open", willOpen);

            button.classList.toggle("open", willOpen);

            button.querySelector("span").textContent =
                willOpen ? t("project.hideDetails") : t("project.viewDetails");

            break;

        case "daily":

            if (markDailyDone(id)) {

                renderProjects();

            }

            break;

        case "copyToMyProject":

            if (await copyHomeProjectToMyProject(id)) {

                renderProjects();

            }

            break;
       
       case "edit":

            editProject(id);

            break;

        case "delete":

            const deleted = await deleteProject(id);

            if (deleted) {

                renderProjects();

            }

            break;

    }

});
