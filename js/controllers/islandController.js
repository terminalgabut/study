// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,

    // 1. TAMBAHKAN INIT DI SINI (Agar error 'is not a function' hilang)
    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        island.onclick = () => {
            // Jika diklik saat mode icon, tampilkan info teks lagi
            if (island.classList.contains('icon-only')) {
                const textSpan = document.getElementById('island-text');
                const currentMsg = textSpan ? textSpan.textContent : "";
                const isTimer = !document.getElementById('icon-timer').classList.contains('hidden');
                this.show(currentMsg, isTimer ? 'timer' : 'music');
            }
        };
        console.log("Island Controller Initialized");
    },

    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');
        
        if (!container || !island) return;

        // Reset timeout lama jika ada
        if (this.timeout) clearTimeout(this.timeout);

        // KUNCI: Gunakan requestAnimationFrame agar browser sempat 
        // memproses perubahan state sebelum animasi dimulai (anti 'langsung hilang')
        requestAnimationFrame(() => {
            // Tampilkan container utama
            container.classList.remove('island-hidden');
            
            // Mode Melebar
            island.classList.remove('icon-only');
            island.classList.add('expanded');
            
            // Update Teks & Icon
            if (textSpan) textSpan.textContent = message;
            
            const isMusic = type === 'music';
            document.getElementById('icon-music').classList.toggle('hidden', !isMusic);
            document.getElementById('icon-timer').classList.toggle('hidden', isMusic);
        });

        // Biarkan melebar selama 6 detik agar terbaca
        this.timeout = setTimeout(() => {
            island.classList.remove('expanded');
            island.classList.add('icon-only');
        }, 6000);
    },

    hide() {
        const container = document.getElementById('dynamic-island-container');
        if (container) {
            container.classList.add('island-hidden');
        }
    }
};
