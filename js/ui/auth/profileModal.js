import { supabase } from '../../services/supabase.js';
import { handleLogout } from './auth.js';

export async function initProfileModal() {
  const nameEl = document.getElementById('profileName');
  const userEl = document.getElementById('profileUsername');
  const avatarEl = document.getElementById('userAvatar');
  const btnLogout = document.getElementById('btnLogoutAction');
  const btnDelete = document.getElementById('btnDeleteAccount'); // ID dari view kamu

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (nameEl) nameEl.innerText = profile.full_name || 'Gabuter';
        if (userEl) userEl.innerText = `@${profile.username}`;
        // FOTO PROFIL: memuat dari DB atau auto-generate
        if (avatarEl) {
           avatarEl.src = profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random`;
        }
      }
    }
  } catch (err) {
    console.error("Gagal memuat profil modal:", err);
  }

  // LOGIKA LOGOUT
  if (btnLogout) {
    btnLogout.onclick = async () => {
      if (confirm('Yakin ingin keluar?')) await handleLogout();
    };
  }

  // LOGIKA HAPUS AKUN (Hapus data profil saja karena auth.admin butuh key khusus)
  if (btnDelete) {
    btnDelete.onclick = async () => {
      if (confirm('PERINGATAN: Hapus akun akan menghapus semua data profil. Lanjutkan?')) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('profiles').delete().eq('id', user.id);
        await handleLogout();
      }
    };
  }
}
