// root/js/controllers/timerController.js

export const timerController = {

    init() {
        this.startBtn = document.getElementById('startTimerBtn');
        this.stopBtn = document.getElementById('stopTimerBtn');
        this.resetBtn = document.getElementById('resetTimerBtn');
        this.input = document.getElementById('timerInput');

        this.interval = null;
        this.timeLeft = 0;
        this.isRunning = false;

        const mins = this.getInputMinutes();
        this.timeLeft = mins * 60;

        this.render(this.timeLeft);
        this.toggleButtons(false);

        this.bindEvents();
    },

    bindEvents() {
        this.startBtn?.addEventListener('click', () => this.start());
        this.stopBtn?.addEventListener('click', () => this.stop());
        this.resetBtn?.addEventListener('click', () => this.reset());
    },

    getInputMinutes() {
        const val = parseInt(this.input?.value);
        return isNaN(val) || val <= 0 ? 25 : val;
    },

    start() {
        if (this.isRunning) return;

        // kalau belum pernah start / sudah reset
        if (this.timeLeft <= 0) {
            this.timeLeft = this.getInputMinutes() * 60;
        }

        this.isRunning = true;
        this.toggleButtons(true);

        this.updateIsland();

        this.interval = setInterval(() => {
            this.timeLeft--;

            if (this.timeLeft <= 0) {
                this.finish();
                return;
            }

            this.render(this.timeLeft);
            this.updateIsland();

        }, 1000);
    },

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.isRunning = false;

        window.islandController?.removeStatus('timer');
        this.toggleButtons(false);
    },

    reset() {
        this.stop();
        this.timeLeft = this.getInputMinutes() * 60;
        this.render(this.timeLeft);
    },

    finish() {
        clearInterval(this.interval);
        this.interval = null;
        this.isRunning = false;

        window.islandController?.setStatus('timer', {
            text: "Selesai ☕",
            icon: 'timer',
            priority: 10,
            persistent: false
        });

        window.islandController?.expand(true);

        setTimeout(() => {
            window.islandController?.removeStatus('timer');
        }, 4000);

        this.toggleButtons(false);
        this.render(0);
    },

    updateIsland() {
        window.islandController?.setStatus('timer', {
            text: this.formatTime(this.timeLeft),
            icon: 'timer',
            priority: 10,
            persistent: true
        });

        window.islandController?.expand(true);
        this.render(this.timeLeft);
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
        this.startBtn?.classList.toggle('hidden', isRunning);
        this.stopBtn?.classList.toggle('hidden', !isRunning);
    },

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
};
