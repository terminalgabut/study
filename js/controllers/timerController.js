// study/js/controllers/timerController.js
import { islandController } from './islandController.js';

export const timerController = {
    init() {
        const startBtn = document.getElementById('startTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        const resetBtn = document.getElementById('resetTimerBtn');
        const input = document.getElementById('timerInput');

        // 1. Dengar detikan dari app.js (Real-time Sync)
        window.addEventListener('timerTick', (e) => {
            this.updateDisplay(e.detail);
        });

        // 2. Dengar jika waktu habis
        window.addEventListener('timerFinished', () => {
            this.toggleButtons(false);
            islandController.announce("Selesai! Istirahat ☕", 'timer');
        });

        // 3. Jika user kembali ke page ini dan timer sudah jalan, sinkronkan UI
        if (window.timerGlobal.isActive()) {
            this.updateDisplay(window.timerGlobal.getTimeLeft());
            this.toggleButtons(true);
        }

        if (startBtn) {
            startBtn.onclick = () => {
                const mins = input.value;
                window.timerGlobal.start(mins);
                this.toggleButtons(true);
                
                // Announce awal agar Island melebar
                const timeStr = `${String(mins).padStart(2, '0')}:00`;
                islandController.announce(timeStr, 'timer');
            };
        }

        if (stopBtn) {
            stopBtn.onclick = () => {
                window.timerGlobal.stop();
                this.toggleButtons(false);
                islandController.updateStatus(false);
            };
        }

        if (resetBtn) {
            resetBtn.onclick = () => {
                window.timerGlobal.stop();
                this.updateDisplay(input.value * 60);
                this.toggleButtons(false);
            };
        }
    },

    updateDisplay(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const minEl = document.getElementById('minutes');
        const secEl = document.getElementById('seconds');
        
        // Safety check: Hanya update jika elemen ada di DOM (mencegah error saat di page lain)
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
