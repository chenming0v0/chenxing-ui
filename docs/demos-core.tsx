import { useState } from 'react'
import {
  Avatar, Badge, BrandLockup, BrandMark, Button, Chip, CopyValue, EmptyState, Icon, Notice, PageIntro,
} from '../src'
import { DemoCard, Section } from './demo-card'

export function BrandSection() {
  return (
    <Section id="brand" title="品牌" blurb="产品标识与组合版式。">
      <DemoCard name="BrandMark" description="产品 Logo 图标；decorative 时对屏幕阅读器隐藏。">
        <BrandMark className="h-14 w-14 rounded-[var(--chenxing-radius-md)]" />
      </DemoCard>
      <DemoCard name="BrandLockup" description="Logo + 字标 + 副标题的组合锁定版式，compact 为顶栏紧凑形态。">
        <BrandLockup />
        <BrandLockup compact />
      </DemoCard>
    </Section>
  )
}

const ICON_SAMPLES = ['shield-check', 'key-round', 'fingerprint', 'rocket', 'database', 'terminal', 'wallet', 'sparkles', 'globe', 'lock']

export function PrimitivesSection() {
  const [scopes, setScopes] = useState(['openid', 'profile', 'email'])
  return (
    <Section id="primitives" title="基础组件" blurb="按钮、徽章、图标与状态反馈原语。">
      <DemoCard name="Button" description="primary / ghost / danger 三种变体，可携带图标；aria-disabled 禁用但保持可聚焦。">
        <Button icon="rocket">主要操作</Button>
        <Button variant="ghost" icon="settings">次要操作</Button>
        <Button variant="danger" icon="trash-2">危险操作</Button>
        <Button aria-disabled="true">禁用态</Button>
      </DemoCard>
      <DemoCard name="Badge" description="四种语气的状态徽章。">
        <Badge>默认</Badge>
        <Badge tone="success">已启用</Badge>
        <Badge tone="warning">待处理</Badge>
        <Badge tone="gold">尊享</Badge>
      </DemoCard>
      <DemoCard name="Chip" description="紧凑标签，可带移除按钮（命中区保证 24×24）。">
        {scopes.map((scope) => (
          <Chip key={scope} onRemove={() => setScopes(scopes.filter((s) => s !== scope))}>{scope}</Chip>
        ))}
        <Chip>只读</Chip>
        {scopes.length < 3 ? (
          <Button variant="ghost" icon="rotate-ccw" onClick={() => setScopes(['openid', 'profile', 'email'])}>重置</Button>
        ) : null}
      </DemoCard>
      <DemoCard name="Icon" description="lucide 图标的语义名称封装，未知名称回落为圆点。">
        {ICON_SAMPLES.map((name) => (
          <Icon key={name} name={name} size={20} className="text-[var(--chenxing-cyan)]" />
        ))}
      </DemoCard>
      <DemoCard name="Notice" description="info / success / warning 行内通知，自动设置 role 与 aria-live。" wide>
        <div className="w-full space-y-3">
          <Notice>会话默认 14 天有效，到期需要重新登录。</Notice>
          <Notice tone="success">两步验证已开启，账号受到额外保护。</Notice>
          <Notice tone="warning">Client Secret 只在创建时显示一次，请立即保存。</Notice>
        </div>
      </DemoCard>
      <DemoCard name="Avatar" description="非交互场景的头像容器，未设置头像时回落产品默认头像。">
        <Avatar className="h-14 w-14" />
        <Avatar className="h-10 w-10" />
        <Avatar className="h-7 w-7" />
      </DemoCard>
      <DemoCard name="CopyValue" description="点击复制到剪贴板，成功短暂提示、失败保留提示，反馈经 aria-live 播报。">
        <div className="w-full max-w-sm">
          <CopyValue value="cxc_live_9f83ab21f0d24e6b" ariaLabel="复制 Client ID" />
        </div>
      </DemoCard>
      <DemoCard name="EmptyState" description="空数据占位，可携带引导操作。">
        <EmptyState
          icon="ticket"
          title="暂无邀请码"
          description="生成第一个邀请码后会显示在这里。"
          action={<Button variant="ghost" icon="plus">生成邀请码</Button>}
        />
      </DemoCard>
      <DemoCard name="PageIntro" description="页面头部版式：eyebrow + 标题 + 描述 + 操作区。" wide>
        <div className="w-full">
          <PageIntro
            eyebrow="ACCESS CONTROL"
            title="授权应用"
            description="管理已获得辰星通行证授权的第三方应用。"
            action={<Button variant="ghost" icon="book-open">查看文档</Button>}
          />
        </div>
      </DemoCard>
    </Section>
  )
}
