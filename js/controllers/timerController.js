// study/js/controllers/timerController.js

export const timerController = {
    init() {
        const startBtn = document.getElementById('startTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        const input = document.getElementById('timerInput');

        // 1. SINKRONISASI AWAL
        // Saat halaman dimuat, tanya ke Island: "Lagi jalanin timer gak?"
        const state = window.islandController.getTimerState();
        if (state.isActive) {
            this.render(state.timeLeft);
            this.toggleButtons(true);
        }

        // 2. LISTEN KE DETIKAN ISLAND (Real-time update)
        // Kita gunakan window listener agar saat Island berdetak, angka di page ini ikut berubah
        window.removeEventListener('timerTick', this._handleTick); // Bersihkan agar tidak double
        this._handleTick = (e) => {
            this.render(e.detail.seconds);
        };
        window.addEventListener('timerTick', this._handleTick);

        // 3. LISTEN KETIKA TIMER SELESAI
        window.addEventListener('timerFinished', () => {
            this.toggleButtons(false);
            this.render(0);
        });

        // 4. EVENT TOMBOL
        if (startBtn) {
            startBtn.onclick = () => {
                const mins = input.value || 25;
                // Perintah ke Island untuk mulai mesin timer
                window.islandController.startTimer(mins);
                this.toggleButtons(true);
            };
        }

        if (stopBtn) {
            stopBtn.onclick = () => {
                // Perintah ke Island untuk stop mesin timer
                window.islandController.stopTimer();
                this.toggleButtons(false);
            };
        }
    },

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
        document.getElementById('startTimerBtn')?.classList.toggle('hidden', isRunning);
        document.getElementById('stopTimerBtn')?.classList.toggle('hidden', !isRunning);
    }
};
