// mobile-enhancements

//Utility Functions  
function createElement(tag, className = '', html = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
}

function addMetaViewport() {
    if (!document.querySelector('meta[name="viewport"]')) {
        const meta = createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        document.head.appendChild(meta);
    }
}

function preventDoubleTapZoom() {
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) e.preventDefault();
        lastTap = now;
    });
}

function confirmAction(message) {
    return confirm(message);
}

// Core Mobile Kanban Class  
class MobileKanban {
    constructor() {
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.swipeThreshold = 50;
        this.init();
    }

    //Initialization  
    init() {
        this.addTouchHandlersToCards();
        this.setupMobileMenu();
        this.optimizeForMobile();
    }

    //Task Cards Touch Events  
    addTouchHandlersToCards() {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach((card) => this.bindCardEvents(card));
    }

    bindCardEvents(card) {
        card.addEventListener('touchstart', (e) => this.onTouchStart(e, card));
        card.addEventListener('touchend', (e) => this.onTouchEnd(e, card));

        this.addLongPressHandler(card, () => this.showCardOptions(card));
    }

    addLongPressHandler(card, callback) {
        let timer;
        card.addEventListener('touchstart', () => {
            timer = setTimeout(callback, 500);
        });
        ['touchend', 'touchmove'].forEach((evt) => {
            card.addEventListener(evt, () => clearTimeout(timer));
        });
    }

    onTouchStart(e, card) {
        this.touchStartX = e.changedTouches[0].screenX;
        card.style.transform = 'scale(0.98)';
    }

    onTouchEnd(e, card) {
        this.touchEndX = e.changedTouches[0].screenX;
        card.style.transform = 'scale(1)';
        this.handleSwipe(card);
    }

    handleSwipe(card) {
        const distance = this.touchEndX - this.touchStartX;
        if (Math.abs(distance) < this.swipeThreshold) return;

        if (distance > 0) this.archiveCard(card);
        else this.deleteCard(card);
    }

    //Card Actions  
    showCardOptions(card) {
        const actions = [
            { text: 'Edit', action: () => this.editCard(card) },
            { text: 'Move to Top', action: () => this.moveToTop(card) },
            { text: 'Archive', action: () => this.archiveCard(card) },
            { text: 'Delete', action: () => this.deleteCard(card), destructive: true },
        ];
        this.buildActionSheet(actions);
    }

    buildActionSheet(actions) {
        document.querySelector('.action-sheet')?.remove();

        const overlay = createElement('div', 'action-sheet-overlay');
        const content = createElement('div', 'action-sheet-content');
        const sheet = createElement('div', 'action-sheet');
        sheet.appendChild(overlay);
        sheet.appendChild(content);

        actions.forEach(({ text, action, destructive }) => {
            const btn = createElement(
                'button',
                `action-sheet-btn ${destructive ? 'destructive' : ''}`,
                text
            );
            btn.onclick = () => {
                action();
                sheet.remove();
            };
            content.appendChild(btn);
        });

        const cancelBtn = createElement('button', 'action-sheet-btn cancel', 'Cancel');
        cancelBtn.onclick = () => sheet.remove();
        content.appendChild(cancelBtn);

        document.body.appendChild(sheet);
        setTimeout(() => (content.style.transform = 'translateY(0)'), 10);
    }

    archiveCard(card) {
        card.style.opacity = '0.5';
        setTimeout(() => {
            card.style.opacity = '1';
            alert('Card archived (demo)');
        }, 200);
    }

    deleteCard(card) {
        if (confirmAction('Delete this task?')) card.remove();
    }

    editCard(card) {
        alert('Edit functionality (demo)');
    }

    moveToTop(card) {
        card.parentNode.prepend(card);
    }

    //   Mobile Menu  
    setupMobileMenu() {
        const menu = createElement(
            'div',
            'mobile-menu',
            `
            <button class="menu-button" id="mobileMenuBtn">+</button>
            <div class="menu-options" id="menuOptions" style="display:none;">
                <button onclick="showAddTask()">Add Task</button>
                <button onclick="showSettings()">Settings</button>
                <button onclick="toggleTheme()">Toggle Theme</button>
            </div>
        `
        );
        document.body.appendChild(menu);

        const menuBtn = menu.querySelector('#mobileMenuBtn');
        const options = menu.querySelector('#menuOptions');

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            options.style.display = options.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => (options.style.display = 'none'));
        options.addEventListener('click', (e) => e.stopPropagation());
    }

    //Optimize Mobile Experience  
    optimizeForMobile() {
        preventDoubleTapZoom();
        addMetaViewport();
    }
}

//Global Utilities for Menu  
function showAddTask() {
    document.querySelector('.add-task-form')?.scrollIntoView({ behavior: 'smooth' });
}

function showSettings() {
    alert('Settings panel (demo)');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

//   Initialize  
document.addEventListener('DOMContentLoaded', () => new MobileKanban());