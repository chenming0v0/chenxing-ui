import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowRight, Code2, MessageSquare, Search, X } from 'lucide-react'
import { SkipTarget, useSkipTargetId } from '../src'
import { allEntries, CATEGORIES, findEntry, getExamples, importNames, type DemoEntry } from './registry'
import { ApiTables, CodeDemo, CopyButton, DocsLayout, Heading, Pager, SearchDialog, Snippet } from './widgets'
import { PROPS } from './props'
import { readRoute, sectionHref } from './navigation'
import { componentMarkdown, sourceUrl } from './content'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const listener = () => setHash(window.location.hash)
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  return hash
}

function GalleryCard({ entry }: { entry: DemoEntry }) {
  return <article className="docs-gallery-card">
    <div className="docs-gallery-card-preview" inert aria-hidden="true">
      {entry.bare ? <Code2 size={28} className="docs-gallery-symbol" /> : <entry.Demo />}
    </div>
    <a className="docs-gallery-card-link" href={`#/c/${entry.slug}`} aria-label={`查看 ${entry.name}`}>
      <div className="docs-gallery-card-copy"><strong>{entry.name}<ArrowRight size={15} aria-hidden="true" /></strong><p>{entry.description}</p></div>
    </a>
  </article>
}

function HomePage() {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLowerCase()
  const categories = CATEGORIES.map((category) => ({ ...category, entries: category.entries.filter((entry) => `${entry.name} ${entry.slug} ${entry.description} ${category.title}`.toLowerCase().includes(normalized)) })).filter((category) => category.entries.length)
  const count = categories.reduce((total, category) => total + category.entries.length, 0)
  return <>
    <div className="docs-title-row"><h1 className="docs-title">辰星组件</h1><span className="docs-badge new">React 19</span></div>
    <p className="docs-description">表单、数据展示、导航与反馈。</p>
    <div className="docs-gallery-filter">
      <div className="docs-gallery-search-wrap"><Search size={17} aria-hidden="true" /><input className="docs-gallery-search" aria-label="筛选组件" placeholder="筛选组件..." value={query} onChange={(event) => setQuery(event.target.value)} />{query ? <button className="docs-icon-button" type="button" aria-label="清除筛选" title="清除筛选" onClick={() => setQuery('')}><X size={16} aria-hidden="true" /></button> : null}</div>
      <span className="docs-result-count" role="status">{count} / {allEntries().length} 个组件</span>
    </div>
    {categories.length ? categories.map((category) => <section className="docs-gallery-section" key={category.id}>
      <h2>{category.title}<span>{category.entries.length}</span></h2>
      <div className="docs-gallery-grid">{category.entries.map((entry) => <GalleryCard entry={entry} key={entry.slug} />)}</div>
    </section>) : <div className="docs-empty"><Search size={28} aria-hidden="true" /><h2>没有匹配的组件</h2><button type="button" className="docs-resource" onClick={() => setQuery('')}>清除筛选</button></div>}
  </>
}

const START_TOC = [{ id: 'start-install', label: '安装依赖' }, { id: 'start-styles', label: '配置样式' }, { id: 'start-example', label: '第一个组件' }]

function StartPage() {
  return <>
    <h1 className="docs-title">开始使用</h1>
    <p className="docs-description">辰星设计体系 · React 19 · Tailwind CSS 4</p>
    <section className="docs-start-section"><Heading id="start-install">安装依赖</Heading><Snippet code="npm i @chenxing/ui react@^19 react-dom@^19 lucide-react" /><Snippet code="npm i -D tailwindcss @tailwindcss/vite" /></section>
    <section className="docs-start-section"><Heading id="start-styles">配置样式</Heading>
      <p>Vite 配置</p><Snippet code={`import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n})`} />
      <p>src/index.css</p><Snippet code={`@import "tailwindcss";\n@import "@chenxing/ui/styles.css";\n@source "../node_modules/@chenxing/ui/src";`} />
      <p>src/main.tsx</p><Snippet code={`import './index.css'`} />
    </section>
    <section className="docs-start-section"><Heading id="start-example">第一个组件</Heading><Snippet code={`import { Button } from '@chenxing/ui'\n\nexport default function App() {\n  return <Button icon="check" onClick={() => console.log('saved')}>保存</Button>\n}`} /></section>
    <a className="docs-start-next" href="#/">浏览全部组件<ArrowRight size={16} aria-hidden="true" /></a>
  </>
}

