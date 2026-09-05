import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, BookOpen, Code2, Layers, Link, List, Menu, Search, X } from 'lucide-react'
import { BrandMark, useDrawerFocus } from '../src'
import { version } from '../package.json'
import { allEntries, CATEGORIES, type DemoEntry, type PropTable } from './registry'
import { sectionHref } from './navigation'

export { CodeDemo, CopyButton, Snippet } from './code'
export { SearchDialog } from './search'

export function Heading({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} tabIndex={-1} className="docs-section-heading">
    <a href={sectionHref(id)}>{children}<Link className="docs-heading-anchor" size={16} aria-hidden="true" /></a>
  </h2>
}

export function ApiTables({ tables }: { tables: PropTable[] }) {
  return <div>{tables.map((table) => <section className="docs-api-group" key={table.heading}>
    <h3>{table.heading}</h3>
    <div className="docs-api-table-wrap" tabIndex={0} role="region" aria-label={table.heading}>
      <table className="docs-api-table">
        <thead><tr><th scope="col">属性</th><th scope="col">类型</th><th scope="col">默认值</th><th scope="col">说明</th></tr></thead>
        <tbody>{table.rows.map((row) => <tr key={row.name}><td><code>{row.name}</code></td><td>{row.type}</td><td>{row.default !== undefined ? <code>{row.default}</code> : '-'}</td><td>{row.description}</td></tr>)}</tbody>
      </table>
    </div>
  </section>)}</div>
}

function SidebarLinks({ activeSlug, onNavigate }: { activeSlug: string | null; onNavigate?: () => void }) {
  return <nav aria-label="组件目录" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) onNavigate?.() }}>
    <div className="docs-sidebar-section">
      <p className="docs-sidebar-heading">概览</p>
      <a className="docs-sidebar-link" href="#/start" aria-current={activeSlug === '__start' ? 'page' : undefined}>开始使用</a>
      <a className="docs-sidebar-link" href="#/" aria-current={activeSlug === null ? 'page' : undefined}>全部组件</a>
    </div>
    {CATEGORIES.map((category) => <div className="docs-sidebar-section" key={category.id}>
      <p className="docs-sidebar-heading docs-sidebar-muted">{category.title}</p>
      {category.entries.map((entry) => <a className="docs-sidebar-link" key={entry.slug} href={`#/c/${entry.slug}`} aria-current={activeSlug === entry.slug ? 'page' : undefined}>
        <span className="docs-dot" /><span className="docs-sidebar-name">{entry.name}</span>
        {entry.badge ? <span className={`docs-badge${entry.badge === 'new' ? ' new' : ''}`}>{entry.badge === 'new' ? '新增' : '更新'}</span> : null}
      </a>)}
    </div>)}
  </nav>
}

function MobileNavigation({ activeSlug, onClose }: { activeSlug: string | null; onClose: () => void }) {
  const ref = useDrawerFocus(onClose)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => { if (media.matches) onClose() }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [onClose])
  return createPortal(<div className="docs-modal-backdrop docs-menu-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="docs-mobile-navigation" ref={ref} role="dialog" aria-modal="true" aria-label="文档目录" tabIndex={-1} id="docs-mobile-navigation">
      <div className="docs-menu-heading"><strong>文档目录</strong><button type="button" className="docs-icon-button" aria-label="关闭目录" title="关闭目录" onClick={onClose}><X size={19} aria-hidden="true" /></button></div>
      <div className="docs-mobile-links"><SidebarLinks activeSlug={activeSlug} onNavigate={onClose} /></div>
    </div>
  </div>, document.body)
}

