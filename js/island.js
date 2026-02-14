// js/island.js

export const islandController = {

    init() {
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');

        this.iconMusic = document.getElementById('icon-music');
        this.iconTimer = document.getElementById('icon-timer');

        this.statuses = new Map();   // semua status aktif
        this.currentKey = null;      // status yg sedang tampil
        this.cycleInterval = null;
        this.autoShrinkTimeout = null;

        if (this.island) {
            this.island.onclick = () => {
                if (this.island.classList.contains('expanded')) {
                    this.shrink();
                } else {
                    this.expand(false);
                }
            };
        }

        this.render();
    },

    /* ==============================
       STATUS MANAGEMENT
    =============================== */

    setStatus(key, { text, icon }) {
        this.statuses.set(key, { text, icon });
        this.startCycle();
        this.render();
    },

    removeStatus(key) {
        this.statuses.delete(key);
        this.startCycle();
        this.render();
    },

    /* ==============================
       CYCLING (Jika > 1 aktif)
    =============================== */

    startCycle() {
        clearInterval(this.cycleInterval);

        const keys = [...this.statuses.keys()];
        if (keys.length === 0) {
            this.currentKey = null;
            return;
        }

        if (keys.length === 1) {
            this.currentKey = keys[0];
            return;
        }

        let index = 0;
        this.currentKey = keys[index];

        this.cycleInterval = setInterval(() => {
            index = (index + 1) % keys.length;
            this.currentKey = keys[index];
            this.render();
        }, 4000);
    },

    /* ==============================
       RENDER
    =============================== */

    render() {
        const keys = [...this.statuses.keys()];

        if (keys.length === 0) {
            this.container?.classList.add('island-hidden');
            this.shrink();
            return;
        }

        this.container?.classList.remove('island-hidden');

        const active = this.statuses.get(this.currentKey);
        if (!active) return;

        this.updateText(active.text);
        this.showIcon(active.icon);

        if (!this.island.classList.contains('expanded')) {
            this.island.classList.add('icon-only');
        }
    },

    /* ==============================
       VISUAL CONTROL
    =============================== */

    expand(auto = false) {
        this.island.classList.remove('icon-only');
        this.island.classList.add('expanded');

        if (auto) {
            clearTimeout(this.autoShrinkTimeout);
            this.autoShrinkTimeout = setTimeout(() => {
                this.shrink();
            }, 5000);
        }
    },

    shrink() {
        this.island.classList.add('icon-only');
        this.island.classList.remove('expanded');
    },

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
