import { useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { Button, HudPanel, Icon } from './ui'

/**
 * 表头列定义。绝大多数列是左对齐文本，直接传字符串；
 * 只有需要对齐方式或自定义节点时才升级成对象，避免调用方为常见情况写样板。
 */
export type DataTableColumn =
  | string
  | {
      label: ReactNode
      align?: 'left' | 'right' | 'center'
      /**
       * label 不是字符串（或为空串）时的 key 基础名；
       * 组件会追加列下标保证唯一，见 columnKey。
       */
      key?: string
    }

type DataTableProps = {
  columns: DataTableColumn[]
  /** 桌面端表格的最小宽度：容器更窄时横向滚动，不挤压列；窄屏卡片布局不受影响 */
  minWidth?: number
  /**
   * 无数据时渲染的内容，自动跨满所有列。
   * 「加载中 / 空结果 / 无权限」文案由调用方判断，组件只负责摆放位置，
   * 因此有数据时传 null。
   * 约定：加载中传「正在加载××。」句号结尾的字符串；确认为空传 EmptyState，
   * 让所有表格的加载与空态保持同一形态。
   */
  empty?: ReactNode
  /** <tbody> 内容，由调用方渲染 <tr>；单元格无需再写 padding 与分隔线 */
  children?: ReactNode
  className?: string
}

const alignClass = { left: '', right: 'text-right', center: 'text-center' } as const

/**
 * React key 必须唯一：列名（或显式 key）只作可读基础名，
 * 统一追加下标消歧，否则两个同名列（如重复的「操作」）会触发
 * React duplicate key 警告并导致 DOM 复用错乱。
 */
function columnKey(column: DataTableColumn, index: number): string {
  const base =
    typeof column === 'string'
      ? column || 'col'
      : column.key ?? (typeof column.label === 'string' ? column.label : 'col')
  return `${base}-${index}`
}

/**
 * 窄屏下每行渲染成一张「表头：值」卡片，单元格需要知道自己属于哪一列。
 * 行由调用方渲染（可能包在任意组件里），组件拿不到 <td> 的 React 元素，
 * 所以在提交后按列位置从 <th> 读取文本写到 data-label，CSS 用 attr() 显示。
 * colSpan 单元格按跨度推进列下标，保证后续单元格仍对得上表头。
 */
function labelCells(table: HTMLTableElement) {
  const labels = Array.from(table.tHead?.rows[0]?.cells ?? [], (th) => th.textContent?.trim() ?? '')
  for (const body of Array.from(table.tBodies)) {
    for (const row of Array.from(body.rows)) {
      let column = 0
      for (const cell of Array.from(row.cells)) {
        const label = labels[column] ?? ''
        if (cell.dataset.label !== label) cell.dataset.label = label
        column += cell.colSpan || 1
      }
    }
  }
}

/**
 * 表格唯一入口：`.cx-table-wrap` / `.cx-table` 的类名契约只在这里出现一次。
 * 页面不得自己拼表格外框、表头排版或分隔线，否则表格规范变更时无法统一跟随。
 * 桌面端是普通表格；窄屏（<768px）每行变成一张带表头标签的卡片，不再横向滚动。
 */
export function DataTable({ columns, minWidth, empty, children, className = '' }: DataTableProps) {
  const tableRef = useRef<HTMLTableElement>(null)
  // 无依赖数组：行内容随任意渲染变化，每次提交后重新对齐标签；只在值变化时写 DOM
  useLayoutEffect(() => {
    if (tableRef.current) labelCells(tableRef.current)
  })
  return (
    <div className={`cx-table-wrap mt-5 ${className}`}>
      <table
        ref={tableRef}
        className="cx-table"
        style={minWidth ? ({ '--cx-table-min-width': `${minWidth}px` } as CSSProperties) : undefined}
      >
        <thead>
          <tr>
            {columns.map((column, index) => {
              const isText = typeof column === 'string'
              const align = isText ? 'left' : column.align ?? 'left'
              return (
                <th key={columnKey(column, index)} scope="col" className={alignClass[align]}>
                  {isText ? column : column.label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {children}
          {/* 空态留在表格内：表头与列结构保持可见，不会出现「空表框 + 下方孤立空态」两段式布局 */}
          {empty ? (
            <tr className="cx-table-empty-row">
              <td className="cx-table-empty" colSpan={columns.length}>{empty}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

type DataTableRowProps = Omit<HTMLAttributes<HTMLTableRowElement>, 'onClick' | 'onKeyDown'> & {
  /**
   * 行详情的唯一入口：调用方在这里打开详情抽屉（Drawer）。
   * 表格行不做内联展开、不跳整页、不弹居中对话框——详情统一走抽屉。
   */
  onOpen: () => void
  /** 读屏器与键盘用户听到的行名称，例如「查看 张三 详情」 */
  label: string
}

/**
 * 可点击的表格行：整行点击、Enter / 空格都会打开详情；
 * 行内 RowActions 已吞掉冒泡，不会连带打开。
 */
export function DataTableRow({ onOpen, label, className = '', children, ...rest }: DataTableRowProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen()
  }
  return (
    <tr
      {...rest}
      className={`cx-table-row-clickable ${className}`}
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      {children}
    </tr>
  )
}

type TablePanelProps = {
  /** 标题左侧的青色图标，用于让列表面板之间保持同一视觉节奏 */
  icon?: string
  title: string
  description?: string
  /** 右上角操作区：主按钮，或筛选控件组 */
  action?: ReactNode
  /** 标题与表格之间的提示区，例如错误 Notice */
  notice?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * 列表面板：统一「HudPanel + 图标标题 + 说明 + 右上操作 + 表格」的排版。
 * 表格类页面一律走这里，不要再用 `HudPanel !p-0` 做通栏表格。
 * 窄屏（<768px）下筛选/操作区默认收起，由「显示操作项」开关展开，
 * 否则一排筛选控件会把第一行数据挤出首屏；桌面端操作区始终可见。
 */
export function TablePanel({ icon, title, description, action, notice, children, className = '' }: TablePanelProps) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsId = useId()
  return (
    <HudPanel className={className}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="chenxing-h2 flex items-center gap-2">
            {icon ? <Icon name={icon} className="shrink-0 text-[var(--chenxing-cyan)]" size={18} /> : null}
            {title}
          </h2>
          {description ? <p className="chenxing-caption mt-1.5">{description}</p> : null}
        </div>
        {action ? (
          <>
            <button
              type="button"
              className="cx-table-actions-toggle"
              aria-expanded={actionsOpen}
              aria-controls={actionsId}
              onClick={() => setActionsOpen((open) => !open)}
            >
              <Icon name={actionsOpen ? 'eye-off' : 'eye'} size={15} />
              {actionsOpen ? '隐藏操作项' : '显示操作项'}
            </button>
            <div id={actionsId} className="cx-table-panel-actions" data-open={actionsOpen || undefined}>{action}</div>
          </>
        ) : null}
      </div>
      {notice ? <div className="mt-4">{notice}</div> : null}
      {children}
    </HudPanel>
  )
}

type RowActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** danger 用于禁用、删除等破坏性操作，文字使用错误色 */
  tone?: 'default' | 'danger'
}

/**
 * 行内操作的唯一形态：文字链接（chenxing-link + chenxing-row-action）。
 * 胶囊 Button 只留给表格外的页面级操作；操作列一律用 RowAction，
 * 否则同一个「禁用」会在一个页面是红色大按钮、另一个页面是文字链接。
 */
export function RowAction({ tone = 'default', className = '', ...props }: RowActionProps) {
  const toneClass = tone === 'danger' ? ' chenxing-row-action-danger' : ''
  return <button type="button" className={`chenxing-link chenxing-row-action${toneClass} ${className}`} {...props} />
}

/**
 * 操作列单元格：统一右对齐（列头用 `{ label: '操作', align: 'right' }` 时
 * 单元格必须跟着右对齐），并吞掉点击冒泡——可点击行里的操作不应同时触发
 * 行点击。非可点击行上 stopPropagation 无害，因此不做开关，少一个特殊情况。
 */
export function RowActions({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`cx-table-actions text-right ${className}`} onClick={(event) => event.stopPropagation()}>
      <div className="inline-flex flex-wrap items-center justify-end gap-2">{children}</div>
    </td>
  )
}
