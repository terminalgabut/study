let inflight = false;

export async function saveStudyAttempt(payload) {
  if (inflight) return false;
  inflight = true;

  try {
    const { error } = await supabase
      .from('study_attempts')
      .insert({
        ...payload,
        submitted_at: new Date().toISOString()
      });

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('[study_attempts]', err);
    return false;
  } finally {
    inflight = false;
  }
}
