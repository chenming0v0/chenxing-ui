import { useState } from 'react'
import {
  Avatar, Badge, BrandLockup, BrandMark, Button, Chip, CopyValue, EmptyState, FlowGoldText, Icon, Notice, PageIntro,
} from '../src'
import type { DemoEntry } from './registry'

function ChipDemo() {
  const [scopes, setScopes] = useState(['openid', 'profile', 'email'])
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Chip>Default</Chip>
        <Chip color="accent">Accent</Chip>
        <Chip color="success">Success</Chip>
        <Chip color="warning">Warning</Chip>
        <Chip color="danger">Danger</Chip>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {scopes.map((scope) => (
          <Chip key={scope} color="accent" onRemove={() => setScopes(scopes.filter((s) => s !== scope))}>{scope}</Chip>
        ))}
        {scopes.length < 3 ? (
          <Button variant="ghost" icon="rotate-ccw" onClick={() => setScopes(['openid', 'profile', 'email'])}>重置</Button>
        ) : null}
      </div>
    </div>
  )
}

const ICON_SAMPLES = ['shield-check', 'key-round', 'fingerprint', 'rocket', 'database', 'terminal', 'wallet', 'sparkles', 'globe', 'lock']

export const BRAND_ENTRIES: DemoEntry[] = [
  {
    slug: 'brand-mark',
    name: 'BrandMark',
    description: '产品 Logo 图标；decorative 时对屏幕阅读器隐藏。',
    Demo: () => <BrandMark className="h-14 w-14 rounded-[var(--chenxing-radius-md)]" />,
  },
  {
    slug: 'flow-gold-text',
    name: 'FlowGoldText',
    description: '品牌专用流金文字；默认动态扫光，也可切换为静态渐变。',
    Demo: () => (
      <div className="flex flex-col items-center gap-3">
        <FlowGoldText className="text-2xl">天穹辰星</FlowGoldText>
        <FlowGoldText animated={false} className="text-base">辰星设计体系</FlowGoldText>
      </div>
    ),
    examples: [
      { id: 'usage', title: 'Usage', Demo: () => <FlowGoldText className="text-3xl">天穹辰星</FlowGoldText> },
      { id: 'heading', title: 'Heading', Demo: () => <FlowGoldText as="h2" className="text-3xl">辰星设计体系</FlowGoldText> },
      { id: 'static', title: 'Static', Demo: () => <FlowGoldText animated={false} className="text-xl">天穹辰星</FlowGoldText> },
    ],
  },
  {
    slug: 'brand-lockup',
    name: 'BrandLockup',
    description: 'Logo + 字标 + 副标题的组合锁定版式，compact 为顶栏紧凑形态。',
    Demo: () => (
      <>
        <BrandLockup />
        <BrandLockup compact />
      </>
    ),
    examples: [
      { id: 'usage', title: 'Usage', Demo: () => <BrandLockup subtitle="设计系统" /> },
      { id: 'compact', title: 'Compact', Demo: () => <BrandLockup compact /> },
    ],
  },
]

export const PRIMITIVE_ENTRIES: DemoEntry[] = [
  {
    slug: 'button',
    name: 'Button',
    description: 'primary / ghost / danger 三种变体，可携带图标；aria-disabled 禁用但保持可聚焦。',
    Demo: () => (
      <>
        <Button icon="rocket">主要操作</Button>
        <Button variant="ghost" icon="settings">次要操作</Button>
        <Button variant="danger" icon="trash-2">危险操作</Button>
        <Button aria-disabled="true">禁用态</Button>
      </>
    ),
    examples: [
      { id: 'usage', title: 'Usage', Demo: () => <Button icon="rocket">主要操作</Button> },
      { id: 'variants', title: 'Variants', Demo: () => <><Button variant="ghost">次要操作</Button><Button variant="danger">危险操作</Button></> },
      { id: 'disabled', title: 'Disabled', Demo: () => <Button aria-disabled="true">不可用</Button> },
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    description: '四种语气的状态徽章。',
    Demo: () => (
      <>
        <Badge>默认</Badge>
        <Badge tone="success">已启用</Badge>
        <Badge tone="warning">待处理</Badge>
        <Badge tone="gold">尊享</Badge>
      </>
    ),
    examples: [
      { id: 'usage', title: 'Usage', Demo: () => <Badge tone="success">已启用</Badge> },
      { id: 'tones', title: 'Tones', Demo: () => <><Badge>默认</Badge><Badge tone="warning">待处理</Badge><Badge tone="gold">尊享</Badge></> },
    ],
  },
  {
    slug: 'chip',
    name: 'Chip',
    description: '紧凑标签：default / accent / success / warning / danger 五种语义色，可带移除按钮（命中区保证 24×24）。',
    wide: true,
    Demo: ChipDemo,
    examples: [
      { id: 'usage', title: 'Usage', Demo: () => <Chip color="accent">openid</Chip> },
      { id: 'colors', title: 'Colors', Demo: () => <><Chip>Default</Chip><Chip color="success">Success</Chip><Chip color="warning">Warning</Chip><Chip color="danger">Danger</Chip></> },
    ],
  },
  {
    slug: 'icon',
    name: 'Icon',
    description: 'lucide 图标的语义名称封装，未知名称回落为圆点。',
    Demo: () => (
      <>
        {ICON_SAMPLES.map((name) => (
          <Icon key={name} name={name} size={20} className="text-[var(--chenxing-cyan)]" />
        ))}
      </>
    ),
  },
  {
    slug: 'notice',
    name: 'Notice',
    description: 'info / success / warning 行内通知，自动设置 role 与 aria-live。',
    wide: true,
    Demo: () => (
      <div className="w-full space-y-3">
        <Notice>会话默认 14 天有效，到期需要重新登录。</Notice>
        <Notice tone="success">两步验证已开启，账号受到额外保护。</Notice>
        <Notice tone="warning">Client Secret 只在创建时显示一次，请立即保存。</Notice>
      </div>
    ),
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    description: '非交互场景的头像容器，未设置头像时回落产品默认头像。',
    Demo: () => (
      <>
        <Avatar className="h-14 w-14" />
        <Avatar className="h-10 w-10" />
        <Avatar className="h-7 w-7" />
      </>
    ),
  },
  {
    slug: 'copy-value',
    name: 'CopyValue',
    description: '点击复制到剪贴板，成功短暂提示、失败保留提示，反馈经 aria-live 播报。',
    Demo: () => (
      <div className="w-full max-w-sm">
        <CopyValue value="cxc_live_9f83ab21f0d24e6b" ariaLabel="复制 Client ID" />
      </div>
    ),
  },
  {
    slug: 'empty-state',
    name: 'EmptyState',
    description: '空数据占位，可携带引导操作。',
    Demo: () => (
      <EmptyState
        icon="ticket"
        title="暂无邀请码"
        description="生成第一个邀请码后会显示在这里。"
        action={<Button variant="ghost" icon="plus">生成邀请码</Button>}
      />
    ),
  },
  {
    slug: 'page-intro',
    name: 'PageIntro',
    description: '页面头部版式：eyebrow + 标题 + 描述 + 操作区。',
    wide: true,
    Demo: () => (
      <div className="w-full">
        <PageIntro
          eyebrow="ACCESS CONTROL"
          title="授权应用"
          description="管理已获得辰星通行证授权的第三方应用。"
          action={<Button variant="ghost" icon="book-open">查看文档</Button>}
        />
      </div>
    ),
  },
]
