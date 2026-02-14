import { islandController } from './islandController.js';

let countdown = null;
let timeLeft = 0;

export const timerController = {
    init() {
        const startBtn = document.getElementById('startTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        const resetBtn = document.getElementById('resetTimerBtn');
        const input = document.getElementById('timerInput');

        if (startBtn) {
            startBtn.onclick = () => this.start(input.value);
        }
        if (stopBtn) {
            stopBtn.onclick = () => this.stop();
        }
        if (resetBtn) {
            resetBtn.onclick = () => this.reset(input.value);
        }
    },

    start(minutes) {
        if (countdown) return;
        
        timeLeft = minutes * 60;
        this.updateDisplay();
        
        // Beritahu Dynamic Island (Mode Melebar)
        islandController.announce(`Fokus Dimulai: ${minutes} Menit`, 'timer');

        document.getElementById('startTimerBtn').classList.add('hidden');
        document.getElementById('stopTimerBtn').classList.remove('hidden');

        countdown = setInterval(() => {
            timeLeft--;
            this.updateDisplay();
            islandController.updateStatus(true, 'timer');

            if (timeLeft <= 0) {
                this.finish();
            }
        }, 1000);
    },

    stop() {
        clearInterval(countdown);
        countdown = null;
        document.getElementById('startTimerBtn').classList.remove('hidden');
        document.getElementById('stopTimerBtn').classList.add('hidden');
        
        // Sembunyikan Island jika tidak ada aktivitas lain
        islandController.hide();
    },

    reset(minutes) {
        this.stop();
        timeLeft = minutes * 60;
        this.updateDisplay();
    },

    finish() {
        this.stop();
        islandController.announce("Waktu Habis! Istirahat sejenak ☕", 'timer');
        alert("Sesi fokus selesai!");
    },

    updateDisplay() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }
};
