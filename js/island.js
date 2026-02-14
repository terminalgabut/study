// js/island.js

export const islandController = {

    init() {
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');

        this.iconMusic = document.getElementById('icon-music');
        this.iconTimer = document.getElementById('icon-timer');

        this.statuses = new Map();
        this.sortedKeys = [];
        this.currentIndex = 0;

        this.cycleInterval = null;
        this.autoShrinkTimeout = null;
        this.isManuallyExpanded = false;

        if (this.island) {
            this.island.onclick = () => {
                if (this.island.classList.contains('expanded')) {
                    this.isManuallyExpanded = false;
                    this.shrink();
                    this.resumeCycle();
                } else {
                    this.isManuallyExpanded = true;
                    this.expand(false);
                    this.pauseCycle();
                }
            };
        }

        this.render();
    },

    /* =========================
       STATUS MANAGEMENT
    ========================== */

    setStatus(key, {
        text,
        icon,
        priority = 0,
        persistent = false
    }) {
        this.statuses.set(key, { text, icon, priority, persistent });
        this.sortStatuses();
        this.startCycle();
        this.render();
    },

    removeStatus(key) {
        this.statuses.delete(key);
        this.sortStatuses();
        this.startCycle();
        this.render();
    },

    sortStatuses() {
        this.sortedKeys = [...this.statuses.entries()]
            .sort((a, b) => b[1].priority - a[1].priority)
            .map(entry => entry[0]);

        this.currentIndex = 0;
    },

    /* =========================
       CYCLING SYSTEM
    ========================== */

    startCycle() {
        clearInterval(this.cycleInterval);

        if (this.sortedKeys.length <= 1) return;

        this.cycleInterval = setInterval(() => {
            if (this.isManuallyExpanded) return;

            this.currentIndex =
                (this.currentIndex + 1) % this.sortedKeys.length;

            this.render();
        }, 4000);
    },

    pauseCycle() {
        clearInterval(this.cycleInterval);
    },

    resumeCycle() {
        this.startCycle();
    },

    /* =========================
       RENDER
    ========================== */

    render() {
        if (this.sortedKeys.length === 0) {
            this.container?.classList.add('island-hidden');
            this.shrink();
            return;
        }

        this.container?.classList.remove('island-hidden');

        const key = this.sortedKeys[this.currentIndex];
        const active = this.statuses.get(key);
        if (!active) return;

        this.updateText(active.text);
        this.showIcon(active.icon);

        if (!this.island.classList.contains('expanded')) {
            this.island.classList.add('icon-only');
        }
    },

    /* =========================
       VISUAL CONTROL
    ========================== */

    expand(auto = false) {
        this.island.classList.remove('icon-only');
        this.island.classList.add('expanded');

        if (auto) {
            clearTimeout(this.autoShrinkTimeout);

            const current =
                this.statuses.get(this.sortedKeys[this.currentIndex]);

            if (!current?.persistent) {
                this.autoShrinkTimeout = setTimeout(() => {
                    if (!this.isManuallyExpanded) {
                        this.shrink();
                    }
                }, 5000);
            }
        }
    },

    shrink() {
        this.island.classList.add('icon-only');
        this.island.classList.remove('expanded');
    },

    /* =========================
       ICON + TEXT
    ========================== */

    showIcon(type) {
        this.iconMusic?.classList.add('hidden');
        this.iconTimer?.classList.add('hidden');

        if (type === 'timer') {
            this.iconTimer?.classList.remove('hidden');
        } else if (type === 'music') {
            this.iconMusic?.classList.remove('hidden');
        }
    },

    updateText(text) {
        if (this.textSpan) {
            this.textSpan.textContent = text;
        }
    }
};

window.islandController = islandController;
