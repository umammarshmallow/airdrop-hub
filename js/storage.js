// ==============================
// STORAGE
// ==============================

const STORAGE_KEY = "airdropHubProjects";

// ==============================
// LOAD PROJECTS
// ==============================

export function loadProjects() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) {
            return [];
        }

        return JSON.parse(data);

    } catch (error) {

        console.error("Gagal memuat data project:", error);

        return [];
    }
}

// ==============================
// SAVE PROJECTS
// ==============================

export function saveProjects(projects) {
    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(projects)
        );

    } catch (error) {

        console.error("Gagal menyimpan data project:", error);

    }
}

// ==============================
// ADD PROJECT
// ==============================

export function addProject(project) {

    const projects = loadProjects();

    projects.push(project);

    saveProjects(projects);

}

// ==============================
// UPDATE PROJECT
// ==============================

export function updateProject(updatedProject) {

    const projects = loadProjects();

    const index = projects.findIndex(
        project => project.id === updatedProject.id
    );

    if (index !== -1) {

        projects[index] = updatedProject;

        saveProjects(projects);

    }

}

// ==============================
// DELETE PROJECT
// ==============================

export function deleteProject(id) {

    const projects = loadProjects().filter(
        project => project.id !== id
    );

    saveProjects(projects);

}

// ==============================
// CHANGE STATUS
// ==============================

export function changeProjectStatus(id, status) {

    const projects = loadProjects();

    const project = projects.find(
        item => item.id === id
    );

    if (!project) {
        return;
    }

    project.status = status;

    saveProjects(projects);

}

// ==============================
// GET PROJECT BY ID
// ==============================

export function getProjectById(id) {

    const projects = loadProjects();

    return projects.find(
        project => project.id === id
    );

}

// ==============================
// CLEAR ALL PROJECTS
// ==============================

export function clearAllProjects() {

    localStorage.removeItem(STORAGE_KEY);

}
