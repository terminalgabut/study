const cache = new Map()

export async function smartFetch(url, ttl = 30000) {
  const now = Date.now()

  if (cache.has(url)) {
    const { data, time } = cache.get(url)
    if (now - time < ttl) return data
  }

  const res = await fetch(url)
  const data = await res.json()

  cache.set(url, { data, time: now })
  return data
}
