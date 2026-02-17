// js/controllers/profileController.js

import { supabase } from '../services/supabase.js';
import { getProfile, updateProfile } from '../services/profileService.js';
import { uploadAvatar, deleteAvatar } from '../services/avatarService.js';
import { compressImage } from '../lib/imageCompressor.js';
import { avatarModalView } from '../../components/avatarModalView.js';

export const profileController = {

  async init() {
    this.cacheDom();
    await this.loadProfile();
    this.bindEvents();
  },

  /* =========================
   * DOM CACHE
   * ========================= */
  cacheDom() {
    this.emailEl = document.getElementById('profileEmail');
    this.usernameEl = document.getElementById('profileUsername');
    this.fullNameEl = document.getElementById('profileFullName');
    this.bioEl = document.getElementById('profileBio');
    this.xpEl = document.getElementById('profileXP');

    this.avatarEl = document.getElementById('profileAvatar');
    this.editBtn = document.getElementById('editProfileBtn');
  },

  /* =========================
   * LOAD PROFILE
   * ========================= */
  async loadProfile() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;

    this.user = user;

    const profile = await getProfile(user.id);
    if (!profile) return;

    this.profile = profile;

    // render data
    this.emailEl && (this.emailEl.textContent = user.email);
    this.usernameEl && (this.usernameEl.textContent = profile.username || '-');
    this.fullNameEl && (this.fullNameEl.textContent = profile.full_name || '-');
    this.bioEl && (this.bioEl.textContent = profile.bio || 'Belum ada bio.');
    this.xpEl && (this.xpEl.textContent = profile.xp ?? 0);

    // avatar
    if (this.avatarEl) {
      this.avatarEl.src =
        profile.avatar_url || '/img/avatar-default.png';
    }
  },

  /* =========================
   * EVENTS
   * ========================= */
  bindEvents() {
    // edit profile
    this.editBtn?.addEventListener('click', () => {
      this.openEditModal();
    });

    // avatar → modal
    this.avatarEl?.addEventListener('click', () => {
      this.openAvatarModal();
    });
  },

  /* =========================
   * AVATAR MODAL HANDLER
   * ========================= */
  openAvatarModal() {
    avatarModalView.show({
      user: this.user,
      profile: this.profile,

      onUpload: async (file) => {
        try {
          // compress image
          const compressed = await compressImage(file, {
            maxWidth: 512,
            maxHeight: 512,
            quality: 0.8
          });

          const avatarUrl = await uploadAvatar(
            this.user.id,
            compressed
          );

          // update local state + UI
          this.profile.avatar_url = avatarUrl;
          if (this.avatarEl) this.avatarEl.src = avatarUrl;

          avatarModalView.hide();
        } catch (err) {
          console.error('[Avatar Upload]', err);
          alert(err.message || 'Gagal upload avatar');
        }
      },

      onRemove: async () => {
        try {
          await deleteAvatar(this.user.id);

          this.profile.avatar_url = null;
          if (this.avatarEl) {
            this.avatarEl.src = '/img/avatar-default.png';
          }

          avatarModalView.hide();
        } catch (err) {
          console.error('[Avatar Remove]', err);
          alert('Gagal menghapus avatar');
        }
      }
    });
  },

  /* =========================
   * EDIT PROFILE (PLACEHOLDER)
   * ========================= */
  openEditModal() {
    // nanti ganti dengan editProfileModalView
    alert('Modal edit profil akan dibuat di sini');
  }
};
