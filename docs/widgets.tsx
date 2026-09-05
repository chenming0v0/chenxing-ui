import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { allEntries, CATEGORIES, importNames, type DemoEntry, type DemoExample, type PropTable } from './registry'
import { Icon, BrandMark } from '../src'

function copyText(value: string) {
  if (navigator.clipboard) return navigator.clipboard.writeText(value)
  const area = document.createElement('textarea')
  area.value = value
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  area.remove()
  return Promise.resolve()
}

export function Highlight({ code }: { code: string }) {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const html = escaped
    .replace(/(\/\/.*)$/gm, '<span class="token-comment">$1</span>')
    .replace(/(&quot;.*?&quot;|&apos;.*?&apos;|".*?"|'.*?')/g, '<span class="token-string">$1</span>')
    .replace(/\b(import|from|export|function|return|const|let|if|else|new|true|false|type|interface)\b/g, '<span class="token-keyword">$1</span>')
    .replace(/(&lt;\/?[A-Z][\w.]*)/g, '<span class="token-tag">$1</span>')
    .replace(/\b([A-Z][A-Za-z]+)(?=\s*\()/g, '<span class="token-function">$1</span>')
  return <code dangerouslySetInnerHTML={{ __html: html }} />
}

export function CopyButton({ value, className = '' }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={className}
      aria-label={copied ? '已复制' : '复制代码'}
      title={copied ? '已复制' : '复制'}
      onClick={() => { void copyText(value).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1500) }) }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={16} />
    </button>
  )
}

export function Snippet({ code }: { code: string }) {
  return <div className="docs-snippet"><Highlight code={code} /><CopyButton value={code} className="docs-snippet-copy" /></div>
}

