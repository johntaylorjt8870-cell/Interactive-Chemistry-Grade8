import { describe, expect, it } from 'vitest'
import { renderApp } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'
import {
  CONTACT_LABEL,
  CONTACT_NAME,
  CONTACT_PHONE,
  CONTACT_WHATSAPP_URL,
} from '@/layouts/SiteContactBar'

/**
 * WhatsApp contact chip contract.
 *
 * The chip is the platform's single official contact entry point, so the three
 * things that must never drift are pinned here: the owner-mandated text
 * (Arabic name + the digits exactly as written), the WhatsApp URL those digits
 * resolve to, and the placement — one instance, at the top of the shell, above
 * the sticky site header and outside it, so no page gains fixed chrome and the
 * lesson rail keeps clearing the header with the untouched height budget.
 *
 * jsdom computes no layout, so centring and responsive padding are asserted
 * against the stylesheet, exactly like the other shell contracts in this suite.
 */

const tokens = readProjectFile('src/styles/tokens.css')
const components = readProjectFile('src/styles/components.css')

const SHELL_ROUTES = [
  '/',
  '/chemistry',
  '/chemistry/structural-chemistry',
  '/chemistry/structural-chemistry/atom-and-element',
  '/teacher',
  '/test-area',
  '/this-route-does-not-exist',
]

function declarations(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[[\]"'=]/g, (char) => `\\${char}`)
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
  const result: Record<string, string> = {}
  for (const line of block.split(';')) {
    const [property, value] = line.split(':')
    if (property && value) result[property.trim()] = value.trim()
  }
  return result
}

describe('contact chip placement', () => {
  it.each(SHELL_ROUTES)('appears exactly once on %s', (path) => {
    const { container, unmount } = renderApp(path)

    expect(container.querySelectorAll('.site-contact')).toHaveLength(1)
    expect(container.querySelectorAll('.site-contact__chip')).toHaveLength(1)
    unmount()
  })

  it('sits at the top of the shell, above the sticky site header and outside it', () => {
    const { container } = renderApp('/')
    const shell = [...container.querySelector('.site')!.children]
    const contactIndex = shell.findIndex((element) => element.classList.contains('site-contact'))
    const headerIndex = shell.findIndex((element) => element.tagName === 'HEADER')

    expect(contactIndex).toBeGreaterThan(-1)
    expect(headerIndex).toBeGreaterThan(contactIndex)

    // Not a second banner: the platform keeps exactly one header landmark.
    expect(container.querySelectorAll('header')).toHaveLength(1)
    expect(container.querySelector('header .site-contact')).toBeNull()
  })

  it('adds no sticky positioning and leaves the header height budget untouched', () => {
    const contact = declarations(components, '.site-contact')
    const chip = declarations(components, '.site-contact__chip')

    expect(contact['position']).toBeUndefined()
    expect(chip['position']).toBeUndefined()
    expect(JSON.stringify(contact)).not.toContain('--header-height')
    expect(tokens).toContain('--header-height: 68px')
  })
})

describe('contact chip content and behaviour', () => {
  it('shows the mandated attribution text with the digits exactly as written', () => {
    const { container } = renderApp('/')
    const chip = container.querySelector('.site-contact__chip')!

    expect(chip.textContent).toBe(`${CONTACT_NAME}: ${CONTACT_PHONE}`)
    expect(chip.textContent).toBe('المهندس سومر شاهين: 0930215022')
  })

  it('links to the WhatsApp number, in a new tab, with no internal route', () => {
    const { container } = renderApp('/')
    const chip = container.querySelector('.site-contact__chip')!

    expect(chip.tagName).toBe('A')
    expect(chip.getAttribute('href')).toBe('https://wa.me/963930215022')
    expect(chip.getAttribute('href')).toBe(CONTACT_WHATSAPP_URL)
    expect(chip.getAttribute('target')).toBe('_blank')
    expect(chip.getAttribute('rel')).toBe('noopener noreferrer')
    // An external absolute URL, never a platform route.
    expect(chip.getAttribute('href')!.startsWith('/')).toBe(false)
  })

  it('keeps the phone number an isolated LTR run inside the RTL interface', () => {
    const { container } = renderApp('/')
    const chip = container.querySelector('.site-contact__chip')!
    const phone = chip.querySelector('.site-contact__phone')!

    expect(phone.getAttribute('dir')).toBe('ltr')
    expect(phone.getAttribute('data-bidi')).toBe('ltr-isolate')
    expect(phone.textContent).toBe('0930215022')

    // No reordering anywhere in the rendered shell.
    expect(container.textContent).not.toContain('2205120390')
    expect(container.textContent).toContain('0930215022')

    // The isolation is backed by CSS, not only by the attribute.
    expect(declarations(components, '.ltr-run')['unicode-bidi']).toBe('isolate')
    expect(declarations(components, '.ltr-run')['direction']).toBe('ltr')
  })

  it('names the chip for assistive technology and hides the decorative icon', () => {
    const { container } = renderApp('/')
    const chip = container.querySelector('.site-contact__chip')!
    const icon = chip.querySelector('svg')!

    expect(chip.getAttribute('aria-label')).toBe('التواصل مع المهندس سومر شاهين عبر واتساب')
    expect(chip.getAttribute('aria-label')).toBe(CONTACT_LABEL)
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    // The icon is never the only cue: the name and the number are real text.
    expect(chip.textContent!.trim().length).toBeGreaterThan(0)
  })
})

describe('contact chip styling contract', () => {
  it('centres the chip horizontally at the top of the shell', () => {
    const contact = declarations(components, '.site-contact')

    expect(contact['display']).toBe('flex')
    expect(contact['justify-content']).toBe('center')
  })

  it('keeps the chip on one line and lets it shrink instead of overflowing', () => {
    const chip = declarations(components, '.site-contact__chip')
    const text = declarations(components, '.site-contact__text')

    expect(chip['max-inline-size']).toBe('100%')
    expect(chip['border-radius']).toBe('var(--radius-pill)')
    expect(text['white-space']).toBe('nowrap')
  })

  it('consumes contact tokens in both themes instead of raw colour literals', () => {
    const chip = declarations(components, '.site-contact__chip')

    expect(chip['background']).toBe('var(--contact-bg)')
    expect(chip['border']).toContain('var(--contact-border)')
    expect(chip['color']).toBe('var(--text-primary)')
    expect(declarations(components, '.site-contact__icon')['color']).toBe('var(--contact-accent)')
    expect(declarations(components, '.site-contact__phone')['color']).toBe('var(--contact-accent)')

    for (const token of [
      '--contact-bg',
      '--contact-bg-hover',
      '--contact-border',
      '--contact-border-strong',
      '--contact-accent',
    ]) {
      expect(tokens, `${token} missing from the token layer`).toContain(`${token}:`)
    }

    const light = declarations(tokens, ":root,\n[data-theme='light']")
    const dark = declarations(tokens, "[data-theme='dark']")
    expect(light['--contact-accent']).toBeDefined()
    expect(dark['--contact-accent']).toBeDefined()
    expect(light['--contact-accent']).not.toBe(dark['--contact-accent'])
  })

  it('provides a hover state that does not rely on colour alone', () => {
    // The pill keeps its 1px border in every state; hover deepens the border
    // and the wash, and focus uses the platform-wide visible outline.
    expect(components).toMatch(/\.site-contact__chip:hover\s*\{[^}]*border-color:\s*var\(--contact-border-strong\)/s)
    expect(components).not.toMatch(/\.site-contact__chip:focus-visible\s*\{[^}]*outline:\s*none/s)
  })
})
