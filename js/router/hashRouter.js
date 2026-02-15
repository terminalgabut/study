// js/router/hashRouter.js
import { supabase } from '../services/supabase.js';

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const content = document.getElementById('content');
  if (!content) return;

  // 1. Normalisasi Hash
  let rawHash = location.hash || '#home';
  let hash = rawHash.replace(/^#\/?/, '');
  
  // 2. Auth Guard
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthPage = hash === 'login' || hash === 'register';

  if (!session && !isAuthPage) {
    location.hash = '#login';
    return;
  }
  if (session && isAuthPage) {
    location.hash = '#home';
    return;
  }

  // Transisi halus
  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 150));

  try {
    // --- [3] LOGIKA ROUTE DINAMIS & STATIS ---
    const noteDetailMatch = hash.match(/^catatan-detail\/([^\/]+)$/);
    const kontenMatch = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/);
    const materiMatch = hash.match(/^materi\/([^\/]+)$/);

    if (noteDetailMatch) {
      const slug = noteDetailMatch[1];
      const [{ notesDetailView }, { initNoteDetail }] = await Promise.all([
        import('../../pages/notesDetailView.js'),
        import('../ui/noteDetails.js')
      ]);
      content.innerHTML = notesDetailView;
      initNoteDetail(slug);
    } 
    else if (kontenMatch) {
      const [, category, slug] = kontenMatch;
      const [{ kontenBabView }, { initKontenBab }, { handleBookmarkToggle }, { initQuizGenerator }] = await Promise.all([
        import('../../pages/kontenBabView.js'),
        import('../controllers/kontenBab.js'),
        import('../ui/bookmark.js'),
        import('../ui/generator.js')
      ]);
      content.innerHTML = kontenBabView;
      initKontenBab(category, slug);
      handleBookmarkToggle(slug, category); 
      initQuizGenerator();
    } 
    else if (materiMatch) {
      const category = materiMatch[1];
      const [{ babView }, { initBab }] = await Promise.all([
        import('../../pages/babView.js'),
        import('../ui/bab.js')
      ]);
      content.innerHTML = babView;
      initBab(category);
    } 
    else {
      // SWITCH CASE UNTUK ROUTE STATIS
      switch (hash) {
        case 'login':
          const [{ loginView }, { initLogin }] = await Promise.all([
            import('../../pages/loginView.js'),
            import('../ui/auth/auth.js')
          ]);
          content.innerHTML = loginView;
          initLogin();
          break;

        case 'register':
          const [{ registerView }, { initRegister }] = await Promise.all([
            import('../../pages/registerView.js'),
            import('../ui/auth/auth.js')
          ]);
          content.innerHTML = registerView;
          initRegister();
          break;

        case 'home':
          const [
            { homeView }, 
            { initLastRead }, { initMotivation }, { initProgress }, { initDailyTarget }, { initRekomendasi }
          ] = await Promise.all([
            import('../../pages/homeView.js'),
            import('../ui/lastread.js'),
            import('../ui/motivation.js'),
            import('../ui/progress.js'),
            import('../ui/target.js'),
            import('../ui/rekomendasi.js')
          ]);
          content.innerHTML = homeView;
          initLastRead(); initMotivation(); initProgress(); initDailyTarget(); initRekomendasi();
          break;

        case 'audio':
          const [{ audioView }, { audioController }] = await Promise.all([
            import('../../pages/audioView.js'),
            import('../controllers/audioController.js')
          ]);
          content.innerHTML = audioView;
          // Note: audioController.init() sudah di app.js, jangan panggil lagi
          audioController.bindEvents();
          audioController.updateUI();
          break;

        case 'timer':
          const [{ timerView }, { timerController }] = await Promise.all([
            import('../../pages/timerView.js'),
            import('../controllers/timerController.js')
          ]);
          content.innerHTML = timerView;
          timerController.init();
          break;

        case 'materi':
          const { materiView } = await import('../../pages/materiView.js');
          content.innerHTML = materiView;
          break;

        case 'bookmark':
          const [{ bookmarkView }, { initBookmarkPage }] = await Promise.all([
            import('../../pages/bookmarkView.js'),
            import('../ui/bookmark.js')
          ]);
          content.innerHTML = bookmarkView;
          initBookmarkPage();
          break;

        case 'riwayat':
          const [{ historyView }, { initHistoryPage }] = await Promise.all([
            import('../../pages/riwayatView.js'),
            import('../ui/riwayat.js')
          ]);
          content.innerHTML = historyView;
          initHistoryPage();
          break;

        case 'catatan':
          const [{ notesView }, { initNotesList }] = await Promise.all([
            import('../../pages/notesView.js'),
            import('../ui/notes.js')
          ]);
          content.innerHTML = notesView;
          initNotesList();
          break;

        case 'performa':
          const [{ performaView }, { performaController }] = await Promise.all([
            import('../../pages/performaView.js'),
            import('../controllers/performaController.js')
          ]);
          content.innerHTML = performaView;
          performaController.init();
          break;

        case 'profile':
          content.innerHTML = `<div class="home-card"><h2>Profil</h2><p>Selamat datang di profil!</p></div>`;
          break;

        default:
          content.innerHTML = '<div class="home-card"><h2>Halaman tidak ditemukan</h2></div>';
      }
    }
  } catch (err) {
    console.error('Router Error:', err);
    content.innerHTML = '<div class="home-card"><h2>Gagal memuat halaman</h2></div>';
  }

  content.classList.remove('fade-out');

  // 4. UI Adjustment
  const navBar = document.querySelector('.mobile-nav'); 
  if (navBar) navBar.style.display = isAuthPage ? 'none' : 'flex';

  const rootPage = hash.split('/')[0];
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
