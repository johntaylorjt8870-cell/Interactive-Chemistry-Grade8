import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { LessonShell } from '@/layouts/LessonShell'
import { LessonOutline } from '@/lessons/LessonOutline'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { ScientificValue, TextbookSource, VectorArrow } from '@/scientific'
import { physicsLesson1 } from '@/data/curriculum/physicsLesson1'
import { fixtureLesson } from './fixtures/lesson'
import { renderWithTheme } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'

/* ============================================================================
   Layout, CSS-contract and prose regression tests.
   ----------------------------------------------------------------------------
   Two things jsdom cannot see are covered here by reading the stylesheets the
   browser will load: (1) the sizes that make the outline a small sidebar and the
   header a slim row, and (2) the rules that keep KaTeX's SVG accents visible —
   a global `svg { max-width: 100% }` once clamped every `\vec` arrow to 0px while
   the DOM looked perfect. The visual result was also verified in a real Chromium
   (docs/PHYSICS_LABS.md).
   ========================================================================= */

const components = readProjectFile('src/styles/components.css')
const tokens = readProjectFile('src/styles/tokens.css')
const base = readProjectFile('src/styles/base.css')
const scientific = readProjectFile('src/styles/scientific.css')
const scientificComponents = readProjectFile('src/styles/scientific-components.css')
const labsCss = readProjectFile('src/styles/physics-labs.css')

