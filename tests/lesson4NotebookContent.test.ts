import { describe, expect, it } from 'vitest'
import { chemistryLesson4, chemistryLesson4StudentNotebook } from '@/data/curriculum/chemistryLesson4'

/**
 * «دفتر الطالب» — Lesson 4 content fidelity.
 *
 * The notebook may only present as *printed* what the lesson already quotes as
 * printed (`kind: 'textbook-verbatim'`), on the same page. Everything else it
 * adds must be either labelled as a platform clarification or moved into the
 * sourced enrichment layer. These tests are the guard for that rule; they read
 * the lesson data itself rather than a copy of it.
 */

const notebook = chemistryLesson4StudentNotebook

/** Every printed sentence the lesson attributes to the book, with its page. */
const printed = new Map<string, Set<string>>()
for (const step of chemistryLesson4.steps) {
  for (const block of step.blocks ?? []) {
    if (block.kind === 'textbook-verbatim') {
      const page = block.source?.page
      if (!page) continue
      const set = printed.get(page) ?? new Set<string>()
      set.add(normalize(block.text))
      printed.set(page, set)
      continue
    }

    // The lesson also attributes printed lists to a page on the step itself
    // (`kind: 'list', attribution: 'textbook'`), e.g. the two combustion rules
    // printed in «أستنتج» ص26. They count as printed text too.
    if (block.kind === 'list' && block.attribution === 'textbook') {
      // `combustion-conclusions` carries its page on the block's sibling quotes
      // (`source('26', …)`) only through `step.source` in newer steps; older ones
      // nest the reference on each quote block, so fall back to the first quote.
      const page =
        step.source?.pages[0]?.page ??
        step.blocks.find((item) => item.kind === 'textbook-verbatim')?.source?.page
      if (!page) continue
      const set = printed.get(page) ?? new Set<string>()
      for (const item of block.items) set.add(normalize(item))
      printed.set(page, set)
    }
  }
}

function normalize(value: string): string {
  return value
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // harakat + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[«»"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function pageOf(source: string | undefined): string[] {
  return (source ?? '').match(/ص(\d{2})/g)?.map((token) => token.slice(1)) ?? []
}

function allPrintedIn(page: string): string {
  return Array.from(printed.get(page) ?? []).join(' | ')
}

describe('Lesson 4 notebook content — book fidelity', () => {
  it('builds a printed-sentence index from the lesson itself', () => {
    expect(printed.size).toBeGreaterThanOrEqual(5)
    expect(allPrintedIn('26')).toContain('الاحتراق')
  })

  it('quotes every definition from a printed sentence on a page it cites', () => {
    const definitions = notebook.sections.flatMap((section) => section.definitions ?? [])
    expect(definitions.length).toBeGreaterThanOrEqual(4)

    for (const definition of definitions) {
      const body = normalize(definition.text)
      const pages = pageOf(definition.source)
      expect(pages.length, `definition missing page: ${definition.term}`).toBeGreaterThan(0)

      const matched = pages.some((page) => allPrintedIn(page).includes(body))
      expect(matched, `not printed verbatim on ${pages.join('/')}: ${definition.term} → ${definition.text}`).toBe(
        true,
      )
    }
  })

  it('attributes the four «تعلّمت» bullets to ص27 word for word', () => {
    const summary = notebook.sections.find((section) => section.id === 'learned-summary')
    expect(summary).toBeDefined()
    expect(summary?.points).toHaveLength(4)
    for (const point of summary?.points ?? []) {
      // «تعلّمت» prints the second bullet as the label plus the diagram; the
      // notebook states the same two words and nothing more.
      const body = normalize(point)
      if (body.startsWith('المعادله الكيميائيه اللفظيه')) {
        expect(body).toBe('المعادله الكيميائيه اللفظيه: مواد متفاعله → مواد ناتجه.')
        continue
      }
      expect(allPrintedIn('27')).toContain(body)
    }
  })

  it('keeps the printed wording of the four reaction signs, ellipsis included', () => {
    const section = notebook.sections.find((item) => item.id === 'reaction-definition')
    const signs = section?.points?.find((point) => point.startsWith('غالباً ما يرافق'))
    expect(signs).toBeDefined()
    // The book prints the list on ص25 with a trailing ellipsis; the notebook keeps
    // it, so nobody mistakes the four signs for an exhaustive five-item list.
    expect(allPrintedIn('25')).toContain(normalize(signs as string))
    expect(allPrintedIn('24')).not.toContain(normalize(signs as string))
    expect(signs?.endsWith('..........')).toBe(true)
  })
})

