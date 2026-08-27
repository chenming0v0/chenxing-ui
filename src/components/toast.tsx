import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Icon } from './ui'

/* 瞬态通知：交互手感对齐 HeroUI v3 Toast 的叠卡堆栈——
   新卡压最前，旧卡每层缩小 5%、沿垂直轴错位 12px、高度锁成最前卡露出一条边；
   最多同时可见 3 张，更早的卡保留在 DOM 但透明且 aria-hidden（不排队）。
   有意偏离一处：入场从水平侧边滑入（end 侧从右、start 侧从左），
   HeroUI 原版是纯垂直滑入，但「从右边跳出来」是本库的产品诉求。
   视觉是辰星玻璃卡片，业务零假设：内容与触发时机全部由调用方决定。 */

export type ToastTone = 'info' | 'success' | 'warning' | 'error'
export type ToastPlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'

export interface ToastOptions {
  description?: ReactNode
  /** 默认 info */
  tone?: ToastTone
  /** 覆盖 tone 默认图标（lucide 名） */
  icon?: string
  /** 自动关闭毫秒数；0 = 常驻直到手动关闭。默认 4000（对齐 HeroUI） */
  timeout?: number
  /** 退场动画结束、卡片移除后回调 */
  onClose?: () => void
}

interface ToastItem {
  key: string
  title: ReactNode
  description?: ReactNode
  tone: ToastTone
  icon?: string
  closing: boolean
}

export interface ToastFn {
  (title: ReactNode, options?: ToastOptions): string
  info(title: ReactNode, options?: Omit<ToastOptions, 'tone'>): string
  success(title: ReactNode, options?: Omit<ToastOptions, 'tone'>): string
  warning(title: ReactNode, options?: Omit<ToastOptions, 'tone'>): string
  error(title: ReactNode, options?: Omit<ToastOptions, 'tone'>): string
}

