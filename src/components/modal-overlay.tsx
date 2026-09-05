import type { MouseEvent, ReactNode } from 'react'

export type ModalOverlayProps = {
  /** 按下遮罩空白处请求关闭；不传则遮罩不可点击关闭（如需脏数据确认的表单弹窗）。 */
  onDismiss?: () => void
  children: ReactNode
}

/**
 * 居中弹窗遮罩的唯一入口：统一暗幕、背景模糊和超高面板的滚动行为。
 * 面板内容请使用 HudPanel，且不要在面板上设置 max-height / overflow，
 * 原因见 .chenxing-modal-overlay 的样式注释。
 */
export function ModalOverlay({ onDismiss, children }: ModalOverlayProps) {
  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (onDismiss && event.target === event.currentTarget) onDismiss()
  }
  return (
    <div className="chenxing-modal-overlay" role="presentation" onMouseDown={handleMouseDown}>
      {children}
    </div>
  )
}
