import { supabase } from './supabase.js';

/**
 * Menyimpan hasil pengerjaan soal ke database.
 * Mengadopsi parameter lengkap dari app.js untuk mencegah data null.
 */
export async function saveStudyAttempt({ 
  session_id, 
  question_id, 
  category, 
  dimension, 
  user_answer, 
  correct_answer, 
  is_correct, 
  score, 
  duration_seconds 
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    const { error } = await supabase.from("study_attempts").insert([{
      user_id: user.id,
      session_id,
      question_id: String(question_id),
      category: category || "Materi",
      dimension: dimension || "Umum", // Memastikan dimension tidak null [cite: 81]
      user_answer,
      correct_answer,
      is_correct,
      score: score, // Skor 1 atau 0 [cite: 82]
      duration_seconds,
      submitted_at: new Date().toISOString()
    }]);

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error("Simpan gagal:", e.message);
    return { success: false, error: e.message };
  }
}
