export async function load(path) {
  const url = new URL(path, import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Load failed');
  return res.text();
}
