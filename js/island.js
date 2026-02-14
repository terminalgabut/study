// js/island.js

let globalCountdown = null;
let globalTimeLeft = 0;

export const islandController = {
    init() {
        console.log("🏝️ Island Service Initialized");
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');
        
        // Referensi Ikon SVG (Sesuai file ke-3)
        this.iconMusic = document.getElementById('icon-music');
        this.iconTimer = document.getElementById('icon-timer');

        // 1. PERBAIKAN: Fitur Klik (Expand/Shrink)
        if (this.island) {
            this.island.onclick = (e) => {
                // Jangan toggle jika yang diklik adalah tombol stop di dalam island (jika nanti ada)
                const isExpanded = this.island.classList.contains('expanded');
                if (isExpanded) {
                    this.shrink();
                } else {
                    this.island.classList.remove('icon-only');
                    this.island.classList.add('expanded');
                }
            };
        }
        
        if (globalCountdown) this.updateStatus(true);
    }

    updateText(msg) {
        if (this.textSpan) this.textSpan.textContent = msg;
    },

    /**
     * 2. PERBAIKAN: Logika Tukar Ikon SVG
     */
    announce(message, type = 'music') {
        if (!this.island) return;
        this.updateText(message);
        
        // Sembunyikan semua ikon dulu, lalu tampilkan yang sesuai
        this.iconMusic?.classList.add('hidden');
        this.iconTimer?.classList.add('hidden');

        if (type === 'timer') {
            this.iconTimer?.classList.remove('hidden');
        } else {
            this.iconMusic?.classList.remove('hidden');
        }
        
        this.island.classList.remove('icon-only');
        this.island.classList.add('expanded');

        setTimeout(() => {
            if (globalCountdown) {
                this.island.classList.add('icon-only');
                this.island.classList.remove('expanded');
            } else {
                this.shrink();
            }
        }, 6000);
    },

    shrink() {
        if (this.island) {
            this.island.classList.add('icon-only');
            this.island.classList.remove('expanded');
        }
    },

    updateStatus(active) {
        if (active) {
            this.container?.classList.remove('island-hidden');
        } else {
            this.container?.classList.add('island-hidden');
            this.shrink();
        }
    },

    // 3. LOGIKA TIMER
    startTimer(minutes) {
        if (globalCountdown) clearInterval(globalCountdown);
        globalTimeLeft = minutes * 60;
        
        this.updateStatus(true);
        // Panggil dengan tipe 'timer' agar SVG Timer muncul
        this.announce(this.formatTime(globalTimeLeft), 'timer');

        globalCountdown = setInterval(() => {
            globalTimeLeft--;

            if (globalTimeLeft <= 0) {
                this.stopTimer();
                this.announce("Selesai! ☕", 'timer');
                window.dispatchEvent(new CustomEvent('timerFinished'));
                return;
            }

            const timeStr = this.formatTime(globalTimeLeft);
            this.updateText(timeStr);
   
            window.dispatchEvent(new CustomEvent('timerTick', { 
                detail: { seconds: globalTimeLeft, formatted: timeStr }
            }));
        }, 1000);
    },

    stopTimer() {
        if (globalCountdown) {
            clearInterval(globalCountdown);
            globalCountdown = null;
        }
        this.updateStatus(false);
    },

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    getTimerState() {
        return {
            isActive: globalCountdown !== null,
            timeLeft: globalTimeLeft,
            formatted: this.formatTime(globalTimeLeft)
        };
    }
};

window.islandController = islandController;
