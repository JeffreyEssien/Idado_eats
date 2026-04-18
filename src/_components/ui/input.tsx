'use client'

type InputProps = {
  label: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:shadow-md focus:shadow-primary/5 hover:border-border/80 ${error ? 'border-danger focus:ring-danger/15' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  )
}
