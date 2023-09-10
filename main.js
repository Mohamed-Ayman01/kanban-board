//! check if there are any saved tabs
window.addEventListener("load", checkForTabs);

function appendTasksFrom(currentProjectP) {
  let projectsData = JSON.parse(localStorage.getItem("projects-tabs"));

  for (obj of projectsData) {
    if (obj.name === currentProjectP.textContent) {
      let todoCont = document.querySelector(".board .todo-sect .task-cont");
      let inProgressCont = document.querySelector(".board .in-progress-sect .task-cont");
      let completedCont = document.querySelector(".board .completed-sect .task-cont");

      todoCont.innerHTML = "";
      inProgressCont.innerHTML = "";
      completedCont.innerHTML = "";

      obj.tasks.forEach((task) => {
        let taskBox = document.createElement("div");
        taskBox.classList.add("task");

        let p = document.createElement("p");
        p.textContent = task.value;

        let button = document.createElement("button");
        button.classList.add("edit-task");

        let buttonIco = document.createElement("i");
        buttonIco.classList.add("fas", "fa-wrench");

        button.append(buttonIco);

        taskBox.append(p, button);

        if (task.status === 1) {
          todoCont.append(taskBox);
        } else if (task.status === 2) {
          inProgressCont.append(taskBox);
        } else if (task.status === 3) {
          completedCont.append(taskBox);
        }

      });
    }
  }

  localStorage.setItem("projects-tabs", JSON.stringify(projectsData));
}

function appendTabsFrom(projectsArr) {
  let projectsBox = document.querySelector(
    "aside .projects-control .projects-box",
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

  let allProjects = document.querySelectorAll(".projects-box .proj");

  allProjects.forEach((proj) => {
    if (!proj.classList.contains("active")) return;

    let projChilds = Array.from(proj.children);

    projChilds.forEach((child) => {
      if (child.tagName === "P") {
        appendTasksFrom(child);
      }
    });
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
        tasks: [
          { value: Math.random(), status: 2 },
          { value: Math.random(), status: 3 },
        ],
      },
    ];

    localStorage.setItem("projects-tabs", JSON.stringify(projectsData));

    appendTabsFrom(JSON.parse(localStorage.getItem("projects-tabs")));
  }
}

function notifyWith(message) {
  let popUp = document.createElement("div");
  popUp.classList.add("pop-up");
  popUp.textContent = message;

  document.body.append(popUp);

  let popUp2 = document.querySelector(".pop-up");

  setTimeout(() => {
    popUp2.style.top = "10px";
  }, 500);

  setTimeout(() => {
    popUp2.style.top = "-80px";
  }, 3000);

  setTimeout(() => {
    popUp2.remove();
  }, 5000);
}

//! Add new project controls
let addProjectInput = document.querySelector("aside input#proj-input");
let addProjectBtn = document.querySelector("aside .controls button");

addProjectBtn.addEventListener("click", () => {
  let projects = JSON.parse(localStorage.getItem("projects-tabs"));

  let inputValue = addProjectInput.value;
  let inputValueValid = inputValue !== "" ? true : false;

  addProjectInput.value = "";

  for (obj of projects) {
    if (obj.name === inputValue) return notifyWith("this project already exsists")
  }


  if (inputValueValid) {
    projects.push({
      name: inputValue,
      isActive: false,
      tasks: [
        { value: Math.random(), status: 2 },
        { value: Math.random(), status: 3 },
      ],
    });

    localStorage.setItem("projects-tabs", JSON.stringify(projects));

    appendTabsFrom(JSON.parse(localStorage.getItem("projects-tabs")));
  } else notifyWith("field is empty");
});

//! Toggle between projects tabs
window.addEventListener("click", (e) => {
  let currentEl = e.target;
  let currentElParent = currentEl.parentNode;

  if (currentEl.tagName === "BUTTON") return;
  if (!currentElParent.classList.contains("proj")) return;

  let allProjects = document.querySelectorAll(".projects-box .proj");

  allProjects.forEach((proj) => {
    proj.classList.remove("active");
  });

  currentElParent.classList.add("active");

  let projectsData = JSON.parse(localStorage.getItem("projects-tabs"));

  for (obj of projectsData) {
    if (obj.name === currentEl.textContent) {
      obj.isActive = true;
    } else {
      obj.isActive = false;
    }
  }

  localStorage.setItem("projects-tabs", JSON.stringify(projectsData));

  appendTasksFrom(currentEl);
});