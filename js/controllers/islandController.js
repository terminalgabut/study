// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,
    isLocked: false,
    isTimerActive: false,

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        island.onclick = () => {
            // Jika diklik dan ada timer aktif, paksa melebar untuk intip waktu
            if (this.isTimerActive) {
                this.announce(document.getElementById('island-text').textContent, 'timer');
            }
        };
    },

    updateText(msg) {
        const textSpan = document.getElementById('island-text');
        if (textSpan) textSpan.textContent = msg;
    },

    announce(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');

        if (!container || !island || !textSpan) return;

        this.isLocked = true;
        if (this.timeout) clearTimeout(this.timeout);

        this.isTimerActive = (type === 'timer');
        textSpan.textContent = message;
        
        // Pilih Icon
        const isMusic = type === 'music';
        document.getElementById('icon-music')?.classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer')?.classList.toggle('hidden', isMusic);

        container.classList.remove('island-hidden');

        // MODE MELEBAR
        requestAnimationFrame(() => {
            island.classList.remove('icon-only');
            island.classList.add('expanded');
            textSpan.style.opacity = "1";
            textSpan.style.visibility = "visible";
        });

        // Kembali jadi bulat setelah 6 detik
        this.timeout = setTimeout(() => {
            this.isLocked = false;
            island.classList.remove('expanded');
            island.classList.add('icon-only');
            
            // Sembunyikan teks saat jadi bulat (Sesuai permintaan: mode bulat icon saja)
            setTimeout(() => {
                if (!island.classList.contains('expanded')) {
                    textSpan.style.visibility = "hidden";
                    textSpan.style.opacity = "0";
                }
            }, 400); 
        }, 6000);
    },

    updateStatus(isActive, type = 'music') {
        if (this.isLocked) return;
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        if (!container || !island) return;

        if (isActive) {
            container.classList.remove('island-hidden');
            island.classList.add('icon-only');
            
            const isMusic = type === 'music';
            this.isTimerActive = (type === 'timer');

            document.getElementById('icon-music')?.classList.toggle('hidden', !isMusic);
            document.getElementById('icon-timer')?.classList.toggle('hidden', isMusic);
            
            // Pastikan teks sembunyi di mode bulat
            const textSpan = document.getElementById('island-text');
            if (textSpan) textSpan.style.visibility = "hidden";
        } else {
            this.isTimerActive = false;
            container.classList.add('island-hidden');
        }
    }
};
