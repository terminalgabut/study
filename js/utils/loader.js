export async function load(path) {
  const res = await fetch(path);
  return res.text();
}
