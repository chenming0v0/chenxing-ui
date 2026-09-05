import { useId } from 'react'
import type { KeyboardEvent } from 'react'
import { Chip, Icon, type ChipColor } from './ui'

export type TagInputFieldProps = {
  label: string
  /** 已提交的标签列表；组件不持有列表状态，增删全部回调给调用方。 */
  values: string[]
  /** 输入框草稿。受控：调用方常把「草稿非空」视为未保存状态，所以草稿不藏在组件里。 */
  draft: string
  onDraftChange: (raw: string) => void
  /** 提交当前草稿（Enter 或添加按钮触发）。校验、规范化、去重由调用方决定。 */
  onAdd: () => void
  onRemove: (value: string, index: number) => void
  /** 添加按钮的无障碍名，默认「添加」。 */
  addLabel?: string
  placeholder?: string
  hint?: string
  /** 校验失败文案。传入即视为 error 状态，并接管 aria-invalid / aria-describedby。 */
  errorText?: string
  disabled?: boolean
  maxLength?: number
  chipColor?: ChipColor
  onBlur?: () => void
}

/**
 * 标签输入：chips 与输入框同住一个 field shell。
 * 交互约定：Enter 或添加按钮提交草稿；草稿为空时按 Backspace 移除末位标签。
 * 与 Field 一致：名称只留 label，提示与校验文案走 aria-describedby
 * （WCAG 2.1 SC 3.3.1 / 3.3.2）。
 */
export function TagInputField({
  label,
  values,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  addLabel = '添加',
  placeholder,
  hint,
  errorText,
  disabled = false,
  maxLength,
  chipColor = 'accent',
  onBlur,
}: TagInputFieldProps) {
  const inputId = useId()
  const messageId = `${inputId}-message`
  const invalid = Boolean(errorText)

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return
    if (event.key === 'Enter') {
      event.preventDefault()
      onAdd()
      return
    }
    if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      event.preventDefault()
      const index = values.length - 1
      onRemove(values[index], index)
    }
  }

  return (
    <div>
      <label className="chenxing-label" htmlFor={inputId}>{label}</label>
      <div className={`chenxing-field-shell chenxing-tag-input${invalid ? ' chenxing-field-error' : ''}`}>
        {values.map((value, index) => (
          <Chip
            key={value}
            color={chipColor}
            removeLabel={`移除 ${value}`}
            onRemove={disabled ? undefined : () => onRemove(value, index)}
          >
            {value}
          </Chip>
        ))}
        <input
          id={inputId}
          value={draft}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid || undefined}
          aria-describedby={errorText || hint ? messageId : undefined}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
        <button
          type="button"
          className="chenxing-icon-btn chenxing-tag-input-add"
          aria-label={addLabel}
          disabled={disabled}
          onClick={onAdd}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
      {errorText ? (
        <small className="chenxing-field-message" id={messageId}>
          <Icon name="circle-alert" size={13} className="shrink-0" />
          {errorText}
        </small>
      ) : hint ? (
        <small className="chenxing-caption mt-1.5 block" id={messageId}>{hint}</small>
      ) : null}
    </div>
  )
}
