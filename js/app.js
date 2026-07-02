let projects = JSON.parse(localStorage.getItem("projects")) || [];

const list = document.getElementById("projectList");

const activeProjects = document.getElementById("activeProjects");
const wallets = document.getElementById("wallets");
const todayTasks = document.getElementById("todayTasks");
const completed = document.getElementById("completed");

function save(){
    localStorage.setItem("projects", JSON.stringify(projects));
}

function render(){

    activeProjects.textContent = projects.length;
    wallets.textContent = 0;
    todayTasks.textContent = 0;
    completed.textContent = 0;

    if(projects.length===0){
        list.innerHTML = `
        <div class="empty">
            Belum ada project.
        </div>
        `;
        return;
    }

    list.innerHTML="";

    projects.forEach((project,index)=>{

        list.innerHTML += `
        <div class="project-item">

            <h3>${project.name}</h3>

            <p><b>Network :</b> ${project.network}</p>

            <p><b>Status :</b> ${project.status}</p>

            <br>

            <button onclick="openWebsite('${project.website}')">
                🌐 Website
            </button>

            <button onclick="deleteProject(${index})">
                🗑 Hapus
            </button>

        </div>
        `;

    });

}

document.getElementById("addProject").addEventListener("click",()=>{

    const name = prompt("Nama Project");

    if(!name) return;

    const network = prompt("Network");

    const website = prompt("Website");

    const status = prompt("Status (Daily / Weekly / Testnet)");

    projects.push({

        name,
        network,
        website,
        status

    });

    save();

    render();

});

function deleteProject(index){

    if(confirm("Hapus project?")){

        projects.splice(index,1);

        save();

        render();

    }

}

function openWebsite(url){

    if(url){
        window.open(url,"_blank");
    }

}

document.getElementById("searchInput").addEventListener("keyup",function(){

    const keyword=this.value.toLowerCase();

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
