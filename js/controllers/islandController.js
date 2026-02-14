// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,
    isLocked: false,

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        island.onclick = () => {
            if (island.classList.contains('icon-only')) {
                const msg = document.getElementById('island-text').textContent;
                this.show(msg);
            }
        };
    },

    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');

        if (!container || !island || !textSpan) return;

        // Kunci status & bersihkan timeout
        this.isLocked = true;
        if (this.timeout) clearTimeout(this.timeout);

        // 1. Siapkan Konten & Icon (Lakukan saat masih hidden agar tidak flickr)
        textSpan.textContent = message;
        const isMusic = type === 'music';
        document.getElementById('icon-music')?.classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer')?.classList.toggle('hidden', isMusic);

        // 2. Munculkan Container
        container.classList.remove('island-hidden');

        // 3. Teknik Double Frame agar transisi 'Melebar' pasti jalan
        requestAnimationFrame(() => {
            // Pastikan properti display/opacity tidak terkunci CSS
            textSpan.style.display = "inline-block"; 
            
            requestAnimationFrame(() => {
                island.classList.remove('icon-only');
                island.classList.add('expanded');
            });
        });

        // 4. Timer kembali ke wujud icon (6 detik)
        this.timeout = setTimeout(() => {
            this.isLocked = false;
            island.classList.remove('expanded');
            island.classList.add('icon-only');
            
            // Opsional: sembunyikan teks setelah animasi menguncup selesai
            setTimeout(() => {
                if(island.classList.contains('icon-only')) {
                    textSpan.style.display = "none";
                }
            }, 600);
        }, 6000);
    },

    hide() {
        if (this.isLocked) return;
        const container = document.getElementById('dynamic-island-container');
        if (container) container.classList.add('island-hidden');
    }
};
