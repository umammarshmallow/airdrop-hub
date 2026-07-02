const projects=[];

const list=document.getElementById("projectList");

document.getElementById("addProject").onclick=function(){

let name=prompt("Nama Project");

if(!name) return;

let network=prompt("Network");

projects.push({

name:name,

network:network

});

render();

}

function render(){

if(projects.length===0){

list.innerHTML='<div class="empty">Belum ada project.</div>';

return;

}

list.innerHTML="";

projects.forEach((p)=>{

list.innerHTML+=`

<div class="project-item">

<h3>${p.name}</h3>

<p>${p.network}</p>

</div>

`;

});

document.getElementById("activeProjects").textContent=projects.length;

}    border-radius:8px;
    cursor:pointer;
}

.menu li:hover{
    background:#1e293b;
}

.active{
    background:#2563eb;
}

.content{
    flex:1;
    padding:30px;
}

.title{
    margin-bottom:25px;
}

.cards{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:20px;
}

.card{
    background:#1e293b;
    padding:20px;
    border-radius:12px;
}

.card span{
    color:#94a3b8;
}

.card h3{
    font-size:36px;
    margin-top:10px;
    color:#38bdf8;
}

.search{
    margin:30px 0;
}

.search input{
    width:100%;
    padding:15px;
    border:none;
    border-radius:10px;
    background:#1e293b;
    color:white;
}

.project{
    background:#1e293b;
    border-radius:12px;
    padding:20px;
}

.empty{
    text-align:center;
    color:#94a3b8;
    padding:60px;
}

@media(max-width:768px){

.container{
    flex-direction:column;
}

.sidebar{
    width:100%;
}

.cards{
    grid-template-columns:1fr;
}

    }
