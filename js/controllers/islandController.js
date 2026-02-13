export const islandController = {
    timeout: null,
    isExpiring: false, // Tambahan state baru

    show(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        
        if (!container || !island) return;

        // Reset state
        this.isExpiring = false; 
        container.classList.remove('island-hidden');
        island.classList.remove('icon-only');
        island.classList.add('expanded');
        
        document.getElementById('island-text').textContent = message;

        // Atur Icon
        const isMusic = type === 'music';
        document.getElementById('icon-music').classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer').classList.toggle('hidden', isMusic);

        if (this.timeout) clearTimeout(this.timeout);

        // Biarkan melebar selama 6 detik
        this.timeout = setTimeout(() => {
            island.classList.remove('expanded');
            island.classList.add('icon-only');
            this.isExpiring = true; // Tandai bahwa sekarang hanya icon
        }, 6000);
    },

    hide() {
        const container = document.getElementById('dynamic-island-container');
        // HANYA sembunyikan jika tidak sedang dalam proses 'show' atau user mematikan musik
        if (container) {
            container.classList.add('island-hidden');
        }
    }
};
