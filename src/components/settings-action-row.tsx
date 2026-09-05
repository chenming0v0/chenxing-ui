import { useId, type ReactNode } from 'react'
import { Icon } from './ui'

export type SettingsActionRowProps = {
  icon: string
  accent?: 'cyan' | 'gold'
  title: string
  description: ReactNode
  status?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * 设置列表项：手机端将操作纵向铺满，桌面端收回标题右侧。
 *
 * 组件只负责列表项结构，不改变 Button 的 primary / ghost / danger 语义。
 */
export function SettingsActionRow({
  icon,
  accent = 'cyan',
  title,
  description,
  status,
  actions,
  className = '',
}: SettingsActionRowProps) {
  const titleId = useId()
  const accentClass = accent === 'gold'
    ? 'text-[var(--chenxing-gold)]'
    : 'text-[var(--chenxing-cyan)]'

  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-[var(--chenxing-radius-md)] border border-[var(--chenxing-border)] bg-[rgba(4,8,16,0.38)] p-4 transition-colors duration-200 hover:border-[var(--chenxing-border-strong)] sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--chenxing-radius-md)] border border-[var(--chenxing-border)] bg-[var(--chenxing-muted)] ${accentClass}`}>
            <Icon name={icon} size={19} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 id={titleId} className="chenxing-body text-sm font-semibold">{title}</h4>
              {status}
            </div>
            <div className="chenxing-caption mt-1 max-w-2xl">{description}</div>
          </div>
        </div>
        {actions ? (
          <div
            data-slot="settings-action-row-actions"
            className="flex w-full shrink-0 flex-col items-stretch gap-2 lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:justify-end [&>*]:w-full lg:[&>*]:w-auto"
          >
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  )
}
