// study/js/controllers/timerController.js

export const timerController = {
    init() {
        const startBtn = document.getElementById('startTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        const resetBtn = document.getElementById('resetTimerBtn'); // Menambahkan referensi tombol reset
        const input = document.getElementById('timerInput');

        // 1. SINKRONISASI AWAL [cite: 79]
        const state = window.islandController.getTimerState();
        if (state.isActive) {
            this.render(state.timeLeft);
            this.toggleButtons(true);
        } else {
            // Jika tidak ada timer aktif, render nilai dari input [cite: 83, 84]
            this.render((input.value || 25) * 60);
        }

        // 2. LISTEN KE DETIKAN ISLAND [cite: 80, 81]
        window.removeEventListener('timerTick', this._handleTick);
        this._handleTick = (e) => {
            this.render(e.detail.seconds);
        };
        window.addEventListener('timerTick', this._handleTick);

        // 3. LISTEN KETIKA TIMER SELESAI [cite: 82]
        window.addEventListener('timerFinished', () => {
            this.toggleButtons(false);
            this.render(0);
        });

        // 4. EVENT TOMBOL
        if (startBtn) {
            startBtn.onclick = () => {
                const mins = input.value || 25; [cite: 84]
                window.islandController.startTimer(mins); [cite: 85]
                this.toggleButtons(true);
            };
        }

        if (stopBtn) {
            stopBtn.onclick = () => {
                window.islandController.stopTimer(); [cite: 85, 86]
                this.toggleButtons(false);
            };
        }

        if (resetBtn) {
    resetBtn.onclick = () => {
        // 1. Berhentikan mesin timer global
        window.islandController.stopTimer(); 
        
        // 2. Kembalikan angka tampilan ke durasi default/input
        const mins = input.value || 25;
        this.render(mins * 60); 
        
        // 3. Update tombol
        this.toggleButtons(false); 
    };
}
    },

    render(seconds) {
        const m = Math.floor(seconds / 60); [cite: 87]
        const s = seconds % 60; [cite: 87]
        const minEl = document.getElementById('minutes'); [cite: 88]
        const secEl = document.getElementById('seconds'); [cite: 88]
        
        if (minEl && secEl) {
            minEl.textContent = String(m).padStart(2, '0'); [cite: 89]
            secEl.textContent = String(s).padStart(2, '0'); [cite: 89]
        }
    },

    toggleButtons(isRunning) {
        document.getElementById('startTimerBtn')?.classList.toggle('hidden', isRunning); [cite: 90]
        document.getElementById('stopTimerBtn')?.classList.toggle('hidden', !isRunning); [cite: 90]
    }
};
