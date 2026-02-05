import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');
  const pageEl = document.querySelector('.konten-page');

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    const contentEl = document.getElementById('learningContent');
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // 1. UI STATE: Sembunyikan materi secara total & tampilkan loading
    if (materiContainer) materiContainer.style.display = 'none';
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');
    
    // Scroll ke atas agar fokus ke area kuis
    document.getElementById('learningTitle').scrollIntoView({ behavior: 'smooth' });

    quizEl.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-placeholder">
          <p>Sedang menyusun soal latihan...</p>
        </div>
      </div>
    `;

    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [category, slug] = hash.split('/');

      // Logic pengiriman ke client tetap sama sesuai file aslimu
      const result = await generateQuiz({
        materi: contentText,
        category: category || "Umum",
        slug: slug || "default",
        order: 1
      });

      if (result && result.quiz) {
        renderStepByStepQuiz(result.quiz, quizEl);
      }
    } catch (err) {
      console.error("Generator Error:", err);
      if (materiContainer) materiContainer.style.display = 'block';
      quizEl.innerHTML = `<p style="color:var(--accent); text-align:center; padding:20px;">Gagal memuat soal: ${err.message}</p>`;
    }
  };
}

function renderStepByStepQuiz(data, container) {
  let currentStep = 0;
  const questions = data.questions;
  const total = questions.length;
  
  // Variabel penampung jawaban untuk dikirim ke backend nanti
  const userAnswers = [];

  const initFrame = () => {
    container.innerHTML = `
      <div class="quiz-progress-container" style="height:6px; background:rgba(255,255,255,0.1); border-radius:10px; margin-bottom:25px; overflow:hidden;">
        <div id="quizBar" style="height:100%; background:var(--accent); width:0%; transition: width 0.3s ease;"></div>
      </div>
      <div id="activeQuestionContainer"></div>
    `;
    displayQuestion();
  };

  const displayQuestion = () => {
    const q = questions[currentStep];
    const target = document.getElementById('activeQuestionContainer');
    const progressBar = document.getElementById('quizBar');

    // Update Progress Bar
    progressBar.style.width = `${(currentStep / total) * 100}%`;

    target.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-item active">
          <span style="color:var(--text-muted); font-size:14px;">Pertanyaan ${currentStep + 1} dari ${total}</span>
          <p class="quiz-question" style="margin-top:10px; margin-bottom:20px; font-weight:600; font-size:18px;">${q.question}</p>
          
          <div class="quiz-options" style="display:flex; flex-direction:column; gap:12px;">
            ${q.options.map((opt, idx) => `
              <label class="option-label" style="display:flex; align-items:center; padding:15px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; cursor:pointer; transition: 0.2s;">
                <input type="radio" name="answer" value="${opt}" style="margin-right:12px; accent-color:var(--accent);">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>

          <div id="feedbackContainer" class="quiz-feedback" style="display:none; margin-top:20px; padding:15px; border-radius:10px; border:1px solid var(--border);">
            <p id="feedbackText"></p>
          </div>

          <div id="actionContainer" style="margin-top:25px; display:none;">
            <button id="nextBtn" class="primary-btn" style="width:100%;">Lanjut ke Soal Berikutnya</button>
          </div>
        </div>
      </div>
    `;

    // Listener Jawaban
    const inputs = target.querySelectorAll('input[name="answer"]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        
        // Simpan jawaban (urusan backend nanti)
        userAnswers[currentStep] = selectedValue;

        // Nonaktifkan semua pilihan agar tidak bisa ganti jawaban saat koreksi muncul
        inputs.forEach(i => i.disabled = true);

        // Tampilkan Wadah Koreksi & Tombol Next
        // (Logika isi koreksi dari AI backend bisa dimasukkan di sini nanti)
        document.getElementById('feedbackContainer').style.display = 'block';
        document.getElementById('feedbackText').innerText = "Jawaban terpilih: " + selectedValue + ". Menunggu koreksi AI...";
        document.getElementById('actionContainer').style.display = 'block';
      });
    });

    // Listener Tombol Next
    document.getElementById('nextBtn')?.addEventListener('click', () => {
      handleNext();
    });
  };

  const handleNext = () => {
    currentStep++;
    if (currentStep < total) {
      displayQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showFinalResult();
    }
  };

  const showFinalResult = () => {
    document.getElementById('quizBar').style.width = "100%";
    container.innerHTML = `
      <div class="quiz-container" style="text-align:center; padding:40px;">
        <h2 style="color:var(--accent); margin-bottom:15px;">Latihan Selesai!</h2>
        <p>Semua jawaban telah terkumpul untuk dikoreksi oleh AI.</p>
        <button class="primary-btn" onclick="location.reload()" style="margin-top:25px;">Kembali ke Materi</button>
      </div>
    `;
  };

  initFrame();
}
