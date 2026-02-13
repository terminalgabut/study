// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,
    isLocked: false, // Kunci agar tidak tertimpa updateUI

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        island.onclick = () => {
            if (island.classList.contains('icon-only')) {
                const msg = document.getElementById('island-text').textContent;
                this.show(msg, document.getElementById('icon-music').classList.contains('hidden') ? 'timer' : 'music');
            }
        };
    },

    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');

        if (!container || !island) return;

        // Kunci status agar updateUI tidak bisa mengubah ke icon-only
        this.isLocked = true;

        // 1. Setup Konten
        if (textSpan) textSpan.textContent = message;
        
        const isMusic = type === 'music';
        document.getElementById('icon-music')?.classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer')?.classList.toggle('hidden', isMusic);

        // 2. Tampilkan & Paksa Melebar
        container.classList.remove('island-hidden');
        
        // Gunakan requestAnimationFrame agar transisi CSS 'expanded' pasti terpicu
        requestAnimationFrame(() => {
            island.classList.remove('icon-only');
            island.classList.add('expanded');
        });

        // 3. Timer untuk melepas kunci dan menguncup
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.isLocked = false; // Buka kunci
            island.classList.remove('expanded');
            island.classList.add('icon-only');
        }, 6000);
    },

    hide() {
        // Jangan sembunyikan jika sedang dikunci (lagi pamer judul)
        if (this.isLocked) return;
        
        const container = document.getElementById('dynamic-island-container');
        if (container) container.classList.add('island-hidden');
    }
};
