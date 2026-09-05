import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Badge, Button } from './ui'
import { SettingsActionRow } from './settings-action-row'

afterEach(cleanup)

describe('SettingsActionRow', () => {
  it('labels the section with its heading and renders status content', () => {
    render(
      <SettingsActionRow
        icon="lock"
        title="密码管理"
        description="定期更新密码。"
        status={<Badge tone="success">已设置</Badge>}
      />,
    )

    const section = screen.getByRole('region', { name: '密码管理' })
    expect(section).toBeTruthy()
    expect(screen.getByText('已设置')).toBeTruthy()
  })

  it('stacks full-width actions on mobile and restores inline sizing on desktop', () => {
    render(
      <SettingsActionRow
        icon="key-round"
        title="Passkey 登录"
        description="使用设备凭据登录。"
        actions={(
          <>
            <Button>添加 Passkey</Button>
            <Button variant="danger">移除全部</Button>
          </>
        )}
      />,
    )

    const actions = screen.getByRole('button', { name: '添加 Passkey' }).parentElement
    expect(actions?.dataset.slot).toBe('settings-action-row-actions')
    expect(actions?.className).toContain('flex-col')
    expect(actions?.className).toContain('[&>*]:w-full')
    expect(actions?.className).toContain('lg:flex-row')
    expect(actions?.className).toContain('lg:[&>*]:w-auto')
  })
})
