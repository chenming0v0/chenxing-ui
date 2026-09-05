import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { useDrawerFocus } from '../src'
import { CATEGORIES } from './registry'

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const containerRef = useDrawerFocus(onClose)
  const resultsRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return CATEGORIES.flatMap((category) => category.entries
      .filter((entry) => `${entry.name} ${entry.slug} ${entry.description} ${category.title}`.toLowerCase().includes(normalized))
      .map((entry) => ({ ...entry, category: category.title })))
  }, [query])
  useEffect(() => {
    resultsRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, query])
  function select(index: number) {
    const entry = results[index]
    if (!entry) return
    window.location.hash = `#/c/${entry.slug}`
    onClose()
  }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229 || !results.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((value) => (value + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      select(active)
    }
  }
  return createPortal(<div className="docs-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div ref={containerRef} className="docs-search-dialog" role="dialog" aria-modal="true" aria-label="搜索组件" tabIndex={-1}>
      <div className="docs-search-input-row">
        <Search size={19} aria-hidden="true" />
        <input role="combobox" aria-label="搜索组件名称或描述" aria-expanded="true" aria-autocomplete="list" aria-controls={listId} aria-activedescendant={results[active] ? `${listId}-${results[active].slug}` : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} onKeyDown={handleKeyDown} placeholder="搜索组件..." autoComplete="off" />
        <button type="button" className="docs-icon-button" aria-label="关闭搜索" title="关闭搜索" onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </div>
      <div className="docs-search-results" id={listId} ref={resultsRef} role="listbox" aria-label="组件搜索结果">
        {results.map((entry, index) => <div key={entry.slug}>
          {entry.category !== results[index - 1]?.category ? <div className="docs-search-group-label" role="presentation">{entry.category}</div> : null}
          <div id={`${listId}-${entry.slug}`} role="option" aria-selected={active === index} className="docs-search-result" onMouseDown={(event) => event.preventDefault()} onClick={() => select(index)} onMouseMove={() => setActive(index)}>
            <span><strong>{entry.name}</strong><small>{entry.description}</small></span><ArrowUpRight size={16} aria-hidden="true" />
          </div>
        </div>)}
      </div>
      {!results.length ? <p className="docs-search-empty" role="status">没有找到匹配的组件</p> : <div className="docs-search-count" role="status">{results.length} 个组件</div>}
    </div>
  </div>, document.body)
}
