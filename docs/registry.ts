import type { ComponentType } from 'react'
import exampleSources from 'virtual:docs-examples'

export type PropRow = {
  name: string
  type: string
  default?: string
  description: string
}

export type PropTable = {
  heading: string
  rows: PropRow[]
}

/** 组件页上的一个示例块：标题 + 实时预览 + 可展开代码 */
export type DemoExample = {
  id: string
  title: string
  description?: string
  code: string
  Demo: ComponentType
  /** 全屏/fixed 遮罩：预览区不加玻璃、给足高度 */
  bare?: boolean
}

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
  badge?: 'new' | 'updated'
  Demo: ComponentType
  /** 详情页分段示例；缺省时回落到单个 Usage（Demo） */
  examples?: Omit<DemoExample, 'code'>[]
}

export function getExamples(entry: DemoEntry): DemoExample[] {
  const examples = entry.examples?.length ? entry.examples : [{ id: 'usage', title: '用法', Demo: entry.Demo, bare: entry.bare }]
  return examples.map((example) => {
    const code = exampleSources[`${entry.slug}/${example.id}`]
    if (!code) throw new Error(`Missing example source: ${entry.slug}/${example.id}`)
    return { ...example, code }
  })
}

export function importNames(entry: DemoEntry): string[] {
  const raw = entry.imports ?? [entry.name]
  return raw.flatMap((name) => name.split(/\s*[+/]\s*/)).map((name) => name.trim()).filter(Boolean)
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

export function allEntries(): DemoEntry[] {
  return CATEGORIES.flatMap((category) => category.entries)
}
