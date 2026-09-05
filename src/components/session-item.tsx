import { useId, type ReactNode } from 'react'
import { Icon } from './ui'

export type SessionItemProps = {
  icon?: string
  title: string
  status?: ReactNode
  description: ReactNode
  actions?: ReactNode
  className?: string
}

/** Unframed session row; layout follows its container width, including narrow desktop panels. */
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
      <div className="chenxing-session-item-layout">
        <span className="chenxing-session-item-icon" aria-hidden="true">
          <Icon name={icon} size={21} />
        </span>
        <div className="chenxing-session-item-content">
          <div className="chenxing-session-item-heading">
            <h3 id={titleId} className="chenxing-session-item-title">{title}</h3>
            {status}
          </div>
          <div className="chenxing-session-item-description">{description}</div>
        </div>
        {actions ? <div className="chenxing-session-item-actions" data-slot="session-item-actions">{actions}</div> : null}
      </div>
    </article>
  )
}
