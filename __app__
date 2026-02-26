// root/js/app.js

// Module
import { supabase } from './services/supabase.js'; 
import { getProfile } from './services/profileService.js'; 
import { initHeader } from './ui/header.js'; 
import { initSidebar } from './ui/sidebar.js'; 
import { audioController } from './controllers/audioController.js'; 
import { initRouter } from './router/hashRouter.js'; 

// Views
import { headerView } from '../components/headerView.js';  
import { sidebarView } from '../components/sidebarView.js'; 

console.log("app.js ✅");

const DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
window.__DEBUG__ = {
  log: (...args) => DEV && console.log('[DEBUG]', ...args),
  warn: (...args) => DEV && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

async function init() {
   console.log("Init ✅");
   window.__DEBUG__.log('App init() dipanggil');

  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div id="main-layout-wrapper">
      ${headerView}
      <div class="layout">
        ${sidebarView}
      </div>
    </div>
    <main id="content"></main>
  `;

  if (!document.getElementById('youtube-player')) {
    const ytDiv = document.createElement('div');
    ytDiv.id = 'youtube-player';
    ytDiv.style.cssText = 'position:absolute; top:-9999px; left:-9999px; width:1px; height:1px;';
    document.body.appendChild(ytDiv);
  }
  
  supabase.auth.onAuthStateChange((event, session) => {
    window.__DEBUG__.log('Auth Event:', event);
    if (event === 'SIGNED_OUT') {
      window.location.hash = '#login';
      const content = document.getElementById('content');
      if (content) content.innerHTML = ''; 
    }
    checkLayout();
  }); 

  audioController.init();
  await initHeader(); 
  await greetUserOnLoad(); 
  initSidebar();
  initRouter();
  
setTimeout(() => {
  greetUserOnLoad();
}, 100);

  window.addEventListener('hashchange', checkLayout);
  checkLayout();
}

function checkLayout() {
  const hash = window.location.hash;
  const layoutWrapper = document.getElementById('main-layout-wrapper');
  const contentArea = document.getElementById('content');
  const isAuthPage = hash === '#login' || hash === '#register' || hash === '' || hash === '#';

  if (layoutWrapper && contentArea) {
    if (isAuthPage) {
      layoutWrapper.style.display = 'none';
      contentArea.style.cssText = 'margin: 0; padding: 0;';
    } else {
      layoutWrapper.style.display = 'block';
      contentArea.style.cssText = ''; 
    }
  }
}

async function greetUserOnLoad() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const profile = await getProfile(user.id);

    const name =
      profile?.full_name ||
      profile?.username ||
      user.email?.split('@')[0] ||
      'User';

    window.islandController?.setStatus('greeting', {
      text: `Wellcome ${name} `,
      icon: 'robot',
      priority: -10
    });

    // hilangkan setelah beberapa detik
    setTimeout(() => {
      window.islandController?.removeStatus('greeting');
    }, 6000);

  } catch (err) {
    console.warn('Greeting gagal:', err);
  }
}

document.addEventListener("DOMContentLoaded", init);
