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

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const rawHash = location.hash || '#home';
  const hash = rawHash.replace(/^#\/?/, '');
  
  // --- [1] ROUTE GUARD LOGIC ---
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthPage = hash === 'login' || hash === 'register';

  // Jika belum login & mencoba akses selain login/register, tendang ke login
  if (!session && !isAuthPage) {
    location.hash = '#login';
    return;
  }

  // Jika sudah login & mencoba akses login/register, lempar ke home
  if (session && isAuthPage) {
    location.hash = '#home';
    return;
  }

  const content = document.getElementById('content');
  if (!content) return;

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
          content.innerHTML = loginView;
          initLogin();
          break;
        case 'register':
          content.innerHTML = registerView;
          initRegister();
          break;
        case 'home':
          content.innerHTML = homeView;
          initLastRead();
          initMotivation();
          initProgress();
          initDailyTarget();
          initRekomendasi();
          break;
        case 'materi':
          content.innerHTML = materiView;
          break;
        case 'bookmark':
          content.innerHTML = bookmarkView;
          initBookmarkPage(); 
          break;
        case 'riwayat':
          content.innerHTML = historyView;
          initHistoryPage();
          break;
        case 'catatan':
          content.innerHTML = notesView;
          initNotesList();
          break;
        default:
          content.innerHTML = '<div class="home-card"><h2>Halaman tidak ditemukan</h2></div>';
      }
    }
  } catch (err) {
    console.error('Router error:', err);
    content.innerHTML = '<div class="home-card"><h2>Terjadi kesalahan sistem</h2></div>';
  }

  content.classList.remove('fade-out');

  // --- [4] UI ADJUSTMENT (Navigasi & Active State) ---
  
  // Sembunyikan Navigasi Bawah di halaman Login/Register
  const navBar = document.querySelector('.mobile-nav'); // Sesuaikan dengan class navbar kamu
  if (navBar) {
    navBar.style.display = isAuthPage ? 'none' : 'flex';
  }

  // Update status tombol aktif
  const rootPage = hash.split('/')[0];
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
