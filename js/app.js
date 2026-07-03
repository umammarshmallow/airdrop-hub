let projects = JSON.parse(localStorage.getItem("projects")) || [];

const list = document.getElementById("projectList");

const modal = document.getElementById("modal");

const addBtn = document.getElementById("addProject");

const closeBtn = document.getElementById("closeModal");

const saveBtn = document.getElementById("saveProject");

const searchInput = document.getElementById("searchInput");

const activeProjects = document.getElementById("activeProjects");

const wallets = document.getElementById("wallets");

const todayTasks = document.getElementById("todayTasks");

const completed = document.getElementById("completed");

function saveData(){

    localStorage.setItem("projects",JSON.stringify(projects));

}

function render(){

    activeProjects.textContent=projects.length;

    wallets.textContent=0;

    todayTasks.textContent=0;

    completed.textContent=0;

    if(projects.length===0){

        list.innerHTML='<div class="empty">Belum ada project.</div>';

        return;

    }

    list.innerHTML="";

    projects.forEach((p,index)=>{

        list.innerHTML+=`

        <div class="project-item">

            <h3>${p.name}</h3>

            <p><b>Network :</b> ${p.network}</p>

            <p><b>Status :</b> ${p.status}</p>

            <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">

                <button onclick="window.open('${p.website}','_blank')">
                Website
                </button>

                <button onclick="removeProject(${index})">
                Hapus
                </button>

            </div>

        </div>

        `;

    });

}

function removeProject(index){

    if(confirm("Hapus project ini?")){

        projects.splice(index,1);

        saveData();

        render();

    }

}

addBtn.onclick=()=>{

    modal.style.display="flex";

}

closeBtn.onclick=()=>{

    modal.style.display="none";

}

saveBtn.onclick=()=>{

    const name=document.getElementById("projectName").value.trim();

    const network=document.getElementById("projectNetwork").value.trim();

    const website=document.getElementById("projectWebsite").value.trim();

    const status=document.getElementById("projectStatus").value;

    if(name===""){

        alert("Nama project wajib diisi");

        return;

    }

    projects.push({

        name,

        network,

        website,

        status

    });

    saveData();

    render();

    document.getElementById("projectName").value="";

    document.getElementById("projectNetwork").value="";

    document.getElementById("projectWebsite").value="";

    document.getElementById("projectStatus").selectedIndex=0;

    modal.style.display="none";

}

searchInput.addEventListener("keyup",()=>{

    const keyword=searchInput.value.toLowerCase();

    const cards=document.querySelectorAll(".project-item");

    cards.forEach(card=>{

        if(card.innerText.toLowerCase().includes(keyword)){

            card.style.display="block";

        }else{

            card.style.display="none";

        }

    });

});

render();
