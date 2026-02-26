export async function saveStudyAttempt(payload) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Pakai payload langsung, tambahkan user_id dan timestamp
    const { error } = await supabase.from("study_attempts").insert([{
      ...payload,
      user_id: user.id,
      submitted_at: new Date().toISOString()
    }]);

    if (error) throw error;
  } catch (e) {
    console.error("Simpan gagal:", e.message);
  }
}