describe('Lesson 4 notebook content — no invented book text', () => {
  it('never presents a platform explanation as printed material', () => {
    const platformOnly = notebook.sections.filter((section) => section.source)
    expect(platformOnly.length).toBeGreaterThan(0)

    for (const section of platformOnly) {
      // Two sanctioned wordings: a clarification of print, or an authored addition.
      expect(section.source).toMatch(/^(توضيح ضروري من المنصة|إضافة من المنصة) — (ليس|ليست) نصاً? من الكتاب$/)
      // A platform section may not quote a definition as if the book said it.
      expect(section.definitions).toBeUndefined()
    }
  })

  it('keeps every enrichment statement out of the printed points', () => {
    for (const section of notebook.sections) {
      for (const item of section.enrichment ?? []) {
        for (const page of Array.from(printed.keys())) {
          expect(allPrintedIn(page)).not.toContain(normalize(item.text))
        }
        expect(section.points ?? []).not.toContain(item.text)
      }
    }
  })

  it('attributes each enrichment claim to a source that actually states it', () => {
    const items = notebook.sections.flatMap((section) => section.enrichment ?? [])

    // PubChem holds the two gas formulas, but says nothing about combustion products.
    const pubchem = items.find((item) => item.reference === 'PubChem')
    expect(pubchem).toBeDefined()
    expect(pubchem?.text).toContain('C₄H₁₀')
    expect(pubchem?.text).toContain('C₃H₈')
    expect(pubchem?.text).not.toMatch(/ثنائي أكسيد الكربون|أحادي أكسيد الكربون|السخام|الماء/)
    // The combustion inference is carried by the chemistry source, not by PubChem.
    const combustion = items.filter((item) => item.url?.includes('zwdsjty'))
    expect(combustion.some((item) => /ثنائي أكسيد الكربون والماء/.test(item.text))).toBe(true)

    // The limewater item is only allowed to name CaCO₃ because its source does.
    const limewater = items.find((item) => item.text.includes('Ca(OH)₂'))
    expect(limewater).toBeDefined()
    expect(limewater?.url).toBe('https://edu.rsc.org/experiments/how-can-hardness-in-water-be-removed/1734.article')
    expect(limewater?.text).toContain('CaCO₃')

    // The soot inference is split out and carried by the combustion source.
    const soot = items.find((item) => item.text.includes('فالسخام لا يأتي إلا من وقود يحتوي الكربون'))
    expect(soot).toBeDefined()
    expect(soot?.url).toBe('https://www.bbc.co.uk/bitesize/guides/zwdsjty/revision/3')
    // The magnesium item itself no longer asserts what its own page never says.
    const magnesium = items.find((item) => item.text.includes('أكسيد المغنزيوم الناتج مسحوق أبيض'))
    expect(magnesium?.url).toBe('https://www.bbc.co.uk/bitesize/articles/z9rbbqt')
    expect(magnesium?.text).not.toContain('السخام لا ينتج')
  })

  it('names an external reference and a working link for every enrichment item', () => {
    const items = notebook.sections.flatMap((section) => section.enrichment ?? [])
    expect(items.length).toBeGreaterThanOrEqual(7)

    const references = new Set(items.map((item) => item.reference))
    expect(references.size).toBeGreaterThanOrEqual(5)

    for (const item of items) {
      expect(item.url, item.text.slice(0, 30)).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\//)
      expect(item.citation.length).toBeGreaterThan(item.reference.length)
      expect(item.why.length).toBeGreaterThan(20)
    }

    // Only reputable publishers — no answer-farm or community-farm sources.
    for (const reference of references) {
      expect(reference).not.toMatch(/brainly|askfilo|answers\.com|quizlet|studocu|sherpa|tuity/i)
    }
  })

  it('does not duplicate the platform comparison table or the sorting table', () => {
    const rendered = JSON.stringify(notebook)
    // The comparison step owns these cells; the notebook cross-references it.
    expect(rendered).not.toContain('وجه المقارنة')
    expect(rendered).not.toContain('وعاء الاحتراق')
    expect(rendered).toContain('مقارنة شاملة')
    expect(rendered).toContain('جدول الفرز')
  })

  it('carries no self-test, no answers and no lab prompts', () => {
    const rendered = JSON.stringify(notebook)
    expect(rendered).not.toMatch(/أختبر نفسي/)
    expect(rendered).not.toMatch(/الإجابة|إجابة نموذجية|الحل:/)
    expect(rendered).not.toMatch(/interactiveId|simulation|مختبر تفاعلي/)
  })

  it('keeps the approved chemistry and scope limits', () => {
    const rendered = JSON.stringify(notebook)
    expect(rendered).toContain('Ca(OH)₂')
    expect(rendered).toContain('CaCO₃')
    expect(rendered).not.toMatch(/C₂H₅SH|C2H5SH/)
    expect(rendered).toMatch(/الكلور/)
    // No balancing: no coefficient + formula patterns such as `2H₂ + O₂`.
    expect(rendered).not.toMatch(/\b[2-9]\s?[A-Z][a-z]?\d?[₀-₉]?\s*\+/)
  })
})

