// root/components/quizView.js

export const quizView = {
  // Placeholder saat memuat kuis [cite: 6]
  loading() {
    return `
      <div class="quiz-container">
        <div class="quiz-placeholder">
          <p>Memasuki mode latihan, mohon tunggu...</p>
        </div>
      </div>
    `;
  },

  // Bingkai utama kuis: Header (Timer & Skor) serta Progress Bar [cite: 13, 14]
  mainFrame() {
    return `
      <div class="quiz-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
         <div class="timer-box" style="color:var(--accent); font-weight:bold; font-family:monospace; font-size:1.2rem;">
            ⏱ <span id="timerDisplay">60</span>s
         </div>
         <div style="color:var(--text-muted)">Skor: <span id="liveScore">0</span></div>
      </div>
      <div class="quiz-progress-container" style="height:6px; background:rgba(255,255,255,0.1); border-radius:10px; margin-bottom:25px; overflow:hidden;">
        <div id="quizBar" style="height:100%; background:var(--accent); width:0%; transition: width 0.3s ease;"></div>
      </div>
      <div id="activeQuestionContainer"></div>
    `;
  },

  // Kartu Soal: Mengikuti struktur detail Soal, Badge Dimension, dan Radio Buttons [cite: 17, 18, 19]
  questionCard(q, currentStep, total) {
    return `
      <div class="quiz-item active">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:var(--text-muted); font-size:14px;">Soal ${currentStep + 1} / ${total}</span>
          <span style="background:rgba(var(--accent-rgb), 0.1); color:var(--accent); font-size:11px; padding:2px 8px; border-radius:4px;">
            ${q.dimension || 'Umum'}
          </span>
        </div>
        <p class="quiz-question" style="margin-top:10px; margin-bottom:20px; font-weight:600; font-size:18px;">
          ${q.question}
        </p>
        
        <div class="quiz-options" style="display:flex; flex-direction:column; gap:12px;">
          ${q.options.map(opt => `
            <label class="option-label">
              <input type="radio" name="quiz-opt" value="${opt}">
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>

        <div id="feedbackArea" class="quiz-feedback" style="display:none; margin-top:20px; padding:15px; border-radius:10px; border:1px solid var(--border);">
          <p id="feedbackText" style="margin:0;"></p>
        </div>

        <div id="actionContainer" style="margin-top:25px; display:none;">
          <button id="nextBtn" class="primary-btn" style="width:100%;">
            ${currentStep + 1 === total ? 'Lihat Hasil Akhir' : 'Lanjut ke Soal Berikutnya'}
          </button>
        </div>
      </div>
    `;
  },

  // Hasil Akhir: Mengadopsi tampilan persentase besar dan tombol "Kembali ke Materi" [cite: 37, 38]
  finalResult(rate, correctCount, total) {
    return `
      <div class="quiz-container" style="text-align:center; padding:40px;">
        <h2 style="color:var(--accent)">Latihan Selesai!</h2>
        <div style="font-size:48px; margin:20px 0; font-weight:bold;">${rate}%</div>
        <p>Anda menjawab <b>${correctCount}</b> dari ${total} soal dengan benar.</p>
        <button class="primary-btn" onclick="location.reload()" style="margin-top:25px;">
          Kembali ke Materi
        </button>
      </div>
    `;
  }
};
