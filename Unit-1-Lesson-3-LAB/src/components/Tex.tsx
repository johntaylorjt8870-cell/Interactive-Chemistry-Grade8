import { Fragment, useMemo } from 'react'
import katex from 'katex'
import 'katex/contrib/mhchem'
import { cn } from '@/utils/cn'
import type { NameToken } from '@/lib/chem'

const cache = new Map<string, string>()

export function texHtml(tex: string, display = false): string {
  const key = (display ? 'D' : 'I') + tex
  const hit = cache.get(key)
  if (hit) return hit
  let html: string
  try {
    html = katex.renderToString(tex, { throwOnError: false, strict: false, displayMode: display, output: 'htmlAndMathml' })
  } catch {
    html = tex
  }
  cache.set(key, html)
  return html
}

/** عبارة KaTeX معزولة LTR داخل أي سياق RTL */
export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => texHtml(tex, display), [tex, display])
  return <span dir="ltr" className={cn('tex', display && 'tex-block', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

/** صيغة/معادلة كيميائية (mhchem) */
export function Ce({ f, display, className }: { f: string; display?: boolean; className?: string }) {
  return <Tex tex={`\\ce{${f}}`} display={display} className={className} />
}

/** كسر/عدّاد «a / b» معزول LTR فلا ينعكس في سياق RTL */
export function Frac({ a, b, className }: { a: string | number; b: string | number; className?: string }) {
  return <Tex tex={`${a}\\,/\\,${b}`} className={className} />
}

/** رقم بخط KaTeX */
export function Num({ children, className }: { children: string | number; className?: string }) {
  return <Tex tex={String(children)} className={className} />
}

/**
 * نص عربي (RTL) تتخلله مقاطع معزولة LTR:
 *   {{Al2(SO4)3}}  ← صيغة كيميائية (mhchem)
 *   $ ... $        ← عبارة رياضية KaTeX
 */
export function Rich({ children, className }: { children: string; className?: string }) {
  const parts = useMemo(() => children.split(/(\{\{.+?\}\}|\$.+?\$)/g).filter((p) => p !== ''), [children])
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith('{{') && p.endsWith('}}')) return <Ce key={i} f={p.slice(2, -2)} />
        if (p.startsWith('$') && p.endsWith('$') && p.length > 2) return <Tex key={i} tex={p.slice(1, -1)} />
        return <Fragment key={i}>{p}</Fragment>
      })}
    </span>
  )
}

/** اسم مركّب عربي: كلمات + رقم روماني بخط KaTeX */
export function NameView({
  tokens,
  className,
  colors,
}: {
  tokens: NameToken[]
  className?: string
  colors?: string[]
}) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      {tokens.map((t, i) =>
        typeof t === 'string' ? (
          <span key={i} className={colors?.[i]}>
            {t}
          </span>
        ) : (
          <Tex key={i} tex={`\\mathrm{${t.roman}}`} className={colors?.[i]} />
        ),
      )}
    </span>
  )
}
