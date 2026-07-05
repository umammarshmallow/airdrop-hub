/* ==========================================
   AIRDROP HUB V4.0
========================================== */

let projects = JSON.parse(localStorage.getItem("airdropHub")) || [];

/* =====================
ELEMENT
===================== */

const projectList = document.getElementById("projectList");

const addProjectBtn = document.getElementById("addProjectBtn");

const projectModal = document.getElementById("projectModal");

const editModal = document.getElementById("editModal");

const closeModal = document.getElementById("closeModal");

const closeEditModal = document.getElementById("closeEditModal");

const saveProject = document.getElementById("saveProject");

const updateProject = document.getElementById("updateProject");

const search = document.getElementById("search");

const filterStatus = document.getElementById("filterStatus");

const filterTask = document.getElementById("filterTask");

const todayTask = document.getElementById("todayTask");

const activeProject = document.getElementById("activeProject");

const pendingProject = document.getElementById("pendingProject");

const completeProject = document.getElementById("completeProject");

/* =====================
MODAL
===================== */

addProjectBtn.onclick = () => {

    projectModal.style.display = "flex";

};

closeModal.onclick = () => {

    projectModal.style.display = "none";

};

closeEditModal.onclick = () => {

    editModal.style.display = "none";

};

window.onclick = (e) => {

    if (e.target === projectModal) {

        projectModal.style.display = "none";

    }

    if (e.target === editModal) {

        editModal.style.display = "none";

    }

};

/* =====================
LOCAL STORAGE
===================== */

function saveData() {

    localStorage.setItem(
        "airdropHub",
        JSON.stringify(projects)
    );

}

/* =====================
HELPER
===================== */

function formatUrl(url) {

    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {

        return url;

    }

    return "https://" + url;

}

function showToast(message) {

    const toast = document.getElementById("toast");

    const text = document.getElementById("toastText");

    text.textContent = message;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 2000);

}

/* =====================
CLEAR FORM
===================== */

function clearForm() {

    document.getElementById("name").value = "";

    document.getElementById("network").value = "";

    document.getElementById("website").value = "";

    document.getElementById("deadline").value = "";

    document.getElementById("note").value = "";

    document.getElementById("taskType").selectedIndex = 0;

    document.getElementById("priority").selectedIndex = 0;

    document.getElementById("status").selectedIndex = 0;

}

/* =====================
ADD PROJECT
===================== */

saveProject.onclick = () => {

    const project = {

        id: Date.now(),

        name: document.getElementById("name").value.trim(),

        network: document.getElementById("network").value.trim(),

        website: document.getElementById("website").value.trim(),

        taskType: document.getElementById("taskType").value,

        deadline: document.getElementById("deadline").value,

        priority: document.getElementById("priority").value,

        status: document.getElementById("status").value,

        note: document.getElementById("note").value.trim()

    };

    if (project.name === "") {

        alert("Nama project wajib diisi");

        return;

    }

    if (project.network === "") {

        alert("Network wajib diisi");

        return;

    }

    projects.push(project);

    saveData();

    clearForm();

    projectModal.style.display = "none";

    showToast("Project berhasil ditambahkan");

    renderProjects();

};

/* =====================
UPDATE DASHBOARD
===================== */

function updateDashboard() {

    let active = 0;
    let pending = 0;
    let complete = 0;
    let today = 0;

    projects.forEach(project => {

        if (project.status === "Active") active++;

        if (project.status === "Pending") pending++;

        if (project.status === "Complete") complete++;

        if (
            project.status === "Active" &&
            (
                project.taskType === "Daily" ||
                project.taskType === "Weekly" ||
                project.taskType === "Testnet" ||
                project.taskType === "Mainnet"
            )
        ) {

            today++;

        }

    });

    todayTask.textContent = today;
    activeProject.textContent = active;
    pendingProject.textContent = pending;
    completeProject.textContent = complete;

}

/* =====================
RENDER PROJECT
===================== */

