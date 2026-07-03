/* =====================================
   DASHBOARD.JS
===================================== */

function calculateDashboard(projects){

    let todayTask = 0;

    let activeProject = 0;

    let pendingProject = 0;

    let completeProject = 0;

    projects.forEach(project=>{

        /* Status Counter */

        if(project.status==="Active"){

            activeProject++;

        }

        if(project.status==="Pending"){

            pendingProject++;

        }

        if(project.status==="Complete"){

            completeProject++;

        }

        /* Today's Task */

        if(project.status!=="Active"){

            return;

        }

        if(

            project.taskType==="Daily" ||

            project.taskType==="Weekly"

        ){

            if(!project.completed){

                todayTask++;

            }

            return;

        }

        if(

            project.taskType==="Testnet" ||

            project.taskType==="Mainnet"

        ){

            todayTask++;

        }

    });

    return{

        todayTask,

        activeProject,

        pendingProject,

        completeProject

    };

}

function renderDashboard(projects){

    const data = calculateDashboard(projects);

    document.getElementById("todayTask").textContent=data.todayTask;

    document.getElementById("activeProject").textContent=data.activeProject;

    document.getElementById("pendingProject").textContent=data.pendingProject;

    document.getElementById("completeProject").textContent=data.completeProject;

}

/* =====================================
   DEADLINE REMINDER
===================================== */

function getUrgentProjects(projects){

    const today=new Date();

    const result=[];

    projects.forEach(project=>{

        if(

            !project.deadline ||

            project.status==="Complete"

        ){

            return;

        }

        const deadline=new Date(project.deadline);

        const diff=Math.ceil(

            (deadline-today)/86400000

        );

        if(diff<=3){

            result.push({

                ...project,

                days:diff

            });

        }

    });

    return result;

}

function deadlineReminder(projects){

    const urgent=getUrgentProjects(projects);

    if(urgent.length===0){

        return;

    }

    let message="Deadline Mendekati\n\n";

    urgent.forEach(project=>{

        if(project.days<=0){

            message+=`• ${project.name} (Hari Ini)\n`;

        }else{

            message+=`• ${project.name} (${project.days} hari lagi)\n`;

        }

    });

    alert(message);

}
