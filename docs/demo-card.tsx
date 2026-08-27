import type { ReactNode } from 'react'
import { HudPanel } from '../src'

/** 组件演示卡：上方实时预览区 + 下方名称与说明。 */
export function DemoCard({
  name,
  description,
  wide = false,
  children,
}: {
  name: string
  description: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <HudPanel as="article" className={wide ? 'docs-card-wide' : ''}>
      <div className="docs-preview">{children}</div>
      <h3 className="chenxing-h3 mt-4">{name}</h3>
      <p className="chenxing-caption mt-1">{description}</p>
    </HudPanel>
  )
}

/** 分类区块：标题 + 简介 + 卡片网格，id 供侧栏锚点跳转。 */
export function Section({
  id,
  title,
  blurb,
  children,
}: {
  id: string
  title: string
  blurb?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="docs-section mt-12" aria-label={title}>
      <h2 className="chenxing-h2">{title}</h2>
      {blurb ? <p className="chenxing-caption mb-5 mt-1.5 max-w-2xl">{blurb}</p> : <div className="mb-5" />}
      <div className="docs-grid">{children}</div>
    </section>
  )
}
