import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Icon } from './ui'

export type TopbarSubnavItem<T extends string = string> = {
  value: T
  label: string
  icon?: string
}

type TopbarSubnavProps<T extends string> = {
  /** 读屏器听到的分栏名称，例如「系统设置分栏」 */
  label: string
  items: readonly TopbarSubnavItem<T>[]
  value: T
  onChange: (value: T) => void
  /** 返回每个分栏对应面板的 id，用于 aria-controls；面板需带 role="tabpanel" */
  panelId?: (value: T) => string
  /** 返回每个分栏按钮自身的 id，面板用 aria-labelledby 指回来 */
  tabId?: (value: T) => string
}

/**
 * 顶栏二级分栏：作为 Topbar 的 subnav 插槽内容，从主胶囊下方「分身」弹出。
 *
 * 语义是 ARIA Tabs（选中即切换）：方向键 / Home / End 移动并激活，
 * roving tabindex 按选中项渲染。选中底块是一个独立的滑块，
 * 用弹簧曲线在分栏之间移动，而不是每个按钮各自淡入淡出。
 */
export function TopbarSubnav<T extends string>({ label, items, value, onChange, panelId, tabId }: TopbarSubnavProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null)

  /* 滑块位置取自选中按钮的布局盒；字体加载、窗口缩放都会改宽度，所以挂 ResizeObserver */
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const active = list.querySelector<HTMLElement>('[aria-selected="true"]')
      if (!active) return setIndicator(null)
      setIndicator({ x: active.offsetLeft, w: active.offsetWidth })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [value, items])

  /* 窄屏横向滚动时把选中项带进可视区（jsdom 没有 scrollIntoView） */
  useLayoutEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    active?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [value])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = items.findIndex((item) => item.value === value)
    const last = items.length - 1
    const next =
      event.key === 'ArrowRight' ? (current + 1) % items.length
        : event.key === 'ArrowLeft' ? (current - 1 + items.length) % items.length
          : event.key === 'Home' ? 0
            : event.key === 'End' ? last
              : null
    if (next === null || !items[next]) return
    event.preventDefault()
    onChange(items[next].value)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  const indicatorStyle = indicator
    ? ({ '--cx-subnav-x': `${indicator.x}px`, '--cx-subnav-w': `${indicator.w}px` } as CSSProperties)
    : undefined

  return (
    <div className="chenxing-topbar-subnav">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        className="chenxing-topbar-subnav-list"
        style={indicatorStyle}
        onKeyDown={handleKeyDown}
      >
        {indicator ? <span aria-hidden="true" className="chenxing-topbar-subnav-indicator" /> : null}
        {items.map((item) => {
          const selected = item.value === value
          return (
            <button
              key={item.value}
              id={tabId?.(item.value)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId?.(item.value)}
              tabIndex={selected ? 0 : -1}
              className="chenxing-topbar-subnav-tab"
              onClick={() => onChange(item.value)}
            >
              {item.icon ? <Icon name={item.icon} size={15} /> : null}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
