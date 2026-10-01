import { useCallback, useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

export type DrawerProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Side the panel enters from. In RTL, `start` is the right edge. */
  side?: 'start' | 'end'
  footer?: ReactNode
}

/**
 * Accessible side panel used for the compact mobile navigation and the mobile
 * lesson outline.
 *
 * Real behaviour, not a decorated div: focus moves into the panel on open,
 * Escape closes it, the backdrop closes it, Tab is trapped inside, the page
 * behind it stops scrolling, and focus returns to the trigger on close.
 */
export function Drawer({ open, onClose, title, children, side = 'start', footer }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const firstFocusable = panel?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    ;(firstFocusable ?? panel)?.focus()

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={onClose} data-testid="drawer-backdrop" />
      <div
        ref={panelRef}
        className={`drawer drawer--${side}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="drawer__header">
          <h2 id={titleId} className="drawer__title">
            {title}
          </h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="إغلاق القائمة">
            <CloseIcon />
          </button>
        </header>
        <div className="drawer__body">{children}</div>
        {footer ? <footer className="drawer__footer">{footer}</footer> : null}
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
