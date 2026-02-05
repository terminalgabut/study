import { supabase } from '../services/supabase.js'; // [cite: 26, 27]

export async function handleBookmarkToggle(slug, category) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  // Cek status awal
  const { data: existing, error: fetchError } = await supabase
    .from('bookmark')
    .select('material_slug')
    .eq('material_slug', slug)
    .maybeSingle();

  if (existing) btn.classList.add('active');

  btn.onclick = async () => {
    const isActive = btn.classList.contains('active');

    if (isActive) {
      const { error } = await supabase
        .from('bookmark')
        .delete()
        .eq('material_slug', slug);
      
      if (!error) {
        btn.classList.remove('active');
        console.log("Berhasil dihapus");
      } else {
        console.error("Gagal hapus:", error.message);
      }
    } else {
      // Pastikan kolom material_slug dan category ada di tabel
      const { error } = await supabase
        .from('bookmark')
        .insert([{ 
          material_slug: slug, 
          category: category 
        }]);
      
      if (!error) {
        btn.classList.add('active');
        console.log("Berhasil disimpan");
      } else {
        // CEK ERROR DI SINI (biasanya RLS Policy)
        alert("Gagal simpan: " + error.message);
        console.error("Detail Error:", error);
      }
    }
  };
}
