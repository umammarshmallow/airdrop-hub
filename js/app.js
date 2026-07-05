/* ==========================================
   AIRDROP HUB V3.1
========================================== */

let projects = JSON.parse(localStorage.getItem("airdropHub")) || [];

/* =====================
ELEMENT
===================== */

const projectList = document.getElementById("projectList");

const addProjectBtn = document.getElementById("addProjectBtn");

const projectModal = document.getElementById("projectModal");

const editModal = document.getElementById("editModal");

const search = document.getElementById("search");

const todayTask = document.getElementById("todayTask");

const activeProject = document.getElementById("activeProject");

const pendingProject = document.getElementById("pendingProject");

const completeProject = document.getElementById("completeProject");

/* =====================
SAVE DATA
===================== */

function saveData(){

    localStorage.setItem(
        "airdropHub",
        JSON.stringify(projects)
    );

}

/* =====================
FORMAT WEBSITE
===================== */

function formatUrl(url){

    if(!url) return "";

    if(url.startsWith("http://") || url.startsWith("https://")){

        return url;

    }

    return "https://" + url;

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
UPDATE DASHBOARD
===================== */

function updateDashboard(){

    let active=0;

    let pending=0;

    let complete=0;

    let today=0;

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

    todayTask.textContent=today;

    activeProject.textContent=active;

    pendingProject.textContent=pending;

    completeProject.textContent=complete;

}

/* =====================
RENDER PROJECT
===================== */

function renderProjects(){

    updateDashboard();

    const keyword = search.value.toLowerCase();

    const filtered = projects.filter(project=>{

        return(

            project.name.toLowerCase().includes(keyword) ||

            project.network.toLowerCase().includes(keyword) ||

            project.status.toLowerCase().includes(keyword) ||

            project.taskType.toLowerCase().includes(keyword)

        );

    });

    if(filtered.length===0){

        projectList.innerHTML=`
        <div class="empty">
            Belum ada project.
        </div>
        `;

        return;

    }

    let html="";

    filtered.forEach(project=>{

        const safeUrl=formatUrl(project.website);

        html+=`

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

    projectList.innerHTML=html;

}

/* =====================
ADD PROJECT
===================== */

document.getElementById("saveProject").onclick=()=>{

    const project={

        id:Date.now(),

        name:document.getElementById("name").value.trim(),

        network:document.getElementById("network").value.trim(),

        website:document.getElementById("website").value.trim(),

        taskType:document.getElementById("taskType").value,

        deadline:document.getElementById("deadline").value,

        priority:document.getElementById("priority").value,

        status:document.getElementById("status").value,

        note:document.getElementById("note").value.trim()

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

    clearForm();

    projectModal.style.display="none";

};

/* =====================
DELETE PROJECT
===================== */

function deleteProject(id){

    if(!confirm("Hapus project ini?")) return;

    projects = projects.filter(project => project.id !== id);

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
UPDATE PROJECT
===================== */

document.getElementById("updateProject").onclick = () => {

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

};

/* =====================
SEARCH
===================== */

search.addEventListener("keyup",()=>{

    renderProjects();

});

/* =====================
OPEN MODAL
===================== */

addProjectBtn.addEventListener("click",()=>{

    projectModal.style.display="flex";

});

document.getElementById("closeModal").addEventListener("click",()=>{

    projectModal.style.display="none";

});

document.getElementById("closeEditModal").addEventListener("click",()=>{

    editModal.style.display="none";

});

/* =====================
CLICK OUTSIDE MODAL
===================== */

window.addEventListener("click",(e)=>{

    if(e.target===projectModal){

        projectModal.style.display="none";

    }

    if(e.target===editModal){

        editModal.style.display="none";

    }

});

/* =====================
ESC KEY
===================== */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        projectModal.style.display="none";

        editModal.style.display="none";

    }

});

/* =====================
TOAST
===================== */

function showToast(message){

    const toast=document.getElementById("toast");

    const text=document.getElementById("toastText");

    text.textContent=message;

    toast.style.display="block";

    setTimeout(()=>{

        toast.style.display="none";

    },2000);

}

/* =====================
LOADING
===================== */

function showLoading(){

    document.getElementById("loading").style.display="flex";

}

function hideLoading(){

    document.getElementById("loading").style.display="none";

}

/* =====================
INITIALIZE
===================== */

function init(){

    renderProjects();

}

/* =====================
START APP
===================== */

init();
