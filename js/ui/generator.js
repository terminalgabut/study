import { generateQuiz } from '../services/quizClient.js';
import { saveStudyAttempt } from '../services/quizService.js';
import { quizTemplates } from '../../components/quizUi.js';

/**
 * Inisialisasi Generator Kuis
 * @param {Object} dataMateri - Objek baris tunggal dari tabel 'materi'
 */
export function initQuizGenerator(dataMateri) {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');

  if (!btnEl || !quizEl || !dataMateri) return;

  btnEl.onclick = async () => {
    // AMBIL DATA DARI OBJEK (Bukan dari DOM)
    const judulKategori = dataMateri.category; 
    const isiMateri = dataMateri.content;
    const slug = dataMateri.slug;

    if (!isiMateri || isiMateri.length < 10) {
      alert("Konten materi tidak valid.");
      return;
    }

    // Persiapan UI
    if (materiContainer) materiContainer.style.display = 'none';
    quizEl.removeAttribute('hidden');
    quizEl.innerHTML = `<div style="text-align:center; padding:40px;"><div class="spinner"></div><p>AI sedang menyusun kuis <b>${judulKategori}</b>...</p></div>`;
    
    try {
      const result = await generateQuiz({
        materi: isiMateri,
        category: judulKategori,
        slug: slug,
        order: dataMateri.order || 1
      });

      if (result && result.quiz) {
        renderStepByStepQuiz(result.quiz, quizEl, slug, judulKategori);
      } else {
        throw new Error("Format kuis tidak valid");
      }
    } catch (err) {
      console.error("Quiz Error:", err);
      quizEl.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat kuis. Silakan coba lagi.</p>`;
      if (materiContainer) materiContainer.style.display = 'block';
    }
  };
}

function renderStepByStepQuiz(quizData, container, slug, judulKategori) {
  let currentStep = 0;
  let correctCount = 0;
  let timerInterval;
  const questions = quizData.questions;
  const total = questions.length;

  // Render Frame Utama dari quizUi.js
  const initFrame = () => {
    container.innerHTML = quizTemplates.mainFrame();
    displayQuestion();
  };

  const displayQuestion = () => {
    const q = questions[currentStep];
    const target = document.getElementById('activeQuestionContainer');
    const progressBar = document.getElementById('quizBar');
    const timerDisplay = document.getElementById('timerDisplay');
    const liveScoreEl = document.getElementById('liveScore');
    
    let timeLeft = 60;
    let startTime = Date.now();
    
    // Update Progress Bar
    if (progressBar) progressBar.style.width = `${(currentStep / total) * 100}%`;
    
    // Render Kartu Soal dari quizUi.js
    target.innerHTML = quizTemplates.questionCard(q, currentStep, total);

    // Timer Logic
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerDisplay) timerDisplay.innerText = timeLeft;
      if (timeLeft <= 0) handleSelection(null, true);
    }, 1000);

    const handleSelection = async (selectedValue, isTimeout = false) => {
      clearInterval(timerInterval);
      
      const isCorrect = selectedValue === q.correct_answer;
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // 1. Update Live Skor di UI
      if (isCorrect) {
        correctCount++;
        if (liveScoreEl) liveScoreEl.textContent = correctCount;
      }

      // 2. Simpan ke Database (study_attempts)
      await saveStudyAttempt({
        session_id: slug,
        question_id: String(q.id || currentStep),
        category: judulKategori, // Menggunakan kategori asli dari materi
        dimension: q.dimension || "Umum",
        user_answer: selectedValue || (isTimeout ? "TIMEOUT" : "NO_ANSWER"),
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        duration_seconds: duration
      });

      // 3. Tampilkan Feedback (Elemen dari quizUi.js)
      const fbContainer = document.getElementById('feedbackContainer');
      const fbText = document.getElementById('feedbackText');
      const actionContainer = document.getElementById('actionContainer');
      const nextBtn = document.getElementById('nextBtn');

      if (fbContainer && fbText) {
        fbContainer.style.display = 'block';
        fbContainer.style.borderColor = isCorrect ? '#4ade80' : '#f87171';
        fbText.innerHTML = isCorrect 
          ? `<b style="color:#4ade80">✓ Benar!</b>` 
          : `<b style="color:#f87171">✘ Kurang Tepat.</b><br>Jawaban benar: <i>${q.correct_answer}</i>`;
      }

      if (actionContainer) {
        actionContainer.style.display = 'block';
        nextBtn.onclick = () => {
          currentStep++;
          if (currentStep < total) {
            displayQuestion();
          } else {
            showFinalResult();
          }
        };
      }
      
      // Disable pilihan agar tidak bisa klik ulang
      target.querySelectorAll('input').forEach(input => input.disabled = true);
    };

    // Listener Jawaban
    target.querySelectorAll('input[name="answer"]').forEach(input => {
      input.onclick = (e) => handleSelection(e.target.value);
    });
  };

  const showFinalResult = () => {
    const rate = Math.round((correctCount / total) * 100);
    // Render Hasil Akhir dari quizUi.js
    container.innerHTML = quizTemplates.finalResult(rate, correctCount, total);
  };
  
  initFrame();
}
