import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { DataTable, RowAction, RowActions } from './data-table'
import { SearchField } from './ui'

afterEach(cleanup)

describe('RowAction', () => {
  it('renders a text-link button, never submits forms', () => {
    render(<RowAction onClick={() => {}}>编辑</RowAction>)
    const button = screen.getByRole('button', { name: '编辑' })
    expect(button.getAttribute('type')).toBe('button')
    expect(button.className).toContain('chenxing-row-action')
    expect(button.className).not.toContain('chenxing-row-action-danger')
  })

  it('applies the danger tone class for destructive actions', () => {
    render(<RowAction tone="danger">禁用</RowAction>)
    expect(screen.getByRole('button', { name: '禁用' }).className).toContain('chenxing-row-action-danger')
  })
})

describe('RowActions', () => {
  it('stops click propagation so clickable rows do not also fire', () => {
    const onRowClick = vi.fn()
    const onAction = vi.fn()
    render(
      <DataTable columns={['名称', { label: '操作', align: 'right' }]}>
        <tr onClick={onRowClick}>
          <td>示例</td>
          <RowActions>
            <RowAction onClick={onAction}>停用</RowAction>
          </RowActions>
        </tr>
      </DataTable>,
    )
    fireEvent.click(screen.getByRole('button', { name: '停用' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('right-aligns the cell to match the right-aligned action column header', () => {
    render(
      <DataTable columns={[{ label: '操作', align: 'right' }]}>
        <tr>
          <RowActions>
            <RowAction>编辑</RowAction>
          </RowActions>
        </tr>
      </DataTable>,
    )
    const cell = screen.getByRole('button', { name: '编辑' }).closest('td')
    expect(cell?.className).toContain('text-right')
  })
})

describe('SearchField', () => {
  it('fires onSearch on Enter and keeps typing untouched', () => {
    const onSearch = vi.fn()
    render(<SearchField aria-label="搜索用户" onSearch={onSearch} defaultValue="abc" />)
    const input = screen.getByLabelText('搜索用户')
    fireEvent.keyDown(input, { key: 'a' })
    expect(onSearch).not.toHaveBeenCalled()
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledTimes(1)
  })
})
