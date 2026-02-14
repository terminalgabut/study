// js/island.js
// Jalur Utama: Mengelola UI Dynamic Island dan Global Timer Service

let globalCountdown = null;
let globalTimeLeft = 0;

export const islandController = {
    // 1. INISIALISASI ELEMEN
    init() {
        console.log("🏝️ Island Service (Module) Initialized");
        this.island = document.getElementById('dynamic-island');
        this.container = document.getElementById('dynamic-island-container');
        this.textSpan = document.getElementById('island-text');
        
        // Ambil elemen ikon untuk mengubah kontennya nanti
        this.iconEl = this.island?.querySelector('.island-icon');

        // PERBAIKAN: Tambahkan fitur klik pada Island
        if (this.island) {
            this.island.style.cursor = 'pointer'; // Sesuai island.css
            this.island.onclick = () => {
                const isExpanded = this.island.classList.contains('expanded');
                if (isExpanded) {
                    this.shrink();
                } else {
                    this.island.classList.remove('icon-only');
                    this.island.classList.add('expanded');
                }
            };
        }
        
        if (globalCountdown) {
            this.updateStatus(true);
        }
    },

    // 2. LOGIKA TAMPILAN (UI)
    updateText(msg) {
        if (this.textSpan) this.textSpan.textContent = msg;
    },

    /**
     * PERBAIKAN: Mengelola Ikon berdasarkan tipe (Timer atau Musik)
     */
    announce(message, type = 'music') {
        if (!this.island) return;
        this.updateText(message);
        
        // Ganti Ikon secara dinamis
        if (this.iconEl) {
            this.iconEl.innerHTML = (type === 'timer') ? '⏱️' : '🎵';
        }
        
        this.island.classList.remove('icon-only');
        this.island.classList.add('expanded');

        setTimeout(() => {
            if (globalCountdown) {
                // Jika timer aktif, kembali ke mode icon tapi tetap tampil
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

    // 3. LOGIKA TIMER GLOBAL
    startTimer(minutes) {
        if (globalCountdown) clearInterval(globalCountdown);
        globalTimeLeft = minutes * 60;
        
        this.updateStatus(true);
        // Kirim tipe 'timer' agar ikon berubah jadi jam
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
