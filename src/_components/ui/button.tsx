'use client'

import Link from 'next/link'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:scale-[0.97]',
  secondary: 'bg-secondary text-white hover:bg-secondary-dark active:scale-[0.97]',
  outline: 'border border-border bg-transparent hover:bg-surface',
  ghost: 'bg-transparent hover:bg-surface',
  danger: 'bg-danger text-white hover:brightness-110 active:scale-[0.97]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

type ButtonProps = {
  variant?: Variant
  size?: Size
  href?: string
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>
  }

  return <button className={classes} {...props}>{children}</button>
}
