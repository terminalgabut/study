// generator.js
import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizSection = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');
  const titleEl = document.getElementById('learningTitle');

  if (!btnEl || !quizSection) return;

  btnEl.onclick = async () => {
    const contentEl = document.getElementById('learningContent');
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    if (!contentText || contentText.length < 10) {
      alert("Materi belum tersedia.");
      return;
    }

    // --- TRANSISI: SEMBUNYIKAN MATERI ---
    materiContainer.classList.add('hidden'); // Sembunyikan artikel & tombol
    quizSection.classList.remove('hidden'); // Tampilkan section kuis
    titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // UI Loading Gaya Tailwind
    const quizUI = document.getElementById('quiz-ui');
    quizUI.innerHTML = `
      <div class="flex flex-col items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-500 font-medium">Menyusun 10 soal evaluasi...</p>
      </div>
    `;

    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [category, slug] = hash.split('/');

      const result = await generateQuiz({
        content: contentText, // Sesuaikan dengan payload API
        category: category || "Umum",
        slug: slug || "default"
      });

      if (result && result.quiz) {
        renderQuizItems(result.quiz, quizUI);
      }
    } catch (err) {
      materiContainer.classList.remove('hidden');
      quizUI.innerHTML = `<p class="text-red-500 p-4">Gagal: ${err.message}</p>`;
    }
  };
}

function renderQuizItems(data, container) {
  let html = `
    <h2 class="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">Uji Pemahaman: ${data.category}</h2>
    <div class="space-y-10">
  `;

  data.questions.forEach((q, i) => {
    html += `
      <div class="quiz-card" data-correct="${q.correct_answer}">
        <p class="text-xl font-semibold mb-5 text-gray-800">${i + 1}. ${q.question}</p>
        <div class="grid grid-cols-1 gap-3">
          ${q.options.map(opt => `
            <label class="flex items-center p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition group relative">
              <input type="radio" name="q${i}" value="${opt}" class="hidden peer">
              <div class="w-6 h-6 border-2 border-gray-300 rounded-full mr-4 peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
              </div>
              <span class="text-gray-600 group-hover:text-blue-700 peer-checked:text-blue-800 peer-checked:font-medium">${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += `
    <button id="submitKuisBtn" class="mt-12 w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg transition transform active:scale-95">
      Kirim Jawaban
    </button>
  `;

  container.innerHTML = html;

  document.getElementById('submitKuisBtn').addEventListener('click', () => {
    processResults(data.questions);
  });
}

function processResults(questions) {
  let correctCount = 0;
  
  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const options = document.querySelectorAll(`input[name="q${i}"]`);
    
    options.forEach(input => {
      const label = input.closest('label');
      label.classList.add('pointer-events-none');
      
      if (input.value === q.correct_answer) {
        label.classList.add('bg-green-50', 'border-green-500', 'text-green-700');
      }
      if (selected && selected.value === input.value && input.value !== q.correct_answer) {
        label.classList.add('bg-red-50', 'border-red-500', 'text-red-700');
      }
    });

    if (selected && selected.value === q.correct_answer) correctCount++;
  });

  const finalScore = Math.round((correctCount / questions.length) * 100);
  document.getElementById('final-score').textContent = finalScore;
  document.getElementById('results-ui').classList.remove('hidden');
  document.getElementById('submitKuisBtn').classList.add('hidden');
  document.getElementById('results-ui').scrollIntoView({ behavior: 'smooth' });
}