/** The declaration block of the first rule whose selector list matches exactly. */
function rule(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`))
  if (!match) throw new Error(`rule not found: ${selector}`)
  return match[1] ?? ''
}

/** The text of a `{ … }` block that starts at `start`, with nested braces balanced. */
function block(css: string, start: string): string {
  const open = css.indexOf(start)
  if (open < 0) throw new Error(`block not found: ${start}`)
  let depth = 0
  for (let i = css.indexOf('{', open); i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    if (css[i] === '}') {
      depth -= 1
      if (depth === 0) return css.slice(css.indexOf('{', open) + 1, i)
    }
  }
  throw new Error(`unbalanced block: ${start}`)
}

describe('lesson shell — a slim header and a breadcrumb that does not stick', () => {
  it('keeps the breadcrumb outside the sticky header', () => {
    const { container } = renderWithTheme(
      <LessonShell
        breadcrumb={<a href="/physics">الفيزياء</a>}
        title="عنوان الدرس"
        subtitle={<span>المصدر</span>}
        progress={{ current: 3, total: 9, ratio: 0.3 }}
        outline={<p>مخطط</p>}
        navigation={<div />}
      >
        <p>المحتوى</p>
      </LessonShell>,
    )
    const header = container.querySelector('.lesson-shell__header')!
    const crumbs = container.querySelector('.lesson-shell__breadcrumb')!
    expect(crumbs).not.toBeNull()
    expect(header.contains(crumbs)).toBe(false)
    expect(crumbs.closest('.lesson-shell__crumbs')).not.toBeNull()
    // title, chip and progress share the header
    expect(within(header as HTMLElement).getByRole('heading', { level: 1, name: 'عنوان الدرس' })).toBeInTheDocument()
    expect(within(header as HTMLElement).getByText('المصدر')).toBeInTheDocument()
    expect(within(header as HTMLElement).getByRole('progressbar', { name: 'الخطوة 3 من 9' })).toBeInTheDocument()
  })

  it('draws a progress bar that matches the position the label announces', () => {
    const { container } = renderWithTheme(
      <LessonShell title="ع" progress={{ current: 3, total: 9, ratio: 0.9 }} outline={<p />} navigation={<div />}>
        <p />
      </LessonShell>,
    )
    const bar = container.querySelector<HTMLElement>('.progress__bar')!
    // 3 of 9 = 33% — never the visited ratio, which the outline reports on its own
    expect(bar.getAttribute('style')).toMatch(/33%/)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
  })

  it('has no second row in the header: no visit counter and no breadcrumb', () => {
    const { container } = renderWithTheme(
      <LessonShell
        breadcrumb={<span>مسار</span>}
        title="ع"
        progress={{ current: 1, total: 2, ratio: 0.5, visited: 1 }}
        outline={<p />}
        navigation={<div />}
      >
        <p />
      </LessonShell>,
    )
    const header = container.querySelector('.lesson-shell__header')!
    expect(header.textContent).not.toContain('زُرت')
    expect(header.textContent).not.toContain('مسار')
  })

  it('declares the slim sizes in CSS: one row of at most 3rem, sticky below the site header', () => {
    const inner = rule(components, '.lesson-shell__header-inner')
    const minBlock = inner.match(/min-block-size:\s*([\d.]+)rem/)
    expect(minBlock).not.toBeNull()
    expect(Number(minBlock![1])).toBeLessThanOrEqual(3)
    const header = rule(components, '.lesson-shell__header')
    expect(header).toMatch(/position:\s*sticky/)
    expect(header).toMatch(/top:\s*var\(--header-height\)/)
    expect(rule(components, '.lesson-shell__crumbs')).not.toMatch(/sticky/)
    expect(rule(components, '.lesson-shell__breadcrumb')).not.toMatch(/sticky/)
  })

  it('gives the progress bar an explicit inline-size (a bare flex-basis used to collapse it to 0)', () => {
    const progress = rule(components, '.lesson-shell__progress .progress')
    expect(progress).toMatch(/inline-size:/)
    expect(progress).toMatch(/flex:\s*none/)
    expect(rule(components, '.progress__bar')).toMatch(/min-inline-size:/)
  })

  it('stops pinning the header on phones, where every pixel of height counts', () => {
    const phone = block(components, '@media (max-width: 640px)')
    expect(phone).toMatch(/\.lesson-shell__header\s*\{\s*position:\s*static;/)
  })
})

describe('lesson outline — a small sidebar, a drawer on narrow screens', () => {
  it('sizes the column in viewport units and caps it far below the old 300px', () => {
    const clamp = tokens.match(/--outline-width:\s*clamp\(\s*(\d+)px,\s*([\d.]+)vw,\s*(\d+)px\s*\)/)
    expect(clamp, 'outline token must be clamp(min px, N vw, max px)').not.toBeNull()
    const [min, vw, max] = [Number(clamp![1]), Number(clamp![2]), Number(clamp![3])]
    expect(vw).toBeGreaterThanOrEqual(12)
    expect(vw).toBeLessThanOrEqual(17)
    expect(min).toBeLessThanOrEqual(180)
    expect(max).toBeLessThanOrEqual(220)
    // never more than ~16% of a 1366px laptop, and never the 300px slab of before
    expect(Math.min(max, Math.max(min, (vw / 100) * 1366)) / 1366).toBeLessThan(0.16)
  })

  it('shows a visit summary and one compact entry per step', () => {
    const seen = [fixtureLesson.steps[0]!.id, fixtureLesson.steps[2]!.id]
    const { container } = render(<LessonOutline lesson={fixtureLesson} currentIndex={1} onSelect={() => {}} seenStepIds={seen} />)
    expect(container.querySelector('.lesson-outline__count')!.textContent).toBe(`زُرت 2 من ${fixtureLesson.steps.length}`)
    expect(container.querySelector('.lesson-outline__heading')).not.toBeNull()
    const buttons = [...container.querySelectorAll<HTMLElement>('.lesson-outline__button')]
    expect(buttons).toHaveLength(fixtureLesson.steps.length)

    // status lives in the index circle: a check (SVG, not a font glyph) for visited steps, a number otherwise
    const circle = (index: number) => buttons[index]!.querySelector('.lesson-outline__index')!
    expect(circle(0).querySelector('svg')).not.toBeNull()
    expect(circle(0).textContent).not.toContain('✓')
    expect(circle(1).textContent).toBe('2')
    expect(circle(1).querySelector('svg')).toBeNull()
    expect(circle(3).textContent).toBe('4')

    // the spoken status is always present, never visible text repeated down the list
    for (const button of buttons) {
      const status = button.querySelector('.lesson-outline__status')!
      expect(status).toHaveClass('visually-hidden')
      expect(status.textContent).toMatch(/^(الحالية|تمت زيارتها|لم تُفتح بعد)$/)
    }
  })

  it('draws the step kind only for the current step in the sidebar, but for all steps in the drawer', () => {
    const sidebar = render(<LessonOutline lesson={fixtureLesson} currentIndex={1} onSelect={() => {}} />)
    const kinds = [...sidebar.container.querySelectorAll('.lesson-outline__kind')]
    expect(kinds).toHaveLength(fixtureLesson.steps.length) // always in the accessible name…
    expect(kinds.filter((el) => !el.classList.contains('visually-hidden'))).toHaveLength(1) // …drawn once
    sidebar.unmount()

    const drawer = render(<LessonOutline lesson={fixtureLesson} currentIndex={1} onSelect={() => {}} variant="drawer" />)
    expect(drawer.container.querySelectorAll('.lesson-outline__kind:not(.visually-hidden)')).toHaveLength(fixtureLesson.steps.length)
    expect(drawer.container.querySelector('.lesson-outline__heading')).toBeNull() // the drawer has its own title
  })

  it('keeps long step titles complete (no truncation in the markup)', () => {
    const { container } = render(<LessonOutline lesson={physicsLesson1} currentIndex={0} onSelect={() => {}} />)
    const titles = [...container.querySelectorAll('.lesson-outline__title')].map((el) => el.textContent)
    expect(titles).toEqual(physicsLesson1.steps.map((step) => step.title))
    expect(rule(components, '.lesson-outline__title')).not.toMatch(/text-overflow|line-clamp|white-space:\s*nowrap/)
  })
})

describe('source cards — one frame per source step, not a card inside a card', () => {
  it('keeps every verbatim block marked as textbook material, but draws nested ones flat', () => {
    const { container } = render(
      <TextbookSource page="55">
        <ContentBlocks
          blocks={[
            { kind: 'textbook-verbatim', text: 'نص الكتاب', source: { page: '55', item: 'رقم الدرس وعنوانه' } },
          ]}
        />
      </TextbookSource>,
    )
    const frames = container.querySelectorAll('[data-origin="textbook"]')
    expect(frames).toHaveLength(2) // the step frame and the block — attribution is never removed from the DOM
    const nested = frames[1]!
    expect(nested.querySelector('.textbook-source__ref--item')!.textContent).toBe('رقم الدرس وعنوانه')
    expect(nested.querySelector('.textbook-source__ref--page')!.textContent).toBe('55')

    const flat = rule(scientificComponents, '.textbook-source .textbook-source')
    expect(flat).toMatch(/background:\s*transparent/)
    expect(flat).toMatch(/border:\s*0/)
    expect(scientificComponents).toMatch(
      /\.textbook-source \.textbook-source \.textbook-source__label,\s*\.textbook-source \.textbook-source \.textbook-source__ref--page\s*\{\s*display:\s*none;/,
    )
  })
})

describe('KaTeX and SVG — the contract that keeps every vector arrow visible', () => {
  it('lifts the global svg max-width clamp for KaTeX accents', () => {
    expect(base).toMatch(/img,\s*svg,\s*canvas\s*\{[^}]*max-width:\s*100%/) // the reset the rule must beat
    const katexSvg = scientific.match(/\.katex svg[^{]*\{([^}]*)\}/)
    expect(katexSvg, '`.katex svg` rule missing').not.toBeNull()
    expect(katexSvg![1]).toMatch(/max-width:\s*none/)
    // (0,1,1) beats (0,0,1): a class plus an element outranks a bare element selector
    const specificity = (selector: string) => ({
      classes: (selector.match(/\.[\w-]+/g) ?? []).length,
      elements: (selector.match(/(^|[\s>+~])[a-z][\w-]*/g) ?? []).length,
    })
    const beats = specificity('.katex svg')
    const reset = specificity('svg')
    expect(beats.classes).toBeGreaterThan(reset.classes)
  })

  it('renders a vector accent as KaTeX SVG geometry (the thing the rule above keeps visible)', () => {
    const { container } = render(<ContentBlocks blocks={[{ kind: 'paragraph', text: 'القوّة F₁⃗ تؤثّر', attribution: 'platform' }]} />)
    expect(container.querySelector('[data-vector="true"] .katex .svg-align, [data-vector="true"] .katex svg')).not.toBeNull()
  })

  it('applies a requested arrow weight as inline style, which outranks the role stylesheet', () => {
    const { container } = render(
      <svg>
        <VectorArrow x1={0} y1={0} x2={50} y2={0} role="force1" strokeWidth={5} />
      </svg>,
    )
    const shaft = container.querySelector('.diagram-vector__shaft')!
    expect(shaft.getAttribute('style')).toMatch(/stroke-width:\s*5/)
  })

  it('keeps an angle sign attached to its number and every other unit spaced', () => {
    const { container } = render(
      <p>
        <ScientificValue value={60} unit="°" />
        <ScientificValue value={25} unit="°C" />
        <ScientificValue value={5} unit="N" />
      </p>,
    )
    const values = [...container.querySelectorAll('.sci-value')]
    expect(values[0]).toHaveClass('sci-value--angle')
    expect(values[1]).not.toHaveClass('sci-value--angle')
    expect(values[2]).not.toHaveClass('sci-value--angle')
    expect(rule(scientificComponents, '.sci-value.sci-value--angle')).toMatch(/gap:\s*0/)
  })
})

describe('physics labs stylesheet — motion is always optional', () => {
  it('declares every animation only for users who have not asked for reduced motion', () => {
    const gated = block(labsCss, '@media (prefers-reduced-motion: no-preference)')
    // remove the gated block, the keyframes and `animation: none` resets; nothing else may animate
    const rest = labsCss
      .replace(gated, '')
      .replace(/@keyframes[^{]+\{(?:[^{}]|\{[^}]*\})*\}/g, '')
      .replace(/animation:\s*none/g, '')
    expect(rest).not.toMatch(/animation\s*:/)
    expect(rest).not.toMatch(/animation-name/)
  })

  it('also honours the in-app preference with the .lab--still class', () => {
    expect(labsCss).toMatch(/\.lab--still \.plab-apparatus,[\s\S]*?animation:\s*none/)
    expect(labsCss).toMatch(/\.plab:not\(\.lab--still\)/)
  })

  it('removes the old ad-hoc physics lab rules from the shared stylesheet', () => {
    expect(components).not.toMatch(/\.parallelogram-lab__figure|\.concurrent-forces-lab__board|\.vec-lab__/)
    // …while keeping the rule the chemistry labs still use
    expect(components).toMatch(/\.covalent-bond-lab__highlight/)
  })
})

/* ---------- colour: both themes, text and graphics ------------------------- */

/** Light tokens live in :root (the defaults) plus the light block; dark ones override them in the dark block. */
function themeBlock(theme: 'light' | 'dark'): string {
  return theme === 'light' ? `${block(tokens, ':root {')}\n${block(tokens, "[data-theme='light'] {")}` : block(tokens, "[data-theme='dark'] {")
}

function hex(value: string): [number, number, number] {
  const clean = value.replace('#', '')
  const full = clean.length === 3 ? [...clean].map((c) => c + c).join('') : clean
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

const luminance = ([r, g, b]: [number, number, number]) => {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrast = (a: [number, number, number], b: [number, number, number]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const mix = (a: [number, number, number], b: [number, number, number], weightB: number): [number, number, number] =>
  a.map((v, i) => Math.round(v * (1 - weightB) + b[i]! * weightB)) as [number, number, number]

function token(scope: string, name: string): string {
  const match = scope.match(new RegExp(`${name}:\\s*([^;]+);`))
  if (!match) throw new Error(`${name} not found`)
  return match[1]!.trim()
}

function resolve(scope: string, name: string): [number, number, number] {
  let value = token(scope, name)
  for (let i = 0; i < 5 && value.startsWith('var('); i += 1) {
    const inner = value.match(/var\((--[\w-]+)\)/)![1]!
    value = token(`${scope}\n${tokens}`, inner)
  }
  return hex(value)
}

describe('vector colours — readable on the lab board in both themes', () => {
  const roles = ['--vec-force1', '--vec-force2', '--vec-weight', '--vec-resultant', '--vec-component1', '--vec-component2']

  for (const theme of ['light', 'dark'] as const) {
    it(`keeps every vector colour at 4.5:1 or better on the ${theme} board`, () => {
      const scope = themeBlock(theme)
      const surface = resolve(scope, '--surface-base')
      // the board is the surface with a 10% wash of the physics accent (see physics-labs.css)
      const accent = theme === 'light' ? hex(token(tokens, '--palette-physics-600')) : hex(token(tokens, '--palette-physics-glow'))
      const board = mix(surface, accent, 0.1)
      for (const role of roles) {
        const colour = hex(token(scope, role))
        expect(contrast(colour, board), `${role} on the ${theme} board`).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`keeps F₁ and F₂ visibly different from each other in the ${theme} theme`, () => {
      const scope = themeBlock(theme)
      const f1 = hex(token(scope, '--vec-force1'))
      const f2 = hex(token(scope, '--vec-force2'))
      const distance = Math.hypot(f1[0] - f2[0], f1[1] - f2[1], f1[2] - f2[2])
      expect(distance).toBeGreaterThan(80)
    })
  }
})

/* ---------- prose ----------------------------------------------------------- */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

/** Every string of the lesson outside verbatim textbook blocks, with the path it came from. */
function platformStrings(): Array<{ path: string; text: string }> {
  const found: Array<{ path: string; text: string }> = []
  const walk = (value: Json, path: string) => {
    if (typeof value === 'string') found.push({ path, text: value })
    else if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${path}[${index}]`))
    else if (value && typeof value === 'object') {
      if (value.kind === 'textbook-verbatim') return
      for (const [key, child] of Object.entries(value)) if (key !== 'tex') walk(child, `${path}.${key}`)
    }
  }
  walk(physicsLesson1.steps as unknown as Json, 'steps')
  return found
}

