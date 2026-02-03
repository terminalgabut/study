import { supabase } from '../services/supabase.js';

export async function initBab(category) {
  const title = document.querySelector('.bab-title');
  const list = document.getElementById('babList');

  if (!title || !list) return;

  title.textContent = `Materi ${category}`;

  // nanti:
  // query supabase
  // render <a href="#materi/.../...">
}
