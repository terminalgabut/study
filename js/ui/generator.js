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
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // TRANSISI UI: Sembunyikan materi & Scroll ke atas
    if (materiContainer) materiContainer.classList.add('hidden');
    quizSection.classList.remove('hidden');
    quizSection.removeAttribute('hidden');
    titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const quizUI = document.getElementById('quiz-ui') || quizSection;
    quizUI.innerHTML = `
      <div class="flex flex-col items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-500 font-medium">Menyusun soal evaluasi...</p>
      </div>
    `;

    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [category, slug] = hash.split('/');

      // Logika data tetap sama
      const result = await generateQuiz({
        materi: contentText,
        category: category || "Umum",
        slug: slug || "default",
        order: 1
      });

      if (result && result.quiz) {
        renderQuizTailwind(result.quiz, quizUI);
      }
    } catch (err) {
      if (materiContainer) materiContainer.classList.remove('hidden');
      quizUI.innerHTML = `<p class="text-red-500 p-4 font-bold text-center">Gagal: ${err.message}</p>`;
    }
  };
}

function renderQuizTailwind(data, container) {
  let html = `
    <div class="mb-8 border-b pb-6">
      <h2 class="text-2xl font-bold text-gray-800">Latihan: ${data.category}</h2>
      <p class="text-gray-500 mt-1">Pilih jawaban yang paling tepat.</p>
    </div>
    <div class="space-y-10">
  `;

  data.questions.forEach((q, i) => {
    html += `
      <div class="quiz-card">
        <p class="text-xl font-semibold mb-5 text-gray-800">${i + 1}. ${q.question}</p>
        <div class="grid grid-cols-1 gap-3">
          ${q.options.map(opt => `
            <label class="flex items-center p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition group relative">
              <input type="radio" name="q${i}" value="${opt}" class="hidden peer">
              <div class="w-6 h-6 border-2 border-gray-300 rounded-full mr-4 peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition">
                <div class="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition"></div>
              </div>
              <span class="text-gray-600 group-hover:text-blue-700 peer-checked:text-blue-800 peer-checked:font-medium">${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += `
    <button id="checkResultBtn" class="mt-12 w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg transition transform active:scale-95">
      Kirim Jawaban
    </button>
  </div>
  `;

  container.innerHTML = html;
}
