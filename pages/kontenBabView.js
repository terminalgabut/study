export const kontenBabView = `
<section class="konten-page">
  <div class="konten-wrapper">

    <!-- judul + bookmark (1 div, 1 baris) -->
    <div class="konten-header">
      <h1 id="learningTitle" class="konten-title"></h1>

      <button id="bookmarkBtn"
              class="bookmark-btn"
              title="Simpan bookmark"
              aria-label="Bookmark materi">
      <svg xmlns="http://www.w3.org/2000/svg"
             width="24" height="24"
             fill="none"
             stroke="currentColor"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round"
     viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>

    <article id="learningContent" class="konten-isi"></article>

  </div>
</section>
`;
