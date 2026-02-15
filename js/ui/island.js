// js/ui/island.js

export const islandController = {
    init() {
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');
        this.iconMusic = document.getElementById('icon-music');
        this.iconTimer = document.getElementById('icon-timer');

        this.statuses = new Map();
        this.sortedKeys = [];
        this.autoShrinkTimeout = null;

        if (!this.island) return;

        // EVENT KLIK: Manual Expand
        this.island.onclick = (e) => {
            e.stopPropagation();
            if (this.island.classList.contains('expanded')) {
                this.shrink();
            } else {
                this.expand();
                this.resetAutoShrink(5000); // Klik manual juga kecil lagi setelah 5 detik
            }
        };

        this.render();
    },

    setStatus(key, { text, icon, priority = 0 }) {
        this.statuses.set(key, { text, icon, priority });
        this.sortStatuses();
        this.render();

        // LOGIKA BARU:
        // 1. Muncul dalam mode bulat (shrink)
        this.shrink(); 
        
        // 2. Jeda 0.5 detik (500ms) baru melebar
        setTimeout(() => {
            if (this.sortedKeys.length > 0) {
                this.expand();
                // 3. Tampilkan teks selama 5 detik, lalu balik jadi bulat (idle)
                this.resetAutoShrink(5000);
            }
        }, 500);
    },

    removeStatus(key) {
        this.statuses.delete(key);
        this.sortStatuses();
        this.render();
    },

    sortStatuses() {
        this.sortedKeys = [...this.statuses.entries()]
            .sort((a, b) => b[1].priority - a[1].priority)
            .map(entry => entry[0]);
    },

    expand() {
        this.island?.classList.add('expanded');
    },

    shrink() {
        this.island?.classList.remove('expanded');
    },

    resetAutoShrink(ms) {
        clearTimeout(this.autoShrinkTimeout);
        this.autoShrinkTimeout = setTimeout(() => {
            this.shrink();
        }, ms);
    },

    render() {
        if (this.sortedKeys.length === 0) {
            this.container?.classList.add('island-hidden');
            return;
        }

        this.container?.classList.remove('island-hidden');
        
        const active = this.statuses.get(this.sortedKeys[0]);
        if (active) {
            this.textSpan.textContent = active.text;
            this.showIcon(active.icon);
        }
    },

    showIcon(type) {
        this.iconMusic?.classList.toggle('hidden', type !== 'music');
        this.iconTimer?.classList.toggle('hidden', type !== 'timer');
    }
};

window.islandController = islandController;
