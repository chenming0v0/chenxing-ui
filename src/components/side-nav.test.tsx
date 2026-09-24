import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { SideNav, type SideNavGroup } from './side-nav'

afterEach(cleanup)

const GROUPS: SideNavGroup[] = [
  { label: '账户', items: [{ label: '总览', href: '/console', icon: 'layout-grid' }, { label: '钱包', href: '/console/wallet', icon: 'wallet' }] },
  { label: '管理', items: [{ label: '仪表盘', href: '/admin', icon: 'gauge' }, { label: '用户管理', href: '/admin/users' }] },
]

const hrefs = (scope: HTMLElement) => within(scope).getAllByRole('link').map((link) => link.getAttribute('href'))

describe('SideNav', () => {
  it('桌面侧栏列出全部分组并标记当前页', () => {
    render(<SideNav groups={GROUPS} currentPath="/console/wallet" brand={<span>品牌</span>} />)
    const sidebar = screen.getByRole('navigation', { name: '控制台导航' })
    expect(hrefs(sidebar)).toEqual(['/console', '/console/wallet', '/admin', '/admin/users'])
    expect(within(sidebar).getByText('账户')).toBeTruthy()
    expect(within(sidebar).getByRole('link', { name: '钱包' }).getAttribute('aria-current')).toBe('page')
    expect(within(sidebar).getByRole('link', { name: '总览' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByText('品牌').closest('.chenxing-sidebar-brand')).not.toBeNull()
  })

  it('移动端底栏只承载当前路径所属分组；别名路径落回 fallbackGroup', () => {
    render(<SideNav groups={GROUPS} currentPath="/admin/users" />)
    expect(hrefs(screen.getByRole('navigation', { name: '当前区域导航' }))).toEqual(['/admin', '/admin/users'])
    cleanup()
    render(<SideNav groups={GROUPS} currentPath="/admin/unknown" fallbackGroup="管理" />)
    expect(hrefs(screen.getByRole('navigation', { name: '当前区域导航' }))).toEqual(['/admin', '/admin/users'])
    cleanup()
    render(<SideNav groups={GROUPS} currentPath="/nowhere" />)
    expect(hrefs(screen.getByRole('navigation', { name: '当前区域导航' }))).toEqual(['/console', '/console/wallet'])
  })

  it('「全部」面板按分组列出全部页面；点链接、Escape、遮罩都能关闭', () => {
    render(<SideNav groups={GROUPS} currentPath="/console" />)
    const trigger = screen.getByRole('button', { name: '全部' })
    trigger.focus()
    fireEvent.click(trigger)
    const sheet = screen.getByRole('dialog', { name: '全部页面' })
    expect(sheet.id).toBe(trigger.getAttribute('aria-controls'))
    expect(sheet.className).toContain('chenxing-hud-panel')
    expect(hrefs(sheet)).toEqual(['/console', '/console/wallet', '/admin', '/admin/users'])
    fireEvent.click(within(sheet).getByRole('link', { name: '总览' }))
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)

    fireEvent.click(trigger)
    fireEvent.click(document.querySelector('.cx-nav-sheet-overlay') as HTMLElement)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('链接通过 renderLink 渲染，便于接入 SPA 路由', () => {
    render(
      <SideNav
        groups={GROUPS}
        currentPath="/console"
        renderLink={({ href, ...props }) => <a href={href} data-spa="1" {...props} />}
      />,
    )
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    expect(links.every((link) => link.getAttribute('data-spa') === '1')).toBe(true)
  })

  it('换页后自动收起「全部」面板', () => {
    const view = render(<SideNav groups={GROUPS} currentPath="/console" />)
    fireEvent.click(screen.getByRole('button', { name: '全部' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    view.rerender(<SideNav groups={GROUPS} currentPath="/admin" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
