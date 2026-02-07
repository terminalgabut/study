// pages/loginView.js

export const loginView = `
<section class="login-page" style="display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 20px;">
  <div class="home-card login-card" style="max-width: 400px; width: 100%; padding: 40px; text-align: center;">
    
    <div class="login-header" style="margin-bottom: 30px;">
      <div class="login-icon" style="font-size: 3rem; margin-bottom: 10px;">📔</div>
      <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Selamat Datang</h2>
      <p class="desc" style="font-size: 0.95rem;">Masuk untuk lanjut belajar dan menyimpan progresmu.</p>
    </div>

    <form id="loginForm" style="text-align: left;">
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">Username</label>
        <input type="text" id="loginUsername" placeholder="Masukkan Username" required>
          style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: rgba(255,255,255,0.05); color: inherit; outline: none;">
      </div>

      <div class="form-group" style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">Password</label>
        <input type="password" id="loginPassword" placeholder="••••••••" required 
          style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: rgba(255,255,255,0.05); color: inherit; outline: none;">
      </div>

      <button type="submit" id="loginBtn" class="bab-item" style="width: 100%; justify-content: center; border: none; cursor: pointer; padding: 15px;">
        <span class="btn-text" style="font-weight: bold;">Masuk Sekarang</span>
      </button>
    </form>

    <div id="loginError" style="margin-top: 20px; color: #ff4d4d; font-size: 0.85rem; display: none; background: rgba(255,77,77,0.1); padding: 10px; border-radius: 6px;"></div>

    <div class="login-footer" style="margin-top: 30px; font-size: 0.9rem;">
      <p class="desc">Belum punya akun? <a href="#register" style="color: var(--accent); font-weight: 600; text-decoration: none;">Daftar Sekarang</a></p>
    </div>

  </div>
</section>
`;
