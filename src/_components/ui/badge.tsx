type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface text-muted-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

type BadgeProps = {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
