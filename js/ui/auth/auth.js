// js/ui/auth/auth.js
import { supabase } from '../../services/supabase.js';

// Helper untuk mengubah username menjadi format email dummy (di balik layar)
const formatEmail = (username) => `${username.toLowerCase().trim()}@study.gabut`;

/**
 * LOGIKA DAFTAR (REGISTER)
 */
export function initRegister() {
  const regForm = document.getElementById('registerForm');
  const regBtn = document.getElementById('regBtn');
  const errorMsg = document.getElementById('regError');

  if (!regForm) return;

  regForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    // Reset UI
    errorMsg.style.display = 'none';
    regBtn.disabled = true;
    regBtn.innerText = 'Mendaftarkan...';

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formatEmail(username),
        password: password,
        options: {
          data: { 
            full_name: username,
            username: username 
          }
        }
      });

      if (error) throw error;

      // Jika berhasil, Supabase otomatis login (jika confirm email OFF)
      window.location.hash = '#home';
      
    } catch (err) {
      errorMsg.innerText = "Gagal daftar: " + err.message;
      errorMsg.style.display = 'block';
      regBtn.disabled = false;
      regBtn.innerText = 'Daftar Sekarang';
    }
  };
}

/**
 * LOGIKA MASUK (LOGIN)
 */
export function initLogin() {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('loginError');

  if (!loginForm) return;

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Reset UI
    errorMsg.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.innerText = 'Memverifikasi...';

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formatEmail(username),
        password: password,
      });

      if (error) throw error;

      window.location.hash = '#home';

    } catch (err) {
      errorMsg.innerText = "Username atau Password salah!";
      errorMsg.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.innerText = 'Masuk Sekarang';
    }
  };
}

/**
 * LOGIKA KELUAR (LOGOUT)
 */
export async function handleLogout() {
  await supabase.auth.signOut();
  window.location.hash = '#login';
}