function renderProjects() {

    updateDashboard();

    const keyword = search.value.toLowerCase();

    const statusFilter = filterStatus.value;

    const taskFilter = filterTask.value;

    const filtered = projects

    .filter(project => {

        const keywordMatch =

            project.name.toLowerCase().includes(keyword) ||

            project.network.toLowerCase().includes(keyword);

        const statusMatch =

            statusFilter === "All" ||

            project.status === statusFilter;

        const taskMatch =

            taskFilter === "All" ||

            project.taskType === taskFilter;

        return keywordMatch && statusMatch && taskMatch;

    })

    .sort((a, b) => {

        /* COMPLETE SELALU PALING BAWAH */

        if (
            a.status === "Complete" &&
            b.status !== "Complete"
        ) return 1;

        if (
            a.status !== "Complete" &&
            b.status === "Complete"
        ) return -1;

        /* URUTKAN A-Z */

        return a.name.localeCompare(
            b.name,
            "id",
            {
                sensitivity: "base"
            }
        );

    });

    if (filtered.length === 0) {

        projectList.innerHTML = `

        <div class="empty">

            Belum ada project.

        </div>

        `;

        return;

    }

    let html = "";

    filtered.forEach(project => {

        const safeUrl = formatUrl(project.website);

        html += `

<div class="project-card">

<div class="project-title">

<h3>${project.name}</h3>

<span class="badge ${project.status.toLowerCase()}">

${project.status}

</span>

</div>

<div class="project-info">

<p>

<b>Network</b>

<br>

${project.network}

</p>

<p>

<b>Task</b>

<br>

${project.taskType}

</p>

<p>

<b>Priority</b>

<br>

${project.priority}

</p>

<p>

<b>Deadline</b>

<br>

${project.deadline || "-"}

</p>

</div>

<div class="note">

${project.note || "-"}

</div>

<div class="link-group">

<a
href="${safeUrl}"
target="_blank">

🌐 Website

</a>

</div>

<div class="project-action">

<button
class="btn-green"
onclick="changeStatus(${project.id},'Active')">

Active

</button>

<button
class="btn-yellow"
onclick="changeStatus(${project.id},'Pending')">

Pending

</button>

<button
class="btn-blue"
onclick="changeStatus(${project.id},'Complete')">

Complete

</button>

<button
class="btn-gray"
onclick="editProject(${project.id})">

Edit

</button>

<button
class="btn-red"
onclick="deleteProject(${project.id})">

Delete

</button>

</div>

</div>

`;

    });

    projectList.innerHTML = html;

}

/* =====================
DELETE PROJECT
===================== */

function deleteProject(id) {

    if (!confirm("Hapus project ini?")) return;

    projects = projects.filter(project => project.id !== id);

    saveData();

    showToast("Project berhasil dihapus");

    renderProjects();

}

/* =====================
CHANGE STATUS
===================== */

function changeStatus(id, status) {

    const project = projects.find(project => project.id === id);

    if (!project) return;

    project.status = status;

    saveData();

    showToast("Status berhasil diubah");

    renderProjects();

}

/* =====================
EDIT PROJECT
===================== */

function editProject(id) {

    const project = projects.find(project => project.id === id);

    if (!project) return;

    document.getElementById("editId").value = project.id;

    document.getElementById("editName").value = project.name;

    document.getElementById("editNetwork").value = project.network;

    document.getElementById("editWebsite").value = project.website;

    document.getElementById("editTaskType").value = project.taskType;

    document.getElementById("editDeadline").value = project.deadline;

    document.getElementById("editPriority").value = project.priority;

    document.getElementById("editStatus").value = project.status;

    document.getElementById("editNote").value = project.note;

    editModal.style.display = "flex";

}

/* =====================
UPDATE PROJECT
===================== */

updateProject.onclick = () => {

    const id = Number(document.getElementById("editId").value);

    const project = projects.find(project => project.id === id);

    if (!project) return;

    project.name = document.getElementById("editName").value.trim();

    project.network = document.getElementById("editNetwork").value.trim();

    project.website = document.getElementById("editWebsite").value.trim();

    project.taskType = document.getElementById("editTaskType").value;

    project.deadline = document.getElementById("editDeadline").value;

    project.priority = document.getElementById("editPriority").value;

    project.status = document.getElementById("editStatus").value;

    project.note = document.getElementById("editNote").value.trim();

    saveData();

    editModal.style.display = "none";

    showToast("Project berhasil diperbarui");

    renderProjects();

};

/* =====================
SEARCH
===================== */

search.addEventListener("keyup", renderProjects);

/* =====================
FILTER
===================== */

filterStatus.addEventListener("change", renderProjects);

filterTask.addEventListener("change", renderProjects);

/* =====================
ESC KEY
===================== */

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        projectModal.style.display = "none";

        editModal.style.display = "none";

    }

});

/* =====================
INITIAL LOAD
===================== */

window.onload = () => {

    renderProjects();

};
