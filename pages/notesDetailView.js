// pages/notesDetailView.js

export const notesDetailView = `
<section class="home notes-detail-page">
  <div class="hero">
    <h2 id="noteTitle">Memuat Judul...</h2>
    <p class="desc">Tinjau dan perbarui catatan belajarmu di sini.</p>
  </div>

  <div class="home-grid" style="grid-template-columns: 1fr;">
    <div class="home-card content-card">
      <div id="noteContentArea" class="note-body">
        <div id="noteDisplay" class="note-display"></div>
        
        <textarea id="noteEditor" class="note-editor" style="display: none;" placeholder="Tulis catatanmu di sini..."></textarea>
      </div>

      <div class="note-footer-action">
        <button id="actionNoteBtn" class="bab-item" style="width: auto; padding: 10px 25px; border: none; cursor: pointer;">
          <span class="btn-content">
            <span class="btn-icon">✏️</span>
            <span class="btn-text" style="font-weight: 600;">Edit Catatan</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</section>
`;
