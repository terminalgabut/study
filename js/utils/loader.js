export async function load(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Load failed');
  return res.text();
}
