import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Badge, Button } from './ui'
import { SessionItem } from './session-item'

afterEach(cleanup)

describe('SessionItem', () => {
  it('renders session identity, status, metadata, and actions', () => {
    render(
      <SessionItem
        title="当前会话"
        status={<Badge tone="success">当前</Badge>}
        description={<span>创建于 2026-09-05 19:06 · 到期 2026-09-25 16:06</span>}
        actions={<Button variant="danger">登出</Button>}
      />,
    )

    expect(screen.getByRole('article', { name: '当前会话' })).toBeTruthy()
    expect(screen.getByText('当前')).toBeTruthy()
    expect(screen.getByText(/创建于 2026-09-05/)).toBeTruthy()
    expect(screen.getByRole('button', { name: '登出' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '登出' }).parentElement?.dataset.slot).toBe('session-item-actions')
  })

  it('keeps supplied actions interactive and respects their disabled state', () => {
    const onRevoke = vi.fn()
    const { rerender } = render(<SessionItem title="其他会话" description="创建于 2026-09-05" actions={<Button onClick={onRevoke}>登出</Button>} />)
    fireEvent.click(screen.getByRole('button', { name: '登出' }))
    expect(onRevoke).toHaveBeenCalledTimes(1)
    rerender(<SessionItem title="其他会话" description="创建于 2026-09-05" actions={<Button disabled onClick={onRevoke}>登出</Button>} />)
    fireEvent.click(screen.getByRole('button', { name: '登出' }))
    expect(onRevoke).toHaveBeenCalledTimes(1)
  })
})
