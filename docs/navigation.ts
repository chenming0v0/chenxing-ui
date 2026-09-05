export function readRoute(hash: string) {
  const [path, query = ''] = (hash.slice(1) || '/').split('?')
  const section = new URLSearchParams(query).get('section')
  if (path === '/start') return { page: 'start' as const, path, section }
  if (path.startsWith('/c/')) return { page: 'component' as const, path, section, slug: path.slice(3) }
  return { page: path === '/' ? 'home' as const : 'missing' as const, path, section }
}

// A second hash would replace the document route. Keep section links in its query.
export function sectionHref(id: string, hash = window.location.hash) {
  const { path } = readRoute(hash)
  return `#${path}?${new URLSearchParams({ section: id })}`
}
