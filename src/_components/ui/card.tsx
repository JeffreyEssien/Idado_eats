type CardProps = {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export function Card({ children, className = '', padding = true, hover = false }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-border bg-card ${padding ? 'p-5' : ''} ${hover ? 'hover:bg-surface hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
