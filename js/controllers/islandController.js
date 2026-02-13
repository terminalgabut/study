// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        island.onclick = () => {
            if (island.classList.contains('icon-only')) {
                const textSpan = document.getElementById('island-text');
                const currentMsg = textSpan ? textSpan.textContent : "Music Playing";
                const isTimer = !document.getElementById('icon-music').classList.contains('hidden') === false;
                this.expandTemporary(currentMsg);
            }
        };
    },

    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        if (!container) return;

        // 1. Pastikan container muncul di DOM terlebih dahulu
        container.classList.remove('island-hidden');
        
        // 2. Atur Icon yang sesuai
        const isMusic = type === 'music';
        document.getElementById('icon-music')?.classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer')?.classList.toggle('hidden', isMusic);

        // 3. Panggil expand dengan sedikit delay (trick agar transisi CSS terbaca)
        setTimeout(() => {
            this.expandTemporary(message);
        }, 50);
    },

    expandTemporary(message) {
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');
        if (!island) return;

        // Bersihkan timeout lama agar tidak bentrok
        if (this.timeout) clearTimeout(this.timeout);

        // MELEBAR
        island.classList.remove('icon-only');
        island.classList.add('expanded');
        
        if (textSpan) {
            textSpan.textContent = message;
            textSpan.style.opacity = "1";
        }

        // Timer untuk MENGUNCUP setelah 6 detik
        this.timeout = setTimeout(() => {
            island.classList.remove('expanded');
            island.classList.add('icon-only');
        }, 6000);
    },

    hide() {
        const container = document.getElementById('dynamic-island-container');
        if (this.timeout) clearTimeout(this.timeout);
        if (container) container.classList.add('island-hidden');
    }
};
