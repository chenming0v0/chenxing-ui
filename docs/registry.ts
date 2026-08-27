import type { ComponentType } from 'react'

/** 单个组件的展示条目：主页渲染成卡片，组件页渲染成整页演示 */
export type DemoEntry = {
  slug: string
  name: string
  description: string
  /** 用法代码块里的具名导入；缺省取 name */
  imports?: string[]
  /** 主页栅格中占两列 */
  wide?: boolean
  /** 依赖 position:fixed 全屏遮罩的组件：主页玻璃卡的 backdrop-filter
      会把 fixed 后代困在卡内，因此只在组件页做实时演示 */
  bare?: boolean
  Demo: ComponentType
}

export type DemoCategory = {
  id: string
  title: string
  blurb: string
  /** 分类级提示（如 reduced-motion 说明），渲染在栅格前 */
  Note?: ComponentType
  entries: DemoEntry[]
}

import { BRAND_ENTRIES, PRIMITIVE_ENTRIES } from './demos-core'
import { FORM_ENTRIES } from './demos-forms'
import { DATA_ENTRIES } from './demos-data'
import { MOTION_ENTRIES, MotionNotice } from './demos-motion'
import { SHELL_ENTRIES } from './demos-shell'
import { FEEDBACK_ENTRIES } from './demos-feedback'

export const CATEGORIES: DemoCategory[] = [
  { id: 'brand', title: '品牌', blurb: '产品标识与组合版式。', entries: BRAND_ENTRIES },
  { id: 'primitives', title: '基础组件', blurb: '按钮、徽章、图标与状态反馈原语。', entries: PRIMITIVE_ENTRIES },
  { id: 'forms', title: '表单', blurb: '输入、选择与开关控件，校验文案经 aria-describedby 关联。', entries: FORM_ENTRIES },
  { id: 'data', title: '容器与数据', blurb: '玻璃容器、数据表与模态抽屉。', entries: DATA_ENTRIES },
  { id: 'motion', title: '动效', blurb: '滚动与入场动效原语，均响应 prefers-reduced-motion。', Note: MotionNotice, entries: MOTION_ENTRIES },
  { id: 'shell', title: '壳层', blurb: '页面级 chrome：全局顶栏与错误边界。', entries: SHELL_ENTRIES },
  { id: 'feedback', title: '反馈', blurb: '瞬态通知：侧边滑入的玻璃叠卡堆栈，悬停暂停计时。', entries: FEEDBACK_ENTRIES },
]

export function findEntry(slug: string): { category: DemoCategory; entry: DemoEntry } | null {
  for (const category of CATEGORIES) {
    const entry = category.entries.find((item) => item.slug === slug)
    if (entry) return { category, entry }
  }
  return null
}
