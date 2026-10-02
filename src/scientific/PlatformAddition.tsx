import type { ReactNode } from 'react'

export type PlatformAdditionProps = {
  children?: ReactNode
  /** `badge` for inline marking, `block` for a bordered wrapper. */
  variant?: 'badge' | 'block'
  /** Bilingual marker text; the Arabic wording is fixed by platform policy. */
  marker?: { ar: string; en: string }
  className?: string
  title?: ReactNode
}

export const PLATFORM_ADDITION_MARKER = { ar: 'إضافة من المنصة', en: 'Platform Addition' } as const

/**
 * Marks any material that the platform adds around the textbook.
 *
 * Source-fidelity policy: the textbook is the only source of truth, and
 * nothing may appear to come from the book unless it does. Explanations,
 * worked examples, simulations and tests authored by the platform are always
 * wrapped in this component so attribution is unambiguous.
 */
export function PlatformAddition({
  children,
  variant = 'badge',
  marker = PLATFORM_ADDITION_MARKER,
  className,
  title,
}: PlatformAdditionProps) {
  const label = `${marker.ar} — ${marker.en}`

  if (variant === 'badge') {
    return (
      <span className={['platform-addition-badge', className].filter(Boolean).join(' ')} title={label} data-origin="platform">
        <span aria-hidden="true" className="platform-addition-badge__dot" />
        <span>{marker.ar}</span>
        <span className="platform-addition-badge__en" dir="ltr">
          {marker.en}
        </span>
      </span>
    )
  }

  return (
    <section
      className={['platform-addition', className].filter(Boolean).join(' ')}
      data-origin="platform"
      aria-label={label}
    >
      <header className="platform-addition__header">
        <PlatformAddition marker={marker} />
        {title ? <h4 className="platform-addition__title">{title}</h4> : null}
      </header>
      <div className="platform-addition__body">{children}</div>
    </section>
  )
}

export type TextbookSourceProps = {
  children: ReactNode
  /** Page reference as printed in the book, e.g. `ص 42`. Only when known. */
  page?: string
  /** Item identifier inside the source page, e.g. `سؤال 3`. Only when known. */
  item?: string
  className?: string
}

/**
 * Marks material reproduced verbatim from the textbook, with its page
 * reference. Quoted text is rendered exactly as printed — never summarised,
 * reworded or shortened.
 */
export function TextbookSource({ children, page, item, className }: TextbookSourceProps) {
  return (
    <aside className={['textbook-source', className].filter(Boolean).join(' ')} data-origin="textbook">
      <header className="textbook-source__header">
        <span className="textbook-source__label">من الكتاب المدرسي</span>
        {page ? <span className="textbook-source__ref textbook-source__ref--page">{page}</span> : null}
        {item ? <span className="textbook-source__ref textbook-source__ref--item">{item}</span> : null}
      </header>
      <div className="textbook-source__body" lang="ar" dir="rtl">
        {children}
      </div>
    </aside>
  )
}
