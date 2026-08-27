import { Component, createRef, type ReactNode } from 'react'
import { SpaceBackdrop } from './space'
import { BrandLockup, Button, HudPanel } from './ui'

type ErrorBoundaryProps = {
  children: ReactNode
  /** 「返回首页」链接地址；恢复路径刻意用原生整页导航，不依赖任何路由器 */
  homeHref?: string
}

type ErrorBoundaryState = { hasError: boolean }

/**
 * 根级错误边界：包住整个 App，任何渲染期崩溃都落到统一的恢复界面。
 *
 * 安全约定：
 * - 恢复界面只展示通用文案，绝不渲染错误消息、堆栈或内部状态——错误内容可能
 *   携带令牌、URL 查询等敏感信息。
 * - 刻意不记录错误细节：任何日志都会冒泄漏风险。React 19 默认会在
 *   onCaughtError 里把完整错误打到控制台，消费方应在 createRoot 层显式替换
 *   为不含错误细节的固定标记，这里不需要也不应该再打印任何东西。
 * - 恢复路径不依赖 router / 全局状态：刷新是原生 location.reload()，
 *   返回首页是原生 <a href> 整页导航，即使 SPA 路由或 App 树已崩溃也能用。
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  private readonly recoveryHeadingRef = createRef<HTMLHeadingElement>()

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {
    this.recoveryHeadingRef.current?.focus()
  }

  render() {
    if (this.state.hasError) {
      return (
        <SpaceBackdrop opacity={0.7}>
          <div className="relative z-[var(--chenxing-z-content)] flex min-h-dvh items-center justify-center p-6">
            <HudPanel className="w-full max-w-md">
              <div role="alert" aria-live="assertive" aria-atomic="true" className="flex flex-col items-start gap-3">
                <BrandLockup />
                <h1 ref={this.recoveryHeadingRef} tabIndex={-1} className="chenxing-h1 mt-1">界面遇到问题</h1>
                <p className="chenxing-caption">
                  页面未能正常加载。请刷新重试，或返回首页。
                </p>
                <div className="mt-6 grid w-full grid-cols-2 gap-3">
                  <Button onClick={() => window.location.reload()}>刷新页面</Button>
                  <a href={this.props.homeHref ?? '/'} className="chenxing-btn-ghost">返回首页</a>
                </div>
              </div>
            </HudPanel>
          </div>
        </SpaceBackdrop>
      )
    }
    return this.props.children
  }
}
