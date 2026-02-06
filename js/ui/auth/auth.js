// js/ui/auth/auth.js
import { supabase } from '../../services/supabase.js';

/**
 * Inisialisasi Logika Halaman Login
 */
export function initLogin() {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('loginError');

  if (!loginForm) return;

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    
    // Ambil data dari form
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Reset UI State
    errorMsg.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="btn-text">Memverifikasi...</span>';

    try {
      // PROSES LOGIN KE SUPABASE
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Jika berhasil, arahkan ke home
      window.location.hash = '#home';
      
    } catch (err) {
      console.error('Auth Error:', err.message);
      errorMsg.innerText = "Email atau password salah!";
      errorMsg.style.display = 'block';
      
      // Kembalikan tombol ke semula
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span class="btn-text">Masuk Sekarang</span>';
    }
  };
}

/**
 * Fungsi Logout Global
 */
export async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Setelah logout, paksa ke halaman login
    window.location.hash = '#login';
  } catch (err) {
    console.error('Logout Error:', err.message);
    alert('Gagal keluar sistem.');
  }
}
