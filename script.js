// Kanban Board Functions

const columns = document.querySelectorAll(".column");
let tasks = JSON.parse(localStorage.getItem("tasks")) || []
const addTaskFormTemplate = document.querySelector("#add-task-form-template");

// Save Tasks
function saveTask() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Create a task
function createTaskElement(task) {
    const div = document.createElement("div");
    div.className = "task";

    const titleDiv = document.createElement("div");
    titleDiv.className = "task-title";
    titleDiv.textContent = task.title;

    div.appendChild(titleDiv);

    if (task.note.trim()) {
        const noteDiv = document.createElement("div");
        noteDiv.className = "task-note";
        noteDiv.textContent = task.note;
        div.appendChild(noteDiv);
    }

    const priorityDiv = document.createElement("div");
    priorityDiv.className = `task-priority ${task.priority.toLowerCase()}`;
    priorityDiv.textContent = `${task.priority} Priority`
    div.appendChild(priorityDiv);

    return div;
}

// Display loaded tasks
function displayTasks() {
    columns.forEach(column => {
        const taskContainer = column.querySelector(".tasks");
        taskContainer.innerHTML = "";
        const columnName = column.dataset.column;

        tasks
            .filter(task => task.column == columnName)
            .forEach(task => taskContainer.appendChild(createTaskElement(task)));
    });
}

// Create a task
function createNewTask(title, note, column, priority = "Low") {
    if (!title.trim()) {
        return;
    }

    const newTask = {
        title: title.trim(), 
        note: note.trim(),
        column,
        priority
    };
    tasks.push(newTask);
    saveTask();
    displayTasks();
}

// Get data for each column
columns.forEach(column => {
    const addButton = column.querySelector(".add-btn");

    // Use add task form from template
    const template = document.querySelector("#add-task-form-template");
    const clone = template.content.cloneNode(true);
    const form = clone.querySelector(".add-task-section");
    const tasksContainer = column.querySelector(".tasks");
    column.insertBefore(form, tasksContainer);

    const titleInput = form.querySelector(".task-name-form");
    const noteInput = form.querySelector(".task-note-form");
    const cancelButton = form.querySelector(".cancel-btn");
    const confirmButton = form.querySelector(".confirm-btn");
    const priorityInput = form.querySelector(".task-priority-input");

    // If + button is clicked
    addButton.addEventListener("click", () => {
        form.hidden = false;
        titleInput.focus();
    });

    cancelButton.addEventListener("click", () => {
        form.hidden = true;
        titleInput.value = "";
        noteInput.value = "";
        priorityInput.value = "Low";
    })

    confirmButton.addEventListener("click", () => {
        if (titleInput.value.trim() === "") return;

        createNewTask(
            titleInput.value,
            noteInput.value,
            column.dataset.column,
            priorityInput.value
        );

        titleInput.value = "";
        noteInput.value = "";
        priorityInput.value = "Low";
        form.hidden = true;
    })
});

displayTasks();