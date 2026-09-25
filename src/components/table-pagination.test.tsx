import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TablePagination, paginationItems } from './table-pagination'

afterEach(cleanup)

describe('paginationItems', () => {
  it('首尾各留两页，当前页两侧各一页，其余折叠', () => {
    expect(paginationItems(1, 13)).toEqual([1, 2, 3, 4, 'gap', 12, 13])
    expect(paginationItems(7, 13)).toEqual([1, 2, 'gap', 6, 7, 8, 'gap', 12, 13])
    expect(paginationItems(13, 13)).toEqual([1, 2, 'gap', 10, 11, 12, 13])
  })

  it('空隙只差一页时直接显示该页，页数少时不折叠', () => {
    expect(paginationItems(4, 13)).toEqual([1, 2, 3, 4, 5, 'gap', 12, 13])
    expect(paginationItems(1, 1)).toEqual([1])
    expect(paginationItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('TablePagination', () => {
  const setup = (page = 1, extra: Partial<Parameters<typeof TablePagination>[0]> = {}) => {
    const onPageChange = vi.fn()
    render(<TablePagination page={page} totalPages={13} total={122} pageSize={10} onPageChange={onPageChange} {...extra} />)
    return onPageChange
  }

  it('显示区间摘要与总页数，并标记当前页', () => {
    setup(2)
    expect(screen.getByText('显示第 11 条 - 第 20 条，共 122 条')).toBeTruthy()
    expect(screen.getByText('总页数：13')).toBeTruthy()
    expect(screen.getByRole('button', { name: '第 2 页' }).getAttribute('aria-current')).toBe('page')
  })

  it('点页码、上一页、下一页翻页；边界禁用', () => {
    const onPageChange = setup(1)
    expect((screen.getByRole('button', { name: '上一页' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '下一页' }))
    fireEvent.click(screen.getByRole('button', { name: '第 13 页' }))
    fireEvent.click(screen.getByRole('button', { name: '第 1 页' }))
    expect(onPageChange.mock.calls).toEqual([[2], [13]])
  })

  it('跳页输入回车后跳转并夹到合法范围', () => {
    const onPageChange = setup(1)
    const input = screen.getByRole('textbox', { name: '跳转页码' })
    fireEvent.change(input, { target: { value: '9x' } })
    expect((input as HTMLInputElement).value).toBe('9')
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onPageChange.mock.calls).toEqual([[9], [13]])
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('空结果显示 0 条；只有传 onPageSizeChange 才渲染每页条数下拉', () => {
    render(<TablePagination page={1} totalPages={1} total={0} pageSize={20} onPageChange={() => {}} />)
    expect(screen.getByText('显示第 0 条 - 第 0 条，共 0 条')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: '每页条数' })).toBeNull()
    cleanup()
    const onPageSizeChange = vi.fn()
    setup(1, { onPageSizeChange })
    fireEvent.click(screen.getByRole('combobox', { name: '每页条数' }))
    fireEvent.click(screen.getByRole('option', { name: '每页条数：50' }))
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })
})
