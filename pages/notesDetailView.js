export const notesDetailView = `
<section class="home notes-detail-page">
  <div class="home-card hero">
    <h2 id="noteTitle">Memuat Judul...</h2>
    <p class="desc">Gunakan catatan ini untuk mengingat poin penting materi.</p>
  </div>

  <div class="home-card content-card">
    <div id="noteContentArea">
      <div id="noteDisplay" class="note-display"></div>
      <textarea id="noteEditor" class="note-editor" style="display: none;"></textarea>
    </div>

    <div class="note-actions">
      <button id="actionNoteBtn" class="primary-btn">
        <span class="btn-icon">✏️</span> 
        <span class="btn-text">Edit Catatan</span>
      </button>
    </div>
  </div>
</section>
`;
