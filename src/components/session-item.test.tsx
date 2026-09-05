import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
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

  it('uses stacked mobile and inline desktop layout hooks', () => {
    render(<SessionItem title="其他会话" description="创建于 2026-09-05" />)
    const item = screen.getByRole('article', { name: '其他会话' })
    expect(item.className).toContain('chenxing-session-item')
  })
})