describe('physics lesson prose — corrections that must never come back', () => {
  const strings = platformStrings()
  const joined = strings.map((entry) => entry.text).join('\n')

  it.each([
    ['«تجربة الغد» (the experiment is called تجربة الربيعتين)', 'تجربة الغد'],
    ['«المستول» (typo of المستوي)', 'المستول'],
    ['«أترجم / نترجم» (a translation of languages, not a move of an arrow)', 'ترجم'],
    ['«قانون الجيب» (the law that generalises Pythagoras is the law of cosines)', 'قانون الجيب'],
    ['«نظرية الزوايا المتبادلة» (wrong reason for the equal angles a)', 'الزوايا المتبادلة'],
    ['«يمرّ الخطوط» (the verb must agree: تمرّ)', 'يمرّ الخطوط'],
    ['«بدايةه»', 'بدايةه'],
    ['«لأنا»', 'لأنا'],
    ['«عكسية تماماً» (the resultant is not inversely proportional to the angle)', 'عكسية تماماً'],
    ['a perpendicular component called «شاقولية»', 'مركّبة شاقولية'],
    ['«شاقولية على المستوي»', 'شاقولية على المستوي'],
  ])('contains no %s', (_label, bad) => {
    expect(joined).not.toContain(bad)
  })

  it('never calls platform wording «حرفياً» or «نصّ الكتاب» (only verbatim blocks are the book’s text)', () => {
    for (const { path, text } of strings) {
      expect(text, path).not.toMatch(/حرفياً|حرفيّاً|نصّ استنتاج|نص استنتاج|نصّ صندوق|نص صندوق/)
    }
  })

  it('carries no raw LaTeX in any prose string (formulas live in formula blocks and KaTeX)', () => {
    for (const { path, text } of strings) {
      expect(text, path).not.toMatch(/\\(frac|sqrt|vec|overrightarrow|text|mathrm|approx|leq?|times)\b|\$\$|\$[^$]+\$/)
    }
  })

  it('keeps vector symbols as tokens that the renderer promotes — never a bare combining arrow beside a digit sign', () => {
    // every U+20D7 must follow a Latin letter (w⃗ F⃗ F₁⃗ OM⃗ R⃗), the only forms the parser promotes
    for (const { path, text } of strings) {
      for (const match of text.matchAll(/(.)\u20D7/gu)) expect(match[1], path).toMatch(/[A-Za-z₀-₉′']/u)
    }
  })

  it('explains each required topic somewhere in the platform steps', () => {
    const topics: Array<[string, RegExp]> = [
      ['what a force is and why an arrow', /ما القوّة|لماذا السهم/],
      ['what concurrent forces are', /ما هو\? القوى المتلاقية|القوى المتلاقية قوى تتلاقى/],
      ['how to read a force diagram', /كيف تقرأ أي شكل قوى/],
      ['why a parallelogram', /لماذا لا يصلح أي شكل رباعي آخر/],
      ['why the diagonal is the resultant', /لماذا القطر هو المحصّلة|لماذا يعمل هذا/],
      ['how the angle changes the resultant', /كيف تؤثر الزاوية/],
      ['how to find the direction of the resultant', /كيف نحدّد اتجاه المحصّلة/],
      ['why Pythagoras at 90°', /لماذا تظهر فيتاغورث عند التعامد/],
      ['what components are', /ما هو تحليل القوّة/],
      ['why resolve a force', /لماذا نحتاج التحليل/],
      ['how to verify a resolution', /كيف تتحقق من تحليلك/],
      ['how to sanity-check a result', /التحقّق من معقولية النتيجة/],
      ['common mistakes', /الخطأ الشائع|أخطاء شائعة/],
    ]
    for (const [name, pattern] of topics) expect(joined, name).toMatch(pattern)
  })

  it('keeps the explanation steps substantial (at least 300 words each)', () => {
    const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
    const explanations = physicsLesson1.steps.filter((step) => step.kind === 'explanation')
    expect(explanations.length).toBeGreaterThanOrEqual(5)
    for (const step of explanations) {
      const text: string[] = []
      const walk = (value: Json) => {
        if (typeof value === 'string') text.push(value)
        else if (Array.isArray(value)) value.forEach(walk)
        else if (value && typeof value === 'object') Object.entries(value).forEach(([key, child]) => key !== 'tex' && walk(child))
      }
      walk(step.blocks as unknown as Json)
      expect(words(text.join(' ')), step.id).toBeGreaterThanOrEqual(300)
    }
  })

  it('states the book’s own reading of the printed angle label a for the incline and of the smooth plane', () => {
    expect(joined).toContain('مستوٍ مائل أملس')
    expect(joined).toContain('ضلعَي إحداهما عموديان على ضلعَي الأخرى')
  })
})
