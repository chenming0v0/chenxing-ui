import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { ScrambleText } from './motion'
import { Icon } from './ui'

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

/* Expanded at page top, condensed once the user scrolls; sentinel keeps it
   scroll-container agnostic (works for window scroll and inner scrollers). */
export function useTopbarExpanded() {
  const [expanded, setExpanded] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setExpanded(entry.isIntersecting))
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])
  return { expanded, sentinelRef }
}

/* 关闭时保留退出动画窗口（遮罩淡出 + 面板收拢，时长由调用方按 CSS 过渡传入）
   再卸载。closing 在渲染期派生（React 认可的 derived-state 写法）：打开的那一
   拍面板立即挂载——useNavDisclosure 的键盘焦点转移依赖同一拍里 panelRef 已就位。 */
export function useExitDelay(open: boolean, ms: number) {
  const [closing, setClosing] = useState(false)
  const prevOpen = useRef(open)
  if (prevOpen.current !== open) {
    prevOpen.current = open
    if (!open) setClosing(true)
  }
  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => setClosing(false), ms)
    return () => window.clearTimeout(timer)
  }, [closing, ms])
  return closing
}

/* 手风琴展开高度：CSS 过渡不认 auto，测出内容真实高度再过渡到该像素值。
   内容高度不是常量（菜单项增减、视口旋转），因此用 ResizeObserver 加 resize
   监听持续重测。上限取 70vh：菜单长于视口时容器封顶、内部滚动。 */
const DRAWER_MAX_VH = 0.7

export function useAccordionHeight(open: boolean) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const inner = innerRef.current
    if (!open || !inner) {
      setHeight(0)
      return
    }
    const measure = () => {
      const limit = typeof window === 'undefined' ? Number.POSITIVE_INFINITY : window.innerHeight * DRAWER_MAX_VH
      setHeight(Math.min(inner.scrollHeight, limit))
    }
    measure()
    window.addEventListener('resize', measure)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(inner)
    return () => {
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [open])
  return { innerRef, height }
}

/* 抽屉导航行：50px 行高、文字左/图标右，顶部分隔线随入场从左向右画出，
   逐行级联由 index 驱动（--i 变量）。href 渲染 <a>、onClick 渲染 <button>、
   两者皆无渲染静态 <span>（不进焦点循环，无 hover 反馈）。 */
export function TopbarNavRow({
  index = 0,
  icon,
  href,
  onClick,
  trailing,
  children,
}: {
  /** 级联入场序号（0 起） */
  index?: number
  /** 行尾 lucide 图标名 */
  icon?: string
  href?: string
  onClick?: () => void
  /** 行尾自定义内容（与 icon 二选一，icon 优先） */
  trailing?: ReactNode
  children: ReactNode
}) {
  const style = { '--i': index } as CSSProperties
  const label = (
    <span className="cx-nav-row-label">
      <span className="cx-nav-row-text">{children}</span>
    </span>
  )
  const tail = icon ? <Icon name={icon} size={16} /> : trailing ?? null
  if (href) {
    return <a href={href} className="cx-nav-row" style={style} onClick={onClick}>{label}{tail}</a>
  }
  if (onClick) {
    return <button type="button" className="cx-nav-row" style={style} onClick={onClick}>{label}{tail}</button>
  }
  return <span className="cx-nav-row is-static" style={style}>{label}{tail}</span>
}

/* 账户面板：大头像信息头（姓名 + 两列元数据）→ 可选扩展区（配额卡等）→ 菜单区。
   业务零假设：头像、身份数据、菜单项全部由调用方注入；原版里的路由 Link、
   登录态、配额请求都留在调用方。配合 Topbar 的 account 插槽在胶囊抽屉内展开。 */
