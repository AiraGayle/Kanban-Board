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
├── index.html                        # Main HTML file
├── main.js                           # Application initialization
├── components/
│   ├── board/
│   │   ├── board-callbacks.js        # Board-level event callbacks
│   │   ├── board-keyboard.js         # Keyboard navigation and shortcuts
│   │   ├── board-tasks.js            # Task state coordination across columns
│   │   ├── board.css                 # Board layout styles
│   │   └── board.js                  # Board — coordinates columns, tasks state, keyboard shortcuts
│   ├── card/
│   │   ├── card-drag.js              # Drag & touch handling, edge-scroll logic
│   │   ├── card-edit.js              # Edit mode toggle and form interactions
│   │   ├── card-view.js              # View mode rendering
│   │   ├── card.css                  # Card styles
│   │   └── card.js                   # Card — DOM, view/edit toggle, and events
│   ├── column/
│   │   ├── column.css                # Column styles
│   │   └── column.js                 # Column — task list rendering and drop targets
│   ├── task/
│   │   ├── task.css                  # Task styles
│   │   └── task.js                   # Task — data model and DOM creation
│   └── task-form/
│       ├── task-form.css             # Task form styles
│       └── task-form.js              # Task form — create and edit task inputs
├── services/
│   ├── storage-service.js            # Handles localStorage operations
│   └── task-service.js               # Task business logic
├── styles/
│   └── base.css                      # Global base styles and CSS variables
├── utils/
│   └── dom-utils.js                  # Shared DOM helper utilities
└── README.md                         # This file
```

## Made With

- JavaScript
- HTML
- CSS

## Acknowledgments

Created as part of Lab Exercise 1: Dynamic UI, DOM API, LocalStorage
