// js/controllers/profileController.js

import { supabase } from '../services/supabase.js';
import { getProfile, updateProfile } from '../services/profileService.js';

export const profileController = {

  async init() {
    this.cacheDom();
    await this.loadProfile();
    this.bindEvents();
  },

  cacheDom() {
    this.emailEl = document.getElementById('profileEmail');
    this.usernameEl = document.getElementById('profileUsername');
    this.fullNameEl = document.getElementById('profileFullName');
    this.bioEl = document.getElementById('profileBio');
    this.xpEl = document.getElementById('profileXP');

    this.editBtn = document.getElementById('editProfileBtn');
  },

  async loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    this.user = user;

    const profile = await getProfile(user.id);
    if (!profile) return;

    this.profile = profile;

    if (this.emailEl) this.emailEl.textContent = user.email;
    if (this.usernameEl) this.usernameEl.textContent = profile.username || '-';
    if (this.fullNameEl) this.fullNameEl.textContent = profile.full_name || '-';
    if (this.bioEl) this.bioEl.textContent = profile.bio || 'Belum ada bio.';
    if (this.xpEl) this.xpEl.textContent = profile.xp ?? 0;
  },

  bindEvents() {
    this.editBtn?.addEventListener('click', () => {
      this.openEditModal();
    });
  },

  openEditModal() {
    // placeholder, nanti bisa jadi komponen modal terpisah
    alert('Modal edit profil akan dibuat di sini');
  }
};
