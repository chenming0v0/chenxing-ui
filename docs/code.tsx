import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Copy, RotateCcw, TriangleAlert } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import type { DemoEntry, DemoExample } from './registry'

export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Older browsers and denied clipboard permissions may still allow selection copying.
    }
  }
  const previous = document.activeElement
  const area = document.createElement('textarea')
  area.value = value
  area.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
  document.body.appendChild(area)
  try {
    area.select()
    if (!document.execCommand?.('copy')) throw new Error('Clipboard unavailable')
  } finally {
    area.remove()
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
  }
}

export function Highlight({ code }: { code: string }) {
  return <code dangerouslySetInnerHTML={{ __html: Prism.highlight(code, Prism.languages.tsx, 'tsx') }} />
}

export function CopyButton({ value, className = '', label = '复制代码', showLabel = false }: {
  value: string
  className?: string
  label?: string
  showLabel?: boolean
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; clearTimeout(timer.current) }
  }, [])
  const status = state === 'copied' ? '已复制' : state === 'error' ? '复制失败，请重试' : label
  const Glyph = state === 'copied' ? Check : state === 'error' ? TriangleAlert : Copy
  async function handleCopy() {
    if (busy) return
    setBusy(true)
    clearTimeout(timer.current)
    try {
      await copyText(value)
      if (mounted.current) setState('copied')
    } catch {
      if (mounted.current) setState('error')
    } finally {
      if (mounted.current) {
        setBusy(false)
        timer.current = setTimeout(() => setState('idle'), 2500)
      }
    }
  }
  return <>
    <button type="button" className={className} aria-label={status} title={status} aria-disabled={busy} data-state={state} onClick={() => void handleCopy()}>
      <Glyph size={16} aria-hidden="true" />
      {showLabel ? <span>{status}</span> : null}
    </button>
    <span className="sr-only" role="status">{state === 'idle' ? '' : status}</span>
  </>
}

export function Snippet({ code }: { code: string }) {
  return <div className="docs-snippet"><pre><Highlight code={code} /></pre><CopyButton value={code} className="docs-snippet-copy" /></div>
}

export function CodeDemo({ example, entry }: { example: DemoExample; entry: DemoEntry }) {
  const [expanded, setExpanded] = useState(false)
  const [revision, setRevision] = useState(0)
  const codeId = useId()
  const Demo = example.Demo
  const code = example.code.trim()
  const collapsible = code.split('\n').length > 8
  return <div className="docs-code-demo">
    <div className="docs-preview-toolbar">
      <span>组件预览</span>
      <button type="button" className="docs-icon-button" title="重置示例" aria-label="重置示例" onClick={() => setRevision((value) => value + 1)}><RotateCcw size={15} aria-hidden="true" /></button>
    </div>
    <div className={`docs-preview-stage${example.bare || entry.bare ? ' docs-preview-bare' : ''}`}><Demo key={revision} /></div>
    {code ? <div className={`docs-code-panel${!expanded && collapsible ? ' is-collapsed' : ''}`}>
      <div className="docs-code-toolbar"><span>TSX</span><CopyButton value={code} className="docs-icon-button" /></div>
      <pre id={codeId} tabIndex={expanded || !collapsible ? 0 : -1} aria-label="示例代码"><Highlight code={code} /></pre>
      {collapsible ? <button type="button" className="docs-expand" aria-expanded={expanded} aria-controls={codeId} onClick={() => setExpanded((value) => !value)}>
        {expanded ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}{expanded ? '收起代码' : '展开代码'}
      </button> : null}
    </div> : null}
  </div>
}
