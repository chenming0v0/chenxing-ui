import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ToastProvider, useToast } from './toast'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function Trigger() {
  const { toast, clear } = useToast()
  return (
    <>
      <button type="button" onClick={() => toast.success('保存成功', { description: '所有更改已同步。' })}>发成功</button>
      <button type="button" onClick={() => toast.error('保存失败', { onClose: onCloseSpy })}>发错误</button>
      <button type="button" onClick={() => toast.info('常驻通知', { timeout: 0 })}>发常驻</button>
      <button
        type="button"
        onClick={() => {
          toast.info('一')
          toast.info('二')
          toast.info('三')
          toast.info('四')
        }}
      >
        连发四条
      </button>
      <button type="button" onClick={clear}>全部关闭</button>
    </>
  )
}

const onCloseSpy = vi.fn()

function renderToast() {
  return render(
    <ToastProvider>
      <Trigger />
    </ToastProvider>,
  )
}

describe('Toast 玻璃叠卡通知', () => {
  it('触发后渲染 alertdialog：标题/描述经 aria 关联，内容区是 alert live 区域', () => {
    renderToast()
    fireEvent.click(screen.getByText('发成功'))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog.className).toContain('cx-toast-success')
    expect(dialog.getAttribute('aria-modal')).toBe('false')
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!)
    expect(title?.textContent).toBe('保存成功')
    const desc = document.getElementById(dialog.getAttribute('aria-describedby')!)
    expect(desc?.textContent).toBe('所有更改已同步。')
    expect(dialog.querySelector('[role="alert"]')).not.toBeNull()
    expect(screen.getByRole('region', { name: '1 条通知' })).not.toBeNull()
  })

  it('默认 4 秒自动关闭：先播 350ms 退场动画再移除，onClose 在移除后触发', () => {
    vi.useFakeTimers()
    onCloseSpy.mockClear()
    renderToast()
    fireEvent.click(screen.getByText('发错误'))
    act(() => { vi.advanceTimersByTime(4000) })
    // 退场窗口内：仍在 DOM，挂 is-closing 播滑出动画
    expect(document.querySelector('.cx-toast.is-closing')).not.toBeNull()
    expect(onCloseSpy).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(350) })
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(onCloseSpy).toHaveBeenCalledTimes(1)
  })

  it('焦点进入通知区暂停剩余计时，离开后累减恢复而不是重开', () => {
    vi.useFakeTimers()
    renderToast()
    fireEvent.click(screen.getByText('发成功'))
    // 先流逝 3 秒，剩 1 秒
    act(() => { vi.advanceTimersByTime(3000) })
    fireEvent.focus(screen.getByRole('alertdialog'))
    // 暂停期间远超原始 timeout 也不关闭
    act(() => { vi.advanceTimersByTime(10000) })
    expect(screen.getByRole('alertdialog')).not.toBeNull()
    fireEvent.blur(screen.getByRole('alertdialog'))
    // 恢复后只需剩余的 1 秒（若被重开成 4 秒，这里就还活着）
    act(() => { vi.advanceTimersByTime(1000) })
    expect(document.querySelector('.cx-toast.is-closing')).not.toBeNull()
    act(() => { vi.advanceTimersByTime(350) })
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('关闭按钮立即触发退场；timeout 0 常驻不自动关闭', () => {
    vi.useFakeTimers()
    renderToast()
    fireEvent.click(screen.getByText('发常驻'))
    act(() => { vi.advanceTimersByTime(60000) })
    expect(screen.getByRole('alertdialog')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(document.querySelector('.cx-toast.is-closing')).not.toBeNull()
    act(() => { vi.advanceTimersByTime(350) })
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('堆叠：新卡最前且唯一可聚焦，超出可见上限的卡 aria-hidden，槽位按层级递推', () => {
    renderToast()
    fireEvent.click(screen.getByText('连发四条'))
    const slots = document.querySelectorAll('.cx-toast-slot')
    expect(slots.length).toBe(4)
    // aria-hidden 的第 4 张不进 role 查询
    const dialogs = screen.getAllByRole('alertdialog')
    expect(dialogs.length).toBe(3)
    // 最新的在最前：标题为「四」，唯一 tabIndex=0
    const front = document.querySelector('.cx-toast-slot.is-front .cx-toast')!
    expect(front.textContent).toContain('四')
    expect(front.getAttribute('tabindex')).toBe('0')
    expect(document.querySelectorAll('.cx-toast[tabindex="0"]').length).toBe(1)
    // 最旧的「一」超出 3 张上限：透明层 + aria-hidden
    const hiddenSlot = document.querySelector('.cx-toast-slot.is-hidden')!
    expect(hiddenSlot.getAttribute('aria-hidden')).toBe('true')
    expect(hiddenSlot.textContent).toContain('一')
    expect(screen.getByRole('region', { name: '4 条通知' })).not.toBeNull()
  })

  it('clear 全部关闭：所有卡同时退场并清空区域', () => {
    vi.useFakeTimers()
    renderToast()
    fireEvent.click(screen.getByText('连发四条'))
    fireEvent.click(screen.getByText('全部关闭'))
    expect(document.querySelectorAll('.cx-toast.is-closing').length).toBe(4)
    act(() => { vi.advanceTimersByTime(350) })
    expect(document.querySelector('.cx-toast-region')).toBeNull()
  })
})
