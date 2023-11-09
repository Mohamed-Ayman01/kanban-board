class Project {
  constructor(name, isActive, tasks) {
    this.name = name;
    this.isActive = isActive;
    this.tasks = tasks;
    this.workTime = [0, 0, 0];
    this.completion = Math.round(
      (tasks.filter((el) => el.status == 3) * 100) / tasks.length,
    );
  }
}

let secCounter = 0;
let minutesCounter = 0;
let hoursCounter = 0;

window.addEventListener("beforeunload", saveTimerData);

//! check if there are any saved tabs
window.addEventListener("load", checkForTabs);

//! change completion status in stoarage
function calcCompletion(projectsData) {
  for (obj of projectsData) {
    if (!obj.isActive) continue;

    obj.completion =
      (obj.tasks.filter((el) => el.status == 3).length * 100) /
      obj.tasks.length;
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));
}

function getFromStorage(item) {
  return JSON.parse(localStorage.getItem(item));
}

function clearActiveProjectBoard() {
  let projects = getFromStorage("projects-data");

  for (project of projects) {
    if (!project.isActive) continue;

    project.tasks = [];
  }

  localStorage.setItem("projects-data", JSON.stringify(projects));

  for (project of projects) {
    if (!project.isActive) continue;

    appendTasksFrom(project.name);
  }

  document.querySelector(".confirm-modal").remove();
  document.querySelector(".confirm-modal-overlay").remove();
}

