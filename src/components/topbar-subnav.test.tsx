import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { Topbar } from './topbar'
import { TopbarSubnav } from './topbar-subnav'

afterEach(cleanup)

const ITEMS = [
  { value: 'a', label: '注册', icon: 'user-plus' },
  { value: 'b', label: 'Passkey' },
  { value: 'c', label: '邮件' },
] as const

function Harness({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState<'a' | 'b' | 'c'>('a')
  return (
    <Topbar
      status="管理 · 系统设置"
      expandOnTop={false}
      menu={<a href="#x">主页</a>}
      subnav={(
        <TopbarSubnav
          label="系统设置分栏"
          items={ITEMS}
          value={value}
          panelId={(tab) => `panel-${tab}`}
          onChange={(next) => { setValue(next); onChange?.(next) }}
        />
      )}
    />
  )
}

describe('TopbarSubnav', () => {
  it('renders as ARIA tabs under the topbar capsule with roving tabindex', () => {
    render(<Harness />)
    const list = screen.getByRole('tablist', { name: '系统设置分栏' })
    expect(list.closest('.chenxing-topbar-subnav-slot')).not.toBeNull()
    expect(document.querySelector('.chenxing-topbar')?.hasAttribute('data-has-subnav')).toBe(true)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1])
    expect(tabs[0].getAttribute('aria-controls')).toBe('panel-a')
  })

  it('switches on click and on arrow / Home / End keys', () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    fireEvent.click(screen.getByRole('tab', { name: '邮件' }))
    expect(screen.getByRole('tab', { name: '邮件' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(screen.getByRole('tab', { name: '邮件' }), { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: '注册' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(screen.getByRole('tab', { name: '注册' }), { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith('c')
    fireEvent.keyDown(screen.getByRole('tab', { name: '邮件' }), { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith('a')
  })

  it('becomes inert while the hamburger drawer is open', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }))
    expect(document.querySelector('.chenxing-topbar-subnav-slot')?.hasAttribute('inert')).toBe(true)
  })
})