describe('Lesson 4 notebook content — level and coverage', () => {
  const rendered = JSON.stringify(notebook)

  it('covers all six printed objectives and all six keywords', () => {
    for (const objective of [
      'يتعرّف التفاعل الكيميائي',
      'يميّز بين المواد المتفاعلة والناتجة',
      'يتعرّف تفاعل الاحتراق',
      'يميّز أنواع تفاعلات الاحتراق',
      'يقارن نواتج الاحتراق التام وغير التام',
      'يعبّر عن التفاعل الكيميائي بمعادلة كيميائية لفظية',
    ]) {
      expect(rendered).toContain(objective)
    }
    for (const keyword of [
      'تفاعل كيميائي',
      'مواد متفاعلة',
      'مواد ناتجة',
      'معادلة كيميائية لفظية',
      'احتراق تام',
      'احتراق غير تام',
    ]) {
      expect(rendered).toContain(keyword)
    }
  })

  it('covers every substance the pages name, with the approved formulas', () => {
    for (const formula of ['MgO', 'FeS', 'CO₂', 'CO', 'O₂', 'H₂O', 'Ca(OH)₂', 'CaCO₃']) {
      expect(rendered).toContain(formula)
    }
    for (const name of ['المغنزيوم', 'أكسيد المغنزيوم', 'كبريتيد الحديد II', 'رائق الكلس', 'المركبتان']) {
      expect(rendered).toContain(name)
    }
  })

  it('gives no hazardous experimental instruction', () => {
    expect(rendered).not.toMatch(/استنشق|شمّ\s+الغاز|قرّب\s+أنفك/)
    expect(rendered).not.toMatch(/اخلط\s+\S+\s+مع\s+ماء جافيل/)
    // The only bleach guidance is a prohibition.
    const safety = notebook.sections.find((section) => section.id === 'gases-and-safety')
    expect(safety?.points?.some((point) => point.includes('لا تُخلط'))).toBe(true)
  })

  it('keeps the reflection checklist as questions without answers', () => {
    expect(notebook.checklist?.items).toHaveLength(9)
    for (const item of notebook.checklist?.items ?? []) {
      expect(item.trim()).toMatch(/[؟.]$/)
    }
  })
})
