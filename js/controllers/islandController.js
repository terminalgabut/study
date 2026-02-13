export const islandController = {
    timeout: null,

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        // Fitur klik: Jika sedang kecil, klik untuk melihat info
        island.onclick = () => {
            if (island.classList.contains('icon-only')) {
                // Ambil pesan terakhir yang ada di span
                const currentMsg = document.getElementById('island-text').textContent;
                const activeIcon = document.getElementById('icon-music').classList.contains('hidden') ? 'timer' : 'music';
                this.show(currentMsg, activeIcon);
            }
        };
    },

    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');
        const musicIcon = document.getElementById('icon-music');
        const timerIcon = document.getElementById('icon-timer');

        if (!container || !island) return;

        // 1. Munculkan container utama
        container.classList.remove('island-hidden');

        // 2. Mode MELEBAR
        island.classList.remove('icon-only');
        island.classList.add('expanded');
        
        // 3. Update Konten
        textSpan.textContent = message;
        textSpan.style.display = "inline-block"; // Pastikan teks terlihat

        if (type === 'music') {
            musicIcon.classList.remove('hidden');
            timerIcon.classList.add('hidden');
        } else {
            timerIcon.classList.remove('hidden');
            musicIcon.classList.add('hidden');
        }

        // 4. Timer untuk MENGUNCUP
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            island.classList.remove('expanded');
            island.classList.add('icon-only');
            // Sembunyikan teks setelah animasi menguncup selesai (opsional via CSS)
        }, 3000);
    },

    hide() {
        const container = document.getElementById('dynamic-island-container');
        if (container) container.classList.add('island-hidden');
    }
};
