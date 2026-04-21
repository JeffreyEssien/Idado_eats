'use client'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

export function Toggle({ checked, onChange, disabled, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-border'}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-1 ${checked ? 'translate-x-6 ml-0.5' : 'translate-x-1'}`}
        />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-semibold leading-tight">{label}</p>}
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
      )}
    </button>
  )
}
