import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { NavigationMenu } from './navigation-menu'

afterEach(cleanup)

function renderMenu() {
  return render(
    <NavigationMenu label="打开导航菜单">
      <a className="chenxing-menu-item" href="#home">主页</a>
      <a className="chenxing-menu-item" href="#console">控制台</a>
      <button type="button" className="chenxing-menu-item">登出</button>
    </NavigationMenu>,
  )
}

const trigger = () => screen.getByRole('button', { name: '打开导航菜单' })

describe('NavigationMenu 展开/收起', () => {
  it('点击汉堡开关面板并同步 aria-expanded / aria-controls', () => {
    renderMenu()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('主页')).toBeNull()

    fireEvent.click(trigger())
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    const panelId = trigger().getAttribute('aria-controls')!
    expect(document.getElementById(panelId)?.contains(screen.getByText('主页'))).toBe(true)

    fireEvent.click(trigger())
    expect(screen.queryByText('主页')).toBeNull()
  })

  it('Escape 关闭并把焦点还给触发器', () => {
    renderMenu()
    fireEvent.click(trigger())
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('主页')).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('点击面板外部（mousedown）关闭', () => {
    renderMenu()
    fireEvent.click(trigger())
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('主页')).toBeNull()
  })

  it('点击遮罩关闭并把焦点还给触发器', () => {
    const { container } = renderMenu()
    fireEvent.click(trigger())
    fireEvent.click(container.querySelector('.chenxing-nav-overlay')!)
    expect(screen.queryByText('主页')).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })
})

describe('NavigationMenu 键盘导航', () => {
  it('触发器上 ArrowDown 打开并聚焦第一项，面板内方向键循环', () => {
    renderMenu()
    trigger().focus()
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toBe('主页')

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toBe('控制台')

    // End 跳末项，再 ArrowDown 环回首项
    fireEvent.keyDown(document.activeElement!, { key: 'End' })
    expect(document.activeElement?.textContent).toBe('登出')
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toBe('主页')
  })

  it('触发器上 ArrowUp 打开并聚焦末项', () => {
    renderMenu()
    trigger().focus()
    fireEvent.keyDown(trigger(), { key: 'ArrowUp' })
    expect(document.activeElement?.textContent).toBe('登出')
  })
})

describe('NavigationMenu 受控模式', () => {
  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <NavigationMenu label="菜单" open={open} onOpenChange={setOpen}>
          <a className="chenxing-menu-item" href="#a">条目A</a>
        </NavigationMenu>
        <button type="button" onClick={() => setOpen(false)}>外部关闭</button>
        <span data-testid="state">{open ? 'open' : 'closed'}</span>
      </>
    )
  }

  it('展开态由外部状态驱动，onOpenChange 双向同步', () => {
    render(<Harness />)
    const btn = screen.getByRole('button', { name: '菜单' })
    fireEvent.click(btn)
    expect(screen.getByTestId('state').textContent).toBe('open')
    expect(screen.getByText('条目A')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '外部关闭' }))
    expect(screen.getByTestId('state').textContent).toBe('closed')
    expect(screen.queryByText('条目A')).toBeNull()
  })
})
