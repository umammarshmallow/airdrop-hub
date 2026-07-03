/* ==========================================
   AIRDROP HUB V3.0
========================================== */

let projects = JSON.parse(localStorage.getItem("airdropHub")) || [];

const projectList = document.getElementById("projectList");

const addProjectBtn = document.getElementById("addProjectBtn");

const projectModal = document.getElementById("projectModal");

const editModal = document.getElementById("editModal");

const closeModal = document.getElementById("closeModal");

const closeEditModal = document.getElementById("closeEditModal");

const saveProject = document.getElementById("saveProject");

const updateProject = document.getElementById("updateProject");

const search = document.getElementById("search");

const todayTask = document.getElementById("todayTask");

const activeProject = document.getElementById("activeProject");

const pendingProject = document.getElementById("pendingProject");

const completeProject = document.getElementById("completeProject");

/* =====================
OPEN & CLOSE MODAL
===================== */

addProjectBtn.onclick = () => {

    projectModal.style.display = "flex";

}

closeModal.onclick = () => {

    projectModal.style.display = "none";

}

closeEditModal.onclick = () => {

    editModal.style.display = "none";

}

window.onclick = (e)=>{

    if(e.target==projectModal){

        projectModal.style.display="none";

    }

    if(e.target==editModal){

        editModal.style.display="none";

    }

}

/* =====================
SAVE LOCAL STORAGE
===================== */

function saveData(){

    localStorage.setItem(

        "airdropHub",

        JSON.stringify(projects)

    );

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

    if(project.name===""){

        alert("Nama Project wajib diisi");

        return;

    }

    if(project.network===""){

        alert("Network wajib diisi");

        return;

    }

    projects.unshift(project);

    saveData();

    renderProjects();

    projectModal.style.display="none";

    clearForm();

}

/* =====================
CLEAR FORM
===================== */

function clearForm(){

    document.getElementById("name").value="";

    document.getElementById("network").value="";

    document.getElementById("website").value="";

    document.getElementById("deadline").value="";

    document.getElementById("note").value="";

    document.getElementById("taskType").selectedIndex=0;

    document.getElementById("priority").selectedIndex=0;

    document.getElementById("status").selectedIndex=0;

}

/* =====================
RENDER PROJECT
===================== */

