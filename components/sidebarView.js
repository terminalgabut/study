export const sidebarView = `
<div class="sidebar-overlay"></div>

<nav class="sidebar">
  <!-- Home -->
  <button class="nav-btn" data-page="home">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5H9v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9z"/>
    </svg>
    <span class="label">Home</span>
  </button>

  <!-- Materi -->
  <button class="nav-btn" data-page="materi">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <path d="M4 19h16M4 5h16M4 12h16"/>
    </svg>
    <span class="label">Materi</span>
  </button>

  <!-- Riwayat -->
  <button class="nav-btn" data-page="riwayat">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <path d="M3 3v5h5M21 21v-5h-5"/>
      <path d="M3 21l18-18"/>
    </svg>
    <span class="label">Riwayat</span>
  </button>

  <!-- Bookmark -->
  <button class="nav-btn" data-page="bookmark">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
    <span class="label">Bookmark</span>
  </button>

  <!-- About -->
  <button class="nav-btn" data-page="about">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12" y2="8"/>
    </svg>
    <span class="label">About</span>
  </button>
</nav>
`;
