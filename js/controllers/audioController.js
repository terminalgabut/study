// study/js/controllers/audioController.js

// JANGAN IMPORT ISLAND LAGI - Kita pakai window.islandController
let player = null;
let isPlaying = false;
let currentTitle = "Lofi Girl - Study"; // Default title

export const audioController = {
    // 1. Inisialisasi API & Player (Dipanggil sekali di app.js)
    init() {
        if (window.YT && window.YT.Player) {
            this.setupPlayer();
        } else {
            // Jika API belum siap, tunggu panggilannya
            window.onYouTubeIframeAPIReady = () => this.setupPlayer();
        }
    },

    setupPlayer() {
        if (player) return; 
        
        // Target: div #youtube-player yang kita buat di app.js
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: 'jfKfPfyJRdk', // Default video
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'rel': 0,
                'showinfo': 0
            },
            events: {
    'onReady': () => console.log('Audio Engine Ready ✅'),
    'onStateChange': (event) => {
        isPlaying = (
            event.data === YT.PlayerState.PLAYING ||
            event.data === YT.PlayerState.BUFFERING
        );
        this.updateUI();
    }
}
        });
    },

    // 2. Bind Events (Dipanggil Router setiap halaman Audio dibuka)
    bindEvents() {
        const playBtn = document.getElementById('mainPlayBtn');
        const volSlider = document.getElementById('volumeRange');
        const cards = document.querySelectorAll('.music-card');

        if (playBtn) {
            playBtn.onclick = () => {
                if (!player || typeof player.playVideo !== 'function') return;
                isPlaying ? player.pauseVideo() : player.playVideo();
            };
        }

        if (volSlider) {
            volSlider.oninput = (e) => {
                player?.setVolume(e.target.value);
            };
        }

        cards.forEach(card => {
            card.onclick = () => {
                const vid = card.getAttribute('data-vid');
                const title = card.getAttribute('data-title');
                
                if (player?.loadVideoById) {
                    currentTitle = title; // Update title global di file ini
                    player.loadVideoById(vid);
                    
                    // Update teks di halaman (jika elemennya ada)
                    const titleEl = document.getElementById('current-title');
                    const statusEl = document.getElementById('track-status');
                    if (titleEl) titleEl.textContent = title;
                    if (statusEl) statusEl.textContent = "Sedang diputar...";
                    
                    isPlaying = true;
                    this.updateUI();
                }
            };
        });

        // Pastikan UI halaman sinkron dengan state musik saat ini
        this.updateUI();
    },

    // 3. Update Visual UI & Sync ke Island
    updateUI() {
        // --- A. Update Elemen di Halaman Audio (Jika sedang dibuka) ---
        const playBtn = document.getElementById('mainPlayBtn');
        const musicWave = document.getElementById('music-wave');
        
        if (playBtn) {
            playBtn.textContent = isPlaying ? 'Pause' : 'Play';
        }
        if (musicWave) {
            isPlaying ? musicWave.classList.remove('music-wave-hidden') 
                      : musicWave.classList.add('music-wave-hidden');
        }

        // --- B. Update ke Dynamic Island (Global) ---
        if (isPlaying) {
            window.islandController?.setStatus('music', { 
                text: currentTitle, 
                icon: 'music',
                priority: 5 // Prioritas lebih rendah dari Timer
            });
        } else {
            // Jika musik pause, hapus dari island agar tidak menumpuk
            window.islandController?.removeStatus('music');
        }
    }
};
