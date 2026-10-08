import { LtrRun } from '@/components/BidiText'
import { WhatsAppGlyph } from '@/components/Icons'

/* ============================================================================
   Platform contact bar — the single official WhatsApp entry point.

   Placement: the first row of the app shell, above the sticky site header, so
   the chip sits at the very top of the platform and is centred horizontally at
   every width without ever overlapping the brand, the navigation or the theme
   control. It is deliberately NOT sticky and NOT a second `<header>`: the
   site header stays the only band pinned to the viewport, and the lesson rail
   keeps clearing it with the untouched `--header-height` budget.

   Bidi: the Arabic name is part of the RTL flow, while the phone number is an
   explicit LTR isolate (`<LtrRun />`) so the digits can never be reordered by
   the surrounding right-to-left paragraph. The displayed number and the link
   are owner-mandated and must not be modified.
   ========================================================================= */

/** Contact identity required by the project owner — must not be modified. */
export const CONTACT_NAME = 'المهندس سومر شاهين'
/** Displayed exactly as written, in an LTR isolate. */
export const CONTACT_PHONE = '0930215022'
/** WhatsApp deep link for the same Syrian number. */
export const CONTACT_WHATSAPP_URL = 'https://wa.me/963930215022'
/** Accessible name of the chip: the icon is never the only cue. */
export const CONTACT_LABEL = 'التواصل مع المهندس سومر شاهين عبر واتساب'

export function SiteContactBar() {
  return (
    <div className="site-contact">
      <a
        className="site-contact__chip"
        href={CONTACT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={CONTACT_LABEL}
      >
        <WhatsAppGlyph size={16} className="site-contact__icon" />
        <span className="site-contact__text">
          {CONTACT_NAME}: <LtrRun className="site-contact__phone">{CONTACT_PHONE}</LtrRun>
        </span>
      </a>
    </div>
  )
}
