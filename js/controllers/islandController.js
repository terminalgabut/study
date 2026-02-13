// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,

    // Fungsi utama untuk memicu Island muncul
    // type: 'music' atau 'timer'
    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');
        const musicIcon = document.getElementById('icon-music');
        const timerIcon = document.getElementById('icon-timer');

        if (!container || !island) return;

        // 1. Reset & Setup Awal
        container.classList.remove('island-hidden');
        island.classList.remove('icon-only');
        island.classList.add('expanded');
        textSpan.textContent = message;

        // 2. Pilih Icon yang sesuai
        if (type === 'music') {
            musicIcon.classList.remove('hidden');
            timerIcon.classList.add('hidden');
        } else {
            timerIcon.classList.remove('hidden');
            musicIcon.classList.add('hidden');
        }

        // 3. Logika Melebar -> Menguncup
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            island.classList.remove('expanded');
            island.classList.add('icon-only');
        }, 3000);
    },

    // Untuk menghilangkan island saat semua aktivitas berhenti
    hide() {
        const container = document.getElementById('dynamic-island-container');
        if (container) container.classList.add('island-hidden');
    }
};
