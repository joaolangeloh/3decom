'use client'

import { useState } from 'react'
import { Input } from './input'

interface DecimalInputProps
  extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
  /** Hide the value when it's 0 (show placeholder instead) */
  hideZero?: boolean
  /** Use integer-only keyboard (no decimal separator) */
  integer?: boolean
}

export function DecimalInput({
  value,
  onValueChange,
  hideZero = false,
  integer = false,
  className,
  ...props
}: DecimalInputProps) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')

  const formatted =
    hideZero && value === 0 ? '' : String(value).replace('.', ',')

  return (
    <Input
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      pattern={integer ? '[0-9]*' : undefined}
      value={editing ? raw : formatted}
      className={className}
      onFocus={(e) => {
        setEditing(true)
        setRaw(formatted)
        requestAnimationFrame(() => e.target.select())
      }}
      onBlur={() => setEditing(false)}
      onChange={(e) => {
        const s = e.target.value
        setRaw(s)
        if (s === '') {
          onValueChange(0)
          return
        }
        const normalized = s.replace(',', '.')
        const n = integer ? parseInt(normalized, 10) : parseFloat(normalized)
        if (!isNaN(n)) onValueChange(Math.max(0, n))
      }}
      {...props}
    />
  )
}
