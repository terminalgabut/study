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

        // Kunci status agar tidak diganggu updateUI dari audioController
        this.isLocked = true;
        if (this.timeout) clearTimeout(this.timeout);

        // 1. Setup Konten & Icon
        textSpan.textContent = message;
        
        const isMusic = type === 'music';
        document.getElementById('icon-music')?.classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer')?.classList.toggle('hidden', isMusic);

        // 2. Tampilkan Container Utama (Pop Up Scale)
        container.classList.remove('island-hidden');

        // 3. Eksekusi Animasi Melebar
        requestAnimationFrame(() => {
            // Paksa teks untuk siap ditampilkan
            textSpan.style.display = "inline-block";
            textSpan.style.opacity = "1";
            textSpan.style.visibility = "visible";

            requestAnimationFrame(() => {
                island.classList.remove('icon-only');
                island.classList.add('expanded');
            });
        });

        // 4. Set Timer untuk kembali ke mode icon (setelah 6 detik)
        this.timeout = setTimeout(() => {
            this.isLocked = false; // Buka kunci status
            
            island.classList.remove('expanded');
            island.classList.add('icon-only');

            // Opsional: Sembunyikan teks sepenuhnya setelah animasi menguncup selesai (0.5s)
            setTimeout(() => {
                if (!island.classList.contains('expanded')) {
                    textSpan.style.visibility = "hidden";
                }
            }, 500);
        }, 6000);
    },

    hide() {
        if (this.isLocked) return;
        const container = document.getElementById('dynamic-island-container');
        if (container) container.classList.add('island-hidden');
    }
};
