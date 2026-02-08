import { supabase } from '../services/supabase.js';
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

    if (materiContainer) materiContainer.style.display = 'none';
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');
    
    document.getElementById('learningTitle').scrollIntoView({ behavior: 'smooth' });

    quizEl.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-placeholder">
          <p>Memasuki mode latihan, mohon tunggu...</p>
        </div>
      </div>
    `;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug') || "default";

      const result = await generateQuiz({
        materi: contentText,
        category: "category",
        slug: slug,
        order: 1
      });

      if (result && result.quiz) {
        renderStepByStepQuiz(result.quiz, quizEl, slug);
      }
    } catch (err) {
      console.error("Generator Error:", err);
      if (materiContainer) materiContainer.style.display = 'block';
      quizEl.innerHTML = `<p style="color:var(--accent); text-align:center; padding:20px;">Gagal memuat soal: ${err.message}</p>`;
    }
  };
}

function renderStepByStepQuiz(data, container, slug) {
  let currentStep = 0;
  let correctCount = 0;
  let timerInterval;
  const questions = data.questions;
  const total = questions.length;

  const initFrame = () => {
    container.innerHTML = `
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
    displayQuestion();
  };

  const displayQuestion = () => {
    const q = questions[currentStep];
    const target = document.getElementById('activeQuestionContainer');
    const progressBar = document.getElementById('quizBar');
    const timerDisplay = document.getElementById('timerDisplay');
    
    let timeLeft = 60; 
    let startTime = Date.now(); 

    progressBar.style.width = `${(currentStep / total) * 100}%`;

    target.innerHTML = `
      <div class="quiz-item active">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:var(--text-muted); font-size:14px;">Soal ${currentStep + 1} / ${total}</span>
          <span style="background:rgba(var(--accent-rgb), 0.1); color:var(--accent); font-size:11px; padding:2px 8px; border-radius:4px;">${q.dimension || 'Umum'}</span>
        </div>
        <p class="quiz-question" style="margin-top:10px; margin-bottom:20px; font-weight:600; font-size:18px;">${q.question}</p>
        
        <div class="quiz-options" style="display:flex; flex-direction:column; gap:12px;">
          ${q.options.map(opt => `
            <label class="option-label">
              <input type="radio" name="answer" value="${opt}">
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>

        <div id="feedbackContainer" class="quiz-feedback" style="display:none; margin-top:20px; padding:15px; border-radius:10px; border:1px solid var(--border);">
          <p id="feedbackText" style="margin:0;"></p>
        </div>

        <div id="actionContainer" style="margin-top:25px; display:none;">
          <button id="nextBtn" class="primary-btn" style="width:100%;">Lanjut ke Soal Berikutnya</button>
        </div>
      </div>
    `;

    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleSelection(null, true);
      }
    }, 1000);

    const inputs = target.querySelectorAll('input[name="answer"]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => handleSelection(e.target.value, false));
    });

    const handleSelection = async (selectedValue, isTimeout) => {
      clearInterval(timerInterval);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      inputs.forEach(i => i.disabled = true);

      const isCorrect = selectedValue === q.correct_answer;
      if (isCorrect) {
        correctCount++;
        document.getElementById('liveScore').innerText = correctCount;
      }

      const fbBox = document.getElementById('feedbackContainer');
      const fbText = document.getElementById('feedbackText');
      fbBox.style.display = 'block';
      fbBox.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;
      
      fbText.innerHTML = isTimeout 
        ? `<b style="color:#ef4444">❌ Waktu Habis!</b><br>Jawaban benar: ${q.correct_answer}`
        : isCorrect 
          ? `<b style="color:#10b981">✅ Benar!</b><br>${q.explanation || ''}` 
          : `<b style="color:#ef4444">❌ Kurang Tepat.</b><br>Jawaban benar: ${q.correct_answer}<br><br>${q.explanation || ''}`;

      document.getElementById('actionContainer').style.display = 'block';

      // REKAM ATTEMPT: Sinkronisasi Dimension & Score
      await saveAttempt({
        session_id: slug, // Nama kolom sesuai SQL
        question_id: String(q.id || currentStep),
        dimension: q.dimension || "Umum", // Mengambil dimensi dari AI
        category: q.category || data.category || "General",
        user_answer: selectedValue || "TIMEOUT",
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0, // Hitung skor otomatis
        duration_seconds: duration
      });
    };

    document.getElementById('nextBtn')?.addEventListener('click', handleNext);
  };

  async function saveAttempt(payload) {
    try {
      // Interceptor di supabase.js akan otomatis menyuntikkan user_id
      const { error } = await supabase.from("study_attempts").insert([payload]);
      if (error) throw error;
      console.log("Statistik latihan berhasil diperbarui.");
    } catch (e) { 
      console.error("Gagal merekam statistik:", e.message); 
    }
  }

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
    const rate = Math.round((correctCount / total) * 100);
    container.innerHTML = `
      <div class="quiz-container" style="text-align:center; padding:40px;">
        <h2 style="color:var(--accent)">Latihan Selesai!</h2>
        <div style="font-size:48px; margin:20px 0; font-weight:bold;">${rate}%</div>
        <p>Anda menjawab <b>${correctCount}</b> dari ${total} soal dengan benar.</p>
        <button class="primary-btn" onclick="location.reload()" style="margin-top:25px;">Kembali ke Materi</button>
      </div>
    `;
  };

  initFrame();
}
