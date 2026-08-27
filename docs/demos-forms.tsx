import { useState } from 'react'
import {
  Field, FieldShell, Icon, PasswordField, Select, SelectField, Switch, TextAreaField, ToggleRow,
} from '../src'
import type { DemoEntry } from './registry'

const REGIONS = [
  { value: 'cn', label: '中国大陆' },
  { value: 'hk', label: '中国香港' },
  { value: 'sg', label: '新加坡' },
  { value: 'jp', label: '日本', disabled: true },
]

const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: '管理员' },
  { value: 'auditor', label: '审计员' },
]

function SelectDemo() {
  const [region, setRegion] = useState('')
  return (
    <div className="w-full max-w-xs">
      <Select aria-label="选择区域" value={region} onChange={setRegion} options={REGIONS} placeholder="选择区域" />
    </div>
  )
}

function SelectFieldDemo() {
  const [role, setRole] = useState('owner')
  return (
    <div className="w-full max-w-xs">
      <SelectField label="角色" icon="crown" value={role} onChange={setRole} options={ROLES} />
    </div>
  )
}

function SwitchDemo() {
  const [mfa, setMfa] = useState(true)
  return (
    <>
      <Switch checked={mfa} onChange={setMfa} label="两步验证" />
      <Switch checked={false} onChange={() => {}} disabled label="禁用示例" />
    </>
  )
}

function ToggleRowDemo() {
  const [mfa, setMfa] = useState(true)
  const [notify, setNotify] = useState(false)
  return (
    <div className="w-full space-y-3">
      <ToggleRow title="登录通知" description="有新设备登录时发送邮件提醒" checked={notify} onChange={setNotify} />
      <ToggleRow title="强制两步验证" description="要求所有管理员开启 TOTP" checked={mfa} onChange={setMfa} />
    </div>
  )
}

export const FORM_ENTRIES: DemoEntry[] = [
  {
    slug: 'field',
    name: 'Field',
    description: '带标签的输入框：icon、hint 与 errorText 状态。',
    Demo: () => (
      <div className="w-full space-y-4">
        <Field label="用户名" icon="user" hint="3-64 个字符" placeholder="chenxing" />
        <Field label="邮箱" icon="mail" errorText="邮箱格式不正确" defaultValue="not-an-email" />
      </div>
    ),
  },
  {
    slug: 'password-field',
    name: 'PasswordField',
    description: '密码输入，内置可见性切换按钮。',
    Demo: () => (
      <div className="w-full">
        <PasswordField label="密码" icon="lock" hint="至少 8 位，包含字母和数字" placeholder="••••••••" />
      </div>
    ),
  },
  {
    slug: 'text-area-field',
    name: 'TextAreaField',
    description: '多行文本输入，与 Field 同一套提示/校验关联。',
    Demo: () => (
      <div className="w-full">
        <TextAreaField label="应用描述" hint="会展示在授权确认页" placeholder="例如：辰星旗下的开发者工具" />
      </div>
    ),
  },
  {
    slug: 'select',
    name: 'Select',
    description: 'ARIA 1.2 select-only combobox，弹层随主题走、支持键盘导航与禁用项。',
    Demo: SelectDemo,
  },
  {
    slug: 'select-field',
    name: 'SelectField',
    description: '带标签与图标的 Select 组合。',
    Demo: SelectFieldDemo,
  },
  {
    slug: 'switch',
    name: 'Switch',
    description: 'role=switch 的开关，禁用态自动降低不透明度。',
    Demo: SwitchDemo,
  },
  {
    slug: 'toggle-row',
    name: 'ToggleRow',
    description: '标题 + 描述 + 开关的设置行。',
    wide: true,
    Demo: ToggleRowDemo,
  },
  {
    slug: 'field-shell',
    name: 'FieldShell',
    description: '带图标/尾随区的输入外壳，内部控件自由组合。',
    Demo: () => (
      <div className="w-full max-w-sm">
        <FieldShell icon="search" trailing={<Icon name="arrow-right" size={14} />}>
          <input placeholder="搜索组件…" aria-label="搜索组件" />
        </FieldShell>
      </div>
    ),
  },
]
