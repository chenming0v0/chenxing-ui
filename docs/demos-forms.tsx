import { useState } from 'react'
import {
  Field, FieldShell, Icon, PasswordField, SearchField, Select, SelectField, Switch, TagInputField, TextAreaField, ToggleRow,
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

function TagInputDemo() {
  const [domains, setDomains] = useState(['qq.com', 'example.com'])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  function validate(domain: string, editingIndex = -1) {
    if (domain.length > 253 || !domain.includes('.') || !domain.split('.').every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part))) {
      setError('请输入完整域名，例如 gmail.com')
      return false
    }
    if (domains.some((value, index) => value === domain && index !== editingIndex)) {
      setError('该域名已存在')
      return false
    }
    setError('')
    return true
  }

  function addDomain() {
    const domain = draft.trim().toLowerCase()
    if (!domain || !validate(domain)) return
    setDomains((current) => [...current, domain])
    setDraft('')
    setError('')
  }

  return (
    <div className="w-full max-w-2xl">
      <TagInputField
        label="允许的邮箱域名"
        values={domains}
        draft={draft}
        onDraftChange={(value) => { setDraft(value); if (error) setError('') }}
        onAdd={addDomain}
        onRemove={(_, index) => { setDomains((current) => current.filter((_, itemIndex) => itemIndex !== index)); setError('') }}
        onUpdate={(value, index, nextValue) => {
          const domain = nextValue.trim().toLowerCase()
          if (!validate(domain, index)) return false
          setDomains((current) => current.map((item, itemIndex) => itemIndex === index ? domain : item))
          setError('')
          return true
        }}
        errorText={error || undefined}
        hint={error ? undefined : '允许使用这些域名的邮箱登录。'}
        placeholder="输入域名，例如 gmail.com"
      />
    </div>
  )
}

function SearchDemo() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  return <div className="w-full max-w-sm space-y-3">
    <SearchField aria-label="搜索组件" placeholder="搜索组件" value={query} onChange={(event) => setQuery(event.target.value)} onSearch={() => setSubmitted(query.trim())} />
    {submitted !== null ? <p className="chenxing-caption" role="status">{submitted ? `搜索内容：${submitted}` : '请输入搜索内容'}</p> : null}
  </div>
}

export const FORM_ENTRIES: DemoEntry[] = [
  {
    slug: 'tag-input-field',
    name: 'TagInputField',
    description: '把可移除的标签与输入框收进同一个 field shell，适合域名、邮箱、权限等列表编辑。',
    imports: ['TagInputField'],
    wide: true,
    Demo: TagInputDemo,
    examples: [
      {
        id: 'usage',
        title: 'Usage',
        Demo: TagInputDemo,
      },
    ],
  },
  {
    slug: 'search-field',
    name: 'SearchField',
    description: '带搜索图标的输入框，按 Enter 触发查询。',
    Demo: SearchDemo,
  },
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
    examples: [
      { id: 'usage', title: 'Usage', Demo: () => <Field label="用户名" placeholder="chenxing" /> },
      { id: 'error', title: 'Error', Demo: () => <Field label="邮箱" errorText="邮箱格式不正确" defaultValue="not-an-email" /> },
    ],
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
    examples: [
      { id: 'usage', title: 'Usage', Demo: SelectDemo },
    ],
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
    examples: [
      { id: 'usage', title: 'Usage', Demo: () => { const [enabled, setEnabled] = useState(true); return <Switch checked={enabled} onChange={setEnabled} label="两步验证" /> } },
      { id: 'disabled', title: 'Disabled', Demo: () => <Switch checked={false} onChange={() => {}} disabled label="不可用" /> },
    ],
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