export function CodeDemo({ example, entry }: { example: DemoExample; entry: DemoEntry }) {
  const [expanded, setExpanded] = useState(false)
  const Demo = example.Demo
  const hasCode = Boolean(example.code.trim())
  const lines = example.code.trim().split('\n').length
  return (
    <div className="docs-code-demo">
      <div className={`docs-preview-stage${example.bare || entry.bare ? ' docs-preview-bare' : ''}`}>
        <Demo />
      </div>
      {hasCode ? (
        <div className={`docs-code-panel${!expanded && lines > 6 ? ' is-collapsed' : ''}`}>
          <pre><Highlight code={example.code.trim()} /></pre>
          <CopyButton value={example.code} className="docs-code-copy" />
          {lines > 6 ? <button type="button" className="docs-expand" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Collapse code' : 'Expand code'}</button> : null}
        </div>
      ) : null}
    </div>
  )
}

export function Heading({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="docs-section-heading"><a href={`#${id}`}>{children}</a><a className="docs-heading-anchor" href={`#${id}`} aria-label={`链接到 ${children}`}>#</a></h2>
}

export function ApiTables({ tables }: { tables: PropTable[] }) {
  return (
    <div>
      {tables.map((table) => (
        <section className="docs-api-group" key={table.heading}>
          <h3>{table.heading}</h3>
          <div className="docs-api-table-wrap">
            <table className="docs-api-table">
              <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>{table.rows.map((row) => <tr key={row.name}><td><code>{row.name}</code></td><td>{row.type}</td><td>{row.default ? <code>{row.default}</code> : '—'}</td><td>{row.description}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

export function Sidebar({ activeSlug }: { activeSlug: string | null }) {
  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar-section">
        <p className="docs-sidebar-heading">Overview</p>
        <a className="docs-sidebar-link" href="#/start" aria-current={activeSlug === '__start' ? 'page' : undefined}>开始使用</a>
        <a className="docs-sidebar-link" href="#/" aria-current={activeSlug === null ? 'page' : undefined}>全部组件</a>
      </div>
      {CATEGORIES.map((category) => (
        <div className="docs-sidebar-section" key={category.id}>
          <p className="docs-sidebar-heading docs-sidebar-muted">{category.title}</p>
          {category.entries.map((entry) => <a className="docs-sidebar-link" key={entry.slug} href={`#/c/${entry.slug}`} aria-current={activeSlug === entry.slug ? 'page' : undefined}><span className="docs-dot" />{entry.name}{entry.badge ? <span className={`docs-badge${entry.badge === 'new' ? ' new' : ''}`}>{entry.badge === 'new' ? 'New' : 'Updated'}</span> : null}</a>)}
        </div>
      ))}
    </aside>
  )
}

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return CATEGORIES.map((category) => ({ ...category, entries: category.entries.filter((entry) => !normalized || `${entry.name} ${entry.slug} ${entry.description}`.toLowerCase().includes(normalized)) })).filter((category) => category.entries.length > 0)
  }, [query])
  useEffect(() => { inputRef.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [onClose])
  return <div className="docs-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="docs-search-dialog" role="dialog" aria-modal="true" aria-label="搜索组件"><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components..." onKeyDown={(event) => { if (event.key === 'Enter' && results[0]?.entries[0]) { window.location.hash = `#/c/${results[0].entries[0].slug}`; onClose() } }} /> <div className="docs-search-results">{results.map((category) => <div key={category.id}><div className="docs-search-group-label">{category.title}</div>{category.entries.map((entry) => <a className="docs-search-result" key={entry.slug} href={`#/c/${entry.slug}`} onClick={onClose}><span>{entry.name}</span><small>{entry.description}</small></a>)}</div>)}</div></div></div>
}

export function Header({ onSearch }: { onSearch: () => void }) {
  const [dark, setDark] = useState(() => localStorage.getItem('chenxing-docs-theme') === 'dark')
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('chenxing-docs-theme', dark ? 'dark' : 'light') }, [dark])
  return <header className="docs-header"><div className="docs-banner"><strong>辰星设计体系</strong><span>v0.2.0 · React component documentation</span></div><div className="docs-navbar"><a className="docs-brand" href="#/"><BrandMark decorative /><span>辰星</span><span className="docs-version">v0.2.0 <Icon name="chevron-down" size={14} /></span></a><button type="button" className="docs-search-trigger" onClick={onSearch}><Icon name="search" size={17} /><span>Search</span><kbd>Ctrl K</kbd></button><div className="docs-actions"><button type="button" className="docs-icon-button docs-mobile-menu" aria-label="打开菜单"><Icon name="menu" size={19} /></button><a className="docs-icon-button" href="https://github.com/chenming0v0/chenxing-ui" target="_blank" rel="noreferrer" aria-label="GitHub"><Icon name="github" size={18} /></a><button type="button" className="docs-theme-button" onClick={() => setDark((value) => !value)}><Icon name={dark ? 'sun' : 'moon'} size={16} />Theme</button></div></div><nav className="docs-subnav" aria-label="文档导航"><a href="#/start" aria-current={window.location.hash === '#/start' ? 'page' : undefined}><Icon name="book-open" size={16} />开始使用</a><a href="#/" aria-current={!window.location.hash.startsWith('#/start') ? 'page' : undefined}><Icon name="layers" size={16} />组件</a></nav></header>
}

export function Toc({ ids }: { ids: { id: string; label: string; level?: number }[] }) {
  const [active, setActive] = useState(ids[0]?.id ?? '')
  useEffect(() => { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id) }), { rootMargin: '0% 0% -80% 0%' }); ids.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element) }); return () => observer.disconnect() }, [ids])
  if (!ids.length) return null
  return <aside className="docs-toc"><div className="docs-toc-title"><Icon name="list" size={16} />On this page</div><ul className="docs-toc-list">{ids.map((item) => <li key={item.id} data-level={item.level ?? 2} data-active={active === item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ul></aside>
}

export function Pager({ entry }: { entry: DemoEntry }) {
  const entries = allEntries(); const index = entries.findIndex((item) => item.slug === entry.slug); const previous = entries[index - 1]; const next = entries[index + 1]
  return <div className="docs-pager">{previous ? <a href={`#/c/${previous.slug}`}><span>Previous</span><strong>← {previous.name}</strong></a> : <span />}{next ? <a href={`#/c/${next.slug}`}><span>Next</span><strong>{next.name} →</strong></a> : null}</div>
}

export function DocsLayout({ children, activeSlug, toc, onSearch }: { children: ReactNode; activeSlug: string | null; toc: { id: string; label: string; level?: number }[]; onSearch: () => void }) {
  return <div className="docs-app"><Header onSearch={onSearch} /><div className="docs-layout"><Sidebar activeSlug={activeSlug} /><main className="docs-main"><div className="docs-article">{children}</div></main><Toc ids={toc} /></div></div>
}

export { importNames }
