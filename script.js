// Kanban Board Functions

// Get all columns
const columns = document.querySelectorAll(".column");
// Load tasks or empty list
let tasks = JSON.parse(localStorage.getItem("tasks")) || []

function saveTask() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// display loaded tasks
function displayTasks() {
    columns.forEach(column => {
        const taskContainer = column.querySelector(".tasks");
        taskContainer.innerHTML = "";

        const columnName = column.dataset.column;

        tasks
            .filter(task => task.column == columnName)
            .forEach(task => {
                const div = document.createElement("div");
                div.className = "task";
                div.innerHTML = `${task.title}<p>${task.note}</p>`;
                taskContainer.appendChild(div);
            });
    });
}

// Get data for each column
columns.forEach(column => {
    const addButton = column.querySelector(".add-btn");
    const form = column.querySelector(".add-task");
    const titleInput = form.querySelector(".task-name");
    const noteInput = form.querySelector(".task-note");
    const cancelButton = form.querySelector(".cancel-btn");
    const confirmButton = form.querySelector(".confirm-btn");

    addButton.addEventListener("click", () => {
        form.hidden = false;
        titleInput.focus();
    });

    cancelButton.addEventListener("click", () => {
        form.hidden = true;
        titleInput.value = "";
        noteInput.value = "";
    })

    confirmButton.addEventListener("click", () => {
        if (titleInput.value.trim() === "") return;

        const newTask = {
            title: titleInput.value,
            note: noteInput.value,
            column: column.dataset.column
        };

        tasks.push(newTask);
        saveTask();
        displayTasks();

        titleInput.value = "";
        noteInput.value = "";
        form.hidden = true;
    })
});

displayTasks();