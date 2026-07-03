/* ==========================================
   AIRDROP HUB v3.1
========================================== */

let projects = JSON.parse(localStorage.getItem("airdropHub")) || [];

/* ==========================
   ELEMENT
========================== */

const projectList = document.getElementById("projectList");

const addProjectBtn = document.getElementById("addProjectBtn");

const projectModal = document.getElementById("projectModal");

const editModal = document.getElementById("editModal");

const saveProject = document.getElementById("saveProject");

const updateProject = document.getElementById("updateProject");

const search = document.getElementById("search");

const todayTask = document.getElementById("todayTask");

const activeProject = document.getElementById("activeProject");

const pendingProject = document.getElementById("pendingProject");

const completeProject = document.getElementById("completeProject");

/* ==========================
   OPEN & CLOSE MODAL
========================== */

addProjectBtn.onclick = () => {

    projectModal.style.display = "flex";

}

document.getElementById("closeModal").onclick = () => {

    projectModal.style.display = "none";

}

document.getElementById("closeEditModal").onclick = () => {

    editModal.style.display = "none";

}

window.onclick = (e)=>{

    if(e.target===projectModal){

        projectModal.style.display="none";

    }

    if(e.target===editModal){

        editModal.style.display="none";

    }

}

/* ==========================
   SAVE DATA
========================== */

function saveData(){

    localStorage.setItem(

        "airdropHub",

        JSON.stringify(projects)

    );

}

/* ==========================
   FORMAT URL
========================== */

function formatUrl(url){

    if(url==="") return "#";

    if(url.startsWith("http")) return url;

    return "https://"+url;

}

/* ==========================================
   ADD PROJECT
========================================== */

saveProject.onclick = () => {

    const name = document.getElementById("name").value.trim();
    const network = document.getElementById("network").value.trim();
    const website = document.getElementById("website").value.trim();
    const taskType = document.getElementById("taskType").value;
    const deadline = document.getElementById("deadline").value;
    const priority = document.getElementById("priority").value;
    const status = document.getElementById("status").value;
    const note = document.getElementById("note").value.trim();

    if(name===""){

        alert("Nama Project wajib diisi");

        return;

    }

    if(network===""){

        alert("Network wajib diisi");

        return;

    }

    projects.unshift({

        id:Date.now(),

        name,

        network,

        website,

        taskType,

        deadline,

        priority,

        status,

        note

    });

    saveData();

    clearForm();

    renderProjects();

    updateDashboard();

    projectModal.style.display="none";

    showToast("Project berhasil ditambahkan");

}

/* ==========================================
   CLEAR FORM
========================================== */

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

/* ==========================================
   RENDER PROJECT
========================================== */

