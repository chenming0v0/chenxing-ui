import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Icon } from './ui'

export type TagInputFieldProps = {
  label: string
  values: string[]
  draft: string
  onDraftChange: (raw: string) => void
  onAdd: () => void
  onRemove: (value: string, index: number) => void
  /** 编辑后的值；返回 false 时保留编辑态，适合把服务端/业务校验错误留在当前条目。 */
  onUpdate?: (value: string, index: number, nextValue: string) => boolean | void
  addLabel?: string
  placeholder?: string
  hint?: string
  errorText?: string
  disabled?: boolean
  maxLength?: number
  onBlur?: () => void
}

/**
 * 可编辑标签输入：每个已提交值是一个带编辑/删除动作的条目，不伪装成不可编辑的胶囊。
 * Enter 或添加按钮提交新值；条目编辑态支持 Enter 保存、Escape 取消、失焦保存。
 */
export function TagInputField({
  label,
  values,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  onUpdate,
  addLabel = '添加',
  placeholder,
  hint,
  errorText,
  disabled = false,
  maxLength,
  onBlur,
}: TagInputFieldProps) {
  const inputId = useId()
  const messageId = `${inputId}-message`
  const editInputRef = useRef<HTMLInputElement>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const invalid = Boolean(errorText)

  useEffect(() => {
    if (editingIndex !== null) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [editingIndex])

  function cancelEdit() {
    setEditingIndex(null)
    setEditValue('')
  }

  function commitEdit(index: number) {
    const nextValue = editValue.trim()
    if (!nextValue || !onUpdate) return
    if (onUpdate(values[index], index, nextValue) === false) return
    cancelEdit()
  }

  function onDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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

  function onEditKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitEdit(index)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  return (
    <div>
      <label className="chenxing-label" htmlFor={inputId}>{label}</label>
      <div className={`chenxing-field-shell chenxing-tag-input${invalid ? ' chenxing-field-error' : ''}`}>
        {values.map((value, index) => editingIndex === index ? (
          <span key={`${value}-${index}-editing`} className="chenxing-tag-editor">
            <input
              ref={editInputRef}
              className="chenxing-tag-input-edit"
              value={editValue}
              disabled={disabled}
              maxLength={maxLength}
              aria-label={`编辑 ${value}`}
              onChange={(event) => setEditValue(event.target.value)}
              onKeyDown={(event) => onEditKeyDown(event, index)}
              onBlur={() => commitEdit(index)}
            />
          </span>
        ) : (
          <span key={`${value}-${index}`} className="chenxing-tag-item">
            <span className="chenxing-tag-value">{value}</span>
            {!disabled && onUpdate ? (
              <button
                type="button"
                className="chenxing-tag-action"
                aria-label={`编辑 ${value}`}
                onClick={() => { setEditValue(value); setEditingIndex(index) }}
              >
                <Icon name="pencil" size={17} />
              </button>
            ) : null}
            {!disabled ? (
              <button
                type="button"
                className="chenxing-tag-action"
                aria-label={`移除 ${value}`}
                onClick={() => onRemove(value, index)}
              >
                <Icon name="trash-2" size={17} />
              </button>
            ) : null}
          </span>
        ))}
        <input
          id={inputId}
          className="chenxing-tag-input-draft"
          value={draft}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid || undefined}
          aria-describedby={errorText || hint ? messageId : undefined}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onDraftKeyDown}
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
