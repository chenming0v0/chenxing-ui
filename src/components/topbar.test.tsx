import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { Topbar, TopbarAccountPanel, TopbarNavRow } from './topbar'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderTopbar() {
  return render(
    <Topbar
      status="控制台 · 总览"
      brand={<a href="#home" aria-label="返回首页">品牌</a>}
      expandOnTop={false}
      menu={
        <>
          <TopbarNavRow index={0} icon="arrow-up-right" href="#home">主页</TopbarNavRow>
          <TopbarNavRow index={1} icon="layout-dashboard" href="#console">控制台</TopbarNavRow>
          <TopbarNavRow index={2} icon="store">应用广场</TopbarNavRow>
        </>
      }
    />,
  )
}

const trigger = () => screen.getByRole('button', { name: '打开导航菜单' })

describe('Topbar 胶囊抽屉', () => {
  it('点击汉堡在胶囊内展开抽屉并同步 aria 状态', () => {
    renderTopbar()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('主页')).toBeNull()

    fireEvent.click(trigger())
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    const panelId = trigger().getAttribute('aria-controls')!
    expect(document.getElementById(panelId)?.contains(screen.getByText('主页'))).toBe(true)
    // 抽屉长在胶囊内部，而不是全屏浮层
    expect(document.querySelector('.chenxing-topbar-capsule .chenxing-topbar-drawer')).not.toBeNull()
    // 遮罩是顶栏的兄弟节点（不被胶囊 backdrop-filter 困住）
    const overlay = document.querySelector('.cx-menu-overlay')
    expect(overlay?.parentElement).toBe(document.querySelector('header.chenxing-topbar')?.parentElement)
  })

  it('关闭后抽屉保留 450ms 退出窗口播放收拢动画再卸载', () => {
    vi.useFakeTimers()
    renderTopbar()
    fireEvent.click(trigger())
    fireEvent.click(trigger())
    // 退出窗口内：抽屉仍在，挂 is-closing 供逐项退出动画
    const drawerClosing = document.querySelector('.chenxing-topbar-drawer.is-closing')
    expect(drawerClosing).not.toBeNull()
    act(() => { vi.advanceTimersByTime(500) })
    expect(document.querySelector('.chenxing-topbar-drawer')).toBeNull()
  })

  it('点击菜单行视为已作选择：立即关闭抽屉', () => {
    renderTopbar()
    fireEvent.click(trigger())
    fireEvent.click(screen.getByText('主页'))
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('静态行渲染为 span，不进入焦点循环', () => {
    renderTopbar()
    fireEvent.click(trigger())
    const staticRow = screen.getByText('应用广场').closest('.cx-nav-row')!
    expect(staticRow.tagName).toBe('SPAN')
    expect(staticRow.className).toContain('is-static')
  })

  it('Escape 关闭抽屉并交还焦点给汉堡', () => {
    renderTopbar()
    fireEvent.click(trigger())
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger())
  })
})

function renderTopbarWithAccount() {
  return render(
    <Topbar
      status="控制台 · 总览"
      expandOnTop={false}
      menu={
        <>
          <TopbarNavRow index={0} icon="arrow-up-right" href="#home">主页</TopbarNavRow>
          <TopbarNavRow index={1} icon="layout-dashboard" href="#console">控制台</TopbarNavRow>
        </>
      }
      account={{
        trigger: <span>头像</span>,
        panel: (
          <TopbarAccountPanel
            avatar={<span />}
            name="辰星用户"
            meta={[
              { label: '会员序列', value: 'NO.000042' },
              { label: '@ Handle', value: '@chenxing', accent: true },
            ]}
          >
            <a className="chenxing-menu-item" href="#profile">账户设置</a>
            <button type="button" className="chenxing-menu-item">退出</button>
          </TopbarAccountPanel>
        ),
      }}
    />,
  )
}

const accountTrigger = () => screen.getByRole('button', { name: '账户菜单' })

describe('Topbar 账户菜单', () => {
  it('不传 account 时不渲染头像触发按钮', () => {
    renderTopbar()
    expect(screen.queryByRole('button', { name: '账户菜单' })).toBeNull()
  })

  it('点击头像在胶囊抽屉内展开账户面板并同步 aria 与 is-open 态', () => {
    renderTopbarWithAccount()
    expect(accountTrigger().getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('辰星用户')).toBeNull()

    fireEvent.click(accountTrigger())
    expect(accountTrigger().getAttribute('aria-expanded')).toBe('true')
    expect(accountTrigger().className).toContain('is-open')
    const panelId = accountTrigger().getAttribute('aria-controls')!
    const panel = document.getElementById(panelId)!
    expect(panel.contains(screen.getByText('辰星用户'))).toBe(true)
    expect(panel.className).toContain('cx-account-panel')
    // 账户面板长在胶囊抽屉内部，与汉堡菜单共享同一个抽屉
    expect(panel.closest('.chenxing-topbar-capsule .chenxing-topbar-drawer')).not.toBeNull()
  })

  it('汉堡与头像互斥：开着汉堡点头像，面板立即换成账户面板', () => {
    renderTopbarWithAccount()
    fireEvent.click(trigger())
    expect(screen.queryByText('主页')).not.toBeNull()

    fireEvent.click(accountTrigger())
    // 互斥切换：汉堡关闭、账户面板立即接管抽屉，不等旧面板的退出窗口
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(accountTrigger().getAttribute('aria-expanded')).toBe('true')
    expect(screen.queryByText('主页')).toBeNull()
    expect(screen.queryByText('辰星用户')).not.toBeNull()

    // 反向：开着账户点汉堡，换回导航面板
    fireEvent.click(trigger())
    expect(accountTrigger().getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('辰星用户')).toBeNull()
    expect(screen.queryByText('主页')).not.toBeNull()
  })

  it('点击账户面板内的行视为已作选择：立即关闭抽屉', () => {
    renderTopbarWithAccount()
    fireEvent.click(accountTrigger())
    fireEvent.click(screen.getByText('账户设置'))
    expect(accountTrigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('关闭后账户面板在 450ms 退出窗口内保持渲染供收拢动画使用，随后卸载', () => {
    vi.useFakeTimers()
    renderTopbarWithAccount()
    fireEvent.click(accountTrigger())
    fireEvent.click(accountTrigger())
    // 退出窗口内：抽屉挂 is-closing，账户面板内容仍在 DOM
    expect(document.querySelector('.chenxing-topbar-drawer.is-closing')).not.toBeNull()
    expect(screen.queryByText('辰星用户')).not.toBeNull()
    act(() => { vi.advanceTimersByTime(500) })
    expect(document.querySelector('.chenxing-topbar-drawer')).toBeNull()
    expect(screen.queryByText('辰星用户')).toBeNull()
  })
})