function appendTasksFrom(activeProjectName) {
  calcCompletion(getFromStorage("projects-data"));

  let projectsData = getFromStorage("projects-data");

  for (obj of projectsData) {
    if (obj.name == activeProjectName) {
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

      let progressBox = document.querySelector(
        ".progress-data .completion-data",
      );

      if (
        document.querySelector(".progress-data .completion-data .progress-bar")
      ) {
        document
          .querySelector(".progress-data .completion-data .progress-bar")
          .remove();
      }

      let progressBar = document.createElement("div");
      let progressValue = Math.round(obj.completion) ?? 0;

      progressBar.classList.add("progress-bar");
      progressBar.setAttribute("data-progress", progressValue);
      progressBar.innerHTML = `${progressValue}% &nbsp;`;
      progressBar.style.width = `${progressValue}%`;

      progressBox.append(progressBar);

      obj.tasks.forEach((task) => {
        let taskBox = document.createElement("div");
        taskBox.classList.add("task");

        taskBox.draggable = true;
        taskBox.setAttribute("data-name", task.name);
        taskBox.setAttribute("data-description", task.description);

        function onDragStart() {
          taskBox.classList.add("dragging");
        }

        taskBox.addEventListener("dragstart", onDragStart);

        function onDragEnd() {
          taskBox.classList.remove("dragging");

          calcCompletion(getFromStorage("projects-data"));

          let objCompletion;

          for (obj of getFromStorage("projects-data")) {
            if (!obj.isActive) continue;

            objCompletion = obj.completion;
          }

          let progressBar = document.querySelector(
            ".board .progress-data .completion-data .progress-bar",
          );
          let progressValue = Math.round(objCompletion) ?? 0;

          progressBar.innerHTML = `${progressValue}% &nbsp; `;
          progressBar.setAttribute("data-progress", progressValue);
          progressBar.style.width = `${progressValue}%`;
        }

        taskBox.addEventListener("dragend", onDragEnd);

        let p = document.createElement("p");
        p.textContent = task.name;

        p.addEventListener("click", () => {
          taskBox.querySelector(".task-modal").classList.toggle("show");
        });

        let editBtn = document.createElement("button");
        editBtn.classList.add("edit-task");

        let buttonIco = document.createElement("i");
        buttonIco.classList.add("fas", "fa-pen-to-square");

        editBtn.append(buttonIco);

        editBtn.addEventListener("click", () => {
          let taskName = taskBox.getAttribute("data-name");
          let taskDescription = taskBox.getAttribute("data-description");

          // ! Make function to create modal
          let container = document.createElement("div");
          container.classList.add("container");

          let taskEditModal = document.createElement("div");
          taskEditModal.classList.add("task-edit-modal");

          let overlay = document.createElement("div");
          overlay.classList.add("task-edit-overlay");

          let nameLabel = document.createElement("label")
          nameLabel.textContent = "name:";

          let nameInput = document.createElement("input");
          nameInput.setAttribute("data-name", taskName);
          nameInput.value = taskName;

          let descLabel = document.createElement("label")
          descLabel.textContent = "description:";

          let textarea = document.createElement("textarea")
          textarea.setAttribute("data-description", taskDescription)
          textarea.value = taskDescription;

          let saveBtn = document.createElement("button");
          saveBtn.classList.add("save-btn");
          saveBtn.textContent = `save`;

          saveBtn.addEventListener("click", function () {
            let currentName = taskName;
            let newName = this.parentNode.querySelector("input").value;
            let newDesc = this.parentNode.querySelector("textarea").value;

            if (newName == "") return notifyWith("name field is empty");
            if (newDesc == "") newDesc = "no description";

            let projectsData = getFromStorage("projects-data");

            for (obj of projectsData) {
              if (!obj.isActive) continue;

              for (task of obj.tasks) {
                if (task.name === newName) {
                  if (task.name === currentName) continue;

                  return notifyWith("this task already exsists");
                }
              }

              for (task of obj.tasks) {
                if (task.name != taskName) continue;

                task.name = newName;
                task.description = newDesc;
              }
            }

            localStorage.setItem("projects-data", JSON.stringify(projectsData));

            let projects = document.querySelectorAll(".projects-box .proj");

            projects.forEach((proj) => {
              if (!proj.classList.contains("active")) return;

              appendTasksFrom(proj.getAttribute("data-name"));
            });

            taskEditModal.remove();

            overlay.remove()
          });

          let exitBtn = document.createElement("button");
          exitBtn.classList.add("exit-btn");
          exitBtn.innerHTML = `X`;

          exitBtn.addEventListener("click", function () {
            this.parentNode.parentNode.remove();
          });

          taskEditModal.append(nameLabel, nameInput, descLabel, textarea, saveBtn, exitBtn);

          container.append(overlay, taskEditModal);

          document.body.append(container);

          nameInput.focus();
        });

        let removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-task");

        let removeBtnIco = document.createElement("i");
        removeBtnIco.classList.add("fas", "fa-trash-can");

        removeBtn.append(removeBtnIco);

        removeBtn.addEventListener("click", () => {
          let taskName = taskBox.getAttribute("data-name");

          let projectsData = getFromStorage("projects-data");
          let newActiveProjectTasks = [];

          for (obj of projectsData) {
            if (!obj.isActive) continue;

            for (task of obj.tasks) {
              if (task.name != taskName) {
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

        let taskModal = document.createElement("div");
        taskModal.classList.add("task-modal");

        let taskDate = new Date(task.date)

        taskModal.innerHTML = `
        <div class="description">${task.description}</div>
        <div class="date"><i class="fas fa-clock"></i> ${taskDate.getDate()}/${taskDate.getMonth()}/${taskDate.getFullYear()}, ${taskDate.getHours()}:${taskDate.getMinutes()}:${taskDate.getSeconds()}</div>
        `;

        taskBox.append(p, editBtn, removeBtn, taskModal);

        if (task.status == 1) {
          todoCont.append(taskBox);
        } else if (task.status == 2) {
          inProgressCont.append(taskBox);
        } else if (task.status == 3) {
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
    proj.classList.add("proj");
    proj.setAttribute("data-name", project.name);
    project.isActive ? proj.classList.add("active") : "";

    let p = document.createElement("p");
    p.textContent = project.name;

    let editBtn = document.createElement("button");
    editBtn.classList.add("edit-tab");

    editBtn.addEventListener("click", () => {
      let projectName = proj.getAttribute("data-name");

      let container = document.createElement("div");
      container.classList.add("container");

      let inputModal = document.createElement("div");
      inputModal.classList.add("project-edit-modal");

      let layover = document.createElement("div");
      layover.classList.add("project-edit-overlay");

      let input = document.createElement("input");
      input.setAttribute("data-name", projectName);
      input.value = projectName;
      input.placeholder = "project name";

      let confirmBtn = document.createElement("button");
      confirmBtn.classList.add("save-btn");
      confirmBtn.textContent = `save`;

      confirmBtn.addEventListener("click", function () {
        let newName = this.parentNode.querySelector("input").value;
        let currentName = proj.getAttribute("data-name");
        console.log(currentName);

        if (newName == "") return notifyWith("project name field is empty");

        let projectsData = getFromStorage("projects-data");

        for (obj of projectsData) {
          if (obj.name == newName) {
            if (obj.name == currentName) continue;

            return notifyWith("this project already exsists");
          }
        }

        for (obj of projectsData) {
          if (obj.name == input.getAttribute("data-name")) {
            obj.name = newName;
          }
        }

        localStorage.setItem("projects-data", JSON.stringify(projectsData));

        saveTimerData();
        appendTabsFrom(getFromStorage("projects-data"));

        this.parentNode.parentNode.remove();
      });

      let exitBtn = document.createElement("button");
      exitBtn.classList.add("exit-btn");
      exitBtn.innerHTML = `X`;

      exitBtn.addEventListener("click", function () {
        this.parentNode.parentNode.remove();
      });

      inputModal.append(input, confirmBtn, exitBtn);

      container.append(layover, inputModal);

      document.body.append(container);

      input.focus();
    });

    let editBtnIco = document.createElement("i");
    editBtnIco.classList.add("fas", "fa-pen-to-square");
    editBtn.append(editBtnIco);

    let removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-tab");

    removeBtn.addEventListener("click", () => {
      let projectName = proj.getAttribute("data-name");

      let projectsData = getFromStorage("projects-data");

      for (obj of projectsData) {
        if (obj.name !== projectName && !obj.isActive) continue;

        let todoCont = document.querySelector(".board .todo-sect .task-cont");
        todoCont.innerHTML = "";

        let inProgressCont = document.querySelector(
          ".board .in-progress-sect .task-cont",
        );
        inProgressCont.innerHTML = "";

        let completedCont = document.querySelector(
          ".board .completed-sect .task-cont",
        );
        completedCont.innerHTML = "";

        let timeBox = document.querySelector(
          ".board .progress-data .timer-data .time",
        );
        timeBox.textContent = "00:00:00";
      }

      projectsData = projectsData.filter((obj) => obj.name != projectName);

      localStorage.setItem("projects-data", JSON.stringify(projectsData));

      saveTimerData();
      appendTabsFrom(getFromStorage("projects-data"));
    });

    let removeBtnIco = document.createElement("i");
    removeBtnIco.classList.add("fas", "fa-trash-can");
    removeBtn.append(removeBtnIco);

    proj.append(p, editBtn, removeBtn);

    projectsBox.append(proj);

    if (project.isActive) {
      let timeBox = document.querySelector(".progress-data .timer-data .time");

      timeBox.textContent = `${
        project.workTime[0] < 10
          ? `0${project.workTime[0]}`
          : project.workTime[0]
      }:${
        project.workTime[1] < 10
          ? `0${project.workTime[1]}`
          : project.workTime[1]
      }:${
        project.workTime[2] < 10
          ? `0${project.workTime[2]}`
          : project.workTime[2]
      }`;

      secCounter = project.workTime[2];
      minutesCounter = project.workTime[1];
      hoursCounter = project.workTime[0];
    }
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
  let inputValueValid = inputValue != "" ? true : false;

  addProjectInput.value = "";

  for (obj of projects) {
    if (obj.name == inputValue)
      return notifyWith("this project already exsists");
  }

  if (inputValueValid) {
    projects.push(new Project(inputValue, false, []));

    localStorage.setItem("projects-data", JSON.stringify(projects));

    saveTimerData();

    appendTabsFrom(getFromStorage("projects-data"));
  } else notifyWith("input field is empty");
});

//! Toggle between projects tabs
window.addEventListener("click", (e) => {
  let currentEl = e.target;
  let currentElParent = currentEl.parentNode;

  if (currentEl.tagName == "BUTTON") return;
  if (!currentElParent.classList.contains("proj")) return;

  if (startTimerBtn.classList.contains("active")) stopTimer();

  let allProjects = document.querySelectorAll(".projects-box .proj");

  allProjects.forEach((proj) => {
    proj.classList.remove("active");
  });

  currentElParent.classList.add("active");

  let projectsData = getFromStorage("projects-data");

  saveTimerData(true);

  for (obj of projectsData) {
    if (obj.name == currentEl.textContent) {
      obj.isActive = true;
    } else {
      obj.isActive = false;
    }
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  let timeBox = document.querySelector(".progress-data .timer-data .time");

  for (obj of projectsData) {
    if (!obj.isActive) continue;

    timeBox.textContent = `${
      obj.workTime[0] < 10 ? `0${obj.workTime[0]}` : obj.workTime[0]
    }:${obj.workTime[1] < 10 ? `0${obj.workTime[1]}` : obj.workTime[1]}:${
      obj.workTime[2] < 10 ? `0${obj.workTime[2]}` : obj.workTime[2]
    }`;

    secCounter = obj.workTime[2];
    minutesCounter = obj.workTime[1];
    hoursCounter = obj.workTime[0];
  }

  appendTasksFrom(currentElParent.getAttribute("data-name"));
});

//! Add new task
let taskNameInput = document.querySelector(
  "aside .task-control #task-name-input",
);
let taskDescInput = document.querySelector("aside .task-control textarea");
let addTaskBtn = document.querySelector("aside .task-control .add-task");

addTaskBtn.addEventListener("click", () => {
  let taskName = taskNameInput.value;
  let taskDesc = taskDescInput.value;

  if (taskName == "") return notifyWith("enter the task name");
  if (taskDesc == "") taskDesc = "no description";

  taskNameInput.value = "";
  taskDescInput.value = "";

  let projectsData = getFromStorage("projects-data");

  for (object of projectsData) {
    if (object.isActive) {
      for (task of object.tasks) {
        if (task.name == taskName)
          return notifyWith("this task already exsist");
      }

      object.tasks.push({
        name: taskName,
        description: taskDesc,
        status: 1,
        date: new Date(),
      });
    }
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  saveTimerData();
  appendTabsFrom(getFromStorage("projects-data"));
});

//! Drag and drop tasks

let taskSects = document.querySelectorAll(".board .sect");

function onDragOver(e) {
  e.preventDefault();

  let dragging = document.querySelector(".dragging");
  let taskCont = this.querySelector(".task-cont");

  let projectsData = getFromStorage("projects-data");

  for (obj of projectsData) {
    if (!obj.isActive) continue;

    for (task of obj.tasks) {
      if (task.name != dragging.getAttribute("data-name")) continue;

      if (taskCont.id == "todo") {
        task.status = 1;
      } else if (taskCont.id == "in-progress") {
        task.status = 2;
      } else if (taskCont.id == "completed") {
        task.status = 3;
      }
    }
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  taskCont.append(dragging);
}

taskSects.forEach((sect) => {
  sect.addEventListener("dragover", onDragOver);
});

// ! clear board

let clearBoardBtn = document.querySelector("aside .task-control .clear-board");

clearBoardBtn.addEventListener("click", function () {
  let confirmModal = document.createElement("div");
  confirmModal.classList.add("confirm-modal");

  confirmModal.innerHTML = `
  <p>are you sure you wan't to clear the board?</p>
  <div class="row">
    <button class="yes">yes</button>
    <button class="no">no</button>
  </div>
  `;

  let confirmModalOverlay = document.createElement("div");
  confirmModalOverlay.classList.add("confirm-modal-overlay");

  document.body.append(confirmModal, confirmModalOverlay);
});

document.addEventListener("click", function (e) {
  if (
    e.target.classList.contains("yes") &&
    document.querySelector(".confirm-modal") != null
  )
    clearActiveProjectBoard();
});

document.addEventListener("click", function (e) {
  if (
    e.target.classList.contains("no") &&
    document.querySelector(".confirm-modal") != null
  ) {
    document.querySelector(".confirm-modal").remove();
    document.querySelector(".confirm-modal-overlay").remove();
  }
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

// ! Timer start and stop
function saveTimerData(clearCounters) {
  let projectsData = getFromStorage("projects-data");

  for (obj of projectsData) {
    if (!obj.isActive) continue;

    obj.workTime = timeBox.textContent.split(":").map((el) => +el);
    console.log(obj.workTime);
  }

  localStorage.setItem("projects-data", JSON.stringify(projectsData));

  if (clearCounters) {
    secCounter = 0;
    minutesCounter = 0;
    hoursCounter = 0;
  }
}
let timeBox = document.querySelector(".progress-data .timer-data .time");
let startTimerBtn = document.querySelector(".progress-data .timer-data .start");
let stopTimerBtn = document.querySelector(".progress-data .timer-data .stop");

startTimerBtn.addEventListener("click", () => {
  if (startTimerBtn.classList.contains("active")) {
    return;
  } else {
    timerInterval = setInterval(() => {
      secCounter++;
      if (secCounter === 60) {
        secCounter = 0;
        minutesCounter++;
      }

      if (minutesCounter === 60) {
        minutesCounter = 0;
        hoursCounter++;
      }

      timeBox.textContent = `${
        hoursCounter < 10 ? `0${hoursCounter}` : hoursCounter
      }:${minutesCounter < 10 ? `0${minutesCounter}` : minutesCounter}:${
        secCounter < 10 ? `0${secCounter}` : secCounter
      }`;
    }, 1000);

    startTimerBtn.classList.add("active");
  }
});

function stopTimer() {
  clearInterval(timerInterval);

  saveTimerData();

  startTimerBtn.classList.remove("active");
}

stopTimerBtn.addEventListener("click", stopTimer);

