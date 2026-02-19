// root/js/controllers/profileController.js

import { supabase } from '../services/supabase.js';
import { getProfile, updateProfile } from '../services/profileService.js';
import { uploadAvatar, deleteAvatar } from '../services/avatarService.js';
import { compressImage } from '../lib/imageCompressor.js';
import { buildTrendAnalysis } from '../lib/trendEngine.js';
import { renderIQTrendPreview } from '../lib/iqTrendPreview.js';
import { avatarModalView } from '../../components/avatarModalView.js'; 
import { profileStatsController } from './profileStatsController.js'; 

export const profileController = {

  async init() {
    this.cacheDom();
    await this.loadProfile();
    await this.loadIQTrendPreview();
    this.bindEvents();
    this.initProfileTabs();
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

    this.emailEl && (this.emailEl.textContent = user.email);
    this.usernameEl && (this.usernameEl.textContent = profile.username || '-');
    this.fullNameEl && (this.fullNameEl.textContent = profile.full_name || '-');
    this.bioEl && (this.bioEl.textContent = profile.bio || 'Belum ada bio.');
    this.xpEl && (this.xpEl.textContent = profile.xp ?? 0);

    if (this.avatarEl) {
      this.avatarEl.src =
        profile.avatar_url || '/img/avatar-default.png';
    } 
  },

  /* =========================
   * IQ TREND PREVIEW (HEADER)
   * ========================= */
  async loadIQTrendPreview() {
  if (!this.user) return;

  const sessions = await getCognitiveHistory(this.user.id, 8);
  if (!sessions.length) return;

  const analysis = buildTrendAnalysis(sessions);
  if (!analysis) return;

  const iqValues = analysis.iqTrend.map(p => p.value);

  renderIQTrendPreview('iqTrendPreview', iqValues);

  const deltaEl = document.getElementById('iqTrendDelta');
  if (deltaEl) {
    deltaEl.textContent =
      analysis.delta >= 0
        ? `+${analysis.delta.toFixed(1)}`
        : analysis.delta.toFixed(1);
  }

  const strengthEl = document.getElementById('strengthText');
  const weaknessEl = document.getElementById('weaknessText');

  strengthEl && (strengthEl.textContent = analysis.strength.name);
  weaknessEl && (weaknessEl.textContent = analysis.weakness.name);
},

  /* =========================
   * EVENTS
   * ========================= */
  bindEvents() {
    this.editBtn?.addEventListener('click', () => {
      this.openEditModal();
    });

    this.avatarEl?.addEventListener('click', () => {
      this.openAvatarModal();
    });
  },

  /* =========================
   * INTERNAL PROFILE TABS
   * ========================= */
  initProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const content = document.getElementById('profileDynamicContent');
    if (!tabs.length || !content) return;

    const views = {
      homeProfile: `
        <div class="home-card">
          <h3>Overview</h3>
          <p>Selamat datang di halaman profil kamu.</p>
        </div>
      `,
      materiProfile: `
        <div class="home-card">
          <h3>Materiku</h3>
          <p>Daftar materi yang sudah kamu pelajari.</p>
        </div>
      `,
      statistikProfile: `
  <div class="home-card">
    <h3>Statistik</h3>

    <canvas id="profileRadar"></canvas>
    <canvas id="stabilityChart"></canvas>

    <div class="iq-summary-card">
      <p><strong>Estimated IQ:</strong> <span id="iqValue"></span></p>
      <p><strong>Classification:</strong> <span id="iqClass"></span></p>
      <p><strong>Confidence:</strong> <span id="iqConfidence"></span>%</p>
      <p><strong>Neuro Type:</strong> <span id="neuroType"></span></p>
      <div class="iq-insight">
      <p id="iqDescription"></p>
      </div>
    </div>
  </div>
`,
      settingProfile: `
        <div class="home-card">
          <h3>Pengaturan</h3>
          <button class="primary-btn" id="editProfileBtnInternal">
            Edit Profil
          </button>
        </div>
      `
    };

    const render = async (tab) => {
    content.innerHTML = views[tab] || views.homeProfile;

    // 🔥 TARUH DI SINI
    if (tab === 'statistikProfile') {
  await profileStatsController.render(this.user.id);
}
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      render(tab.dataset.tab);
    });
  });

  render('homeProfile');
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
          const compressed = await compressImage(file, {
            maxWidth: 512,
            maxHeight: 512,
            quality: 0.8
          });

          const avatarUrl = await uploadAvatar(
            this.user.id,
            compressed
          );

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

  openEditModal() {
    alert('Modal edit profil akan dibuat di sini');
  }
};
