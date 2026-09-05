import { createElement, type HTMLAttributes, type ReactNode } from 'react'

export type FlowGoldTextElement = 'span' | 'strong' | 'p' | 'div' | 'h1' | 'h2' | 'h3'

export type FlowGoldTextProps = HTMLAttributes<HTMLElement> & {
  /** 用于语义标题或正文的根元素，默认是 span。 */
  as?: FlowGoldTextElement
  /** 是否播放流金扫光动画；关闭后保留渐变的静态中间帧。 */
  animated?: boolean
  children: ReactNode
}

/** 辰星品牌专用的流金动态文字。 */
export function FlowGoldText({ as = 'span', animated = true, children, className = '', ...props }: FlowGoldTextProps) {
  const classes = ['chenxing-flow-gold-text', 'chenxing-text-shimmer', animated ? 'is-animated' : 'is-static', className].filter(Boolean).join(' ')
  return createElement(as, { ...props, className: classes }, children)
}
