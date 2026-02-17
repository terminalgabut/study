// root/components/headerView.js

export const headerView = `
<header class="app-header">
  <div class="header-left">
    <button id="menuBtn" class="menu-btn" aria-label="Toggle sidebar">☰</button>
    <h1 class="app-title">Study App</h1>
  </div>

  <div id="dynamic-island-container" class="island-hidden">
    <div id="dynamic-island">
      <div class="island-content">
        <span id="island-icon"></span>
        <span id="island-text"></span>
      </div>
    </div>
  </div>

  <div class="header-right">
    <button id="settingsBtn" class="icon-btn" aria-label="Settings">
       <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
         <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
       </svg>
    </button>
    <button id="profileHeaderBtn" class="icon-btn profile-btn">
      <img src="https://i.pravatar.cc/32" alt="User profile">
    </button>
  </div>
</header>
`;
