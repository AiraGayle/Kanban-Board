# Kanban Board — Frontend

Vanilla JS offline-first Kanban board with JWT authentication, real-time WebSocket sync, and an offline queue.


## Features

- **Three columns** — To Do · Doing · Done
- **Full task CRUD** — create, edit, move, delete
- **Drag and drop** — mouse and touch support with auto-scroll
- **Full keyboard navigation** — see shortcuts table below
- **Offline-first** — all changes are saved to `localStorage` immediately; an `OfflineQueue` syncs to the backend when connectivity is restored
- **JWT Authentication** — register, login, and logout; session is persisted in `localStorage`
- **Real-time updates** — native WebSocket client receives `TASK_UPDATED` / `TASK_DELETED` events and applies them live without a page refresh
- **Conflict resolution** — last-write-wins via `updated_at` timestamp; server returns its version when it wins so the client can reconcile
- **Mobile responsive** design



## Prerequisites

- A modern web browser
- A local HTTP server (required for ES modules — `file://` URLs do not work)
  - Recommended: [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) — serves on `http://localhost:5500`
- The backend running on `http://localhost:3000` (or your ngrok URL)



## Setup

### 1. Clone the repository

```bash
git clone https://github.com/AiraGayle/Kanban-Board.git
cd Kanban-Board
git checkout develop
```

### 2. Configure the API base URL

Open `frontend/services/AuthService.js` and update `API_BASE` if your backend is not on `localhost:3000`:

```js
// frontend/services/AuthService.js
const API_BASE = 'http://localhost:3000';   // ← change to your ngrok URL if needed
```

Do the same in `frontend/services/StorageService.js`:

```js
const API_BASE = 'http://localhost:3000';
```

### 3. Open the app

Open the `frontend/` folder with VS Code Live Server (right-click `index.html` → **Open with Live Server**) or any other static server. The app loads at `http://localhost:5500`.

### 4. Register and log in

- The landing page (`index.html`) presents the login / register form.
- After successful login, you are redirected to `kanban-board.html`.
- Your JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>` on every API call.



## Offline Testing

1. Open the board while online — tasks load from the backend and are mirrored to `localStorage`.
2. **Disconnect from the internet** (toggle Wi-Fi off).
3. Continue adding, editing, moving, and deleting tasks — all changes persist locally.
4. **Reconnect** — the `OfflineQueue` detects the connection restored event (`window online`) and automatically pushes every queued change to the backend one by one.



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
frontend/
├── index.html                             # Login / register page
├── kanban-board.html                      # Main board shell
├── kanban-board.js                        # Board entry point — bootstraps after auth
├── login.js                               # Auth form logic
├── config.js                              # API base URL — swap local ↔ ngrok here
├── components/
│   ├── auth/
│   │   ├── Auth.js                        # Auth component (register/login forms)
│   │   └── auth.css
│   ├── board/
│   │   ├── Board.js                       # Board class — orchestrates columns & global state
│   │   ├── board-callbacks.js             # Callback objects passed to Column and Card
│   │   ├── board-keyboard.js              # Keyboard shortcuts and focus management
│   │   ├── board-tasks.js                 # Task CRUD handlers (create/update/delete/move)
│   │   └── board.css                      # Board styles
│   ├── card/
│   │   ├── Card.js                        # Card lifecycle, events, edit toggle
│   │   ├── card-dom.js                    # Builds card view and edit DOM nodes
│   │   ├── card-drag.js                   # Entry point — binds drag listeners, handles resize
│   │   ├── card-drag-desktop.js           # HTML5 drag events and ghost image (mouse)
│   │   ├── card-drag-touch.js             # Touch start/move/end/cancel handlers
│   │   ├── card-drag-visual.js            # DOM positioning, drag state, drop dispatch
│   │   ├── card-drag-scroll.js            # Auto-scroll during drag
│   │   └── card.css                       # Card styles
│   └── column/
│       ├── Column.js                      # Column rendering, drop zone handling
│       ├── column-dom.js                  # Builds column DOM structure
│       └── column.css                     # Column styles
├── services/
│   ├── AuthService.js                     # register/login/logout, JWT storage
│   ├── StorageService.js                  # localStorage reads/writes + API sync
│   ├── OfflineQueue.js                    # Queues mutations made while offline
│   ├── TaskService.js                     # Task CRUD and ordering business logic
│   └── ws-client.js                       # WebSocket client, reconnect logic
├── styles/
│   └── base.css                           # CSS variables, reset, dark/light theme
└── utils/
    └── dom-utils.js                       # Shared makeElement helper
```

## Made With

- JavaScript
- HTML
- CSS

## Acknowledgments

Built as Lab Exercise 2: Online Sync Kanban Board.
Extended from Lab Exercise 1: Dynamic UI, DOM API, LocalStorage.