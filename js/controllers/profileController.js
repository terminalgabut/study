// root/js/controllers/profileController.js

import { supabase } from '../services/supabase.js';
import { getProfile, 
         updateProfile, 
         getCognitiveHistory } from '../services/profileService.js';
import { uploadAvatar, deleteAvatar } from '../services/avatarService.js';
import { compressImage } from '../lib/imageCompressor.js'; 
import { buildLevelProfile } from '../lib/levelEngine.js';
import { buildTrendAnalysis } from '../lib/trendEngine.js';
import { buildStrengthProfile } from '../lib/strengthEngine.js';
import { analyzeVolatility } from '../lib/volatilityEngine.js';
import { buildStrengthNarrative } from "../lib/strengthNarrative.js"; 
import { renderIQTrendPreview } from '../lib/iqTrendPreview.js';
import { avatarModalView } from '../../components/avatarModalView.js'; 
import { profileHomeController } from './profileHomeController.js';
import { profileStatsController } from './profileStatsController.js'; 
import { profileMateriController } from './profileMateriController.js'; 

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
    this.uuidEl = document.getElementById('profileUuid');
    this.emailEl = document.getElementById('profileEmail');
    this.usernameEl = document.getElementById('profileUsername');
    this.fullNameEl = document.getElementById('profileFullName');
    this.bioEl = document.getElementById('profileBio');
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
    if (this.uuidEl) {
    this.uuidEl.textContent =
  profile.uuid || this.user.id.slice(0, 8);
           }
    this.bioEl && (this.bioEl.textContent = profile.bio || 'Belum ada bio.'); 

    if (this.avatarEl) {
      this.avatarEl.src =
        profile.avatar_url || '/img/avatar-default.png';
    } 
           
/* ===============================
   LEVEL ENGINE
=============================== */

const levelData = buildLevelProfile(profile.xp);

const levelEl = document.getElementById('userLevel');
const xpEl = document.getElementById('userXP');
const nextXpEl = document.getElementById('nextLevelXP');
const xpFillEl = document.getElementById('xpFill');
const badgeEl = document.getElementById('levelBadge');

if (levelEl) {
  levelEl.textContent = levelData.level;
}

if (xpEl) {
  xpEl.textContent =
    levelData.xp - levelData.currentLevelXP;
}

if (nextXpEl) {
  nextXpEl.textContent =
    levelData.nextLevelXP - levelData.currentLevelXP;
}

if (xpFillEl) {
  xpFillEl.style.width =
    `${levelData.progressPercent}%`;
}

if (badgeEl) {
  badgeEl.textContent = levelData.badge.name;
  badgeEl.className =
    `badge ${levelData.badge.className}`;
}
           
/* ===============================
   APPLY BADGE TO AVATAR
=============================== */

const avatarWrapper =
  document.querySelector('.profile-avatar');

if (avatarWrapper) {
  avatarWrapper.className =
    `profile-avatar ${levelData.badge.className}`;

}
  },

  /* =========================
 * IQ TREND PREVIEW (HEADER)
 * ========================= */
