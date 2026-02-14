// study/js/controllers/timerController.js

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
        
        // 1. Format waktu awal
        const timeStr = this.getTimeString();
        this.updateDisplay();
        
        // 2. Langsung tampilkan angka di Island (Mode Melebar otomatis oleh announce)
        islandController.announce(timeStr, 'timer');

        document.getElementById('startTimerBtn').classList.add('hidden');
        document.getElementById('stopTimerBtn').classList.remove('hidden');

        // 3. Jalankan interval
        countdown = setInterval(() => {
            timeLeft--;
            
            const currentTimeStr = this.getTimeString();
            this.updateDisplay();
            
            // Update teks di dalam Island secara real-time (di balik layar)
            islandController.updateText(currentTimeStr);
            
            // Jaga agar icon tetap mode timer (Bulat)
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
        
        islandController.updateStatus(false); // Sembunyikan/Reset Island
    },

    reset(minutes) {
        this.stop();
        timeLeft = minutes * 60;
        this.updateDisplay();
    },

    finish() {
        this.stop();
        // Melebar kembali untuk pengumuman selesai
        islandController.announce("Selesai! Istirahat ☕", 'timer');
    },

    // Fungsi pembantu untuk mendapatkan format MM:SS
    getTimeString() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    updateDisplay() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }
};
