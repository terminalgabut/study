// js/island.js
// Jalur Utama: Mengelola UI Dynamic Island dan Global Timer Service

// State Privat (Tidak bisa diakses langsung dari luar file untuk keamanan data)
let globalCountdown = null;
let globalTimeLeft = 0;

export const islandController = {
    // 1. INISIALISASI ELEMEN
    init() {
        console.log("🏝️ Island Service (Module) Initialized");
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');
        
        // Pastikan state awal sinkron dengan DOM
        if (globalCountdown) {
            this.updateStatus(true);
        }
    },

    // 2. LOGIKA TAMPILAN (UI)
    updateText(msg) {
        if (this.textSpan) this.textSpan.textContent = msg;
    },

    /**
     * Membuat Island melebar untuk memberikan informasi
     * @param {string} message - Pesan yang ditampilkan
     * @param {string} type - 'music' atau 'timer'
     */
    announce(message, type = 'music') {
        if (!this.island) return;

        this.updateText(message);
        
        // Mode Melebar (Expanded)
        this.island.classList.remove('icon-only');
        this.island.classList.add('expanded');

        // Kembali jadi icon bulat setelah 6 detik
        setTimeout(() => {
            // Jika ada timer aktif, jangan menciut total, tetap tampilkan angka
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

    // 3. LOGIKA TIMER GLOBAL (Background Process)
    /**
     * Menjalankan timer yang tidak akan mati saat pindah page
     * @param {number} minutes 
     */
    startTimer(minutes) {
        // Bersihkan interval lama jika ada
        if (globalCountdown) clearInterval(globalCountdown);
        
        globalTimeLeft = minutes * 60;
        
        this.updateStatus(true);
        this.announce(this.formatTime(globalTimeLeft), 'timer');

        globalCountdown = setInterval(() => {
            globalTimeLeft--;

            if (globalTimeLeft <= 0) {
                this.stopTimer();
                this.announce("Selesai! ☕", 'timer');
                // Beritahu sistem bahwa timer selesai
                window.dispatchEvent(new CustomEvent('timerFinished'));
                return;
            }

            const timeStr = this.formatTime(globalTimeLeft);
            
            // Update UI Island secara langsung (Real-time)
            this.updateText(timeStr);
            
            // Kirim event ke UI Page (Misal: Timer Page) agar angka di layar ikut berubah
            window.dispatchEvent(new CustomEvent('timerTick', { 
                detail: {
                    seconds: globalTimeLeft,
                    formatted: timeStr
                }
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

    // 4. HELPER & GETTER
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

// EXPLICIT WINDOW MAPPING
// Agar file non-module atau app.js bisa memanggil tanpa import berulang
window.islandController = islandController;
