// root/js/app.js

// Module


alert('TEST MODULE JALAN');
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
  

init();