function renderProjects(){

    updateDashboard();

    const keyword = search.value.toLowerCase();

    let html = "";

    const filtered = projects.filter(project=>{

        return (

            project.name.toLowerCase().includes(keyword) ||

            project.network.toLowerCase().includes(keyword) ||

            project.status.toLowerCase().includes(keyword) ||

            project.taskType.toLowerCase().includes(keyword)

        );

    });

    if(filtered.length===0){

        projectList.innerHTML = `
        <div class="empty">
            Belum ada project.
        </div>
        `;

        return;

    }

    filtered.forEach(project=>{

        html += `

<div class="project-card">

<div class="project-title">

<h3>${project.name}</h3>

<span class="badge ${project.status.toLowerCase()}">

${project.status}

</span>

</div>

<div class="project-info">

<p><b>Network</b><br>${project.network}</p>

<p><b>Task</b><br>${project.taskType}</p>

<p><b>Priority</b><br>${project.priority}</p>

<p><b>Deadline</b><br>${project.deadline || "-"}</p>

</div>

<div class="note">

${project.note || "-"}

</div>

<div class="link-group">

<a href="${project.website}" target="_blank">

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
UPDATE DASHBOARD
===================== */

function updateDashboard(){

    let active = 0;

    let pending = 0;

    let complete = 0;

    let today = 0;

    projects.forEach(project=>{

        switch(project.status){

            case "Active":

                active++;

                break;

            case "Pending":

                pending++;

                break;

            case "Complete":

                complete++;

                break;

        }

        /* Today's Task */

        if(project.status==="Active"){

            if(

                project.taskType==="Daily" ||

                project.taskType==="Weekly" ||

                project.taskType==="Testnet" ||

                project.taskType==="Mainnet"

            ){

                today++;

            }

        }

    });

    todayTask.textContent = today;

    activeProject.textContent = active;

    pendingProject.textContent = pending;

    completeProject.textContent = complete;

}

/* =====================
SEARCH
===================== */

search.addEventListener("keyup",()=>{

    renderProjects();

});

/* =====================
DELETE PROJECT
===================== */

function deleteProject(id){

    if(!confirm("Hapus project ini?")) return;

    projects = projects.filter(p => p.id !== id);

    saveData();

    renderProjects();

}

/* =====================
CHANGE STATUS
===================== */

function changeStatus(id, status){

    const index = projects.findIndex(p => p.id === id);

    if(index === -1) return;

    projects[index].status = status;

    saveData();

    renderProjects();

}

/* =====================
EDIT PROJECT
===================== */

function editProject(id){

    const project = projects.find(p => p.id === id);

    if(!project) return;

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
UPDATE PROJECT (SAVE EDIT)
===================== */

updateProject.onclick = () => {

    const id = Number(document.getElementById("editId").value);

    const index = projects.findIndex(p => p.id === id);

    if(index === -1) return;

    projects[index] = {

        ...projects[index],

        name: document.getElementById("editName").value.trim(),

        network: document.getElementById("editNetwork").value.trim(),

        website: document.getElementById("editWebsite").value.trim(),

        taskType: document.getElementById("editTaskType").value,

        deadline: document.getElementById("editDeadline").value,

        priority: document.getElementById("editPriority").value,

        status: document.getElementById("editStatus").value,

        note: document.getElementById("editNote").value.trim()

    };

    saveData();

    renderProjects();

    editModal.style.display = "none";

}

/* =====================
OPEN MODAL EVENTS
===================== */

addProjectBtn.addEventListener("click", () => {

    projectModal.style.display = "flex";

});

/* =====================
CLOSE MODAL EVENTS
===================== */

document.getElementById("closeModal").addEventListener("click", () => {

    projectModal.style.display = "none";

});

document.getElementById("closeEditModal").addEventListener("click", () => {

    editModal.style.display = "none";

});

/* =====================
TOAST SYSTEM
===================== */

function showToast(message){

    const toast = document.getElementById("toast");

    const text = document.getElementById("toastText");

    text.textContent = message;

    toast.style.display = "block";

    setTimeout(()=>{

        toast.style.display = "none";

    },2000);

}

/* =====================
LOADING SYSTEM
===================== */

function showLoading(){

    document.getElementById("loading").style.display = "flex";

}

function hideLoading(){

    document.getElementById("loading").style.display = "none";

}

/* =====================
INITIAL LOAD
===================== */

window.onload = () => {

    renderProjects();

};

/* =====================
ENTER KEY SUPPORT (OPTIONAL UX)
===================== */

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        projectModal.style.display = "none";

        editModal.style.display = "none";

    }

});

/* =====================
AUTO FORMAT WEBSITE LINK
===================== */

function formatUrl(url){

    if(!url) return "";

    if(url.startsWith("http")) return url;

    return "https://" + url;

}

/* =====================
PATCH: SAFE WEBSITE LINK
===================== */

function renderProjects(){

    updateDashboard();

    const keyword = search.value.toLowerCase();

    let html = "";

    const filtered = projects.filter(project => {

        return (

            project.name.toLowerCase().includes(keyword) ||

            project.network.toLowerCase().includes(keyword) ||

            project.status.toLowerCase().includes(keyword) ||

            project.taskType.toLowerCase().includes(keyword)

        );

    });

    if(filtered.length === 0){

        projectList.innerHTML = `
        <div class="empty">
            Belum ada project.
        </div>
        `;

        return;

    }

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

<p><b>Network</b><br>${project.network}</p>

<p><b>Task</b><br>${project.taskType}</p>

<p><b>Priority</b><br>${project.priority}</p>

<p><b>Deadline</b><br>${project.deadline || "-"}</p>

</div>

<div class="note">

${project.note || "-"}

</div>

<div class="link-group">

<a href="${safeUrl}" target="_blank">🌐 Website</a>

</div>

<div class="project-action">

<button class="btn-green" onclick="changeStatus(${project.id},'Active')">Active</button>

<button class="btn-yellow" onclick="changeStatus(${project.id},'Pending')">Pending</button>

<button class="btn-blue" onclick="changeStatus(${project.id},'Complete')">Complete</button>

<button class="btn-gray" onclick="editProject(${project.id})">Edit</button>

<button class="btn-red" onclick="deleteProject(${project.id})">Delete</button>

</div>

</div>

`;

    });

    projectList.innerHTML = html;

}

/* =====================
FIX: COUNTER BUG SAFETY
===================== */

function safeCount(){

    let active = 0;

    let pending = 0;

    let complete = 0;

    let today = 0;

    projects.forEach(p => {

        if(p.status === "Active") active++;

        if(p.status === "Pending") pending++;

        if(p.status === "Complete") complete++;

        if(p.status === "Active"){

            if(

                p.taskType === "Daily" ||

                p.taskType === "Weekly" ||

                p.taskType === "Testnet" ||

                p.taskType === "Mainnet"

            ){

                today++;

            }

        }

    });

    return {active, pending, complete, today};

}

/* =====================
REPLACE DASHBOARD WITH SAFE VERSION
===================== */

function updateDashboard(){

    const c = safeCount();

    todayTask.textContent = c.today;

    activeProject.textContent = c.active;

    pendingProject.textContent = c.pending;

    completeProject.textContent = c.complete;

}

/* =====================
FINAL INIT FIX
===================== */

renderProjects();
updateDashboard();

/* =====================
FINAL CLEAN INIT
===================== */

function init(){

    try{

        if(!projects) projects = [];

        renderProjects();

        updateDashboard();

    }catch(e){

        console.error("Init error:", e);

    }

}

/* =====================
RUN APP
===================== */

init();
