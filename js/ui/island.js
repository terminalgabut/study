// js/ui/island.js

// UX BRAIN (LOGIKA STATUS)
class UXBrain {
    constructor() {
        this.statuses = new Map();
    }

    setStatus(key, config) {
        this.statuses.set(key, config);
    }

    removeStatus(key) {
        this.statuses.delete(key);
    }

    getActiveStatus() {
        if (this.statuses.size === 0) return null;

        return [...this.statuses.values()]
            .sort((a, b) => b.priority - a.priority)[0];
    }

    hasStatuses() {
        return this.statuses.size > 0;
    }
}

// ISLAND VIEW (RENDER DOM)
class IslandView {
    constructor() {
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textEl = document.getElementById('island-text');
        this.iconEl = document.getElementById('island-icon');

        this.autoShrinkTimeout = null;
    }

    bindClick() {
        if (!this.island) return;

        this.island.onclick = (e) => {
            e.stopPropagation();
            if (this.island.classList.contains('expanded')) {
                this.shrink();
            } else {
                this.expand();
                this.resetAutoShrink(5000);
            }
        };
    }

    render(status) {
    if (!status) return;

    if (this.textEl && this.textEl.textContent !== status.text) {
        this.textEl.textContent = status.text;
    }

    if (this.iconEl) {
        const newIcon = this.getIcon(status.icon);
        if (this.iconEl.innerHTML !== newIcon) {
            this.iconEl.innerHTML = newIcon;
        }
    }
    }

    getIcon(type) {
    const icons = {
        music: `
                <svg class="island-icon" xmlns="http://www.w3.org/2000/svg"
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
                </svg>`,

        timer: `
               <svg class="island-icon" xmlns="http://www.w3.org/2000/svg"
               width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="12" cy="12" r="10"></circle>
               <polyline points="12 6 12 12 16 14"></polyline>
               </svg>`,

        robot: `
               <svg class="island-icon" xmlns="http://www.w3.org/2000/svg"
               width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <rect x="3" y="11" width="18" height="10" rx="2"></rect>
               <circle cx="12" cy="5" r="2"></circle>
               <path d="M12 7v4"></path>
               </svg>`
    };

    return icons[type] || '';
}

    show() {
        if (!this.container) return;

        const isHidden = this.container.classList.contains('island-hidden');
        if (isHidden) {
            this.container.classList.remove('island-hidden');

            setTimeout(() => {
                this.expand();
                this.resetAutoShrink(5000);
            }, 500);
        }
    }

    hide() {
        this.shrink();
        setTimeout(() => {
            this.container?.classList.add('island-hidden');
        }, 500);
    }

    expand() {
        this.island?.classList.add('expanded');
    }

    shrink() {
        this.island?.classList.remove('expanded');
    }

    resetAutoShrink(ms) {
        clearTimeout(this.autoShrinkTimeout);
        this.autoShrinkTimeout = setTimeout(() => {
            this.shrink();
        }, ms);
    }
}

// CONTROLLER (FACADE)
export const islandController = {
    init() {
        this.brain = new UXBrain();
        this.view = new IslandView();

        if (!this.view.island) return;

        this.view.bindClick();
    },

    setStatus(key, { text, icon, priority = 0 }) {
        const isNew = !this.brain.statuses.has(key);

        this.brain.setStatus(key, { text, icon, priority });
        const active = this.brain.getActiveStatus();

        this.view.render(active);

        if (isNew || this.view.container.classList.contains('island-hidden')) {
            this.view.show();
        }
    },

    removeStatus(key) {
        this.brain.removeStatus(key);

        if (!this.brain.hasStatuses()) {
            this.view.hide();
        } else {
            const active = this.brain.getActiveStatus();
            this.view.render(active);
        }
    }
};

// global access (untuk modul lain)
window.islandController = islandController;
