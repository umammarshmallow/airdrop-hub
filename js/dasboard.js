// ==========================================
// DASHBOARD
// ==========================================

const todayTask = document.getElementById("todayTask");

const activeProject = document.getElementById("activeProject");

const pendingProject = document.getElementById("pendingProject");

const waitlistProject = document.getElementById("waitlistProject");

const completeProject = document.getElementById("completeProject");

// ==========================================
// UPDATE DASHBOARD
// ==========================================

export function updateDashboard(projects = []) {

    let today = 0;

    let active = 0;

    let pending = 0;

    let waitlist = 0;

    let complete = 0;

    projects.forEach(project => {

        switch (project.status) {

            case "Active":

                active++;

                if (
                    project.taskType === "Daily" ||
                    project.taskType === "Weekly" ||
                    project.taskType === "Testnet" ||
                    project.taskType === "Mainnet"
                ) {

                    today++;

                }

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

    });

    todayTask.textContent = today;

    activeProject.textContent = active;

    pendingProject.textContent = pending;

    waitlistProject.textContent = waitlist;

    completeProject.textContent = complete;

}

// ==========================================
// RESET DASHBOARD
// ==========================================

export function resetDashboard() {

    todayTask.textContent = 0;

    activeProject.textContent = 0;

    pendingProject.textContent = 0;

    waitlistProject.textContent = 0;

    completeProject.textContent = 0;

}

// ==========================================
// GET DASHBOARD DATA
// ==========================================

export function getDashboardSummary(projects = []) {

    let summary = {

        today: 0,

        active: 0,

        pending: 0,

        waitlist: 0,

        complete: 0

    };

    projects.forEach(project => {

        switch (project.status) {

            case "Active":

                summary.active++;

                if (
                    project.taskType === "Daily" ||
                    project.taskType === "Weekly" ||
                    project.taskType === "Testnet" ||
                    project.taskType === "Mainnet"
                ) {

                    summary.today++;

                }

                break;

            case "Pending":

                summary.pending++;

                break;

            case "Waitlist":

                summary.waitlist++;

                break;

            case "Complete":

                summary.complete++;

                break;

        }

    });

    return summary;

}
