import Link from 'next/link'

const roles = [
  { icon: '🛍️', title: 'I want to order', desc: 'Browse & buy from estate stores', href: '/register/customer', bg: 'from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/15' },
  { icon: '🏪', title: 'I have a store', desc: 'List your business & receive orders', href: '/register/business', bg: 'from-emerald-100 to-green-50 dark:from-emerald-950/30 dark:to-green-950/15' },
  { icon: '🚴', title: 'I want to deliver', desc: 'Earn per delivery, flexible hours', href: '/register/rider', bg: 'from-indigo-100 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/15' },
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xl font-extrabold">idado<span className="text-primary">.</span></Link>
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Join Idado Eats</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick your role to get started</p>

        <div className="mt-8 flex flex-col gap-3">
          {roles.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={`group flex items-center gap-4 rounded-3xl bg-gradient-to-br ${r.bg} border border-border/50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <span className="text-4xl shrink-0">{r.icon}</span>
              <div className="flex-1">
                <p className="font-bold group-hover:text-primary transition-colors">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
              <span className="text-muted-foreground/40 group-hover:text-primary transition-colors text-lg">→</span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground text-center">
          Already signed up?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