async loadIQTrendPreview() {
  if (!this.user) return;

  try {
    const sessions = await getCognitiveHistory(this.user.id, 8);
    if (!sessions || !sessions.length) return;

    const analysis = buildTrendAnalysis(sessions);
    if (!analysis) return;

/* ===============================
   VOLATILITY BADGE
================================ */

const volatilityBadgeEl =
  document.getElementById('volatilityBadge');

if (volatilityBadgeEl) {
  const iqHistory = sessions
    .map(s => s.cognitive_index)
    .filter(v => typeof v === 'number');

  const volatility = analyzeVolatility(iqHistory);

  volatilityBadgeEl.textContent = volatility.label;

  volatilityBadgeEl.classList.remove(
    'volatility-stable',
    'volatility-moderate',
    'volatility-high'
  );

  volatilityBadgeEl.classList.add(
    volatility.className
  );
}

    /* ===============================
       1️⃣ RENDER CHART
    =============================== */

    const iqValues = analysis.iqTrend.map(p => p.value);
    renderIQTrendPreview('iqTrendPreview', iqValues);

    /* ===============================
       2️⃣ DELTA DISPLAY
    =============================== */

    const deltaEl = document.getElementById('iqTrendDelta');

    if (deltaEl) {
      const deltaText =
        analysis.delta >= 0
          ? `+${analysis.delta.toFixed(1)}`
          : analysis.delta.toFixed(1);

      deltaEl.textContent = deltaText;

      // Dynamic color based on trendStatus
      deltaEl.classList.remove(
        'trend-up',
        'trend-down',
        'trend-stable'
      );

      if (analysis.trendStatus.includes("uptrend")) {
        deltaEl.classList.add('trend-up');
      } else if (analysis.trendStatus.includes("downtrend")) {
        deltaEl.classList.add('trend-down');
      } else {
        deltaEl.classList.add('trend-stable');
      }
    }
    
 /* ===============================
   3️⃣ STRENGTH / WEAKNESS
=============================== */

const strengthEl = document.getElementById('strengthText');
const weaknessEl = document.getElementById('weaknessText');

if (strengthEl) {
  strengthEl.textContent = analysis.strength.name;
}

if (weaknessEl) {
  weaknessEl.textContent = analysis.weakness.name;
}

/* ===============================
   3️⃣b STRENGTH NARRATIVE
=============================== */

const strengthDescEl = document.getElementById('strengthDescription');
const weaknessDescEl = document.getElementById('weaknessDescription');
const balanceNoteEl = document.getElementById('balanceNote');

const strengthProfile = buildStrengthProfile(sessions);

if (strengthProfile) {
  const narrative = buildStrengthNarrative(strengthProfile);

  if (strengthDescEl) {
    strengthDescEl.textContent = narrative.strengthText;
  }

  if (weaknessDescEl) {
    weaknessDescEl.textContent = narrative.weaknessText;
  }

  if (balanceNoteEl) {
    balanceNoteEl.textContent = narrative.balanceNote;
  }
}

    /* ===============================
       4️⃣ STABILITY SCORE
    =============================== */

    const stabilityEl = document.getElementById('stabilityScore');

    if (stabilityEl) {
      stabilityEl.textContent = `${analysis.stabilityScore}%`;
    }

    /* ===============================
       5️⃣ CONFIDENCE WARNING
    =============================== */

    const confidenceEl = document.getElementById('confidenceNote');

    if (confidenceEl) {
      if (analysis.confidenceNote) {
        confidenceEl.textContent = analysis.confidenceNote;
        confidenceEl.style.display = "block";
      } else {
        confidenceEl.style.display = "none";
      }
    }

  } catch (err) {
    console.error("IQ Trend Preview Error:", err);
  }
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
  <div class="home-overview">

    <!-- HERO SUMMARY -->
    <div class="home-card overview-hero">
      <div class="hero-main">
        <div class="hero-metric">
          <span class="metric-label">Cognitive Index</span>
          <span class="metric-value">...</span>
        </div>

        <div class="hero-metric">
          <span class="metric-label">Stability</span>
          <span class="metric-value">...</span>
        </div>

        <div class="hero-metric">
          <span class="metric-label">Neuro Type</span>
          <span class="metric-value accent">...</span>
        </div>
      </div>
    </div>

    <!-- DAILY STATS -->
    <div class="home-card overview-daily">
      <h4>Today</h4>
      <div class="daily-grid">
        <div class="daily-item">
          <span class="daily-number">12</span>
          <span class="daily-label">Quiz Done</span>
        </div>
        <div class="daily-item">
          <span class="daily-number">92</span>
          <span class="daily-label">Highest Score</span>
        </div>
        <div class="daily-item">
          <span class="daily-number">+18 XP</span>
          <span class="daily-label">XP Gained</span>
        </div>
      </div>
    </div>

    <!-- FAVORITE MATERIAL -->
    <div class="home-card overview-favorite">
      <h4>Favorite Material</h4>
      <div class="favorite-item">
        <span class="favorite-title">Logical Fallacies Advanced</span>
        <small>Most practiced this week</small>
      </div>
    </div>

    <!-- NEXT TARGET -->
    <div class="home-card overview-target">
      <h4>Next Target</h4>
      <div class="target-row">
        <span>Level 10 (Skilled)</span>
        <span class="accent">132 XP needed</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 64%"></div>
      </div>
    </div>

  </div>
`,
      materiProfile: `
  <div class="materi-overview">
    <div id="materiList"></div>
  </div>
`,
      statistikProfile: `
  <div class="home-card">
    <h3>Statistik</h3>

    <canvas id="profileRadar"></canvas>
    <canvas id="stabilityChart"></canvas>

    <div class="iq-summary-card">
      <p><strong>Estimated Cognitive Poin:</strong> <span id="iqValue"></span></p>
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

    if (tab === 'homeProfile') {
      await profileHomeController.render(this.user.id);  
}
    if (tab === 'statistikProfile') {
      await profileStatsController.render(this.user.id);
}
             if (tab === 'materiProfile') {
  await profileMateriController.render(this.user.id);
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
