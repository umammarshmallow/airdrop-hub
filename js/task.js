/* =====================================
   TASK.JS
===================================== */

function todayString(){

    return new Date().toISOString().split("T")[0];

}

function weekString(){

    const d = new Date();

    const first = new Date(d.getFullYear(),0,1);

    const day = Math.floor((d-first)/86400000);

    const week = Math.ceil((day+first.getDay()+1)/7);

    return d.getFullYear()+"-"+week;

}

function resetTasks(projects){

    const today = todayString();

    const week = weekString();

    let changed = false;

    projects.forEach(project=>{

        if(project.completed===undefined){

            project.completed=false;

        }

        if(project.lastDaily===undefined){

            project.lastDaily="";

        }

        if(project.lastWeekly===undefined){

            project.lastWeekly="";

        }

        if(project.taskType==="Daily"){

            if(project.lastDaily!==today){

                project.completed=false;

                project.lastDaily=today;

                changed=true;

            }

        }

        if(project.taskType==="Weekly"){

            if(project.lastWeekly!==week){

                project.completed=false;

                project.lastWeekly=week;

                changed=true;

            }

        }

    });

    return changed;

}

function toggleTask(projects,id){

    const project = projects.find(p=>p.id===id);

    if(!project) return;

    project.completed=!project.completed;

}
