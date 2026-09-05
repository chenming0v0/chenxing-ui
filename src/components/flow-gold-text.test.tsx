import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FlowGoldText } from '../index'

afterEach(cleanup)

describe('FlowGoldText', () => {
  it('exports inline text that preserves attributes and event handlers', () => {
    let clicks = 0
    render(<FlowGoldText id="brand-name" title="辰星" style={{ fontSize: 24 }} onClick={() => { clicks += 1 }}>天穹辰星</FlowGoldText>)
    const text = screen.getByText('天穹辰星')
    expect(text.tagName).toBe('SPAN')
    expect(text.id).toBe('brand-name')
    expect(text.title).toBe('辰星')
    expect(text.style.fontSize).toBe('24px')
    fireEvent.click(text)
    expect(clicks).toBe(1)
  })

  it('supports semantic elements, static text, and additional classes', () => {
    const { rerender } = render(<FlowGoldText as="h2" animated={false} className="text-3xl">品牌标题</FlowGoldText>)
    const text = screen.getByRole('heading', { name: '品牌标题', level: 2 })
    expect(text.className).toContain('chenxing-flow-gold-text')
    expect(text.className).toContain('is-static')
    expect(text.className).toContain('text-3xl')
    expect(text.className).not.toContain('is-animated')
    expect(text.hasAttribute('as')).toBe(false)
    expect(text.hasAttribute('animated')).toBe(false)
    rerender(<FlowGoldText as="h2">品牌标题</FlowGoldText>)
    expect(text.className).toContain('is-animated')
    expect(text.className).not.toContain('is-static')
  })
})