export function TopbarAccountPanel({
  avatar,
  name,
  meta,
  extra,
  children,
}: {
  /** 信息头大头像内容（建议 AvatarContent，容器由本组件提供） */
  avatar: ReactNode
  name: ReactNode
  /** 两列元数据（会员序列、@ handle 等）；accent 用青色强调数值 */
  meta?: readonly { label: ReactNode; value: ReactNode; accent?: boolean }[]
  /** 信息头底部自定义区（配额卡等），建议放 TopbarQuotaCard */
  extra?: ReactNode
  /** 菜单区：链接/按钮行，建议 .chenxing-menu-item 行样式 */
  children?: ReactNode
}) {
  return (
    <>
      {/* 信息头：pointer-events-none 让大头像纯展示，不与菜单行争点击 */}
      <div className="cx-account-header">
        <div className="chenxing-avatar h-20 w-20 text-2xl pointer-events-none">{avatar}</div>
        <p className="mt-3 text-base font-semibold text-[var(--chenxing-foreground)]">{name}</p>
        {meta?.length ? (
          <div className="mt-2.5 grid grid-cols-2 gap-x-8 text-center text-[11px]">
            {meta.map((item, i) => (
              <div key={i}>
                <p className="chenxing-caption uppercase tracking-[0.1em]">{item.label}</p>
                <p className={`chenxing-mono mt-0.5 ${item.accent ? 'text-[var(--chenxing-cyan)]' : 'text-[var(--chenxing-foreground)]'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        {extra ? <div className="mt-4 w-full space-y-2.5 px-2">{extra}</div> : null}
      </div>
      {children ? <div className="p-2">{children}</div> : null}
    </>
  )
}

/** 配额卡：说明居左、数值居右的小卡，放在 TopbarAccountPanel 的 extra 区。 */
export function TopbarQuotaCard({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="cx-quota-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--chenxing-muted-foreground)]">{label}</span>
        <span className="chenxing-mono text-xs font-semibold">{value}</span>
      </div>
    </div>
  )
}

/* 全局顶栏：漂浮玻璃胶囊。品牌居左、微标签绝对居中、汉堡+动作居右；
   汉堡菜单作为第二行在胶囊内部手风琴展开，而不是另开全屏面板。
   遮罩是顶栏的兄弟节点：backdrop-filter 的模糊会作用于其下绘制的一切，
   遮罩若嵌在顶栏内部，顶栏就无法靠 z-index 逃出模糊。
   业务零假设：路由、登录态、账户菜单全部由调用方通过插槽注入。 */
export function Topbar({
  brand,
  status,
  links,
  actions,
  menu,
  menuLabel = '打开导航菜单',
  account,
  hideBrandWhenExpanded = false,
  expandOnTop = true,
}: {
  /** 左侧品牌插槽（调用方自带链接语义） */
  brand?: ReactNode
  /** 中央微标签：字符串时在收拢态以乱码解码入场 */
  status: ReactNode
  /** 桌面内联锚点：只在页面顶部全宽展开态显示，收拢后导航职责交还汉堡 */
  links?: readonly { label: string; href: string }[]
  /** 右侧动作插槽（登录入口等），排在汉堡与头像之后 */
  actions?: ReactNode
  /** 抽屉内容：建议由 TopbarNavRow 组成 */
  menu: ReactNode
  menuLabel?: string
  /** 头像触发的账户菜单：与汉堡互斥，在同一个胶囊抽屉里展开。
      trigger 是头像按钮内容（建议 AvatarContent），panel 建议用 TopbarAccountPanel。 */
  account?: {
    trigger: ReactNode
    label?: string
    panel: ReactNode
  }
  hideBrandWhenExpanded?: boolean
  /** 置顶时展开为全宽透明条；无滚动上下文的页面（如文档演示）传 false 固定胶囊形态 */
  expandOnTop?: boolean
}) {
  const { expanded, sentinelRef } = useTopbarExpanded()
  /* 汉堡与账户是两个互斥 disclosure，共享同一个胶囊抽屉：点任一个按钮都只换
     抽屉内容。account 未传时第二个 disclosure 永远关闭（没有触发器），零开销。 */
  const nav = useNavDisclosure()
  const acct = useNavDisclosure()
  const isExpanded = expandOnTop && expanded
  const anyOpen = nav.open || acct.open

  /* 450ms = 抽屉收拢 0.45s（遮罩淡出 0.35s 先结束），与 CSS 过渡对齐。
     三个退出窗口：anyOpen 的窗口控制抽屉与遮罩存续；nav / acct 各自的窗口
     （#379）让最后打开的面板在收拢期间保持渲染——面板内容若在关闭第一拍就
     卸载，.is-closing 下的逐项退出动画（cx-mask-down / cx-line-out /
     cx-nav-fade-out）匹配不到任何元素，永远不会执行。 */
  const closing = useExitDelay(anyOpen, 450)
  const navPanelClosing = useExitDelay(nav.open, 450)
  const acctPanelClosing = useExitDelay(acct.open, 450)
  const drawer = useAccordionHeight(anyOpen)

  /* 抽屉内容在退出窗口内的面板选择：open 分支优先——「关汉堡同时开账户」这类
     互斥切换必须立即换面板，不能等旧面板的退出窗口结束；两者都关闭时，各自的
     退出窗口选中最后打开的面板，供 .is-closing 逐项退出动画使用。 */
  const showNavMenu = nav.open || (!acct.open && navPanelClosing)
  const showAccountPanel = acct.open || (!nav.open && acctPanelClosing)

  // 点击汉堡时：先关账户菜单；点击头像时：先关汉堡菜单
  const toggleNav = () => {
    if (acct.open) acct.close()
    nav.toggle()
  }
  const toggleAccount = () => {
    if (nav.open) nav.close()
    acct.toggle()
  }

  const closeAndRefocus = () => {
    const opener = acct.open ? acct.buttonRef : nav.buttonRef
    nav.close()
    acct.close()
    opener.current?.focus()
  }

  return (
    <>
      {expandOnTop ? <div ref={sentinelRef} aria-hidden="true" className="chenxing-topbar-sentinel" /> : null}
      <header
        className="chenxing-topbar"
        data-expanded={isExpanded || undefined}
        data-open={anyOpen || undefined}
        data-hide-brand-when-expanded={hideBrandWhenExpanded || undefined}
      >
        {/* 胶囊视觉在内层：外层 header 流内高度固定一行，
            抽屉展开只向下溢出覆盖内容，不改变文档高度与滚动条长度。 */}
        <div className="chenxing-topbar-capsule">
          <div className="chenxing-topbar-row">
            {brand ? <div className="chenxing-topbar-brand">{brand}</div> : null}
            {links?.length ? (
              <nav className="chenxing-topbar-links" aria-label="页面导航">
                {links.map((item) => (
                  <a key={item.href} href={item.href}>{item.label}</a>
                ))}
              </nav>
            ) : null}
            {/* 微标签绝对居中且不吃指针：居中与两侧元素宽度解耦，也永不挡住按钮命中区 */}
            <div className="chenxing-topbar-status" data-hidden={isExpanded || undefined}>
              {typeof status === 'string' ? <ScrambleText text={status} active={!isExpanded} /> : <span>{status}</span>}
            </div>
            <div className="chenxing-topbar-actions">
              <div className="inline-flex" ref={nav.containerRef}>
                <button
                  ref={nav.buttonRef}
                  type="button"
                  className={`chenxing-hamburger${nav.open ? ' is-open' : ''}`}
                  aria-label={menuLabel}
                  aria-expanded={nav.open}
                  aria-controls={nav.panelId}
                  aria-haspopup="true"
                  onClick={toggleNav}
                  onKeyDown={nav.onButtonKeyDown}
                >
                  <span /><span /><span />
                </button>
              </div>
              {/* 头像按钮：点击时收缩（is-open 弹性缩放）并在抽屉里展开账户面板 */}
              {account ? (
                <div className="inline-flex" ref={acct.containerRef}>
                  <button
                    ref={acct.buttonRef}
                    type="button"
                    className={`chenxing-avatar chenxing-avatar-trigger h-11 w-11 text-sm${acct.open ? ' is-open' : ''}`}
                    aria-label={account.label ?? '账户菜单'}
                    aria-expanded={acct.open}
                    aria-controls={acct.panelId}
                    aria-haspopup="true"
                    onClick={toggleAccount}
                    onKeyDown={acct.onButtonKeyDown}
                  >
                    {account.trigger}
                  </button>
                </div>
              ) : null}
              {actions}
            </div>
          </div>
          {(anyOpen || closing) ? (
            <div
              className={`chenxing-topbar-drawer${!anyOpen && closing ? ' is-closing' : ''}`}
              style={{ height: `${drawer.height}px` }}
            >
              <div ref={drawer.innerRef} className="chenxing-topbar-drawer-inner">
                {showNavMenu ? (
                  <div
                    id={nav.panelId}
                    ref={nav.panelRef}
                    onKeyDown={nav.onPanelKeyDown}
                    className="chenxing-menu cx-nav-panel"
                    /* 点击行内链接/按钮即视为已作选择：关闭与跳转同时发生 */
                    onClick={(event) => {
                      const target = event.target as Element
                      if (target.closest('a, button')) nav.close()
                    }}
                  >
                    {menu}
                  </div>
                ) : showAccountPanel && account ? (
                  <div
                    id={acct.panelId}
                    ref={acct.panelRef}
                    onKeyDown={acct.onPanelKeyDown}
                    className="chenxing-menu cx-nav-panel cx-account-panel"
                    onClick={(event) => {
                      const target = event.target as Element
                      if (target.closest('a, button')) acct.close()
                    }}
                  >
                    {account.panel}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </header>
      {(anyOpen || closing) ? (
        <div
          className={`cx-menu-overlay${anyOpen ? ' is-open' : ''}`}
          onClick={closeAndRefocus}
          aria-hidden="true"
        />
      ) : null}
    </>
  )
}
