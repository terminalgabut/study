// js/ui/island.js

export const islandController = {
    init() {
        // 1. Ambil elemen dari DOM (dari headerView)
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');
        this.iconMusic = document.getElementById('icon-music');
        this.iconTimer = document.getElementById('icon-timer');

        // 2. State Management
        this.statuses = new Map();
        this.sortedKeys = [];
        this.currentIndex = 0;

        this.cycleInterval = null;
        this.autoShrinkTimeout = null;
        this.isManuallyExpanded = false;

        if (!this.island) {
            console.error("Dynamic Island element not found!");
            return;
        }

        // 3. Event Listener Klik (Expand/Shrink)
        this.island.onclick = (e) => {
            e.stopPropagation();
            if (this.island.classList.contains('expanded')) {
                this.isManuallyExpanded = false;
                this.shrink();
                this.startCycle(); // Lanjutkan putaran status
            } else {
                this.isManuallyExpanded = true;
                this.expand(false); // Buka permanen (manual)
                clearInterval(this.cycleInterval); // Berhenti berputar saat dibuka
            }
        };

        this.render();
        console.log("Island ✅");
    },

    /* =========================
       STATUS MANAGEMENT
    ========================== */

    // Menambah atau update status (misal: 'music' atau 'timer')
    setStatus(key, { text, icon, priority = 0, persistent = false }) {
        this.statuses.set(key, { text, icon, priority, persistent });
        this.sortStatuses();
        
        // Jika status baru punya prioritas tinggi, langsung tampilkan
        if (this.sortedKeys[0] === key) {
            this.currentIndex = 0;
            this.render();
            this.expand(true); // Auto-expand sebentar untuk memberi tahu user
        }
        
        this.startCycle();
    },

    removeStatus(key) {
        this.statuses.delete(key);
        this.sortStatuses();
        
        if (this.sortedKeys.length === 0) {
            this.render(); // Akan menyembunyikan container
        } else {
            this.currentIndex = 0;
            this.render();
            this.startCycle();
        }
    },

    sortStatuses() {
        this.sortedKeys = [...this.statuses.entries()]
            .sort((a, b) => b[1].priority - a[1].priority)
            .map(entry => entry[0]);
    },

    /* =========================
       CYCLING SYSTEM (Monitor Berjalan)
    ========================== */

    startCycle() {
        clearInterval(this.cycleInterval);
        if (this.sortedKeys.length <= 1 || this.isManuallyExpanded) return;

        this.cycleInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.sortedKeys.length;
            this.render();
        }, 4000); // Ganti status setiap 4 detik
    },

    /* =========================
       VISUAL CONTROL (Animasi)
    ========================== */

    render() {
        if (!this.container || !this.island) return;

        // Sembunyikan jika tidak ada status aktif
        if (this.sortedKeys.length === 0) {
            this.container.classList.add('island-hidden');
            return;
        }

        this.container.classList.remove('island-hidden');

        const key = this.sortedKeys[this.currentIndex];
        const active = this.statuses.get(key);
        if (!active) return;

        // Update Konten
        this.updateText(active.text);
        this.showIcon(active.icon);
    },

    expand(auto = false) {
        if (!this.island) return;
        this.island.classList.add('expanded');
        
        if (auto) {
            clearTimeout(this.autoShrinkTimeout);
            this.autoShrinkTimeout = setTimeout(() => {
                if (!this.isManuallyExpanded) {
                    this.shrink();
                }
            }, 3000); // Ciutkan kembali setelah 3 detik
        }
    },

    shrink() {
        if (!this.island) return;
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

// Tempelkan ke window agar bisa dipanggil file lain tanpa import ulang
if (typeof window !== 'undefined') {
    window.islandController = islandController;
}
