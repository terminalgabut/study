// root/js/app.js

// Module
import { supabase } from './services/supabase.js'; 


console.log("app.js ✅");

// 2. GLOBAL DEBUG CONFIG
const DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
window.__DEBUG__ = {
  log: (...args) => DEV && console.log('[DEBUG]', ...args),
  warn: (...args) => DEV && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// 3. MAIN INIT FUNCTION
function init() {
   console.log("Init ✅");
   document.getElementById('app').innerHTML = "<h1>2 Sistem Hidup!</h1>";
  
  supabase.auth.onAuthStateChange((event, session) => {
    window.__DEBUG__.log('Auth Event:', event);
    if (event === 'SIGNED_OUT') {
      window.location.hash = '#login';
      const content = document.getElementById('content');
      if (content) content.innerHTML = ''; 
    }
    checkLayout();
  });
  
}
init();
