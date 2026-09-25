import { useState, type KeyboardEvent } from 'react'
import { Icon } from './ui'
import { Select } from './select'

export type TablePaginationProps = {
  /** 当前页码，从 1 开始 */
  page: number
  totalPages: number
  /** 数据总条数 */
  total: number
  /** 每页条数：用于「显示第 x 条 - 第 y 条」 */
  pageSize: number
  onPageChange: (page: number) => void
  /** 传入后显示「每页条数」下拉；调用方负责把页码重置到合法范围 */
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: readonly number[]
  className?: string
}

/**
 * 页码序列：首尾各两页 + 当前页前后各一页，其余折叠成省略号。
 * 贴着开头/结尾时补足到 4 个连续页码，避免只露出 1、2 就断开；
 * 空隙只差一页时直接显示那一页——省略号代替一个数字没有意义。
 */
export function paginationItems(page: number, totalPages: number): (number | 'gap')[] {
  const pages = new Set([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1])
  if (page <= 3) [3, 4].forEach((value) => pages.add(value))
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2].forEach((value) => pages.add(value))
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)
  const items: (number | 'gap')[] = []
  for (const value of sorted) {
    const previous = items.at(-1)
    if (typeof previous === 'number' && value - previous === 2) items.push(previous + 1)
    else if (typeof previous === 'number' && value - previous > 2) items.push('gap')
    items.push(value)
  }
  return items
}

/**
 * 表格分页栏。一套 DOM，按宽度切两种形态：
 * - 桌面：左侧「显示第 x - y 条，共 n 条」；右侧总页数、页码条、每页条数下拉；
 * - 窄屏（<768px）：居中的「‹ 3/13 ›」加「跳至 _ 页」，页码条与下拉收起。
 */
export function TablePagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}: TablePaginationProps) {
  const [jump, setJump] = useState('')
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const go = (target: number) => {
    const next = Math.min(Math.max(1, target), totalPages)
    if (next !== page) onPageChange(next)
  }
  const submitJump = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    const target = Number.parseInt(jump, 10)
    if (Number.isFinite(target)) go(target)
    setJump('')
  }

  return (
    <nav className={`cx-pagination ${className}`} aria-label="分页">
      <p className="cx-pagination-summary">显示第 {start} 条 - 第 {end} 条，共 {total} 条</p>
      <div className="cx-pagination-controls">
        <span className="cx-pagination-total">总页数：{totalPages}</span>
        <button type="button" className="cx-pagination-step" aria-label="上一页" disabled={page <= 1} onClick={() => go(page - 1)}>
          <Icon name="chevron-left" size={16} />
        </button>
        <ol className="cx-pagination-pages">
          {paginationItems(page, totalPages).map((item, index) => (
            <li key={item === 'gap' ? `gap-${index}` : item}>
              {item === 'gap' ? (
                <span className="cx-pagination-gap" aria-hidden="true">…</span>
              ) : (
                <button
                  type="button"
                  className="cx-pagination-page"
                  aria-label={`第 ${item} 页`}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => go(item)}
                >
                  {item}
                </button>
              )}
            </li>
          ))}
        </ol>
        <span className="cx-pagination-compact" aria-hidden="true">{page}/{totalPages}</span>
        <button type="button" className="cx-pagination-step" aria-label="下一页" disabled={page >= totalPages} onClick={() => go(page + 1)}>
          <Icon name="chevron-right" size={16} />
        </button>
        <label className="cx-pagination-jump">
          跳至
          <input
            className="cx-pagination-jump-input"
            inputMode="numeric"
            aria-label="跳转页码"
            value={jump}
            onChange={(event) => setJump(event.target.value.replace(/\D/g, ''))}
            onKeyDown={submitJump}
          />
          页
        </label>
        {onPageSizeChange ? (
          <Select
            className="cx-pagination-size"
            aria-label="每页条数"
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            options={pageSizeOptions.map((size) => ({ value: String(size), label: `每页条数：${size}` }))}
          />
        ) : null}
      </div>
    </nav>
  )
}
