class Project {
  constructor(name, isActive, tasks) {
    this.name = name;
    this.isActive = isActive;
    this.tasks = tasks;
    this.completion = Math.round(
      (tasks.filter((el) => el.status == 3) * 100) / tasks.length,
    );
  }
}

//! check if there are any saved tabs
window.addEventListener("load", checkForTabs);

//! change completion status in stoarage
function calcCompletion(projectsData) {
  for (obj of projectsData) {
    if (!obj.isActive) continue;

    obj.completion = (obj.tasks.filter((el) => el.status == 3).length * 100) /obj.tasks.length;
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));
}

function getFromStorage(item) {
  return JSON.parse(localStorage.getItem(item));
}

function appendTasksFrom(activeProjectName) {
  calcCompletion(getFromStorage("projects-data"));

  let projectsData = getFromStorage("projects-data");

  for (obj of projectsData) {
    if (obj.name === activeProjectName) {
      let todoCont = document.querySelector(".board .todo-sect .task-cont");
      let inProgressCont = document.querySelector(
        ".board .in-progress-sect .task-cont",
      );
      let completedCont = document.querySelector(
        ".board .completed-sect .task-cont",
      );

      todoCont.innerHTML = "";
      inProgressCont.innerHTML = "";
      completedCont.innerHTML = "";

      let progressBox = document.querySelector(".progress-data .completion-data");

      if (document.querySelector(".progress-data .completion-data .progress-bar")) {
        document.querySelector(".progress-data .completion-data .progress-bar").remove();
      }

      let progressBar = document.createElement("div");
      let progressValue = Math.round(obj.completion) ?? 0;

      progressBar.classList.add("progress-bar")
      progressBar.setAttribute("data-progress", progressValue);
      progressBar.innerHTML = `${progressValue}% &nbsp;`;
      progressBar.style.width = `${progressValue}%`;

      progressBox.append(progressBar)

      obj.tasks.forEach((task) => {
        let taskBox = document.createElement("div");
        taskBox.classList.add("task");

        taskBox.draggable = true;
        taskBox.setAttribute("data-value", task.value);

        taskBox.addEventListener("dragstart", () => {
          taskBox.classList.add("dragging");
        });

        taskBox.addEventListener("dragend", () => {
          taskBox.classList.remove("dragging");

          calcCompletion(getFromStorage("projects-data"));

          let objCompletion;

          for (obj of getFromStorage("projects-data")) {
            if (!obj.isActive) continue;

            objCompletion = obj.completion;
          }

          let progressBar = document.querySelector(".board .progress-data .completion-data .progress-bar");
          let progressValue = Math.round(objCompletion) ?? 0;

          progressBar.innerHTML = `${progressValue}% &nbsp; `;
          progressBar.setAttribute("data-progress", progressValue);
          progressBar.style.width = `${progressValue}%`;
        });

        let p = document.createElement("p");
        p.textContent = task.value;

        let editBtn = document.createElement("button");
        editBtn.classList.add("edit-task");

        let buttonIco = document.createElement("i");
        buttonIco.classList.add("fas", "fa-pen-to-square");

        editBtn.append(buttonIco);

        taskBox.append(p, editBtn);

        let removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-task");

        let removeBtnIco = document.createElement("i");
        removeBtnIco.classList.add("fas", "fa-trash-can");

        removeBtn.append(removeBtnIco);

        taskBox.append(p, editBtn, removeBtn);

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
}

function appendTabsFrom(projectsArr) {
  let projectsBox = document.querySelector(
    "aside .projects-control .projects-box",
  );
  projectsBox.innerHTML = "";

  projectsArr.forEach((project) => {
    let proj = document.createElement("div");
    project.isActive ? proj.classList.add("active") : "";
    proj.classList.add("proj");
    proj.setAttribute("data-name", project.name);

    let p = document.createElement("p");
    p.textContent = project.name;

    let editBtn = document.createElement("button");
    editBtn.classList.add("edit-tab");

    let editBtnIco = document.createElement("i");
    editBtnIco.classList.add("fas", "fa-pen-to-square");
    editBtn.append(editBtnIco);

    let removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-tab");

    let removeBtnIco = document.createElement("i");
    removeBtnIco.classList.add("fas", "fa-trash-can");
    removeBtn.append(removeBtnIco);

    proj.append(p, editBtn, removeBtn);

    projectsBox.append(proj);
  });

  let allProjects = document.querySelectorAll(".projects-box .proj");

  allProjects.forEach((proj) => {
    if (!proj.classList.contains("active")) return;

    appendTasksFrom(proj.getAttribute("data-name"));
  });
}

function checkForTabs() {
  if (
    Boolean(localStorage.getItem("projects-data")) &&
    getFromStorage("projects-data").length > 0
  ) {
    appendTabsFrom(getFromStorage("projects-data"));
  } else {
    let projectsData = [new Project("new project", true, [])];

    localStorage.setItem("projects-data", JSON.stringify(projectsData));

    appendTabsFrom(getFromStorage("projects-data"));
  }
}

function notifyWith(message) {
  if (document.querySelector(".pop-up"))
    document.querySelector(".pop-up").remove();
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
  let projects = getFromStorage("projects-data");

  let inputValue = addProjectInput.value;
  let inputValueValid = inputValue !== "" ? true : false;

  addProjectInput.value = "";

  for (obj of projects) {
    if (obj.name === inputValue)
      return notifyWith("this project already exsists");
  }

  if (inputValueValid) {
    projects.push(new Project(inputValue, false, []));

    localStorage.setItem("projects-data", JSON.stringify(projects));

    appendTabsFrom(getFromStorage("projects-data"));
  } else notifyWith("input field is empty");
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

  let projectsData = getFromStorage("projects-data");

  for (obj of projectsData) {
    if (obj.name === currentEl.textContent) {
      obj.isActive = true;
    } else {
      obj.isActive = false;
    }
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  appendTasksFrom(currentElParent.getAttribute("data-name"));
});

//! Add new task
let taskTextArea = document.querySelector("aside .task-control textarea");
let addTaskBtn = document.querySelector("aside .task-control .add-task");

addTaskBtn.addEventListener("click", () => {
  let taskValue = taskTextArea.value;
  if (taskValue === "") return notifyWith("input field is empty");
  taskTextArea.value = "";

  let projectsData = getFromStorage("projects-data");

  for (object of projectsData) {
    if (object.isActive) {
      for (task of object.tasks) {
        if (task.value === taskValue)
          return notifyWith("this task already exsist");
      }

      object.tasks.push({ value: taskValue, status: 1 });
    }
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  appendTabsFrom(getFromStorage("projects-data"));
});

//! remove project

window.addEventListener("click", (e) => {
  let projectName;
  if (e.target.classList.contains("remove-tab")) {
    projectName = e.target.parentNode.getAttribute("data-name");
  } else if (e.target.parentNode.classList.contains("remove-tab")) {
    projectName = e.target.parentNode.parentNode.getAttribute("data-name");
  } else return;

  let projectsData = getFromStorage("projects-data");

  for (obj of projectsData) {
    if (obj.name === projectName && obj.isActive) {
      let todoCont = document.querySelector(".board .todo-sect .task-cont");
      let inProgressCont = document.querySelector(
        ".board .in-progress-sect .task-cont",
      );
      let completedCont = document.querySelector(
        ".board .completed-sect .task-cont",
      );

      todoCont.innerHTML = "";
      inProgressCont.innerHTML = "";
      completedCont.innerHTML = "";
    }
  }

  projectsData = projectsData.filter((obj) => obj.name !== projectName);

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  appendTabsFrom(getFromStorage("projects-data"));
});

//! edit project

window.addEventListener("click", (e) => {
  let projectName;
  if (e.target.classList.contains("edit-tab")) {
    projectName = e.target.parentNode.getAttribute("data-name");
  } else if (e.target.parentNode.classList.contains("edit-tab")) {
    projectName = e.target.parentNode.parentNode.getAttribute("data-name");
  } else return;

  let container = document.createElement("div");
  container.classList.add("container");

  let inputModal = document.createElement("div");
  inputModal.classList.add("input-modal");

  let layover = document.createElement("div");
  layover.classList.add("input-modal-layover");

  let input = document.createElement("input");
  input.setAttribute("data-name", projectName);
  input.placeholder = "new name";

  let confirmBtn = document.createElement("button");
  confirmBtn.classList.add("confirm-btn");
  confirmBtn.textContent = `confirm`;

  confirmBtn.addEventListener("click", function () {
    let input = this.parentNode.querySelector("input");
    let newName = input.value;

    if (newName === "") return notifyWith("input field is empty");

    let projectsData = getFromStorage("projects-data");

    for (obj of projectsData) {
      if (obj.name === newName)
        return notifyWith("this project name already used");
    }

    for (obj of projectsData) {
      if (obj.name === input.getAttribute("data-name")) {
        obj.name = newName;
      }
    }

    localStorage.setItem("projects-data", JSON.stringify(projectsData));

    appendTabsFrom(getFromStorage("projects-data"));

    this.parentNode.parentNode.remove();
  });

  let exitBtn = document.createElement("button");
  exitBtn.classList.add("exit-btn");
  exitBtn.innerHTML = `x`;

  exitBtn.addEventListener("click", function () {
    this.parentNode.parentNode.remove();
  });

  inputModal.append(input, confirmBtn, exitBtn);

  container.append(layover, inputModal);

  document.body.append(container);

  input.focus();
});

//! Drag and drop tasks

let taskSects = document.querySelectorAll(".board .sect");

taskSects.forEach((sect) => {
  sect.addEventListener("dragover", (e) => {
    e.preventDefault();

    let dragging = document.querySelector(".dragging");
    let taskCont = sect.querySelector(".task-cont");

    let projectsData = getFromStorage("projects-data");

    for (obj of projectsData) {
      if (!obj.isActive) continue;

      for (task of obj.tasks) {
        if (task.value !== dragging.getAttribute("data-value")) continue;

        if (taskCont.id === "todo") {
          task.status = 1;
        } else if (taskCont.id === "in-progress") {
          task.status = 2;
        } else if (taskCont.id === "completed") {
          task.status = 3;
        }
      }
    }

    localStorage.setItem("projects-data", JSON.stringify(projectsData));

    taskCont.append(dragging);
  });
});

window.addEventListener("dragend", (e) => {

})

//! remove task

window.addEventListener("click", (e) => {
  let taskValue;
  if (e.target.classList.contains("remove-task")) {
    taskValue = e.target.parentNode.getAttribute("data-value");
  } else if (e.target.parentNode.classList.contains("remove-task")) {
    taskValue = e.target.parentNode.parentNode.getAttribute("data-value");
  } else return;

  let projectsData = getFromStorage("projects-data");
  let newActiveProjectTasks = [];

  for (obj of projectsData) {
    if (!obj.isActive) continue;

    for (task of obj.tasks) {
      if (task.value != taskValue) {
        newActiveProjectTasks.push(task);
      }
    }

    obj.tasks = newActiveProjectTasks;
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  let projects = document.querySelectorAll(".projects-box .proj");

  projects.forEach((proj) => {
    if (!proj.classList.contains("active")) return;

    appendTasksFrom(proj.getAttribute("data-name"));
  });
});

//! edit task

window.addEventListener("click", (e) => {
  let taskValue;
  if (e.target.classList.contains("edit-task")) {
    taskValue = e.target.parentNode.getAttribute("data-value");
  } else if (e.target.parentNode.classList.contains("edit-task")) {
    taskValue = e.target.parentNode.parentNode.getAttribute("data-value");
  } else return;

  // ! Make function to create modal
  let container = document.createElement("div");
  container.classList.add("container");

  let inputModal = document.createElement("div");
  inputModal.classList.add("input-modal");

  let layover = document.createElement("div");
  layover.classList.add("input-modal-layover");

  let input = document.createElement("input");
  input.setAttribute("data-value", taskValue);
  input.placeholder = "new name";

  let confirmBtn = document.createElement("button");
  confirmBtn.classList.add("confirm-btn");
  confirmBtn.textContent = `confirm`;

  confirmBtn.addEventListener("click", function () {
    let input = this.parentNode.querySelector("input");
    let newName = input.value;

    if (newName === "") return notifyWith("input field is empty");

    let projectsData = getFromStorage("projects-data");

    for (obj of projectsData) {
      if (!obj.isActive) continue;

      for (task of obj.tasks) {
        if (task.value === newName)
          return notifyWith("this task already exsist");
      }

      for (task of obj.tasks) {
        if (task.value != taskValue) continue;

        task.value = newName;
      }
    }

    localStorage.setItem("projects-data", JSON.stringify(projectsData));

    let projects = document.querySelectorAll(".projects-box .proj");

    projects.forEach((proj) => {
      if (!proj.classList.contains("active")) return;

      appendTasksFrom(proj.getAttribute("data-name"));
    });

    this.parentNode.parentNode.remove();
  });

  let exitBtn = document.createElement("button");
  exitBtn.classList.add("exit-btn");
  exitBtn.innerHTML = `x`;

  exitBtn.addEventListener("click", function () {
    this.parentNode.parentNode.remove();
  });

  inputModal.append(input, confirmBtn, exitBtn);

  container.append(layover, inputModal);

  document.body.append(container);

  input.focus();
});

// ! menu on phone

let menuBtn = document.querySelector("aside .menu");
let menuBtnIco = menuBtn.querySelector("i");
let sideBar = document.querySelector("aside");

menuBtn.addEventListener("click", () => {
  if (menuBtn.classList.contains("show")) {
    menuBtnIco.className = "fas fa-bars";
  } else {
    menuBtnIco.className = "fas fa-x";
  }
  menuBtn.classList.toggle("show");
  sideBar.classList.toggle("show");
});
