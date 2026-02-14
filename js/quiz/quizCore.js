// root/js/quiz/quizCore.js
import { quizView } from '../../components/quizView.js';
import { quizState } from './quizState.js';
import { quizTimer } from './quizTimer.js';
import { supabase } from '../services/supabase.js';

export const quizCore = {
  container: null,
  slug: null,
  categoryPath: null,
  babTitle: null, // Tambahkan untuk menyimpan judul bab

  init(questions, container, babTitle) { // Terima babTitle dari generator
    const hash = window.location.hash; 
    const parts = hash.split('/'); 
    
    this.categoryPath = parts[1] || "umum"; 
    this.slug = parts[2] || "default";
    this.container = container;
    this.babTitle = babTitle; // Simpan ke state kuis

    const data = questions?.questions || questions;
    quizState.reset(Array.isArray(data) ? data : []);
    this.start();
  },

  start() {
    this.container.innerHTML = quizView.mainFrame();
    this.renderQuestion();
  },

  renderQuestion() {
    const q = quizState.getCurrentQuestion();
    if (!q) return;

    const activeArea = document.getElementById('activeQuestionContainer');
    const timerDisplay = document.getElementById('timerDisplay');
    
    // 1. Tampilkan Kartu Soal
    activeArea.innerHTML = quizView.questionCard(
      q, 
      quizState.currentStep, 
      quizState.totalQuestions
    );

    // 2. Jalankan Timer per Soal
    quizTimer.start(60, 
      (time) => { if (timerDisplay) timerDisplay.textContent = time; },
      () => { this.handleSelection(q, null, true); } // Timeout
    );

    this.updateProgressUI();
    
    // 3. Listener Radio Buttons
    const inputs = activeArea.querySelectorAll('input[name="quiz-opt"]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleSelection(q, e.target.value, false));
    });
  },

  async handleSelection(q, selectedValue, isTimeout) {
    quizTimer.stop();
    
    // Hitung durasi sejak soal ditampilkan
    const duration = Math.floor((Date.now() - quizState.startTime) / 1000);
    
    const inputs = document.querySelectorAll('input[name="quiz-opt"]');
    inputs.forEach(i => i.disabled = true);

    const isCorrect = selectedValue === q.correct_answer;
    if (isCorrect) quizState.addScore();

    // Sesuai rujukan: Tampilkan feedbackArea dan actionContainer
    const feedbackArea = document.getElementById('feedbackArea');
    const feedbackText = document.getElementById('feedbackText');
    const actionContainer = document.getElementById('actionContainer');
    const nextBtn = document.getElementById('nextBtn');

    if (feedbackArea && feedbackText) {
      feedbackArea.style.display = 'block';
      
      // Styling feedback sesuai kondisi
      if (isTimeout) {
        feedbackText.innerHTML = `<b style="color:#ef4444">❌ Waktu Habis!</b><br>Jawaban benar: ${q.correct_answer}`;
      } else {
        feedbackText.innerHTML = isCorrect 
          ? `<b style="color:#10b981">✅ Benar!</b><br>${q.explanation || ''}` 
          : `<b style="color:#ef4444">❌ Kurang Tepat.</b><br>Jawaban benar: ${q.correct_answer}<br><br>${q.explanation || ''}`;
      }
    }

    if (actionContainer) {
      actionContainer.style.display = 'block';
    }

    if (nextBtn) {
      nextBtn.onclick = () => this.handleNext();
    }

    // Simpan ke Supabase
    await this.saveAttempt({
      session_id: this.slug,
      question_id: String(q.id || quizState.currentStep), // Gunakan ID asli jika ada
      dimension: q.dimension || "Umum",
      category: this.categoryPath,
      title: this.babTitle, // MEMASUKKAN JUDUL BAB KE TABEL study_attempts
      user_answer: selectedValue || "TIMEOUT",
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      score: isCorrect ? 1 : 0,
      duration_seconds: Math.floor((Date.now() - quizState.startTime) / 1000)
    });
  },

  async saveAttempt(payload) {
    try {
      const { error } = await supabase.from("study_attempts").insert([payload]);
      if (error) throw error;
      console.log("Statistik berhasil direkam.");
    } catch (e) {
      console.error("Gagal merekam statistik:", e.message);
    }
  },

  handleNext() {
    if (quizState.hasNext()) {
      quizState.currentStep++;
      // Penting: Reset startTime state agar durasi per soal akurat
      quizState.startTime = Date.now(); 
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.finish();
    }
  },

  updateProgressUI() {
    // Progres dihitung dari index soal saat ini
    const progress = ((quizState.currentStep + 1) / quizState.totalQuestions) * 100;
    const bar = document.getElementById('quizBar');
    const scoreEl = document.getElementById('liveScore');
    
    if (bar) bar.style.width = `${progress}%`;
    if (scoreEl) scoreEl.textContent = quizState.correctCount;
  },

  async finish() {
  quizTimer.stop();
  const rate = quizState.getScoreRate();
  let nextChapter = null;

  try {
    // 1. Ambil posisi m_order dan category dari materi sekarang
    const { data: currentData } = await supabase
      .from('materials')
      .select('m_order, category')
      .eq('slug', this.slug)
      .single();

    if (currentData) {
      // 2. Cari materi berikutnya yang satu kategori dan m_order-nya lebih besar
      const { data: nextData } = await supabase
        .from('materials')
        .select('slug, title')
        .eq('category', currentData.category) // Pengunci kategori
        .gt('m_order', currentData.m_order)    // Cari urutan setelahnya
        .order('m_order', { ascending: true }) // Pastikan urut dari yang terkecil
        .limit(1)
        .maybeSingle();

      if (nextData) {
        nextChapter = {
          // Gunakan categoryPath agar URL tetap konsisten dengan router kamu
          url: `#materi/${this.categoryPath}/${nextData.slug}`,
          title: nextData.title 
        };
      }
    }
  } catch (err) {
    console.error("Gagal memuat bab berikutnya:", err.message);
  }

  // 3. Render ke UI melalui quizView
  this.container.innerHTML = quizView.finalResult(
    rate, 
    quizState.correctCount, 
    quizState.totalQuestions, 
    nextChapter
  );
},

  closeQuiz() {
    const quizEl = document.getElementById('quizSection');
    const materiContainer = document.getElementById('materiContainer');
    const pageEl = document.querySelector('.konten-page');

    // Hentikan timer kuis jika masih berjalan
    if (quizTimer) quizTimer.stop();

    // Sembunyikan Kuis (kebalikan dari logic di generator.js)
    if (quizEl) {
      quizEl.setAttribute('hidden', 'true');
      quizEl.innerHTML = ''; 
    }

    // Tampilkan kembali Materi
    if (materiContainer) {
      materiContainer.style.display = 'block';
    }

    // Hapus class animasi transisi
    if (pageEl) {
      pageEl.classList.remove('show-quiz');
    }

    // Feedback ke Island (Opsional tapi keren)
    if (window.islandController) {
        window.islandController.announce("Lanjut Belajar 📖", "music", "timer");
    }
  }
};

window.closeQuiz = () => quizCore.closeQuiz();
