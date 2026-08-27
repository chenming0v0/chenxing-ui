import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'

/* 汉堡导航的共享可访问性逻辑，实现 WAI-ARIA Disclosure Navigation 模式
   （面板里是导航链接/按钮，不是 role="menu"，因此不用 menu 小部件语义）：
   - 触发器带 aria-expanded / aria-controls / aria-haspopup，useId 保证多实例不重复；
   - 点击面板外部关闭（mousedown）；
   - Escape 关闭并把焦点还给触发器按钮；
   - 面板内 ArrowDown/ArrowUp 循环移动焦点，Home/End 跳首尾；
   - 在触发器上按 ArrowDown/ArrowUp 打开面板并把焦点移进首/末项。
   支持受控（open + onOpenChange）与非受控两种用法：传了 open 即受控。 */
export function useNavDisclosure({ open: controlledOpen, onOpenChange }: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const controlled = controlledOpen !== undefined
  const open = controlled ? controlledOpen : uncontrolledOpen

  const onOpenChangeRef = useRef(onOpenChange)
  useEffect(() => { onOpenChangeRef.current = onOpenChange })

  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pendingFocus = useRef<'first' | 'last' | null>(null)

  const setOpen = useCallback((next: boolean) => {
    if (!controlled) setUncontrolledOpen(next)
    onOpenChangeRef.current?.(next)
  }, [controlled])

  const close = useCallback(() => setOpen(false), [setOpen])
  const toggle = useCallback(() => setOpen(!open), [setOpen, open])

  const focusableItems = useCallback(() => {
    const panel = panelRef.current
    if (!panel) return []
    return Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
  }, [])

  const moveFocus = useCallback(
    (delta: number) => {
      const items = focusableItems()
      if (items.length === 0) return
      const current = items.indexOf(document.activeElement as HTMLElement)
      const next =
        current === -1 ? (delta > 0 ? 0 : items.length - 1) : (current + delta + items.length) % items.length
      items[next].focus()
    },
    [focusableItems],
  )

  // 点击容器与面板之外关闭（面板可能 portal 到容器外时也算"内部"）
  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (!containerRef.current?.contains(target) && !panelRef.current?.contains(target)) close()
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open, close])

  // Escape 关闭并把焦点还给触发器按钮（焦点在面板内或触发器上都生效）
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  // 键盘打开（方向键）时，渲染完成后把焦点移进面板首/末项
  useEffect(() => {
    if (!open || pendingFocus.current == null) return
    const items = focusableItems()
    const target = pendingFocus.current === 'first' ? 0 : items.length - 1
    pendingFocus.current = null
    if (items[target]) items[target].focus()
  }, [open, focusableItems])

  const onButtonKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      if (open) {
        moveFocus(event.key === 'ArrowDown' ? 1 : -1)
      } else {
        pendingFocus.current = event.key === 'ArrowDown' ? 'first' : 'last'
        setOpen(true)
      }
    },
    [open, moveFocus, setOpen],
  )

  const onPanelKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        moveFocus(event.key === 'ArrowDown' ? 1 : -1)
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        const items = focusableItems()
        const target = event.key === 'Home' ? 0 : items.length - 1
        if (items[target]) items[target].focus()
      }
    },
    [focusableItems, moveFocus],
  )

  return {
    open,
    panelId,
    containerRef,
    panelRef,
    buttonRef,
    close,
    toggle,
    onButtonKeyDown,
    onPanelKeyDown,
  }
}

/* 汉堡导航菜单：三条细杠的触发按钮 + 全屏压暗遮罩 + 触发器下方的玻璃面板。
   children 即面板内容：导航链接/按钮建议使用 .chenxing-menu-item 行样式。
   面板不做业务假设——路由、登录态、导航树全部由调用方注入。 */
export function NavigationMenu({
  label = '打开导航菜单',
  open,
  onOpenChange,
  className = '',
  children,
}: {
  /** 触发按钮的无障碍名称 */
  label?: string
  /** 受控展开态；不传则组件内部管理 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: ReactNode
}) {
  const nav = useNavDisclosure({ open, onOpenChange })
  const closeAndRefocus = () => {
    nav.close()
    nav.buttonRef.current?.focus()
  }
  return (
    <div ref={nav.containerRef} className={`chenxing-nav-menu ${className}`}>
      <button
        type="button"
        ref={nav.buttonRef}
        className={`chenxing-hamburger${nav.open ? ' is-open' : ''}`}
        aria-expanded={nav.open}
        aria-controls={nav.panelId}
        aria-haspopup="true"
        aria-label={label}
        onClick={nav.toggle}
        onKeyDown={nav.onButtonKeyDown}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {/* 遮罩常驻：关闭时透明且不拦截指针，保留淡出过渡 */}
      <div
        className={`chenxing-nav-overlay${nav.open ? ' is-open' : ''}`}
        aria-hidden="true"
        onClick={closeAndRefocus}
      />
      {nav.open ? (
        <div
          id={nav.panelId}
          ref={nav.panelRef}
          className="chenxing-nav-panel"
          onKeyDown={nav.onPanelKeyDown}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
