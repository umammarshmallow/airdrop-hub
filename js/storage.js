/* =====================================
   STORAGE.JS
===================================== */

const STORAGE_KEY = "airdropHub_v31";

function loadProjects(){

    const data = localStorage.getItem(STORAGE_KEY);

    if(!data){

        return [];

    }

    try{

        return JSON.parse(data);

    }catch{

        return [];

    }

}

function saveProjects(projects){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(projects)

    );

}

function clearProjects(){

    localStorage.removeItem(STORAGE_KEY);

}
