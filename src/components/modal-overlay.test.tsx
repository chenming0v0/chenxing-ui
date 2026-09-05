import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ModalOverlay } from './modal-overlay'

afterEach(cleanup)

describe('ModalOverlay', () => {
  it('renders children inside the unified overlay', () => {
    render(
      <ModalOverlay>
        <section role="dialog" aria-label="示例弹窗">内容</section>
      </ModalOverlay>,
    )
    const overlay = screen.getByRole('presentation')
    expect(overlay.className).toContain('chenxing-modal-overlay')
    expect(screen.getByRole('dialog', { name: '示例弹窗' })).toBeTruthy()
  })

  it('dismisses only on backdrop press, not on panel press', () => {
    const onDismiss = vi.fn()
    render(
      <ModalOverlay onDismiss={onDismiss}>
        <section role="dialog" aria-label="示例弹窗">内容</section>
      </ModalOverlay>,
    )
    fireEvent.mouseDown(screen.getByRole('dialog', { name: '示例弹窗' }))
    expect(onDismiss).not.toHaveBeenCalled()
    fireEvent.mouseDown(screen.getByRole('presentation'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('ignores backdrop press without onDismiss', () => {
    render(
      <ModalOverlay>
        <section role="dialog" aria-label="示例弹窗">内容</section>
      </ModalOverlay>,
    )
    fireEvent.mouseDown(screen.getByRole('presentation'))
    expect(screen.getByRole('dialog', { name: '示例弹窗' })).toBeTruthy()
  })
})
