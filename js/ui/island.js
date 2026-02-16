// js/ui/island.js

/* =========================
   ISLAND VIEW (TAMPILAN)
========================= */
class IslandView {
    constructor() {
        this.island = null;
        this.container = null;
        this.textSpan = null;
        this.iconMusic = null;
        this.iconTimer = null;

        this.autoShrinkTimeout = null;
    }

    init() {
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');
        this.iconMusic = document.getElementById('icon-music');
        this.iconTimer = document.getElementById('icon-timer');

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

    show(text, icon, isNewStatus) {
        if (!this.container) return;

        if (this.textSpan) this.textSpan.textContent = text;
        this.showIcon(icon);

        if (isNewStatus || this.container.classList.contains('island-hidden')) {
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

    showIcon(type) {
        this.iconMusic?.classList.toggle('hidden', type !== 'music');
        this.iconTimer?.classList.toggle('hidden', type !== 'timer');
    }
}

/* =========================
   UX BRAIN (LOGIKA)
========================= */
class UXBrain {
    constructor(view) {
        this.view = view;
        this.statuses = new Map();
        this.sortedKeys = [];
    }

    setStatus(key, { text, icon, priority = 0 }) {
        const isNewStatus = !this.statuses.has(key);
        this.statuses.set(key, { text, icon, priority });

        this.sortStatuses();
        this.render(isNewStatus);
    }

    removeStatus(key) {
        this.statuses.delete(key);
        this.sortStatuses();

        if (this.statuses.size === 0) {
            this.view.hide();
        } else {
            this.render(false);
        }
    }

    sortStatuses() {
        this.sortedKeys = [...this.statuses.entries()]
            .sort((a, b) => b[1].priority - a[1].priority)
            .map(entry => entry[0]);
    }

    render(isNewStatus) {
        if (this.sortedKeys.length === 0) return;

        const active = this.statuses.get(this.sortedKeys[0]);
        if (!active) return;

        this.view.show(active.text, active.icon, isNewStatus);
    }
}

/* =========================
   CONTROLLER (FACADE)
   agar kode lama tetap jalan
========================= */
const islandView = new IslandView();
const uxBrain = new UXBrain(islandView);

export const islandController = {
    init() {
        islandView.init();
    },

    setStatus(key, data) {
        uxBrain.setStatus(key, data);
    },

    removeStatus(key) {
        uxBrain.removeStatus(key);
    }
};

window.islandController = islandController;