function Header({ activeSlug, menuOpen, onSearch, onMenu }: { activeSlug: string | null; menuOpen: boolean; onSearch: () => void; onMenu: () => void }) {
  return <header className="docs-header">
    <div className="docs-navbar">
      <a className="docs-brand" href="#/" aria-label="辰星设计体系首页"><BrandMark decorative /><span>辰星</span><span className="docs-version">v{version}</span></a>
      <button type="button" className="docs-search-trigger" aria-label="搜索组件" onClick={onSearch}><Search size={17} aria-hidden="true" /><span>搜索组件...</span></button>
      <div className="docs-actions">
        <button type="button" className="docs-icon-button docs-mobile-search" aria-label="搜索组件" title="搜索组件" onClick={onSearch}><Search size={19} aria-hidden="true" /></button>
        <a className="docs-icon-button" href="https://github.com/chenming0v0/chenxing-ui" target="_blank" rel="noreferrer" aria-label="GitHub 仓库" title="GitHub 仓库"><Code2 size={19} aria-hidden="true" /></a>
        <button type="button" className="docs-icon-button docs-mobile-menu" aria-label="打开目录" title="打开目录" aria-expanded={menuOpen} aria-controls={menuOpen ? 'docs-mobile-navigation' : undefined} onClick={onMenu}><Menu size={20} aria-hidden="true" /></button>
      </div>
    </div>
    <nav className="docs-subnav" aria-label="文档导航">
      <a href="#/start" aria-current={activeSlug === '__start' ? 'page' : undefined}><BookOpen size={16} aria-hidden="true" />开始使用</a>
      <a href="#/" aria-current={activeSlug !== '__start' && activeSlug !== '__missing' ? 'page' : undefined}><Layers size={16} aria-hidden="true" />组件</a>
    </nav>
  </header>
}

export type TocItem = { id: string; label: string }

function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  useEffect(() => {
    let frame = 0
    function update() {
      const last = items.filter(({ id }) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 150).at(-1)
      setActive(last?.id ?? items[0]?.id ?? '')
    }
    function onScroll() { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [items])
  if (!items.length) return null
  return <aside className="docs-toc" aria-label="本页目录">
    <div className="docs-toc-title"><List size={16} aria-hidden="true" />本页目录</div>
    <ul className="docs-toc-list">{items.map((item) => <li key={item.id} data-active={active === item.id}><a href={sectionHref(item.id)} aria-current={active === item.id ? 'location' : undefined}>{item.label}</a></li>)}</ul>
  </aside>
}

export function Pager({ entry }: { entry: DemoEntry }) {
  const entries = allEntries()
  const index = entries.findIndex((item) => item.slug === entry.slug)
  const previous = entries[index - 1]
  const next = entries[index + 1]
  return <nav className="docs-pager" aria-label="相邻组件">
    {previous ? <a href={`#/c/${previous.slug}`}><span>上一个</span><strong><ArrowLeft size={16} aria-hidden="true" />{previous.name}</strong></a> : <span />}
    {next ? <a href={`#/c/${next.slug}`}><span>下一个</span><strong>{next.name}<ArrowRight size={16} aria-hidden="true" /></strong></a> : null}
  </nav>
}

export function DocsLayout({ children, activeSlug, toc, onSearch }: { children: ReactNode; activeSlug: string | null; toc: TocItem[]; onSearch: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const selected = sidebarRef.current?.querySelector<HTMLElement>('[aria-current="page"]')
    const sidebar = sidebarRef.current
    if (selected && sidebar) sidebar.scrollTop = Math.max(0, selected.offsetTop - sidebar.clientHeight / 2)
  }, [activeSlug])
  return <div className="docs-app">
    <Header activeSlug={activeSlug} menuOpen={menuOpen} onSearch={onSearch} onMenu={() => setMenuOpen(true)} />
    <div className={`docs-layout${toc.length ? '' : ' docs-layout-wide'}`}>
      <aside className="docs-sidebar" ref={sidebarRef}><SidebarLinks activeSlug={activeSlug} /></aside>
      <main className="docs-main"><div className="docs-article">{children}</div></main>
      <Toc items={toc} />
    </div>
    {menuOpen ? <MobileNavigation activeSlug={activeSlug} onClose={() => setMenuOpen(false)} /> : null}
  </div>
}
