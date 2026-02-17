// root/pages/profileView.js

import { supabase } from '../js/services/supabase.js';
import { getProfile, updateProfile } from '../js/services/profileService.js';

export async function profilePage() {
  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `<p>Loading profile...</p>`;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    content.innerHTML = `<p>Silakan login dulu.</p>`;
    return;
  }

  const profile = await getProfile(user.id);

  const fullName = profile?.full_name || '';
  const username = profile?.username || '';
  const bio = profile?.bio || '';

  content.innerHTML = `
    <section class="profile-page">
      <h2>Profile</h2>

      <form id="profile-form" class="profile-form">
        <label>
          Username
          <input type="text" name="username" value="${username}" />
        </label>

        <label>
          Full Name
          <input type="text" name="full_name" value="${fullName}" />
        </label>

        <label>
          Bio
          <textarea name="bio" rows="3">${bio}</textarea>
        </label>

        <button type="submit" class="primary-btn">
          Simpan Perubahan
        </button>

        <p id="profile-status" class="status"></p>
      </form>
    </section>
  `;

  const form = document.getElementById('profile-form');
  const status = document.getElementById('profile-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Menyimpan...';

    const formData = new FormData(form);

    const payload = {
      username: formData.get('username'),
      full_name: formData.get('full_name'),
      bio: formData.get('bio'),
      updated_at: new Date().toISOString()
    };

    try {
      await updateProfile(user.id, payload);
      status.textContent = 'Profil berhasil diperbarui ✅';
    } catch (err) {
      status.textContent = 'Gagal menyimpan profil ❌';
    }
  });
}
