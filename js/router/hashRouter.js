// js/router/hashRouter.js

import { supabase } from '../services/supabase.js'; // PASTIKAN PATH INI BENAR

// ===== VIEW pages =====
import { loginView } from '../../pages/loginView.js';
import { registerView } from '../../pages/registerView.js';
import { homeView } from '../../pages/homeView.js';
import { materiView } from '../../pages/materiView.js';
import { babView } from '../../pages/babView.js';
import { kontenBabView } from '../../pages/kontenBabView.js';
import { bookmarkView } from '../../pages/bookmarkView.js';
import { historyView } from '../../pages/riwayatView.js';
import { notesView } from '../../pages/notesView.js';
import { notesDetailView } from '../../pages/notesDetailView.js';
import { performaView } from '../../pages/performaView.js';

// ===== LOGIC =====
import { initLogin, initRegister } from '../ui/auth/auth.js';
import { initLastRead } from '../ui/lastread.js';
import { initMotivation } from '../ui/motivation.js';
import { initProgress } from '../ui/progress.js';
import { initDailyTarget } from '../ui/target.js';
import { initRekomendasi } from '../ui/rekomendasi.js';
import { initBab } from '../ui/bab.js';
import { initKontenBab } from '../ui/kontenBab.js';
import { initQuizGenerator } from '../ui/generator.js';
import { handleBookmarkToggle, initBookmarkPage } from '../ui/bookmark.js'; 
import { initHistoryPage } from '../ui/riwayat.js';
import { initNotesList } from '../ui/notes.js';
import { initNoteDetail } from '../ui/noteDetails.js'; 
import { performaController } from '../controllers/performaController.js';

// js/router/hashRouter.js
__DEBUG__?.log('hashRouter loaded');

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  __DEBUG__?.log('handleRoute()', location.hash); // ← TAMBAHAN

  const content = document.getElementById('content');
  if (!content) return;

  // 1. Normalisasi Hash (Penting!)
  // Jika URL hanya https://.../study/ tanpa hash, kita anggap itu #home
  let rawHash = location.hash || '#home';
  let hash = rawHash.replace(/^#\/?/, '');
  __DEBUG__?.log('Normalized hash:', hash); // ← TAMBAHAN
  
  // --- [1] ROUTE GUARD LOGIC (Real-time Session Check) ---
  // getSession() lebih cepat dari getUser() untuk routing
  const { data: { session } } = await supabase.auth.getSession();
const isAuthPage = hash === 'login' || hash === 'register';

__DEBUG__?.log('Route Guard', {
  hash,
  isAuthPage,
  hasSession: !!session
}); // ← TAMBAHAN

  // LOGIKA PENGUNCI (Sangat penting agar tidak bypass)
  if (!session && !isAuthPage) {
    // Jika tidak ada session, PAKSA ke #login
    if (location.hash !== '#login') {
      location.hash = '#login';
      return; // Stop eksekusi router di sini
    }
  }

  if (session && isAuthPage) {
    // Jika sudah login tapi iseng buka login/register, PAKSA ke #home
    location.hash = '#home';
    return;
  }

  // Transisi halus
  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 150));

  try {
    // --- [2] ROUTE DINAMIS ---
    const noteDetailMatch = hash.match(/^catatan-detail\/([^\/]+)$/);
    const kontenMatch = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/);
    const materiMatch = hash.match(/^materi\/([^\/]+)$/);

    if (noteDetailMatch) {
      const slug = noteDetailMatch[1];
      content.innerHTML = notesDetailView;
      initNoteDetail(slug);
    } 
    else if (kontenMatch) {
      const [, category, slug] = kontenMatch;
      content.innerHTML = kontenBabView;
      initKontenBab(category, slug);
      handleBookmarkToggle(slug, category); 
      initQuizGenerator();
    } 
    else if (materiMatch) {
      const category = materiMatch[1];
      content.innerHTML = babView;
      initBab(category);
    } 

    // --- [3] ROUTE STATIS ---
    else {
      switch (hash) {
          
        case 'login':
          __DEBUG__?.log('Route → login');
          content.innerHTML = loginView;
          initLogin();
        break;
          
        case 'register':
          __DEBUG__?.log('Route → register');
          content.innerHTML = registerView;
          initRegister();
        break;
          
        case 'home':
          __DEBUG__?.log('Route → home');
          content.innerHTML = homeView;
          initLastRead();
          initMotivation();
          initProgress();
          initDailyTarget();
          initRekomendasi();
        break;
          
        case 'materi':
          __DEBUG__?.log('Route → materi');
          content.innerHTML = materiView;
        break;
          
        case 'bookmark':
          __DEBUG__?.log('Route → bookmark');
          content.innerHTML = bookmarkView;
          initBookmarkPage(); 
        break;
          
        case 'riwayat':
          __DEBUG__?.log('Route → riwayat');
          content.innerHTML = historyView;
          initHistoryPage();
        break;
          
        case 'catatan':
          __DEBUG__?.log('Route → catatan');
          content.innerHTML = notesView;
          initNotesList();
        break;

        case 'profile':
          __DEBUG__?.log('Route → profile');
          content.innerHTML = `<div class="home-card"><h2>Profil Pengguna</h2><p>Selamat datang di halaman profil!</p></div>`;
        break;

        case 'performa':
          __DEBUG__?.log('Route → performa');
          content.innerHTML = performaView;
          performaController.init();
        break;
       
        default:
          content.innerHTML = '<div class="home-card"><h2>Halaman tidak ditemukan</h2></div>';
      }
    }
  } catch (err) {
  __DEBUG__?.error('Router error:', err); // ← TAMBAHAN
  console.error('Router error:', err);
  content.innerHTML = '<div class="home-card"><h2>Terjadi kesalahan sistem</h2></div>';
}

  content.classList.remove('fade-out');

  // --- [4] UI ADJUSTMENT ---
  // Pastikan header/sidebar juga mengikuti status auth di app.js
  const navBar = document.querySelector('.mobile-nav'); 
  if (navBar) {
    navBar.style.display = isAuthPage ? 'none' : 'flex';
  }

  // Update menu aktif
  const rootPage = hash.split('/')[0];
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

export function initRouter() {
  __DEBUG__?.log('Router initialized'); // ← TAMBAHAN
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
