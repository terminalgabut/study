// js/router/hashRouter.js
import { supabase } from '../services/supabase.js';

export function navigate(page) {
  location.hash = page;
}

/* =========================================
   UTILITIES
========================================= */

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getAuthState() {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/* =========================================
   ROUTE HANDLERS (DYNAMIC MAP)
========================================= */

const routes = {
  login: async (content) => {
    const [{ loginView }, { initLogin }] = await Promise.all([
      import('../../pages/loginView.js'),
      import('../auth/auth.js')
    ]);
    content.innerHTML = loginView;
    initLogin();
  },

  register: async (content) => {
    const [{ registerView }, { initRegister }] = await Promise.all([
      import('../../pages/registerView.js'),
      import('../auth/auth.js')
    ]);
    content.innerHTML = registerView;
    initRegister();
  },

  home: async (content) => {
    const [
      { homeView }, 
      { initLastRead }, 
      { initMotivation }, 
      { initProgress }, 
      { initDailyTarget }, 
      { initRekomendasi }
    ] = await Promise.all([
      import('../../pages/homeView.js'),
      import('../ui/lastread.js'),
      import('../ui/motivation.js'),
      import('../ui/progress.js'),
      import('../ui/target.js'),
      import('../ui/rekomendasi.js')
    ]);

    content.innerHTML = homeView;
    initLastRead();
    initMotivation();
    initProgress();
    initDailyTarget();
    initRekomendasi();
  },

  audio: async (content) => {
    const [{ audioView }, { audioController }] = await Promise.all([
      import('../../pages/audioView.js'),
      import('../controllers/audioController.js')
    ]);
    content.innerHTML = audioView;
    audioController.bindEvents();
    audioController.updateUI();
  },

  timer: async (content) => {
    const [{ timerView }, { timerController }] = await Promise.all([
      import('../../pages/timerView.js'),
      import('../controllers/timerController.js')
    ]);
    content.innerHTML = timerView;
    timerController.init();
  },

  materi: async (content) => {
    const { materiView } = await import('../../pages/materiView.js');
    content.innerHTML = materiView;
  },

  bookmark: async (content) => {
    const [{ bookmarkView }, { initBookmarkPage }] = await Promise.all([
      import('../../pages/bookmarkView.js'),
      import('../ui/bookmark.js')
    ]);
    content.innerHTML = bookmarkView;
    initBookmarkPage();
  },

  riwayat: async (content) => {
    const [{ historyView }, { initHistoryPage }] = await Promise.all([
      import('../../pages/riwayatView.js'),
      import('../ui/riwayat.js')
    ]);
    content.innerHTML = historyView;
    initHistoryPage();
  },

  catatan: async (content) => {
    const [{ notesView }, { initNotesList }] = await Promise.all([
      import('../../pages/notesView.js'),
      import('../ui/notes.js')
    ]);
    content.innerHTML = notesView;
    initNotesList();
  },

  performa: async (content) => {
    const [{ performaView }, { performaController }] = await Promise.all([
      import('../../pages/performaView.js'),
      import('../controllers/performaController.js')
    ]);
    content.innerHTML = performaView;
    performaController.init();
  },

  profile: async (content) => {
    const [{ profileView }, { profileController }] = await Promise.all([
      import('../../pages/profileView.js'),
      import('../controllers/profileController.js')
    ]);
    content.innerHTML = profileView;
    profileController.init();
  }
};

/* =========================================
   MAIN ROUTER
========================================= */

export async function handleRoute() {
  const content = document.getElementById('content');
  if (!content) return;

  let hash = (location.hash || '#home').replace(/^#\/?/, '');

  const isAuthPage = hash === 'login' || hash === 'register';
  const isLoggedIn = await getAuthState();

  if (!isLoggedIn && !isAuthPage) {
    location.hash = '#login';
    return;
  }

  if (isLoggedIn && isAuthPage) {
    location.hash = '#home';
    return;
  }

  content.classList.add('fade-out');
  await sleep(120);

  try {
    // === Dynamic Route Match ===
    let match;

    if ((match = hash.match(/^catatan-detail\/([^\/]+)$/))) {
      const slug = match[1];
      const [{ notesDetailView }, { initNoteDetail }] = await Promise.all([
        import('../../pages/notesDetailView.js'),
        import('../ui/noteDetails.js')
      ]);
      content.innerHTML = notesDetailView;
      initNoteDetail(slug);
    }

    else if ((match = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/))) {
      const [, category, slug] = match;
      const [
        { kontenBabView },
        { initKontenBab },
        { handleBookmarkToggle },
        { initQuizGenerator }
      ] = await Promise.all([
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

    else if ((match = hash.match(/^materi\/([^\/]+)$/))) {
      const category = match[1];
      const [{ babView }, { initBab }] = await Promise.all([
        import('../../pages/babView.js'),
        import('../ui/bab.js')
      ]);
      content.innerHTML = babView;
      initBab(category);
    }

    else if (routes[hash]) {
      await routes[hash](content);
    }

    else {
      content.innerHTML = '<div class="home-card"><h2>Halaman tidak ditemukan</h2></div>';
    }

  } catch (err) {
    console.error('Router Error:', err);
    content.innerHTML = '<div class="home-card"><h2>Gagal memuat halaman</h2></div>';
  }

  content.classList.remove('fade-out');
  adjustUI(hash);
}

/* =========================================
   UI SYNC
========================================= */

function adjustUI(hash) {
  const isAuthPage = hash === 'login' || hash === 'register';

  const navBar = document.querySelector('.mobile-nav');
  if (navBar) navBar.style.display = isAuthPage ? 'none' : 'flex';

  const rootPage = hash.split('/')[0];
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

/* =========================================
   INIT
========================================= */

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
