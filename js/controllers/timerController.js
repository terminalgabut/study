// root/js/controllers/timerController.js

export const timerController = {

    interval: null,
    timeLeft: null,
    isRunning: null,
    isBound: false,

    init() {
    this.cacheDom();

    if (this.timeLeft == null) {
        const mins = this.getInputMinutes();
        this.timeLeft = mins * 60;
    }

    if (this.isRunning == null) {
        this.isRunning = false;
    }

    this.render();
    this.toggleButtons(this.isRunning);

    if (!this.isBound) {
        this.bindEvents();
        this.isBound = true;
    }
},

    cacheDom() {
    this.startBtn = document.getElementById('startTimerBtn');
    this.stopBtn = document.getElementById('stopTimerBtn');
    this.resetBtn = document.getElementById('resetTimerBtn');
    this.input = document.getElementById('timerInput');
    this.minEl = document.getElementById('minutes');
    this.secEl = document.getElementById('seconds');
},

    resetState() {
        this.clearTimer();

        const mins = this.getInputMinutes();
        this.timeLeft = mins * 60;

        this.render();
        this.toggleButtons(false);
    },

    bindEvents() {
        this.startBtn?.addEventListener('click', () => this.start());
        this.stopBtn?.addEventListener('click', () => this.stop());
        this.resetBtn?.addEventListener('click', () => this.reset());
    },

    getInputMinutes() {
        const val = parseInt(this.input?.value, 10);
        return isNaN(val) || val <= 0 ? 25 : val;
    },

    start() {
        if (this.isRunning) return;

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

            this.render();
            this.updateIsland();

        }, 1000);
    },

    stop() {
        this.clearTimer();
        this.isRunning = false;
        this.toggleButtons(false);
        window.islandController?.removeStatus('timer');
    },

    reset() {
        this.stop();
        this.timeLeft = this.getInputMinutes() * 60;
        this.render();
    },

    finish() {
        this.clearTimer();
        this.isRunning = false;

        this.render();

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
    },

    clearTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    render() {
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;

        if (this.minEl && this.secEl) {
            this.minEl.textContent = String(m).padStart(2, '0');
            this.secEl.textContent = String(s).padStart(2, '0');
        }
    },

    toggleButtons(isRunning) {
        this.startBtn?.classList.toggle('hidden', isRunning);
        this.stopBtn?.classList.toggle('hidden', !isRunning);
    },

    updateIsland() {
    window.islandController?.setStatus('timer', {
        text: this.formatTime(this.timeLeft),
        icon: 'timer',
        priority: 10,
        persistent: true
    });
}, 

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
};
