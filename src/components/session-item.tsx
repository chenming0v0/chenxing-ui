import { useId, type ReactNode } from 'react'
import { Icon } from './ui'

export type SessionItemProps = {
  /** Device or session icon name from the shared icon registry. */
  icon?: string
  title: ReactNode
  status?: ReactNode
  /** Time, device, or other session metadata. Keep the content semantic. */
  description: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Responsive account session item.
 *
 * The item keeps the metadata column flexible so dates wrap at word boundaries
 * instead of collapsing into one character per line beside fixed actions.
 * On narrow screens the device identity and action become a vertical stack.
 */
export function SessionItem({
  icon = 'monitor',
  title,
  status,
  description,
  actions,
  className = '',
}: SessionItemProps) {
  const titleId = useId()

  return (
    <article
      aria-labelledby={titleId}
      className={`chenxing-session-item ${className}`}
    >
      <div className="chenxing-session-item-main">
        <span className="chenxing-session-item-icon" aria-hidden="true">
          <Icon name={icon} size={21} />
        </span>
        <div className="chenxing-session-item-content">
          <div className="chenxing-session-item-heading">
            <h3 id={titleId} className="chenxing-body text-sm font-semibold">{title}</h3>
            {status}
          </div>
          <div className="chenxing-session-item-description">{description}</div>
        </div>
      </div>
      {actions ? <div className="chenxing-session-item-actions" data-slot="session-item-actions">{actions}</div> : null}
    </article>
  )
}
