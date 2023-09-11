addTaskBtn.addEventListener("click", () => {
  let taskValue = taskTextArea.value;
  if (taskValue === "") return;
  taskTextArea.value = "";

  let activeProjectP = document.querySelector(
    "aside .projects-box .proj.active P",
  );
  console.log(activeProjectP);
  let projectsData = JSON.parse(localStorage.getItem("projects-tabs"));

  for (object of projectsData) {
    if (object.isActive !== true) return;

    object.tasks.push({ value: taskValue, status: 1 });

    localStorage.setItem("projects-tabs", JSON.stringify(projectsData));
  }

  appendTasksFrom(activeProjectP);
});
