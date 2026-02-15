// study/js/controllers/audioController.js

import { islandController } from './islandController.js';

let player = null;
let isPlaying = false;

export const audioController = {
    // 1. Inisialisasi API & Player
    init() {
        if (window.YT && window.YT.Player) {
            this.setupPlayer();
        } else {
            window.onYouTubeIframeAPIReady = () => this.setupPlayer();
        }
    },

    setupPlayer() {
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
                'onReady': () => console.log('Audio Engine Ready'),
                'onStateChange': (event) => {
                    // YT.PlayerState.PLAYING = 1, PAUSED = 2
                    isPlaying = (event.data === 1);
                    this.updateUI();
                }
            }
        });
    },

    // 2. Event Listeners (Tombol & Kartu)
    bindEvents() {
        const playBtn = document.getElementById('mainPlayBtn');
        const volSlider = document.getElementById('volumeRange');
        const cards = document.querySelectorAll('.music-card');

        // Play / Pause Utama
        if (playBtn) {
            playBtn.onclick = () => {
                if (!player || typeof player.playVideo !== 'function') return;
                isPlaying ? player.pauseVideo() : player.playVideo();
            };
        }

        // Volume
        if (volSlider) {
            volSlider.oninput = (e) => {
                if (player && player.setVolume) {
                    player.setVolume(e.target.value);
                }
            };
        }

        // Pilih Lagu dari Kartu
        cards.forEach(card => {
            card.onclick = () => {
                const vid = card.getAttribute('data-vid');
                const title = card.getAttribute('data-title');
                
                if (player && typeof player.loadVideoById === 'function') {
                    // Load lagu baru
                    player.loadVideoById(vid);
                    
                    // --- SYNC ISLAND (PENGUMUMAN) ---
                    islandController.announce(title, 'music');
                    
                    // Update teks di halaman
                    document.getElementById('current-title').textContent = title;
                    document.getElementById('track-status').textContent = "Sedang diputar...";
                    
                    // Set status dan update UI tombol
                    isPlaying = true;
                    this.updateUI();
                } else {
                    console.log("Player belum siap.");
                }
            };
        });

        this.updateUI();
    },

    // 3. Update Visual UI
    // Di dalam audioController.js
updateUI() {
    if (isPlaying) {
        // Kirim status ke Island secara global
        window.islandController?.setStatus('music', { 
            text: currentTitle || "Memutar Musik", 
            icon: 'music',
            priority: 5 
        });
    } else {
        // Hapus status jika musik berhenti
        window.islandController?.removeStatus('music');
    }
}
};
