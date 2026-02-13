// root/js/controllers/audioController.js

let player;
let isPlaying = false;

export const audioController = {
    // 1. Inisialisasi Player (Panggil sekali di main.js)
    init() {
        window.onYouTubeIframeAPIReady = () => {
            player = new YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: 'jfKfPfyJRdk', // Default: Lofi Girl
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'disablekb': 1,
                    'rel': 0
                },
                events: {
                    'onStateChange': (event) => {
                        // 1 = Playing, 2 = Paused
                        isPlaying = (event.data === 1);
                        this.updateUI();
                    }
                }
            });
        };
    },

    // 2. Pasang Listener ke UI (Panggil setiap kali render audioView)
    bindEvents() {
        const playBtn = document.getElementById('mainPlayBtn');
        const volSlider = document.getElementById('volumeRange');
        const cards = document.querySelectorAll('.music-card');

        if (playBtn) {
            playBtn.onclick = () => {
                if (isPlaying) player.pauseVideo();
                else player.playVideo();
            };
        }

        if (volSlider) {
            volSlider.oninput = (e) => {
                player.setVolume(e.target.value);
                const volText = document.getElementById('volume-level');
                if (volText) volText.textContent = `${e.target.value}%`;
            };
        }

        cards.forEach(card => {
            card.onclick = () => {
                const vid = card.getAttribute('data-vid');
                const title = card.getAttribute('data-title');
                
                player.loadVideoById(vid);
                document.getElementById('current-title').textContent = title;
                document.getElementById('track-status').textContent = "Sedang diputar...";
            };
        });

        this.updateUI();
    },

    updateUI() {
        const playBtn = document.getElementById('mainPlayBtn');
        const statusText = document.getElementById('track-status');
        const wave = document.getElementById('music-wave');

        if (!playBtn) return;

        if (isPlaying) {
            playBtn.textContent = 'Pause';
            statusText.textContent = 'Musik menemani belajarmu...';
            if (wave) wave.classList.remove('music-wave-hidden');
        } else {
            playBtn.textContent = 'Play';
            statusText.textContent = 'Musik berhenti';
            if (wave) wave.classList.add('music-wave-hidden');
        }
    }
};
