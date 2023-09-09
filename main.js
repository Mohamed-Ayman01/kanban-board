//* check if there are any saved tabs

window.addEventListener("load", checkForTabs);

function appendTabsFrom(projectsArr) {
  let projectsBox = document.querySelector(
    "aside .projects-control .projects-box"
  );
  projectsBox.innerHTML = "";

  projectsArr.forEach((project) => {
    let proj = document.createElement("div");
    project.isActive === true ? proj.classList.add("active") : "";
    proj.classList.add("proj");

    let p = document.createElement("p");
    p.textContent = project.name;

    let btn = document.createElement("button");
    let btnIco = document.createElement("i");
    btnIco.classList.add("fas", "fa-wrench");

    btn.append(btnIco);

    proj.append(p, btn);

    projectsBox.append(proj);
  });
}

function checkForTabs() {
  if (Boolean(localStorage.getItem("projects-tabs"))) {
    appendTabsFrom(JSON.parse(localStorage.getItem("projects-tabs")));
  } else {
    let projectsData = [
      {
        name: "project 1",
        isActive: true,
        tasks: [],
      },
    ];

    localStorage.setItem("projects-tabs", JSON.stringify(projectsData));

    appendTabsFrom(JSON.parse(localStorage.getItem("projects-tabs")));
  }
}

let addProjectInput = document.querySelector("aside input#proj-input");
let addProjectBtn = document.querySelector("aside .controls button");

addProjectBtn.addEventListener("click", () => {
  let projects = JSON.parse(localStorage.getItem("projects-tabs"));

  let inputValue = addProjectInput.value;
  let inputValueValid = inputValue !== "" ? true : false;

  if (inputValueValid) {
    projects.push({ name: inputValue, isActive: false, tasks: [] });

    localStorage.setItem("projects-tabs", JSON.stringify(projects));

    appendTabsFrom(JSON.parse(localStorage.getItem("projects-tabs")));
  } else {
    window.alert("enter a valid name");
    //! MAKE POP UP ALERT HERE
  }
});
