/* =====================================
   RENDER.JS
===================================== */

function sortProjects(projects){

    const unfinished = [];
    const finished = [];

    projects.forEach(project=>{

        if(
            (project.taskType==="Daily" || project.taskType==="Weekly")
            && project.completed
        ){

            finished.push(project);

        }else{

            unfinished.push(project);

        }

    });

    unfinished.sort((a,b)=>a.name.localeCompare(b.name));

    finished.sort((a,b)=>a.name.localeCompare(b.name));

    return{

        unfinished,

        finished

    };

}

function createCard(project){

    const checked = project.completed ? "checked" : "";

    return `
<div class="project-card">

<div class="project-title">

<div class="project-left">

${
(project.taskType==="Daily"||project.taskType==="Weekly")
?

`<input
type="checkbox"
${checked}
onclick="toggleComplete(${project.id})">`

:

""

}

<h3>${project.name}</h3>

</div>

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

${
project.website
?

`<a href="${project.website}" target="_blank">

🌐 Website

</a>`

:

""

}

</div>

<div class="project-action">

<button

class="btn-gray"

onclick="editProject(${project.id})">

✏ Edit

</button>

<button

class="btn-red"

onclick="deleteProject(${project.id})">

🗑 Delete

</button>

</div>

</div>

`;

}

/* =====================================
   RENDER LIST
===================================== */

function renderProjects(){

    autoResetTask();

    renderDashboard(projects);

    const keyword = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = projects.filter(project=>{

        return(

            project.name.toLowerCase().includes(keyword) ||

            project.network.toLowerCase().includes(keyword) ||

            project.status.toLowerCase().includes(keyword) ||

            project.taskType.toLowerCase().includes(keyword)

        );

    });

    const sorted = sortProjects(filtered);

    let html = "";


/* =====================================
   TASK BELUM DIKERJAKAN
===================================== */

if(sorted.unfinished.length>0){

    html += `

<div class="section-title">

📌 Task Belum Dikerjakan

</div>

`;

    sorted.unfinished.forEach(project=>{

        html += createCard(project);

    });

}

/* =====================================
   TASK SUDAH SELESAI
===================================== */

if(sorted.finished.length>0){

    html += `

<div class="section-title done">

✅ Task Selesai

</div>

`;

    sorted.finished.forEach(project=>{

        html += createCard(project);

    });

}

if(

    sorted.unfinished.length===0 &&

    sorted.finished.length===0

){

    html=`

<div class="empty">

Belum ada project.

</div>

`;

}

document.getElementById("projectList").innerHTML=html;

}

/* =====================================
   TOGGLE CHECKLIST
===================================== */

function toggleComplete(id){

    toggleTask(projects,id);

    saveProjects(projects);

    renderProjects();

}

/* =====================================
   SEARCH
===================================== */

const searchInput = document.getElementById("search");

if(searchInput){

    searchInput.addEventListener("input",()=>{

        renderProjects();

    });

}

/* =====================================
   SORT AFTER UPDATE
===================================== */

function refreshProjectList(){

    projects.sort((a,b)=>{

        const aDone = a.completed ? 1 : 0;

        const bDone = b.completed ? 1 : 0;

        if(aDone!==bDone){

            return aDone-bDone;

        }

        return a.name.localeCompare(

            b.name,

            "id",

            {

                sensitivity:"base"

            }

        );

    });

    saveProjects(projects);

    renderProjects();

}

/* =====================================
   BADGE COLOR
===================================== */

function getStatusClass(status){

    switch(status){

        case "Active":

            return "active";

        case "Pending":

            return "pending";

        case "Complete":

            return "complete";

        default:

            return "";

    }

}

/* =====================================
   PRIORITY CLASS
===================================== */

function getPriorityClass(priority){

    switch(priority){

        case "High":

            return "high";

        case "Medium":

            return "medium";

        case "Low":

            return "low";

        default:

            return "";

    }

}

/* =====================================
   INITIAL RENDER
===================================== */

function initializeRender(){

    autoResetTask();

    saveProjects(projects);

    renderProjects();

    deadlineReminder(projects);

}

/* =====================================
   AUTO SAVE AFTER CHECKLIST
===================================== */

function updateChecklist(id,value){

    const project = projects.find(

        p=>p.id===id

    );

    if(!project){

        return;

    }

    project.completed=value;

    saveProjects(projects);

    renderDashboard(projects);

    refreshProjectList();

}

/* =====================================
   FORMAT WEBSITE
===================================== */

function formatWebsite(url){

    if(!url){

        return "";

    }

    if(

        url.startsWith("http://") ||

        url.startsWith("https://")

    ){

        return url;

    }

    return "https://"+url;

}

/* =====================================
   SAFE WEBSITE
===================================== */

document.addEventListener("click",(e)=>{

    const link=e.target.closest("[data-url]");

    if(!link){

        return;

    }

    const url=formatWebsite(

        link.dataset.url

    );

    window.open(

        url,

        "_blank"

    );

});

/* =====================================
   START APP
===================================== */

initializeRender();
