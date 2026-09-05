import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './app'
import { readRoute, sectionHref } from './navigation'

beforeEach(() => {
  window.history.replaceState(null, '', '/#/c/tag-input-field')
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0))
  vi.stubGlobal('cancelAnimationFrame', clearTimeout)
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  HTMLElement.prototype.scrollIntoView = vi.fn()
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('documentation navigation', () => {
  it('keeps the component route when following and reloading section links', async () => {
    const href = sectionHref('tag-input-field-api')
    expect(readRoute(href)).toMatchObject({ page: 'component', slug: 'tag-input-field', section: 'tag-input-field-api' })
    render(<App />)
    const toc = screen.getByRole('complementary', { name: '本页目录' })
    fireEvent.click(within(toc).getByRole('link', { name: 'API 参考' }))
    await waitFor(() => expect(window.location.hash).toBe(href))
    expect(screen.getByRole('heading', { name: 'TagInputField', level: 1 })).toBeTruthy()
    expect(document.querySelectorAll('#tag-input-field-api')).toHaveLength(1)
    cleanup()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'TagInputField', level: 1 })).toBeTruthy()
  })

  it('opens mobile navigation, follows a component and restores the background', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '打开目录' }))
    const dialog = screen.getByRole('dialog', { name: '文档目录' })
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(within(dialog).getByRole('link', { name: 'PasswordField' }))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('PasswordField'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('supports search selection, no results, Escape and focus restoration', async () => {
    render(<App />)
    const opener = screen.getAllByRole('button', { name: '搜索组件' })[0]
    opener.focus()
    fireEvent.click(opener)
    let input = screen.getByRole('combobox')
    expect(document.activeElement).toBe(input)
    fireEvent.change(input, { target: { value: 'nonexistent-component-xyz' } })
    expect(screen.getByText('没有找到匹配的组件')).toBeTruthy()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(opener)
    fireEvent.click(opener)
    input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'field' } })
    const options = screen.getAllByRole('option')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(options[1].getAttribute('aria-selected')).toBe('true')
    const selected = options[1].querySelector('strong')!.textContent
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(selected))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows a missing page for an unknown component', () => {
    window.history.replaceState(null, '', '/#/c/not-a-component')
    render(<App />)
    expect(screen.getByRole('heading', { name: '页面不存在' })).toBeTruthy()
  })

  it('lets wide gallery entries span two desktop columns', () => {
    window.history.replaceState(null, '', '/#/')
    render(<App />)
    const tableLink = screen.getByRole('link', { name: '查看 TablePanel + DataTable + TablePagination' })
    expect(tableLink.parentElement?.className).toContain('docs-gallery-card-wide')
  })
})
