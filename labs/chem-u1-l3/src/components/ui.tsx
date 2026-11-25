import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, Minus, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Num } from './Tex'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-forest-900/10 bg-white/90 p-4 shadow-[0_10px_30px_-18px_rgba(15,59,46,0.35)] sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** ترويسة كل تبويب: الفكرة + الهدف */
export function TabIntro({
  icon: Icon,
  kicker,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  kicker: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-l from-forest-800 via-forest-700 to-leaf-600 p-5 text-white shadow-lg sm:p-7">
      <div className="pointer-events-none absolute -left-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 left-24 h-40 w-40 rounded-full bg-white/5" />
      <div className="relative flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-mint-200">{kicker}</p>
          <h2 className="mt-0.5 text-xl font-bold leading-snug sm:text-2xl">{title}</h2>
          {children && <div className="mt-2 max-w-3xl text-sm leading-7 text-mint-100 sm:text-[15px]">{children}</div>}
        </div>
      </div>
    </div>
  )
}

export function SectionTitle({ n, children, sub }: { n?: number; children: ReactNode; sub?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      {n !== undefined && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-forest-800 text-sm font-bold text-white">
          <Num>{n}</Num>
        </span>
      )}
      <div>
        <h3 className="text-lg font-bold text-forest-900">{children}</h3>
        {sub && <p className="text-sm text-forest-800/70">{sub}</p>}
      </div>
    </div>
  )
}

const CALLOUT = {
  rule: { cls: 'border-gold-400/50 bg-gold-100/70 text-gold-600', icon: Lightbulb, ink: 'text-forest-950' },
  tip: { cls: 'border-leaf-400/40 bg-mint-100 text-leaf-600', icon: Sparkles, ink: 'text-forest-950' },
  warn: { cls: 'border-clay-400/50 bg-clay-100/80 text-clay-600', icon: AlertTriangle, ink: 'text-forest-950' },
  ok: { cls: 'border-leaf-500/50 bg-mint-200/70 text-leaf-600', icon: CheckCircle2, ink: 'text-forest-950' },
  info: { cls: 'border-lagoon-400/40 bg-lagoon-100/70 text-lagoon-600', icon: Info, ink: 'text-forest-950' },
} as const

export function Callout({
  kind = 'rule',
  title,
  children,
  className,
}: {
  kind?: keyof typeof CALLOUT
  title?: string
  children: ReactNode
  className?: string
}) {
  const c = CALLOUT[kind]
  const Icon = c.icon
  return (
    <div className={cn('flex gap-3 rounded-2xl border p-4', c.cls, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className={cn('min-w-0 text-sm leading-7', c.ink)}>
        {title && <p className="mb-0.5 font-bold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}

type Variant = 'primary' | 'soft' | 'ghost' | 'clay' | 'lagoon' | 'gold' | 'danger'
const VARIANT: Record<Variant, string> = {
  primary: 'bg-forest-800 text-white hover:bg-forest-700 shadow-sm',
  soft: 'bg-mint-100 text-forest-800 hover:bg-mint-200',
  ghost: 'bg-transparent text-forest-800 hover:bg-mint-100 border border-forest-900/15',
  clay: 'bg-clay-500 text-white hover:bg-clay-600 shadow-sm',
  lagoon: 'bg-lagoon-500 text-white hover:bg-lagoon-600 shadow-sm',
  gold: 'bg-gold-400 text-forest-950 hover:bg-gold-500 shadow-sm',
  danger: 'bg-clay-100 text-clay-600 hover:bg-clay-400/40',
}

export function Btn({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT[variant],
        className,
      )}
    />
  )
}

export function Chip({
  active,
  tone = 'leaf',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; tone?: 'leaf' | 'clay' | 'lagoon' | 'plum' | 'gold' }) {
  const on = {
    leaf: 'bg-forest-800 text-white border-forest-800',
    clay: 'bg-clay-500 text-white border-clay-500',
    lagoon: 'bg-lagoon-500 text-white border-lagoon-500',
    plum: 'bg-plum-500 text-white border-plum-500',
    gold: 'bg-gold-400 text-forest-950 border-gold-400',
  }[tone]
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition active:scale-95',
        active ? on : 'border-forest-900/15 bg-white text-forest-800 hover:bg-mint-100',
        className,
      )}
    />
  )
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 9,
  tone = 'leaf',
  label,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  tone?: 'leaf' | 'clay' | 'lagoon' | 'gold'
  label?: ReactNode
}) {
  const t = {
    leaf: 'bg-forest-800 hover:bg-forest-700',
    clay: 'bg-clay-500 hover:bg-clay-600',
    lagoon: 'bg-lagoon-500 hover:bg-lagoon-600',
    gold: 'bg-gold-500 hover:bg-gold-600',
  }[tone]
  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && <div className="text-sm font-semibold text-forest-800">{label}</div>}
      <div className="flex items-center gap-2" dir="ltr">
        <button
          aria-label="إنقاص"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={cn('grid h-9 w-9 place-items-center rounded-xl text-white transition active:scale-90 disabled:opacity-30', t)}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="grid h-9 min-w-11 place-items-center rounded-xl border border-forest-900/15 bg-white px-2 text-lg font-bold">
          <Num>{value}</Num>
        </span>
        <button
          aria-label="زيادة"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={cn('grid h-9 w-9 place-items-center rounded-xl text-white transition active:scale-90 disabled:opacity-30', t)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function DoneBanner({ children }: { children: ReactNode }) {
  return (
    <div className="anim-pop flex items-center gap-3 rounded-2xl bg-gradient-to-l from-leaf-600 to-forest-700 p-4 text-white shadow-md">
      <CheckCircle2 className="h-7 w-7 shrink-0 text-gold-400" />
      <div className="text-sm font-semibold leading-7">{children}</div>
    </div>
  )
}

/** وسم تعريفي صغير */
export function Tag({ children, tone = 'leaf' }: { children: ReactNode; tone?: 'leaf' | 'clay' | 'lagoon' | 'plum' | 'gold' }) {
  const t = {
    leaf: 'bg-mint-100 text-forest-800',
    clay: 'bg-clay-100 text-clay-600',
    lagoon: 'bg-lagoon-100 text-lagoon-600',
    plum: 'bg-plum-100 text-plum-600',
    gold: 'bg-gold-100 text-gold-600',
  }[tone]
  return <span className={cn('inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold', t)}>{children}</span>
}
