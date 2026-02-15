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
        this.currentIndex = 0;
        this.autoShrinkTimeout = null;

        if (!this.island) return;

        // LOGIKA KLIK: Toggle Lebar/Kecil
        this.island.onclick = (e) => {
            e.stopPropagation();
            if (this.island.classList.contains('expanded')) {
                this.shrink();
            } else {
                this.expand();
                // Jika diklik manual, kita beri waktu 5 detik juga sebelum mengecil lagi
                this.resetAutoShrink(5000);
            }
        };

        this.render();
    },

    setStatus(key, { text, icon, priority = 0 }) {
        this.statuses.set(key, { text, icon, priority });
        this.sortStatuses();
        
        // Update tampilan ke status terbaru/tertinggi
        this.render();

        // EFEK POP-UP: Melebar otomatis saat ada update
        this.expand();
        this.resetAutoShrink(5000); // Otomatis kecil setelah 5 detik
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
        if (!this.island) return;
        this.island.classList.add('expanded');
    },

    shrink() {
        if (!this.island) return;
        this.island.classList.remove('expanded');
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
        
        // Ambil status prioritas tertinggi (indeks 0)
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
