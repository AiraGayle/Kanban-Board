// Kanban Board Functions

const columns = document.querySelectorAll(".column");
let tasks = JSON.parse(localStorage.getItem("tasks")) || []
const addTaskFormTemplate = document.querySelector("#add-task-form-template");
const editTaskFormTemplate = document.querySelector("#edit-task-form-template");

// Save Tasks
function saveTask() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Create a task
function createTaskElement(task) {
    const div = document.createElement("div");
    div.className = "task";
    div.dataset.taskId = task.id;

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

    // Add action buttons container
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.setAttribute("aria-label", "Edit Task");

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete Task");

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    div.appendChild(actionsDiv);

    // Edit button event listener
    editBtn.addEventListener("click", () => {
        // Find the parent column
        const parentColumn = div.closest(".column");
        showEditForm(task, parentColumn);
    });

    // Delete button event listener
    deleteBtn.addEventListener("click", () => {
        deleteTask(task.id);
    });

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
        id: Date.now(),
        title: title.trim(), 
        note: note.trim(),
        column,
        priority
    };
    tasks.push(newTask);
    saveTask();
    displayTasks();
}

// Delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTask();
    displayTasks();
}

// Update a task
function updateTask(taskId, title, note, priority) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.title = title.trim();
        task.note = note.trim();
        task.priority = priority;
        saveTask();
        displayTasks();
    }
}

// Show edit form for a task
function showEditForm(task, column) {
    // Hide all other edit forms
    document.querySelectorAll(".edit-task-section:not([hidden])").forEach(form => {
        form.hidden = true;
    });

    const editForm = column.querySelector(".edit-task-section");
    const editTitleInput = editForm.querySelector(".edit-task-name-form");
    const editNoteInput = editForm.querySelector(".edit-task-note-form");
    const editPriorityInput = editForm.querySelector(".edit-task-priority-input");
    const editConfirmButton = editForm.querySelector(".edit-confirm-btn");
    const editCancelButton = editForm.querySelector(".edit-cancel-btn");

    // Pre-fill the form with current task values
    editTitleInput.value = task.title;
    editNoteInput.value = task.note;
    editPriorityInput.value = task.priority;

    editForm.hidden = false;
    editTitleInput.focus();

    // Clear previous event listeners by cloning
    const newConfirmButton = editConfirmButton.cloneNode(true);
    editConfirmButton.parentNode.replaceChild(newConfirmButton, editConfirmButton);

    const newCancelButton = editCancelButton.cloneNode(true);
    editCancelButton.parentNode.replaceChild(newCancelButton, editCancelButton);

    // Add new event listener for confirm
    newConfirmButton.addEventListener("click", () => {
        if (editTitleInput.value.trim() === "") return;

        updateTask(
            task.id,
            editTitleInput.value,
            editNoteInput.value,
            editPriorityInput.value
        );

        editForm.hidden = true;
    });

    // Add new event listener for cancel
    newCancelButton.addEventListener("click", () => {
        editForm.hidden = true;
    });
}
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
// Clone edit form into each column
columns.forEach(column => {
    const editTemplate = document.querySelector("#edit-task-form-template");
    const editClone = editTemplate.content.cloneNode(true);
    const editForm = editClone.querySelector(".edit-task-section");
    const tasksContainer = column.querySelector(".tasks");
    column.insertBefore(editForm, tasksContainer);
});
displayTasks();