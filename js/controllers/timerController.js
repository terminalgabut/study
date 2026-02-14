// study/js/controllers/timerController.js

export const timerController = {
    init() {
        const startBtn = document.getElementById('startTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        const resetBtn = document.getElementById('resetTimerBtn'); 
        const input = document.getElementById('timerInput');

        // 1. SINKRONISASI AWAL
        // Mengecek apakah ada timer yang sudah berjalan di Island
        const state = window.islandController.getTimerState();
        if (state && state.isActive) {
            this.render(state.timeLeft);
            this.toggleButtons(true);
        } else if (input) {
            // Jika tidak ada timer aktif, tampilkan angka sesuai input
            this.render((input.value || 25) * 60);
        }

        // 2. LISTEN KE DETIKAN ISLAND (Real-time update)
        window.removeEventListener('timerTick', this._handleTick);
        this._handleTick = (e) => {
            if (e.detail && typeof e.detail.seconds !== 'undefined') {
                this.render(e.detail.seconds);
            }
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
                const mins = input ? (input.value || 25) : 25;
                window.islandController.startTimer(mins);
                this.toggleButtons(true);
            };
        }

        if (stopBtn) {
            stopBtn.onclick = () => {
                window.islandController.stopTimer();
                this.toggleButtons(false);
            };
        }

        if (resetBtn) {
            resetBtn.onclick = () => {
                // Berhentikan timer di background (Island)
                window.islandController.stopTimer(); 
                // Reset tampilan ke angka awal
                const mins = input ? (input.value || 25) : 25;
                this.render(mins * 60); 
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
        const startBtn = document.getElementById('startTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        
        if (startBtn && stopBtn) {
            startBtn.classList.toggle('hidden', isRunning);
            stopBtn.classList.toggle('hidden', !isRunning);
        }
    }
};
