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
      // 1. Buat User di Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formatEmail(username),
        password: password,
      });

      if (authError) throw authError;

      // 2. Jika Auth berhasil, buat record di tabel profiles publik
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              username: username, 
              full_name: username,
              xp: 0 // Nilai awal untuk fitur gamifikasi nanti
            }
          ]);

        if (profileError) {
          console.warn("Auth sukses tapi gagal membuat profil:", profileError.message);
          // Kita tetap lanjut ke home karena akun auth sudah aktif
        }
      }

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
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.hash = '#login';
  } else {
    console.error("Gagal logout:", error.message);
  }
}
