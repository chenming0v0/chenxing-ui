import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { DataTable, DataTableRow, RowAction, RowActions } from './data-table'
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

describe('DataTable', () => {
  it('labels every body cell with its column header for the narrow-screen card layout', () => {
    function Row({ name }: { name: string }) {
      return (
        <tr>
          <td>{name}</td>
          <td>启用</td>
          <RowActions><RowAction>编辑</RowAction></RowActions>
        </tr>
      )
    }
    const { container, rerender } = render(
      <DataTable columns={['名称', { label: <span>状态</span>, key: 'status' }, { label: '操作', align: 'right' }]}>
        <Row name="甲" />
      </DataTable>,
    )
    const labels = () => Array.from(container.querySelectorAll('tbody td'), (td) => (td as HTMLElement).dataset.label)
    expect(labels()).toEqual(['名称', '状态', '操作'])
    expect(screen.getByRole('button', { name: '编辑' }).closest('td')?.className).toContain('cx-table-actions')

    rerender(
      <DataTable columns={['名称', { label: <span>状态</span>, key: 'status' }, { label: '操作', align: 'right' }]}>
        <Row name="甲" />
        <Row name="乙" />
      </DataTable>,
    )
    expect(labels()).toEqual(['名称', '状态', '操作', '名称', '状态', '操作'])
  })

  it('advances the column index across colSpan cells', () => {
    const { container } = render(
      <DataTable columns={['A', 'B', 'C']}>
        <tr><td colSpan={2}>ab</td><td>c</td></tr>
      </DataTable>,
    )
    const cells = container.querySelectorAll<HTMLElement>('tbody td')
    expect(cells[0].dataset.label).toBe('A')
    expect(cells[1].dataset.label).toBe('C')
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

describe('DataTableRow', () => {
  it('opens on click, Enter and Space but not on keys from nested controls', () => {
    const onOpen = vi.fn()
    render(
      <DataTable columns={['名称', { label: '操作', align: 'right' }]}>
        <DataTableRow onOpen={onOpen} label="查看 甲 详情">
          <td>甲</td>
          <RowActions><RowAction>停用</RowAction></RowActions>
        </DataTableRow>
      </DataTable>,
    )
    const row = screen.getByRole('row', { name: '查看 甲 详情' })
    expect(row.tabIndex).toBe(0)
    fireEvent.click(row)
    fireEvent.keyDown(row, { key: 'Enter' })
    fireEvent.keyDown(row, { key: ' ' })
    expect(onOpen).toHaveBeenCalledTimes(3)
    fireEvent.keyDown(screen.getByRole('button', { name: '停用' }), { key: 'Enter' })
    fireEvent.click(screen.getByRole('button', { name: '停用' }))
    expect(onOpen).toHaveBeenCalledTimes(3)
  })
})
