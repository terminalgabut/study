import { load } from './loader.js';

export async function navigate(page) {
  const content = document.getElementById('content');
  content.innerHTML = await load(`pages/${page}.html`);
}
