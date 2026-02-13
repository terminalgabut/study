// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        island.onclick = () => {
            // Klik untuk "Peek" (melihat judul sebentar saat status aktif)
            if (island.classList.contains('icon-only')) {
                const msg = document.getElementById('island-text').textContent;
                this.expandTemporary(msg);
            }
        };
    },

    // Dipanggil saat musik mulai/ganti lagu
    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        
        if (!container || !island) return;

        // Pastikan container terlihat (Status: On)
        container.classList.remove('island-hidden');
        
        // Atur Icon
        const isMusic = type === 'music';
        document.getElementById('icon-music').classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer').classList.toggle('hidden', isMusic);

        this.expandTemporary(message);
    },

    // Fungsi untuk melebar lalu mengecil otomatis (tapi tidak hilang)
    expandTemporary(message) {
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');

        if (this.timeout) clearTimeout(this.timeout);

        island.classList.remove('icon-only');
        island.classList.add('expanded');
        if (textSpan) textSpan.textContent = message;

        this.timeout = setTimeout(() => {
            island.classList.remove('expanded');
            island.classList.add('icon-only');
        }, 6000);
    },

    // Hanya dipanggil saat musik benar-benar STOP/PAUSE
    hide() {
        const container = document.getElementById('dynamic-island-container');
        if (container) container.classList.add('island-hidden');
    }
};
