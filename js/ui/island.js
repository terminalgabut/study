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
        this.isFirstShow = true; // Penanda untuk pop-up pertama kali

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

        this.render();
    },

    setStatus(key, { text, icon, priority = 0 }) {
        const isNewStatus = !this.statuses.has(key);
        this.statuses.set(key, { text, icon, priority });
        this.sortStatuses();
        
        // Update teks & icon tanpa animasi dulu
        this.render();

        // JALUR LOGIKA ANIMASI:
        // Jika ini status baru atau container tadinya sembunyi
        if (isNewStatus || this.container.classList.contains('island-hidden')) {
            this.container.classList.remove('island-hidden'); // Muncul mode bulat (karena default CSS bulat)
            
            // Jeda 0.5 detik dalam mode bulat sesuai permintaan
            setTimeout(() => {
                this.expand(); // Transisi halus melebar
                this.resetAutoShrink(5000); // Otomatis balik bulat setelah 5 detik
            }, 500);
        }
    },

    removeStatus(key) {
        this.statuses.delete(key);
        this.sortStatuses();
        
        if (this.statuses.size === 0) {
            // Animasi menyusut ke tengah sebelum hilang
            this.shrink(); 
            setTimeout(() => {
                this.container?.classList.add('island-hidden');
            }, 500); // Tunggu animasi shrink selesai baru sembunyi
        } else {
            this.render();
        }
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
        if (this.sortedKeys.length === 0) return;
        
        const active = this.statuses.get(this.sortedKeys[0]);
        if (active) {
            if (this.textSpan) this.textSpan.textContent = active.text;
            this.showIcon(active.icon);
        }
    },

    showIcon(type) {
        this.iconMusic?.classList.toggle('hidden', type !== 'music');
        this.iconTimer?.classList.toggle('hidden', type !== 'timer');
    }
};

window.islandController = islandController;
