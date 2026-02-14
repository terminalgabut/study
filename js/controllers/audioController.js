// study/js/controllers/audioController.js

import { islandController } from './islandController.js';

let player = null;
let isPlaying = false;

export const audioController = {
    // Inisialisasi API & Player
    init() {
        if (window.YT && window.YT.Player) {
            this.setupPlayer();
        } else {
            window.onYouTubeIframeAPIReady = () => this.setupPlayer();
        }
    },

    setupPlayer() {
        if (player) return; // Mencegah double init
        
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
                'onReady': () => window.__DEBUG__?.log('Audio Engine Ready'),
                'onStateChange': (event) => {
                    // YT.PlayerState.PLAYING = 1, PAUSED = 2
                    isPlaying = (event.data === 1);
                    this.updateUI();
                }
            }
        });
    },

    // Menghubungkan tombol di View ke Player
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
                
                if (player && typeof player.loadVideoById === 'function') {
                    player.loadVideoById(vid);
                    
                    // Update UI Instan
                    document.getElementById('current-title').textContent = title;
                    document.getElementById('track-status').textContent = "Sedang diputar...";
                    isPlaying = true;
                    this.updateUI();
                    
                } else {
                    alert("Player sedang disiapkan, mohon tunggu 2 detik...");
                }
            };
        });

        this.updateUI(); // Sinkronkan status saat halaman dibuka
    },

    updateUI() {
    const playBtn = document.getElementById('mainPlayBtn');
    if (!playBtn) return;

    if (isPlaying) {
    playBtn.textContent = 'Pause';
    document.getElementById('music-wave')?.classList.remove('music-wave-hidden');
    
    // Sinkronisasi dengan Dynamic Island sebagai STATUS
    const container = document.getElementById('dynamic-island-container');
    const island = document.getElementById('dynamic-island');

    // HANYA update jika sedang TIDAK pamer judul (isLocked = false)
    if (!islandController.isLocked && container && island) {
        // 1. Pastikan container muncul (tidak scale 0)
        container.classList.remove('island-hidden');
        
        // 2. Jika dia tidak sedang melebar, pastikan dia dalam mode icon
        if (!island.classList.contains('expanded')) {
            island.classList.add('icon-only');
            // Pastikan teks sembunyi saat mode status icon
            const textSpan = document.getElementById('island-text');
            if (textSpan) textSpan.style.visibility = "hidden";
        }
    }
} else {
    playBtn.textContent = 'Play';
    document.getElementById('music-wave')?.classList.add('music-wave-hidden');
    
    // Jika musik berhenti, Island harus hilang total (kecuali ada Lock dari Timer nanti)
    if (!islandController.isLocked) {
        islandController.hide();
    }
}
};
