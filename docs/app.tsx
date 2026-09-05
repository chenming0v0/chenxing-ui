import { useEffect, useState, type ReactNode } from 'react'
import { Icon, SkipLink, SkipTarget, useSkipTargetId } from '../src'
import { CATEGORIES, findEntry, getExamples, importNames, type DemoEntry } from './registry'
import { ApiTables, CodeDemo, DocsLayout, Heading, Pager, SearchDialog, Snippet } from './widgets'
import { PROPS } from './props'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => { const listener = () => setHash(window.location.hash); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  return hash
}

function route(hash: string) {
  if (hash === '#/start') return { page: 'start' as const }
  if (hash.startsWith('#/c/')) return { page: 'component' as const, slug: hash.slice(4) }
  return { page: 'home' as const }
}

function HomePage() {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLowerCase()
  return <>
    <div className="docs-title-row"><h1 className="docs-title">组件</h1><span className="docs-badge new">React</span></div>
    <p className="docs-description">辰星设计体系的 React 组件。每个组件都提供实时预览、可复制代码和 API 参考。</p>
    <div className="docs-gallery-search-wrap"><Icon name="search" size={16} className="docs-search-icon" /><input className="docs-gallery-search" aria-label="筛选组件" placeholder="筛选组件..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    {CATEGORIES.map((category) => {
      const entries = category.entries.filter((entry) => !normalized || `${entry.name} ${entry.description}`.toLowerCase().includes(normalized))
      if (!entries.length) return null
      return <section className="docs-gallery-section" key={category.id}><h2>{category.title}</h2><div className="docs-gallery-grid">{entries.map((entry) => <GalleryCard entry={entry} key={entry.slug} />)}</div></section>
    })}
  </>
}

function GalleryCard({ entry }: { entry: DemoEntry }) {
  return <a className="docs-gallery-card" href={`#/c/${entry.slug}`}><div className="docs-gallery-card-preview">{entry.bare ? <span className="chenxing-caption">在组件页查看实时效果</span> : <entry.Demo />}</div><div className="docs-gallery-card-copy"><strong>{entry.name}</strong><p>{entry.description}</p></div></a>
}

function StartPage() {
  return <>
    <div className="docs-title-row"><h1 className="docs-title">开始使用</h1></div>
    <p className="docs-description">安装辰星组件库，并在应用入口引入基础样式。</p>
    <section className="docs-start-section" id="start-install"><h2>安装</h2><Snippet code="npm i @chenxing/ui lucide-react" /></section>
    <section className="docs-start-section"><h2>引入样式</h2><Snippet code={`import '@chenxing/ui/styles.css'`} /><p>组件依赖 React 19 和 lucide-react。使用组件时从 @chenxing/ui 导入具名组件。</p></section>
    <a className="docs-start-next" href="#/">浏览全部组件 <Icon name="arrow-right" size={16} /></a>
  </>
}

function ComponentPage({ entry }: { entry: DemoEntry }) {
  const examples = getExamples(entry)
  const names = importNames(entry)
  const tables = PROPS[entry.slug]
  const toc = examples.map((example) => ({ id: `${entry.slug}-${example.id}`, label: example.title, level: 2 })).concat(tables ? [{ id: `${entry.slug}-api`, label: 'API Reference', level: 2 }] : [])
  return <>
    <div className="docs-title-row"><h1 className="docs-title">{entry.name}{entry.badge ? <span className={`docs-badge${entry.badge === 'new' ? ' new' : ''}`}>{entry.badge === 'new' ? 'New' : 'Updated'}</span> : null}</h1><button type="button" className="docs-copy-markdown" onClick={() => void navigator.clipboard?.writeText(`# ${entry.name}\n\n${entry.description}`)}><Icon name="copy" size={16} /> <span>Copy Markdown</span></button></div>
    <p className="docs-description">{entry.description}</p>
    <div className="docs-resource-row"><a className="docs-resource" href="https://github.com/chenming0v0/chenxing-ui" target="_blank" rel="noreferrer"><Icon name="github" size={15} />Source</a><a className="docs-resource" href="https://github.com/chenming0v0/chenxing-ui/issues" target="_blank" rel="noreferrer"><Icon name="message-square" size={15} />Report an issue</a></div>
    {examples.map((example, index) => <section className="docs-section" id={`${entry.slug}-${example.id}`} key={example.id}><Heading id={`${entry.slug}-${example.id}`}>{example.title}</Heading>{example.description ? <p className="docs-example-description">{example.description}</p> : null}{index === 0 ? <Snippet code={`import { ${names.join(', ')} } from '@chenxing/ui'`} /> : null}<CodeDemo entry={entry} example={example} /></section>)}
    {tables ? <section className="docs-section" id={`${entry.slug}-api`}><Heading id={`${entry.slug}-api`}>API Reference</Heading><ApiTables tables={tables} /></section> : null}
    <Pager entry={entry} />
  </>
}

export default function App() {
  const hash = useHash(); const current = route(hash); const found = current.page === 'component' && current.slug ? findEntry(current.slug) : null; const skipId = useSkipTargetId(); const [searchOpen, setSearchOpen] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [hash])
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) } }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener) }, [])
  const content: ReactNode = found ? <ComponentPage entry={found.entry} /> : current.page === 'start' ? <StartPage /> : <HomePage />
  const toc = found ? getExamples(found.entry).map((example) => ({ id: `${found.entry.slug}-${example.id}`, label: example.title })).concat(PROPS[found.entry.slug] ? [{ id: `${found.entry.slug}-api`, label: 'API Reference' }] : []) : current.page === 'start' ? [{ id: 'start-install', label: '安装' }] : []
  return <><SkipLink targetId={skipId} /><DocsLayout activeSlug={found?.entry.slug ?? (current.page === 'start' ? '__start' : null)} toc={toc} onSearch={() => setSearchOpen(true)}><SkipTarget targetId={skipId} />{content}</DocsLayout>{searchOpen ? <SearchDialog onClose={() => setSearchOpen(false)} /> : null}</>
}
