export async function initKontenBab(category, slug) {
  const titleEl = document.getElementById('learningTitle');
  const contentEl = document.getElementById('learningContent');
  if (!titleEl || !contentEl) return;

  const { data, error } = await supabase
    .from('materi')
    .select('content, category')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    contentEl.innerHTML = '<p>Materi tidak ditemukan</p>';
    return;
  }

  // 🔑 judul dari category
  titleEl.textContent = data.category;

  // 🔥 isi HTML murni dari DB
  contentEl.innerHTML = data.content;
}
