/* =====================================
   MODAL.JS
===================================== */

const projectModal=document.getElementById("projectModal");

const editModal=document.getElementById("editModal");

const addProjectBtn=document.getElementById("addProjectBtn");

const closeModal=document.getElementById("closeModal");

const closeEditModal=document.getElementById("closeEditModal");

const saveProject=document.getElementById("saveProject");

const updateProject=document.getElementById("updateProject");

/* =====================================
OPEN MODAL
===================================== */

addProjectBtn.onclick=()=>{

    clearForm();

    projectModal.style.display="flex";

}

/* =====================================
CLOSE MODAL
===================================== */

closeModal.onclick=()=>{

    projectModal.style.display="none";

}

closeEditModal.onclick=()=>{

    editModal.style.display="none";

}

window.onclick=(e)=>{

    if(e.target===projectModal){

        projectModal.style.display="none";

    }

    if(e.target===editModal){

        editModal.style.display="none";

    }

}

/* =====================================
CLEAR FORM
===================================== */

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

/* =====================================
ADD PROJECT
===================================== */

saveProject.onclick=()=>{

    const name=document.getElementById("name").value.trim();

    const network=document.getElementById("network").value.trim();

    if(name===""){

        alert("Nama Project wajib diisi");

        return;

    }

    if(network===""){

        alert("Network wajib diisi");

        return;

    }

    projects.push({

        id:Date.now(),

        name:name,

        network:network,

        website:document.getElementById("website").value.trim(),

        taskType:document.getElementById("taskType").value,

        deadline:document.getElementById("deadline").value,

        priority:document.getElementById("priority").value,

        status:document.getElementById("status").value,

        note:document.getElementById("note").value.trim(),

        completed:false,

        lastDaily:todayString(),

        lastWeekly:weekString()

    });

    saveProjects(projects);

    projectModal.style.display="none";

    renderProjects();

}

/* =====================================
EDIT PROJECT
===================================== */

function editProject(id){

    const project=projects.find(p=>p.id===id);

    if(!project){

        return;

    }

    document.getElementById("editId").value=project.id;

    document.getElementById("editName").value=project.name;

    document.getElementById("editNetwork").value=project.network;

    document.getElementById("editWebsite").value=project.website;

    document.getElementById("editTaskType").value=project.taskType;

    document.getElementById("editDeadline").value=project.deadline;

    document.getElementById("editPriority").value=project.priority;

    document.getElementById("editStatus").value=project.status;

    document.getElementById("editNote").value=project.note;

    editModal.style.display="flex";

}

/* =====================================
UPDATE PROJECT
===================================== */

updateProject.onclick=()=>{

    const id=Number(document.getElementById("editId").value);

    const project=projects.find(p=>p.id===id);

    if(!project){

        return;

    }

    project.name=document.getElementById("editName").value.trim();

    project.network=document.getElementById("editNetwork").value.trim();

    project.website=document.getElementById("editWebsite").value.trim();

    project.taskType=document.getElementById("editTaskType").value;

    project.deadline=document.getElementById("editDeadline").value;

    project.priority=document.getElementById("editPriority").value;

    project.status=document.getElementById("editStatus").value;

    project.note=document.getElementById("editNote").value.trim();

    saveProjects(projects);

    editModal.style.display="none";

    renderProjects();

};

/* =====================================
DELETE PROJECT
===================================== */

function deleteProject(id){

    const project=projects.find(p=>p.id===id);

    if(!project){

        return;

    }

    if(!confirm("Hapus project '"+project.name+"' ?")){

        return;

    }

    projects=projects.filter(p=>p.id!==id);

    saveProjects(projects);

    renderProjects();

}

/* =====================================
VALIDATE EDIT
===================================== */

document.getElementById("editName").addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        updateProject.click();

    }

});

document.getElementById("name").addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        saveProject.click();

    }

});

/* =====================================
AUTO CLOSE ESC
===================================== */

document.addEventListener("keydown",(e)=>{

    if(e.key!=="Escape"){

        return;

    }

    projectModal.style.display="none";

    editModal.style.display="none";

});

/* =====================================
REFRESH AFTER SAVE
===================================== */

function refreshAll(){

    if(resetTasks(projects)){

        saveProjects(projects);

    }

    renderDashboard(projects);

    renderProjects();

}

/* =====================================
INITIALIZE MODAL
===================================== */

refreshAll();
