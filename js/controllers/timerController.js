// study/js/controllers/timerController.js

export const timerController = {

    init() {
        this.startBtn = document.getElementById('startTimerBtn');
        this.stopBtn = document.getElementById('stopTimerBtn');
        this.resetBtn = document.getElementById('resetTimerBtn');
        this.input = document.getElementById('timerInput');

        this.interval = null;
        this.timeLeft = 0;

        // initial render
        const mins = this.input ? (this.input.value || 25) : 25;
        this.render(mins * 60);
        this.toggleButtons(false);

        /* =========================
           BUTTON EVENTS
        ========================== */

        if (this.startBtn) {
            this.startBtn.onclick = () => {
                const mins = this.input ? (this.input.value || 25) : 25;
                this.start(mins);
            };
        }

        if (this.stopBtn) {
            this.stopBtn.onclick = () => this.stop();
        }

        if (this.resetBtn) {
            this.resetBtn.onclick = () => this.reset();
        }
    },

    /* =========================
       TIMER ENGINE
    ========================== */

    start(minutes) {
        if (this.interval) return; 

        this.timeLeft = minutes * 60;

        this.toggleButtons(true);
        this.render(this.timeLeft);

        // Kirim ke island secara global (Gunakan ?. agar aman)
        window.islandController?.setStatus('timer', {
            text: this.formatTime(this.timeLeft),
            icon: 'timer',
            priority: 10, // Prioritas tinggi agar mengalahkan status musik
            persistent: true
        });

        window.islandController?.expand(true);

        this.interval = setInterval(() => {
            this.timeLeft--;

            if (this.timeLeft <= 0) {
                this.finish();
                return;
            }

            this.render(this.timeLeft);

            // Update Island setiap detik
            window.islandController?.setStatus('timer', {
                text: this.formatTime(this.timeLeft),
                icon: 'timer',
                priority: 10,
                persistent: true
            });

        }, 1000);
    },

    stop() {
        clearInterval(this.interval);
        this.interval = null;

        // Hapus status timer dari island saat stop
        window.islandController?.removeStatus('timer');
        this.toggleButtons(false);
    },

    reset() {
        this.stop();
        const mins = this.input ? (this.input.value || 25) : 25;
        this.render(mins * 60);
    },

    finish() {
        clearInterval(this.interval);
        this.interval = null;

        // Notifikasi Selesai di Island
        window.islandController?.setStatus('timer', {
            text: "Selesai ☕",
            icon: 'timer',
            priority: 10,
            persistent: false
        });

        window.islandController?.expand(true);

        // Hapus otomatis setelah 4 detik
        setTimeout(() => {
            window.islandController?.removeStatus('timer');
        }, 4000);

        this.toggleButtons(false);
        this.render(0);
    },

    /* =========================
       UI RENDER
    ========================== */

    render(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;

        const minEl = document.getElementById('minutes');
        const secEl = document.getElementById('seconds');

        if (minEl && secEl) {
            minEl.textContent = String(m).padStart(2, '0');
            secEl.textContent = String(s).padStart(2, '0');
        }
    },

    toggleButtons(isRunning) {
        if (this.startBtn && this.stopBtn) {
            this.startBtn.classList.toggle('hidden', isRunning);
            this.stopBtn.classList.toggle('hidden', !isRunning);
        }
    },

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
};
