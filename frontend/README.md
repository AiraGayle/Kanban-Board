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
   Open `index.html` directly in your browser.
   > Note: because ES modules are used, open via a local server (e.g. VS Code Live Server) rather than `file://`.

## Keyboard Shortcuts

| Shortcut       | Action                  |
|----------------|-------------------------|
| Alt + A        | Add task to focused col |
| Alt + E        | Edit selected card      |
| Alt + D        | Delete selected card    |
| Alt + ← / →    | Move card left / right  |
| ← / →          | Switch focused column   |
| ↑ / ↓          | Navigate cards          |

## Project Structure

```
.
├── index.html                          # App shell — structure only
├── main.js                             # Entry point — initializes Board
├── components/
│   ├── board/
│   │   ├── board.js                    # Board class — orchestrates columns & state
│   │   ├── board-callbacks.js          # Builds callback objects for columns & cards
│   │   ├── board-keyboard.js           # Keyboard shortcuts and navigation
│   │   ├── board-tasks.js              # Task CRUD handlers (called by board)
│   │   └── board.css                   # Board layout styles
│   ├── card/
│   │   ├── card.js                     # Card class — lifecycle, events, edit toggle
│   │   ├── card-dom.js                 # Builds card view and edit DOM sections
│   │   ├── card-drag.js                # Drag & touch handling, auto-scroll
│   │   └── card.css                    # Card styles
│   └── column/
│       ├── column.js                   # Column class — rendering, drop handling
│       ├── column-dom.js               # Builds column DOM structure
│       └── column.css                  # Column styles
├── services/
│   ├── storage-service.js              # localStorage read/write
│   └── task-service.js                 # Task business logic (CRUD, ordering)
├── styles/
│   └── base.css                        # CSS variables, reset, dark/light theme
├── utils/
│   └── dom-utils.js                    # Shared makeElement helper
└── README.md
```

## Made With

- JavaScript
- HTML
- CSS

## Acknowledgments

Created as part of Lab Exercise 1: Dynamic UI, DOM API, LocalStorage
