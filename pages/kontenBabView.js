export const kontenBabView = `
<section class="konten-page">
  <div class="konten-wrapper">

    <!-- judul + bookmark -->
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

    <!-- isi materi -->
    <article id="learningContent" class="konten-isi"></article>

    <!-- aksi materi -->
    <div class="konten-actions">
      <button class="primary-btn" id="generateQuizBtn">
        Latihan Soal
      </button>
    </div>

    <!-- placeholder generator soal (hidden by default) -->
    <section class="quiz-section" id="quizSection" hidden>
      <h3>Latihan Soal</h3>
      <div class="quiz-placeholder">
        <p>Soal akan muncul di sini.</p>
      </div>
    </section>

    <!-- navigasi bab -->
    <div class="konten-nav">
      <button class="nav-prev" disabled>
        ← Sebelumnya
      </button>

      <button class="nav-next" disabled>
        Selanjutnya →
      </button>
    </div>

  </div>
</section>
`;