function renderProjects(){

    const keyword = search.value.toLowerCase();

    let html = "";

    const filtered = projects.filter(project =>

        project.name.toLowerCase().includes(keyword) ||

        project.network.toLowerCase().includes(keyword) ||

        project.taskType.toLowerCase().includes(keyword) ||

        project.status.toLowerCase().includes(keyword)

    );

    if(filtered.length===0){

        projectList.innerHTML=`

        <div class="empty">

            Belum ada project.

        </div>

        `;

        return;

    }

    filtered.forEach(project=>{

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

<a href="${safeUrl}" target="_blank">

🌐 Website

</a>

</div>

<div class="project-action">

<button

class="btn-blue"

onclick="editProject(${project.id})">

✏️ Edit

</button>

<button

class="btn-red"

onclick="deleteProject(${project.id})">

🗑 Delete

</button>

</div>

</div>

`;

    });

    projectList.innerHTML = html;

}

/* ==========================================
   EDIT PROJECT
========================================== */

function editProject(id){

    const project = projects.find(item => item.id === id);

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

/* ==========================================
   UPDATE PROJECT
========================================== */

updateProject.onclick = () => {

    const id = Number(document.getElementById("editId").value);

    const index = projects.findIndex(item => item.id === id);

    if(index === -1) return;

    projects[index].name = document.getElementById("editName").value.trim();

    projects[index].network = document.getElementById("editNetwork").value.trim();

    projects[index].website = document.getElementById("editWebsite").value.trim();

    projects[index].taskType = document.getElementById("editTaskType").value;

    projects[index].deadline = document.getElementById("editDeadline").value;

    projects[index].priority = document.getElementById("editPriority").value;

    projects[index].status = document.getElementById("editStatus").value;

    projects[index].note = document.getElementById("editNote").value.trim();

    saveData();

    renderProjects();

    updateDashboard();

    editModal.style.display = "none";

    showToast("Project berhasil diperbarui");

}

/* ==========================================
   DELETE PROJECT
========================================== */

function deleteProject(id){

    const confirmDelete = confirm("Yakin ingin menghapus project ini?");

    if(!confirmDelete){

        return;

    }

    projects = projects.filter(project => project.id !== id);

    saveData();

    renderProjects();

    updateDashboard();

    showToast("Project berhasil dihapus");

}

/* ==========================================
   DASHBOARD COUNTER
========================================== */

function updateDashboard(){

    let today = 0;

    let active = 0;

    let pending = 0;

    let complete = 0;

    projects.forEach(project=>{

        if(project.status==="Active"){

            active++;

        }

        if(project.status==="Pending"){

            pending++;

        }

        if(project.status==="Complete"){

            complete++;

        }

        if(

            project.status==="Active" &&

            (

                project.taskType==="Daily" ||

                project.taskType==="Weekly" ||

                project.taskType==="Testnet" ||

                project.taskType==="Mainnet"

            )

        ){

            today++;

        }

    });

    todayTask.textContent = today;

    activeProject.textContent = active;

    pendingProject.textContent = pending;

    completeProject.textContent = complete;

}

/* ==========================================
   SEARCH
========================================== */

search.addEventListener("keyup",()=>{

    renderProjects();

});

/* ==========================================
   TOAST
========================================== */

function showToast(message){

    const toast=document.getElementById("toast");

    const toastText=document.getElementById("toastText");

    toastText.textContent=message;

    toast.style.display="block";

    setTimeout(()=>{

        toast.style.display="none";

    },2000);

}

/* ==========================================
   LOADING
========================================== */

function showLoading(){

    document.getElementById("loading").style.display="flex";

}

function hideLoading(){

    document.getElementById("loading").style.display="none";

}

/* ==========================================
   INITIALIZE
========================================== */

function init(){

    renderProjects();

    updateDashboard();

}

window.addEventListener("load",()=>{

    init();

});

/* ==========================================
   ESC KEY CLOSE MODAL
========================================== */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        projectModal.style.display="none";

        editModal.style.display="none";

    }

});

/* ==========================================
   CLICK OUTSIDE MODAL
========================================== */

projectModal.addEventListener("click",(e)=>{

    if(e.target===projectModal){

        projectModal.style.display="none";

    }

});

editModal.addEventListener("click",(e)=>{

    if(e.target===editModal){

        editModal.style.display="none";

    }

});

/* ==========================================
   SORT PROJECT
========================================== */

function sortProjects(){

    const priorityOrder={

        "High":1,

        "Medium":2,

        "Low":3

    };

    projects.sort((a,b)=>{

        if(priorityOrder[a.priority]!==priorityOrder[b.priority]){

            return priorityOrder[a.priority]-priorityOrder[b.priority];

        }

        return a.name.localeCompare(b.name);

    });

}

/* ==========================================
   AUTO SORT BEFORE RENDER
========================================== */

const oldRenderProjects = renderProjects;

renderProjects = function(){

    sortProjects();

    oldRenderProjects();

};

/* ==========================================
   START APPLICATION
========================================== */

init();

showToast("Airdrop Hub v3.1 Ready");
