import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ErrorBoundary } from './error-boundary'

afterEach(cleanup)

function Bomb(): never {
  throw new Error('secret-token-abc123')
}

describe('ErrorBoundary', () => {
  it('正常时透明渲染 children', () => {
    render(<ErrorBoundary><p>一切正常</p></ErrorBoundary>)
    expect(screen.getByText('一切正常')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('渲染崩溃落到恢复界面，且不泄漏任何错误详情', () => {
    // React 会把捕获的错误打到 console.error，测试里静音
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Bomb /></ErrorBoundary>)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('界面遇到问题')).toBeTruthy()
    expect(screen.getByRole('button', { name: '刷新页面' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '返回首页' }).getAttribute('href')).toBe('/')
    // 安全约定：错误消息绝不出现在 DOM 里
    expect(document.body.textContent).not.toContain('secret-token-abc123')
    spy.mockRestore()
  })

  it('崩溃后把焦点移到恢复标题，homeHref 可定制', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary homeHref="/home"><Bomb /></ErrorBoundary>)
    const heading = screen.getByText('界面遇到问题')
    expect(document.activeElement).toBe(heading)
    expect(screen.getByRole('link', { name: '返回首页' }).getAttribute('href')).toBe('/home')
    spy.mockRestore()
  })
})
