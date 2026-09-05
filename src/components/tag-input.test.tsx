import { describe, expect, it, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { TagInputField } from './tag-input'

afterEach(cleanup)

function renderField(overrides: Partial<Parameters<typeof TagInputField>[0]> = {}) {
  const onDraftChange = vi.fn()
  const onAdd = vi.fn()
  const onRemove = vi.fn()
  const onUpdate = vi.fn(() => true)
  render(
    <TagInputField
      label="允许的域名"
      values={['a.com', 'b.com']}
      draft=""
      onDraftChange={onDraftChange}
      onAdd={onAdd}
      onRemove={onRemove}
      onUpdate={onUpdate}
      {...overrides}
    />,
  )
  return { onDraftChange, onAdd, onRemove, onUpdate }
}

describe('TagInputField', () => {
  it('label 与输入框关联，chips 与输入框同在一个 field shell 里', () => {
    renderField()
    const input = screen.getByLabelText('允许的域名')
    expect(input.closest('.chenxing-field-shell')).toBeTruthy()
    expect(screen.getByText('a.com').closest('.chenxing-field-shell'))
      .toBe(input.closest('.chenxing-field-shell'))
  })

  it('Enter 提交草稿并阻止表单默认提交', () => {
    const submit = vi.fn((event) => event.preventDefault())
    const onAdd = vi.fn()
    render(
      <form onSubmit={submit}>
        <TagInputField label="允许的域名" values={[]} draft="c.com" onDraftChange={() => {}} onAdd={onAdd} onRemove={() => {}} />
      </form>,
    )
    fireEvent.keyDown(screen.getByLabelText('允许的域名'), { key: 'Enter' })
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(submit).not.toHaveBeenCalled()
  })

  it('添加按钮使用可配置的无障碍名并触发 onAdd', () => {
    const { onAdd } = renderField()
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('输入法组合期间 Enter 和 Backspace 不提交或移除标签', () => {
    const { onAdd, onRemove } = renderField()
    const input = screen.getByLabelText('允许的域名')
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    fireEvent.keyDown(input, { key: 'Backspace', isComposing: true })
    expect(onAdd).not.toHaveBeenCalled()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('编辑时输入法确认与取消不提前结束编辑', () => {
    const { onUpdate } = renderField()
    fireEvent.click(screen.getByRole('button', { name: '编辑 a.com' }))
    const editor = screen.getByRole('textbox', { name: '编辑 a.com' })
    fireEvent.keyDown(editor, { key: 'Enter', isComposing: true })
    fireEvent.keyDown(editor, { key: 'Escape', isComposing: true })
    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: '编辑 a.com' })).toBe(editor)
  })

  it('草稿为空时 Backspace 移除末位标签，草稿非空时不动列表', () => {
    const { onRemove } = renderField()
    fireEvent.keyDown(screen.getByLabelText('允许的域名'), { key: 'Backspace' })
    expect(onRemove).toHaveBeenCalledWith('b.com', 1)

    cleanup()
    const withDraft = renderField({ draft: 'c' })
    fireEvent.keyDown(screen.getByLabelText('允许的域名'), { key: 'Backspace' })
    expect(withDraft.onRemove).not.toHaveBeenCalled()
  })

  it('条目默认显示编辑/删除动作，编辑时自动选中文本，Enter 提交新值', () => {
    const { onUpdate } = renderField()
    fireEvent.click(screen.getByRole('button', { name: '编辑 a.com' }))
    const editor = screen.getByRole('textbox', { name: '编辑 a.com' }) as HTMLInputElement
    expect(editor.value).toBe('a.com')
    fireEvent.change(editor, { target: { value: 'new.example.com' } })
    fireEvent.keyDown(editor, { key: 'Enter' })
    expect(onUpdate).toHaveBeenCalledWith('a.com', 0, 'new.example.com')
    expect(screen.queryByRole('textbox', { name: '编辑 a.com' })).toBeNull()
  })

  it('Escape 取消编辑，回调返回 false 时保留编辑态', () => {
    const onUpdate = vi.fn(() => false)
    renderField({ onUpdate })
    fireEvent.click(screen.getByRole('button', { name: '编辑 a.com' }))
    const editor = screen.getByRole('textbox', { name: '编辑 a.com' })
    fireEvent.change(editor, { target: { value: 'invalid' } })
    fireEvent.keyDown(editor, { key: 'Enter' })
    expect(screen.getByRole('textbox', { name: '编辑 a.com' })).toBeTruthy()
    fireEvent.keyDown(editor, { key: 'Escape' })
    expect(screen.queryByRole('textbox', { name: '编辑 a.com' })).toBeNull()
  })

  it('每枚 chip 的移除按钮带上具体值，避免同名按钮不可区分', () => {
    const { onRemove } = renderField()
    fireEvent.click(screen.getByRole('button', { name: '移除 a.com' }))
    expect(onRemove).toHaveBeenCalledWith('a.com', 0)
  })

  it('errorText 接管 aria-invalid 与 aria-describedby，无错误时显示 hint', () => {
    renderField({ errorText: '域名格式不对。', hint: '不显示' })
    const input = screen.getByLabelText('允许的域名')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const message = document.getElementById(input.getAttribute('aria-describedby')!)
    expect(message?.textContent).toContain('域名格式不对。')

    cleanup()
    renderField({ hint: '仅接受完整域名。' })
    const hinted = screen.getByLabelText('允许的域名')
    expect(hinted.getAttribute('aria-invalid')).toBeNull()
    expect(document.getElementById(hinted.getAttribute('aria-describedby')!)?.textContent)
      .toBe('仅接受完整域名。')
  })

  it('disabled 时输入框与添加按钮禁用，且不渲染移除按钮', () => {
    renderField({ disabled: true })
    expect((screen.getByLabelText('允许的域名') as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: '添加' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByRole('button', { name: /移除/ })).toBeNull()
  })
})
