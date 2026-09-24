import { Fragment, useEffect, useId, useState, type ReactNode } from 'react'
import { HudPanel, Icon } from './ui'
import { useModalFocus } from './modal'

export type SideNavItem = { label: string; href: string; icon?: string }
export type SideNavGroup = { label: string; items: readonly SideNavItem[] }

/** 交给 renderLink 的全部属性：原样展开到路由库的链接组件上即可 */
export type SideNavLinkProps = {
  href: string
  className: string
  'aria-current'?: 'page'
  children: ReactNode
}

export type SideNavProps = {
  /** 已按权限过滤的导航分组；空分组请在调用方丢弃 */
  groups: readonly SideNavGroup[]
  /** 当前路径：决定高亮项，以及移动端底栏承载哪个分组 */
  currentPath: string
  /** 桌面侧栏顶部的品牌区 */
  brand?: ReactNode
  /** 当前路径不属于任何分组时（别名路由），底栏落回的分组标题；缺省取第一组 */
  fallbackGroup?: string
  /** 渲染链接。SPA 传入自己的 Link 以走客户端路由；缺省渲染原生 <a> */
  renderLink?: (props: SideNavLinkProps) => ReactNode
  /** 桌面侧栏导航的无障碍名称 */
  label?: string
}

const defaultLink = ({ href, ...props }: SideNavLinkProps) => <a href={href} {...props} />

type Render = { currentPath: string; renderLink: (props: SideNavLinkProps) => ReactNode }

function link({ currentPath, renderLink }: Render, item: SideNavItem, className: string, iconSize: number) {
  const active = item.href === currentPath
  return (
    <Fragment key={item.href}>
      {renderLink({
        href: item.href,
        className,
        'aria-current': active ? 'page' : undefined,
        children: <>{item.icon ? <Icon name={item.icon} size={iconSize} /> : null}{item.label}</>,
      })}
    </Fragment>
  )
}

function GroupList({ groups, render }: { groups: readonly SideNavGroup[]; render: Render }) {
  return groups.map((group) => (
    <div key={group.label}>
      <p className="chenxing-nav-label">{group.label}</p>
      {group.items.map((item) => link(render, item, 'chenxing-nav-item', 16))}
    </div>
  ))
}

/** 底栏只承载当前路径所属的一个分组，分组语义因此不被抹平 */
function owningGroup(groups: readonly SideNavGroup[], path: string, fallback?: string) {
  return groups.find((group) => group.items.some((item) => item.href === path))
    ?? groups.find((group) => group.label === fallback)
    ?? groups[0]
}

/** 「全部」面板：贴底升起的模态列表，底栏放不下的页面都在这里，不会被静默丢掉 */
function NavSheet({ id, groups, render, onClose }: { id: string; groups: readonly SideNavGroup[]; render: Render; onClose: () => void }) {
  const titleId = useId()
  // 初始焦点、Tab 循环、Escape 关闭与焦点归还都由 useModalFocus 负责
  const containerRef = useModalFocus<HTMLElement>(onClose)
  return (
    <div className="cx-nav-sheet-overlay" role="presentation" onClick={onClose}>
      <HudPanel
        ref={containerRef}
        id={id}
        as="section"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="cx-nav-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="chenxing-h2">全部页面</h2>
          <button type="button" className="chenxing-icon-btn" aria-label="关闭" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>
        <nav
          className="cx-nav-sheet-scroll"
          aria-label="全部区域导航"
          /* 点了任一项就算完成选择：停在当前页时路径不变，不能只靠路径变化关闭 */
          onClick={(event) => { if ((event.target as Element).closest('a')) onClose() }}
        >
          <GroupList groups={groups} render={render} />
        </nav>
      </HudPanel>
    </div>
  )
}

function BottomNav({ groups, fallbackGroup, render }: { groups: readonly SideNavGroup[]; fallbackGroup?: string; render: Render }) {
  const current = owningGroup(groups, render.currentPath, fallbackGroup)
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetId = useId()
  // 前进/后退或面板内跳转换页后，面板不应留在屏幕上
  useEffect(() => { setSheetOpen(false) }, [render.currentPath])
  return (
    <>
      <nav className="chenxing-bottom-nav" aria-label="当前区域导航">
        <div className="cx-bottom-nav-scroll">
          {current?.items.map((item) => link(render, item, 'chenxing-bottom-tab', 18))}
        </div>
        <button
          type="button"
          className="chenxing-bottom-tab cx-bottom-more"
          aria-expanded={sheetOpen}
          aria-controls={sheetId}
          aria-haspopup="dialog"
          onClick={() => setSheetOpen((open) => !open)}
        >
          <Icon name="layers" size={18} />
          全部
        </button>
      </nav>
      {sheetOpen ? <NavSheet id={sheetId} groups={groups} render={render} onClose={() => setSheetOpen(false)} /> : null}
    </>
  )
}

/**
 * 分组侧边导航，桌面与移动端一体：
 * - ≥1024px：固定左侧栏，列出全部分组；
 * - <1024px：侧栏隐藏，改为固定底栏（只承载当前分组，可横滑）+ 右端「全部」按钮
 *   打开的贴底面板（按分组列出全部页面）。
 * 显隐完全由 CSS 断点切换，两套导航同时渲染、互不依赖 JS 媒体查询。
 * 页面主列加 `.chenxing-sidenav-main`，由它让出侧栏宽度与底栏高度。
 */
export function SideNav({ groups, currentPath, brand, fallbackGroup, renderLink = defaultLink, label = '控制台导航' }: SideNavProps) {
  const render: Render = { currentPath, renderLink }
  return (
    <>
      <aside className="chenxing-sidebar">
        {brand ? <div className="chenxing-sidebar-brand">{brand}</div> : null}
        <nav className="chenxing-sidebar-scroll" aria-label={label}>
          <GroupList groups={groups} render={render} />
        </nav>
      </aside>
      <BottomNav groups={groups} fallbackGroup={fallbackGroup} render={render} />
    </>
  )
}