function ComponentPage({ entry }: { entry: DemoEntry }) {
  const examples = getExamples(entry)
  const names = importNames(entry)
  const tables = PROPS[entry.slug]
  return <>
    <div className="docs-title-row">
      <h1 className="docs-title">{entry.name}{entry.badge ? <span className={`docs-badge${entry.badge === 'new' ? ' new' : ''}`}>{entry.badge === 'new' ? '新增' : '更新'}</span> : null}</h1>
      <CopyButton value={componentMarkdown(entry)} label="复制 Markdown" showLabel className="docs-copy-markdown" />
    </div>
    <p className="docs-description">{entry.description}</p>
    <div className="docs-resource-row">
      <a className="docs-resource" href={sourceUrl(entry)} target="_blank" rel="noreferrer"><Code2 size={15} aria-hidden="true" />源码</a>
      <a className="docs-resource" href={`https://github.com/chenming0v0/chenxing-ui/issues/new?${new URLSearchParams({ title: `[${entry.name}] ` })}`} target="_blank" rel="noreferrer"><MessageSquare size={15} aria-hidden="true" />反馈问题</a>
    </div>
    {examples.map((example, index) => <section className="docs-section" key={example.id}>
      <Heading id={`${entry.slug}-${example.id}`}>{example.title}</Heading>
      {example.description ? <p className="docs-example-description">{example.description}</p> : null}
      {index === 0 ? <Snippet code={`import { ${names.join(', ')} } from '@chenxing/ui'`} /> : null}
      <CodeDemo entry={entry} example={example} />
    </section>)}
    {tables ? <section className="docs-section"><Heading id={`${entry.slug}-api`}>API 参考</Heading><ApiTables tables={tables} /></section> : null}
    <Pager entry={entry} />
  </>
}

function NotFoundPage() {
  return <div className="docs-empty"><span className="docs-version">404</span><h1 className="docs-title">页面不存在</h1><a className="docs-resource" href="#/">返回组件总览<ArrowRight size={16} aria-hidden="true" /></a></div>
}

export default function App() {
  const hash = useHash()
  const current = readRoute(hash)
  const found = current.page === 'component' && current.slug ? findEntry(current.slug) : null
  const missing = current.page === 'missing' || (current.page === 'component' && !found)
  const skipId = useSkipTargetId()
  const [searchOpen, setSearchOpen] = useState(false)
  const entry = found?.entry
  const toc = useMemo(() => entry ? getExamples(entry).map((example) => ({ id: `${entry.slug}-${example.id}`, label: example.title })).concat(PROPS[entry.slug] ? [{ id: `${entry.slug}-api`, label: 'API 参考' }] : []) : current.page === 'start' ? START_TOC : [], [entry, current.page])
  useEffect(() => {
    const target = current.section ? document.getElementById(current.section) : null
    if (target) { target.scrollIntoView({ block: 'start' }); target.focus({ preventScroll: true }) }
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [hash, current.section])
  useEffect(() => {
    document.title = `${entry?.name ?? (missing ? '页面不存在' : current.page === 'start' ? '开始使用' : '组件总览')} · 辰星设计体系`
  }, [entry, missing, current.page])
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (!document.querySelector('[aria-modal="true"]')) setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
  return <>
    <a href={sectionHref(skipId)} className="chenxing-skip-link"><ArrowDown size={16} aria-hidden="true" />跳到主内容</a>
    <DocsLayout activeSlug={missing ? '__missing' : entry?.slug ?? (current.page === 'start' ? '__start' : null)} toc={toc} onSearch={() => setSearchOpen(true)}>
      <SkipTarget targetId={skipId} />
      {entry ? <ComponentPage key={entry.slug} entry={entry} /> : missing ? <NotFoundPage /> : current.page === 'start' ? <StartPage /> : <HomePage />}
    </DocsLayout>
    {searchOpen ? <SearchDialog onClose={() => setSearchOpen(false)} /> : null}
  </>
}
