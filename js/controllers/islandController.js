// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        // Klik manual: Jika sedang mode icon, klik untuk melihat info kembali
        island.onclick = () => {
            if (island.classList.contains('icon-only')) {
                const currentMsg = document.getElementById('island-text').textContent;
                // Cek icon mana yang sedang aktif (tidak hidden)
                const isTimer = !document.getElementById('icon-timer').classList.contains('hidden');
                this.show(currentMsg, isTimer ? 'timer' : 'music');
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

        // 1. Trigger Pop Up (Hapus class hidden)
        container.classList.remove('island-hidden');

        // 2. Mode MELEBAR
        island.classList.remove('icon-only');
        island.classList.add('expanded');
        
        // 3. Update Konten & Icon
        textSpan.textContent = message;

        if (type === 'music') {
            musicIcon.classList.remove('hidden');
            timerIcon.classList.add('hidden');
        } else {
            timerIcon.classList.remove('hidden');
            musicIcon.classList.add('hidden');
        }

        // 4. Timer untuk MENGUNCUP
        // Gunakan 6000ms (6 detik) agar judul terbaca dengan jelas
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            island.classList.remove('expanded');
            island.classList.add('icon-only');
        }, 6000); 
    },

    hide() {
        const container = document.getElementById('dynamic-island-container');
        if (container) {
            // Menutup dengan efek menyusut ke tengah (scale 0)
            container.classList.add('island-hidden');
        }
    }
};