interface ToastContextValue {
  toast: ToastFn
  /** 手动关闭指定 key 的通知（播退场动画） */
  close: (key: string) => void
  /** 关闭全部 */
  clear: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/* 350ms 退场窗口与 CSS 动画时长对齐；卡片标记 is-closing 播完滑出再从 DOM 移除 */
const EXIT_MS = 350
const DEFAULT_TIMEOUT = 4000
const DEFAULT_MAX_VISIBLE = 3
const DEFAULT_GAP = 12

const TONE_ICONS: Record<ToastTone, string> = {
  info: 'info',
  success: 'check',
  warning: 'alert-triangle',
  error: 'alert-circle',
}

/* 每条通知一份计时记录：remaining 是剩余毫秒。悬停/聚焦暂停时结算已流逝时间，
   恢复时用剩余值重新调度——累减而不是重开整段（对齐 HeroUI/React Aria）。 */
interface TimerRecord {
  remaining: number
  startedAt: number
  id: number | null
}

export function ToastProvider({
  placement = 'bottom-end',
  maxVisible = DEFAULT_MAX_VISIBLE,
  gap = DEFAULT_GAP,
  children,
}: {
  placement?: ToastPlacement
  maxVisible?: number
  /** 叠卡轴向错位像素 */
  gap?: number
  children: ReactNode
}) {
  /* 最新的在下标 0（最前）。 */
  const [items, setItems] = useState<ToastItem[]>([])
  const uid = useId()
  const nextId = useRef(0)
  const timers = useRef(new Map<string, TimerRecord>())
  const onCloses = useRef(new Map<string, (() => void) | undefined>())
  const removals = useRef(new Set<number>())
  const closingKeys = useRef(new Set<string>())
  /* 悬停与焦点各自计数：任一为真即暂停全部计时 */
  const pauseState = useRef({ hover: false, focus: false })
  /* 渲染期镜像：clear 等命令式操作要遍历当前列表，不能在 setState 更新器里搞副作用 */
  const itemsRef = useRef<ToastItem[]>([])

  const isPaused = () => pauseState.current.hover || pauseState.current.focus

  const schedule = useCallback((key: string, rec: TimerRecord, fire: (key: string) => void) => {
    rec.startedAt = Date.now()
    rec.id = window.setTimeout(() => fire(key), Math.max(rec.remaining, 0))
  }, [])

  const startExit = useCallback((key: string) => {
    /* 幂等：超时与手动关闭可能竞争同一张卡 */
    if (closingKeys.current.has(key)) return
    closingKeys.current.add(key)
    const rec = timers.current.get(key)
    if (rec?.id != null) window.clearTimeout(rec.id)
    timers.current.delete(key)
    setItems((prev) => prev.map((t) => (t.key === key ? { ...t, closing: true } : t)))
    const id = window.setTimeout(() => {
      removals.current.delete(id)
      closingKeys.current.delete(key)
      setItems((prev) => prev.filter((t) => t.key !== key))
      const onClose = onCloses.current.get(key)
      onCloses.current.delete(key)
      onClose?.()
    }, EXIT_MS)
    removals.current.add(id)
  }, [])

  const pauseAll = useCallback(() => {
    for (const rec of timers.current.values()) {
      if (rec.id == null) continue
      window.clearTimeout(rec.id)
      rec.id = null
      rec.remaining -= Date.now() - rec.startedAt
    }
  }, [])

  const resumeAll = useCallback(() => {
    for (const [key, rec] of timers.current.entries()) {
      if (rec.id == null) schedule(key, rec, startExit)
    }
  }, [schedule, startExit])

  const contextValue = useMemo<ToastContextValue>(() => {
    const add = (title: ReactNode, options: ToastOptions = {}) => {
      const key = `${uid}t${nextId.current++}`
      const timeout = options.timeout ?? DEFAULT_TIMEOUT
      onCloses.current.set(key, options.onClose)
      setItems((prev) => [
        { key, title, description: options.description, tone: options.tone ?? 'info', icon: options.icon, closing: false },
        ...prev,
      ])
      if (timeout > 0) {
        const rec: TimerRecord = { remaining: timeout, startedAt: Date.now(), id: null }
        timers.current.set(key, rec)
        /* 光标正悬停在通知区时新卡不起表，等移开一并恢复 */
        if (!isPaused()) schedule(key, rec, startExit)
      }
      return key
    }
    const toast = Object.assign(add, {
      info: (title: ReactNode, options?: Omit<ToastOptions, 'tone'>) => add(title, { ...options, tone: 'info' }),
      success: (title: ReactNode, options?: Omit<ToastOptions, 'tone'>) => add(title, { ...options, tone: 'success' }),
      warning: (title: ReactNode, options?: Omit<ToastOptions, 'tone'>) => add(title, { ...options, tone: 'warning' }),
      error: (title: ReactNode, options?: Omit<ToastOptions, 'tone'>) => add(title, { ...options, tone: 'error' }),
    }) as ToastFn
    return {
      toast,
      close: startExit,
      clear: () => {
        for (const item of itemsRef.current) startExit(item.key)
      },
    }
  }, [uid, schedule, startExit])

  /* 卸载时清掉全部计时器（自动关闭 + 退场移除） */
  useEffect(() => {
    const timersMap = timers.current
    const removalSet = removals.current
    return () => {
      for (const rec of timersMap.values()) if (rec.id != null) window.clearTimeout(rec.id)
      for (const id of removalSet) window.clearTimeout(id)
    }
  }, [])

  /* 最前卡实测高度：非最前卡的槽位高度锁定成它，露出一条边（HeroUI 的叠卡形态）。
     内容不定高（描述行数、字体加载），ResizeObserver 持续重测。 */
  const frontKey = items.find((t) => !t.closing)?.key ?? null
  const frontRef = useRef<HTMLDivElement>(null)
  const [frontHeight, setFrontHeight] = useState(0)
  useEffect(() => {
    const el = frontRef.current
    if (!frontKey || !el) return
    const measure = () => setFrontHeight(el.offsetHeight)
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(el)
    return () => observer?.disconnect()
  }, [frontKey])

  itemsRef.current = items
  const activeCount = items.filter((t) => !t.closing).length

  /* 堆叠序号只在未关闭的卡之间分配：前卡滑出的同时后卡立即补位过渡。
     关闭中的卡固定用 0 号位形态播放滑出。 */
  let stackIndex = 0

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {items.length > 0 ? (
        <div
          className="cx-toast-region"
          data-placement={placement}
          role="region"
          aria-label={`${activeCount} 条通知`}
          tabIndex={-1}
          style={{ '--cx-toast-front-h': `${frontHeight}px`, '--cx-toast-gap': `${gap}px` } as React.CSSProperties}
          onMouseEnter={() => { pauseState.current.hover = true; pauseAll() }}
          onMouseLeave={() => {
            pauseState.current.hover = false
            if (!isPaused()) resumeAll()
          }}
          onFocus={() => { pauseState.current.focus = true; pauseAll() }}
          onBlur={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
            pauseState.current.focus = false
            if (!isPaused()) resumeAll()
          }}
        >
          {items.map((item) => {
            const index = item.closing ? 0 : stackIndex++
            const isFront = item.key === frontKey
            /* 超出可见上限：保留 DOM 但透明 + aria-hidden，对齐 HeroUI（不排队补位） */
            const hidden = !item.closing && index >= maxVisible
            const titleId = `${item.key}-title`
            const descId = item.description != null ? `${item.key}-desc` : undefined
            return (
              <div
                key={item.key}
                className={`cx-toast-slot${isFront ? ' is-front' : ''}${hidden ? ' is-hidden' : ''}`}
                style={{ '--cx-i': index } as React.CSSProperties}
                aria-hidden={hidden || undefined}
              >
                <div
                  ref={isFront ? frontRef : undefined}
                  className={`cx-toast cx-toast-${item.tone}${item.closing ? ' is-closing' : ''}`}
                  role="alertdialog"
                  aria-modal="false"
                  aria-labelledby={titleId}
                  aria-describedby={descId}
                  tabIndex={isFront ? 0 : -1}
                >
                  <Icon name={item.icon ?? TONE_ICONS[item.tone]} size={18} className="cx-toast-icon" />
                  {/* 内容区才是 live 区域（alert 隐含 assertive）：卡片容器保持 alertdialog 语义 */}
                  <div role="alert" aria-atomic="true" className="cx-toast-body">
                    <p id={titleId} className="cx-toast-title">{item.title}</p>
                    {item.description != null ? <p id={descId} className="cx-toast-desc">{item.description}</p> : null}
                  </div>
                  <button
                    type="button"
                    className="cx-toast-close"
                    aria-label="关闭"
                    onClick={() => startExit(item.key)}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast 必须在 <ToastProvider> 内部使用')
  return value
}
