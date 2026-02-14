// study/js/controllers/islandController.js

export const islandController = {
    timeout: null,
    isLocked: false, // Papan "Jangan Diganggu" saat pengumuman tayang

    init() {
        const island = document.getElementById('dynamic-island');
        if (!island) return;

        // Klik pada icon untuk intip kembali pesan terakhir
        island.onclick = () => {
            if (island.classList.contains('icon-only')) {
                const lastMsg = document.getElementById('island-text').textContent;
                this.announce(lastMsg);
            }
        };
    },

    /**
     * FUNGSI SERVICE: Untuk Pengumuman (Ganti Lagu, Timer Habis, Notifikasi)
     * Akan melebar dan mengunci tampilan selama 6 detik.
     */
    announce(message, type = 'music') {
        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');

        if (!container || !island || !textSpan) return;

        // Pasang Kunci agar updateStatus tidak bisa mengganggu
        this.isLocked = true;
        if (this.timeout) clearTimeout(this.timeout);

        // 1. Ganti Konten
        textSpan.textContent = message;
        const isMusic = type === 'music';
        document.getElementById('icon-music')?.classList.toggle('hidden', !isMusic);
        document.getElementById('icon-timer')?.classList.toggle('hidden', isMusic);

        // 2. Munculkan & Melebarkan
        container.classList.remove('island-hidden');
        
        requestAnimationFrame(() => {
            textSpan.style.display = "inline-block";
            textSpan.style.opacity = "1";
            textSpan.style.visibility = "visible";

            requestAnimationFrame(() => {
                island.classList.remove('icon-only');
                island.classList.add('expanded');
            });
        });

        // 3. Lepas Kunci dan Kembali jadi Bulat setelah 6 detik
        this.timeout = setTimeout(() => {
            this.isLocked = false;
            island.classList.remove('expanded');
            island.classList.add('icon-only');

            // Sembunyikan teks setelah animasi ciut selesai
            setTimeout(() => {
                if (!island.classList.contains('expanded')) {
                    textSpan.style.visibility = "hidden";
                }
            }, 500);
        }, 6000);
    },

    /**
     * FUNGSI CONTROLLER: Untuk Status (Musik Sedang Jalan/Berhenti)
     * Hanya mengatur muncul/hilangnya lingkaran kecil (icon-only).
     */
    updateStatus(isActive) {
        if (this.isLocked) return; // Jika sedang pamer judul, abaikan instruksi ini

        const container = document.getElementById('dynamic-island-container');
        const island = document.getElementById('dynamic-island');
        const textSpan = document.getElementById('island-text');

        if (!container || !island) return;

        if (isActive) {
            // Tampilkan sebagai lingkaran kecil
            container.classList.remove('island-hidden');
            island.classList.add('icon-only');
            island.classList.remove('expanded');
            if (textSpan) textSpan.style.visibility = "hidden";
        } else {
            // Sembunyikan total
            container.classList.add('island-hidden');
        }
    },

    // Fungsi darurat untuk menyembunyikan paksa
    hide() {
        if (this.isLocked) return;
        document.getElementById('dynamic-island-container')?.classList.add('island-hidden');
    }
};
