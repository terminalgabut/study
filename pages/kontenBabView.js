export const kontenBabView = `
<section class="konten-page bg-gray-50 min-h-screen">
  <div class="konten-wrapper max-w-2xl mx-auto px-4 py-10">

    <div class="konten-header mb-8 text-center">
      <h1 id="learningTitle" class="text-3xl font-bold text-gray-800"></h1>
    </div>

    <div id="materiContainer">
      <article id="learningContent" class="bg-white p-6 rounded-xl shadow-sm mb-6 prose max-w-none"></article>
      <div class="konten-actions">
        <button id="generateQuizBtn" class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition duration-200">
          🎯 Mulai Latihan Soal
        </button>
      </div>
    </div>

    <section id="quizSection" class="hidden space-y-8">
      <div id="quiz-ui" class="bg-white rounded-xl shadow-lg p-6 sm:p-8 dark:bg-slate-800 dark:text-gray-100">
         </div>
      
      <div id="results-ui" class="bg-white rounded-xl shadow-lg p-8 text-center hidden">
        <h2 class="text-3xl font-bold text-blue-600 mb-4">Hasil Kuis</h2>
        <p class="text-lg text-gray-600 mb-2">Skor Akhir Anda:</p>
        <p id="final-score" class="font-bold text-7xl text-green-600 my-4">0</p>
        <button onclick="location.reload()" class="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
          Ulangi Materi
        </button>
      </div>
    </section>

  </div>
</section>
`;
