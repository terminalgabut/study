// js/ui/auth/auth.js
import { supabase } from '../../services/supabase.js';

// Helper tetap sama, memastikan username jadi format email di database
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
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;

    // Validasi sederhana: Username tidak boleh pakai spasi
    if (username.includes(' ')) {
        errorMsg.innerText = "Username tidak boleh mengandung spasi!";
        errorMsg.style.display = 'block';
        return;
    }

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

      // 2. Jika Auth berhasil
      if (authData.user) {
        // Simpan username asli ke tabel profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              username: username, 
              full_name: username,
              xp: 0 
            }
          ]);

        if (profileError) console.warn("Profil gagal dibuat:", profileError.message);
        
        // PENTING: Jika di Supabase "Confirm Email" NYALA, 
        // user tidak akan otomatis login. Kita paksa login manual:
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: formatEmail(username),
            password: password,
        });

        if (loginError) throw new Error("Akun dibuat, tapi gagal login otomatis. Silakan login manual.");
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
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    errorMsg.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.innerText = 'Memverifikasi...';

    try {
      const { error } = await supabase.auth.signInWithPassword({
        // User ketik username, kita kirim email virtualnya
        email: formatEmail(username),
        password: password,
      });

      if (error) throw error;

      window.location.hash = '#home';

    } catch (err) {
      // Pesan error lebih ramah
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
  try {
    await supabase.auth.signOut();
    
    // Gunakan replace agar user tidak bisa klik "back" kembali ke halaman profil
    window.location.replace('#login'); 
    
    // Opsional: Jika masih membandel di browser tertentu, 
    // force reload akan membersihkan semua sisa variabel di app.js
    // window.location.reload(); 
  } catch (err) {
    console.error("Gagal logout:", err.message);
    window.location.hash = '#login';
  }
}
