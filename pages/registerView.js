// pages/registerView.js

export const registerView = `
<section class="login-page" style="display: flex; align-items: center; justify-content: center; min-height: 90vh; padding: 20px;">
  <div class="home-card login-card" style="max-width: 420px; width: 100%; padding: 40px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
    
    <div class="login-header" style="margin-bottom: 30px;">
      <div class="login-icon" style="font-size: 3.5rem; margin-bottom: 15px; filter: drop-shadow(0 0 10px var(--accent));">🚀</div>
      <h2 style="font-size: 1.8rem; margin-bottom: 10px; letter-spacing: -0.5px;">Buat Akun Baru</h2>
      <p class="desc" style="font-size: 0.95rem; line-height: 1.5; opacity: 0.8;">Mulai perjalanan belajarmu dan simpan semua progres secara personal.</p>
    </div>

    <form id="registerForm" style="text-align: left;">
      
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7;">Username</label>
        <input type="text" id="regUsername" placeholder="Pilih nama unikmu" required 
          style="width: 100%; padding: 14px; border: 1.5px solid rgba(0,0,0,0.1); border-radius: 12px; background: rgba(255,255,255,0.05); color: inherit; outline: none; transition: 0.3s focus;">
      </div>

      <div class="form-group" style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7;">Password</label>
        <input type="password" id="regPassword" placeholder="Minimal 6 karakter" required 
          style="width: 100%; padding: 14px; border: 1.5px solid rgba(0,0,0,0.1); border-radius: 12px; background: rgba(255,255,255,0.05); color: inherit; outline: none;">
      </div>

      <button type="submit" id="regBtn" class="bab-item" style="width: 100%; justify-content: center; border: none; cursor: pointer; padding: 16px; border-radius: 12px; transition: transform 0.2s;">
        <span class="btn-text" style="font-weight: 700; font-size: 1rem;">Daftar Sekarang</span>
      </button>
    </form>

    <div id="regError" style="margin-top: 20px; color: #ff4d4d; font-size: 0.85rem; display: none; background: rgba(255,77,77,0.08); padding: 12px; border-radius: 8px; border-left: 4px solid #ff4d4d;"></div>

    <div class="login-footer" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05);">
      <p class="desc" style="font-size: 0.9rem;">Sudah punya akun? 
        <a href="#login" style="color: var(--accent); font-weight: 700; text-decoration: none; margin-left: 5px;">Masuk di sini</a>
      </p>
    </div>

  </div>
</section>
`;
