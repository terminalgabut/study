export const loginView = `
<section class="login-page">
  <div class="login-container">
    <div class="home-card login-card">
      <div class="login-header">
        <h2>📔 Study Gabut</h2>
        <p>Masuk untuk menyimpan progres belajarmu</p>
      </div>

      <form id="loginForm" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="loginEmail" placeholder="nama@email.com" required>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" id="loginPassword" placeholder="••••••••" required>
        </div>

        <button type="submit" id="loginBtn" class="bab-item" style="width: 100%; justify-content: center;">
          Masuk Sekarang
        </button>
      </form>

      <div id="loginError" class="error-msg" style="display: none;"></div>
      
      <p class="auth-footer">
        Belum punya akun? <a href="#register">Daftar Gratis</a>
      </p>
    </div>
  </div>
</section>
`;
