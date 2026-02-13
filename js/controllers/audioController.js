// controllers/audioController.js

let player = null; // Inisialisasi dengan null
let isPlaying = false;

export const audioController = {
    init() {
        // Cek jika API YouTube sudah dimuat
        if (window.YT && window.YT.Player) {
            this.setupPlayer();
        } else {
            // Jika belum, pasang global listener
            window.onYouTubeIframeAPIReady = () => {
                this.setupPlayer();
            };
        }
    },

    setupPlayer() {
        // Jangan buat player baru jika sudah ada
        if (player) return;

        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: 'jfKfPfyJRdk',
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'rel': 0,
                'showinfo': 0
            },
            events: {
                'onReady': () => window.__DEBUG__?.log('YouTube Player Ready'),
                'onStateChange': (event) => {
                    // YT.PlayerState.PLAYING = 1, PAUSED = 2
                    isPlaying = (event.data === 1);
                    this.updateUI();
                }
            }
        });
    },

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
                if (player && player.setVolume) {
                    player.setVolume(e.target.value);
                }
            };
        }

        cards.forEach(card => {
            card.onclick = () => {
                const vid = card.getAttribute('data-vid');
                const title = card.getAttribute('data-title');
                
                // PROTEKSI: Cek apakah player sudah siap sebelum panggil loadVideoById
                if (player && typeof player.loadVideoById === 'function') {
                    player.loadVideoById(vid);
                    
                    const titleEl = document.getElementById('current-title');
                    if (titleEl) titleEl.textContent = title;
                } else {
                    console.warn("YouTube Player belum siap. Tunggu sebentar...");
                    alert("Player sedang disiapkan, silakan klik lagi dalam 2 detik.");
                }
            };
        });

        this.updateUI();
    },

    updateUI() {
        const playBtn = document.getElementById('mainPlayBtn');
        if (!playBtn) return;
        playBtn.textContent = isPlaying ? 'Pause' : 'Play';
    }
};
