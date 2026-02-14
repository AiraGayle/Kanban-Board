# Kanban Board

A simple, offline Kanban board built using DOM APIs and LocalStorage.

## Features

- Three columns: To Do, Doing, Done
- Create, read, update, refresh, and delete tasks
- Drag and drop tasks between columns
- Full keyboard navigation support
- Mobile responsive design

## Restrictions
- Use only HTML, CSS, and JavaScript
- No frontend libraries or frameworks
- Use DOM APIs only (createElement, appendChild, removeChild, etc.)
- Do not hard-code tasks in HTML
- Do not use SessionStorage
- Do not use any database — LocalStorage is the only storage

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)

## Project Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AiraGayle/Kanban-Board.git
   cd Kanban-Board
   ```

2. **Open the application**
   Open `index.html` in your web browser

## Project Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── main.js             # Application initialization
├── keyboard-shortcuts.js        # Keyboard navigation and commands
├── storage-service.js           # Handles localStorage operations
├── task-dom.js         # Handles task DOM creation and display
├── task-service.js     # Handles task business logic
└── README.md           # This file
```

## Made With

- JavaScript
- HTML
- CSS

## Acknowledgments

Created as part of Lab Exercise 1: Dynamic UI, DOM API, LocalStorage
