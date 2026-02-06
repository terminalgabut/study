export const kontenBabView = `
<section class="konten-page">
  <div class="konten-wrapper">

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

    <div id="materiContainer">
      <article id="learningContent" class="konten-isi"></article>

  <div class="notes-section">
  <h4>Catatan</h4>
  <textarea id="noteArea" placeholder="Tulis poin-poin penting di sini..."></textarea>
  <button id="saveNoteBtn" class="btn-save">Simpan Catatan</button>
  <span id="saveStatus" class="status-text"></span>
</div>

      <div class="konten-actions">
        <button class="primary-btn" id="generateQuizBtn">
          Latihan Soal
        </button>
      </div>
    </div>

    <section class="quiz-section" id="quizSection" hidden>
      </section>

  </div>
</section>
`;
