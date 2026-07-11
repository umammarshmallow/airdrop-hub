/* ==========================================
   DASHBOARD.JS
========================================== */

export function updateDashboard(projects) {

    const todayTask = document.getElementById("todayTask");
    const activeProject = document.getElementById("activeProject");
    const pendingProject = document.getElementById("pendingProject");
    const waitlistProject = document.getElementById("waitlistProject");
    const completeProject = document.getElementById("completeProject");

    let today = 0;
    let active = 0;
    let pending = 0;
    let waitlist = 0;
    let complete = 0;

    projects.forEach(project => {

        switch (project.status) {

            case "Active":
                active++;
                break;

            case "Pending":
                pending++;
                break;

            case "Waitlist":
                waitlist++;
                break;

            case "Complete":
                complete++;
                break;

        }

        /* ==========================
           TODAY TASK
        ========================== */

        if (project.status !== "Active") return;

        switch (project.taskType) {

            case "Daily":

                if (!project.dailyDone) {
                    today++;
                }

                break;

            case "Weekly":

                if (
                    isTodayWeeklyTask(project) &&
                    !project.dailyDone
                ) {
                    today++;
                  }

                break;

            case "Testnet":
            case "Mainnet":

               if (!project.dailyDone) {
                   today++;
               }

               break;

        }

    });

    if (todayTask) todayTask.textContent = today;

    if (activeProject) activeProject.textContent = active;

    if (pendingProject) pendingProject.textContent = pending;

    if (waitlistProject) waitlistProject.textContent = waitlist;

    if (completeProject) completeProject.textContent = complete;

}

/* ==========================================
   WEEKLY TASK
========================================== */

function isTodayWeeklyTask(project) {

    if (!project.deadline) {

        return true;

    }

    const deadline = new Date(project.deadline);

    const today = new Date();

    return deadline.getDay() === today.getDay();

}

/* ==========================================
   PROJECT SUMMARY
========================================== */

export function getSummary(projects) {

    return {

        total: projects.length,

        active: projects.filter(p => p.status === "Active").length,

        pending: projects.filter(p => p.status === "Pending").length,

        waitlist: projects.filter(p => p.status === "Waitlist").length,

        complete: projects.filter(p => p.status === "Complete").length

    };

}
