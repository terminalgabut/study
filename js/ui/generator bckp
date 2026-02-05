import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const pageEl = document.querySelector('.konten-page');

  if (!btnEl || !quizEl) return;

  // Hapus listener lama jika ada (mencegah double click/error)
  btnEl.onclick = async () => {
    // 1. Ambil elemen konten secara REAL-TIME saat klik terjadi
    const contentEl = document.getElementById('learningContent');
    
    // 2. Ambil teks murni, bersihkan spasi/newline berlebih
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    // DEBUG: Cek di console apakah teksnya muncul saat tombol diklik
    console.log("Konten yang ditangkap saat klik:", contentText);

    // 3. Validasi sebelum kirim ke API
    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna. Tunggu sebentar.");
      return;
    }

    // 4. UI State: Tampilkan loading
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');
    quizEl.scrollIntoView({ behavior: 'smooth' });
    quizEl.innerHTML = `<h3>Latihan Soal</h3><p>Sedang menyusun soal dari materi di atas...</p>`;

    // 5. Ambil data pendukung dari URL
    const hash = window.location.hash.replace(/^#\/?/, '');
    const [category, slug] = hash.split('/');

    try {
      // 6. Kirim ke API
      const result = await generateQuiz({
        materi: contentText, // Pastikan variabel ini yang dikirim
        category: category || "Umum",
        slug: slug || "default",
        order: 1
      });

      // 7. Render (Pastikan ambil result.quiz)
      renderQuiz(result.quiz, quizEl);

    } catch (err) {
      console.error("Generator Error:", err);
      quizEl.innerHTML = `<h3>Latihan Soal</h3><p style="color:red">Gagal: ${err.message}</p>`;
    }
  };
}

function renderQuiz(data, container) {
  if (!data || !data.questions) {
    container.innerHTML = '<p>Soal gagal dibuat.</p>';
    return;
  }

  let html = `<h3>Latihan Soal: ${data.category}</h3>`;
  data.questions.forEach((q, i) => {
    html += `
      <div class="quiz-item" style="margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <p><strong>${i+1}. ${q.question}</strong></p>
        <ul style="list-style:none; padding:0;">
          ${q.options.map(opt => `
            <li>
              <label><input type="radio" name="q${i}" value="${opt}"> ${opt}</label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });
  container.innerHTML = html;
}
