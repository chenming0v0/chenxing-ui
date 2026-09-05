import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CopyButton, Highlight } from './code'
import { componentMarkdown } from './content'
import { findEntry } from './registry'

afterEach(() => { cleanup(); vi.restoreAllMocks(); Reflect.deleteProperty(navigator, 'clipboard'); Reflect.deleteProperty(document, 'execCommand') })

describe('code and document copying', () => {
  it('preserves code containing URLs, quotes and markup while highlighting', () => {
    const code = `// import \"quoted\"\nconst url = 'https://example.com/from'\nconst tag = <Field label=\"<script>alert(1)</script>\" />`
    const { container } = render(<Highlight code={code} />)
    expect(container.textContent).toBe(code)
    expect(container.querySelector('script')).toBeNull()
  })

  it('reports success only after the clipboard write completes', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<CopyButton value="example code" />)
    fireEvent.click(screen.getByRole('button', { name: '复制代码' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '已复制' })).toBeTruthy())
    expect(writeText).toHaveBeenCalledWith('example code')
  })

  it('reports a failure and restores focus when both clipboard paths are unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => false) })
    render(<CopyButton value="example code" />)
    const button = screen.getByRole('button', { name: '复制代码' })
    button.focus()
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByRole('button', { name: '复制失败，请重试' })).toBeTruthy())
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('copies complete Markdown including runnable examples and API tables', () => {
    const entry = findEntry('tag-input-field')!.entry
    const markdown = componentMarkdown(entry)
    expect(markdown).toContain('# TagInputField')
    expect(markdown).toContain('onUpdate')
    expect(markdown).toContain('## TagInputField Props')
    expect(markdown).toContain('```tsx')
    expect(markdown).toContain('boolean \\| void')
  })
})
