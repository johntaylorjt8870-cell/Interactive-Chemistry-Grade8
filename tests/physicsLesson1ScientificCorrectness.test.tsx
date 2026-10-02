import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { physicsLesson1 } from '@/data/curriculum/physicsLesson1'
import type { ContentBlock, LessonStep } from '@/data/curriculum/schema'
import { renderApp } from './utils/renderApp'

/**
 * Scientific-correctness regression — Physics Lesson 1 (القوى المتلاقية).
 *
 * The platform explanation «لماذا نبحث عن محصّلة؟» used to end with
 * «… تسارع باتجاهها، أو سكوناً إن كانت صفراً» — that is, zero resultant ⟹ at rest.
 * That is false. The correct chain is
 *
 *     محصّلة القوى = 0   ⟹   التسارع = 0   ⟹   السرعة لا تتغيّر
 *
 * and an unchanging velocity covers TWO states: rest (v = 0) when the body was at
 * rest to begin with, or uniform straight-line motion (v ≠ 0, constant in magnitude
 * AND direction) when it was already moving. The resultant alone never decides
 * which one; the body's initial state does.
 *
 * Scope: the lesson DATA as stored (the platform explanation, the book solutions and
 * the final test). Lab components are separate surfaces and are not inspected here.
 * Textbook wording is deliberately not asserted here either — it is pinned by
 * physicsLesson1.test.tsx («verbatim fidelity against the finalized source report»).
 */

const LESSON_PATH = '/physics/motion-and-forces/concurrent-forces'
const EXPLANATION_STEP_ID = 'concurrent-explained'

/** The four ideas the explanation must keep apart, in teaching order (cause → effect → two states). */
const CONCEPTS = ['محصّلة القوى صفر', 'التسارع صفر', 'السكون', 'الحركة بسرعة ثابتة'] as const

/* ---------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------ */

/** Compare words, not vowel marks: a harmless diacritic edit must not break these tests. */
const plain = (text: string): string => text.normalize('NFC').replace(/[\u064B-\u065F\u0670\u0640]/gu, '')

// Written against `plain()` text (no diacritics).
const RESULTANT = /محصل/u // محصّلة · المحصّلة · محصّلتها
const ZERO = /صفر(?!اء)/u // صفر · صفراً · الصفرية — never «صفراء» (yellow, as in the parachute photo)
const REST = /ساكن|سكون/u // ساكن · ساكناً · السكون · سكوناً · بسكون
const CONSTANT_VELOCITY = /سرعة\s+ثابتة/u // «بسرعة ثابتة»

/** A text that discusses a zero resultant and rest together. */
const tiesZeroResultantToRest = (text: string): boolean => {
  const words = plain(text)
  return RESULTANT.test(words) && ZERO.test(words) && REST.test(words)
}

/**
 * The shape of the legacy error: zero resultant and rest discussed together, but
 * constant velocity — the other outcome — never named. A correct statement about
 * rest and a zero resultant always has to mention that second outcome.
 */
const hasLegacyShape = (text: string): boolean =>
  tiesZeroResultantToRest(text) && !CONSTANT_VELOCITY.test(plain(text))

type BlockOfKind<K extends ContentBlock['kind']> = Extract<ContentBlock, { kind: K }>

function blocksOfKind<K extends ContentBlock['kind']>(step: LessonStep, kind: K): Array<BlockOfKind<K>> {
  return step.blocks.filter((block): block is BlockOfKind<K> => block.kind === kind)
}

function explanationStep(): LessonStep {
  const step = physicsLesson1.steps.find((candidate) => candidate.id === EXPLANATION_STEP_ID)
  if (!step) throw new Error(`Physics Lesson 1 lost its «${EXPLANATION_STEP_ID}» explanation step`)
  return step
}

/** The paragraph that explains why we look for a resultant (the one that held the error). */
function whyResultantText(): string {
  const paragraph = blocksOfKind(explanationStep(), 'paragraph').find((block) => block.text.startsWith('لماذا نبحث عن'))
  if (!paragraph) throw new Error('The «لماذا نبحث عن محصّلة؟» paragraph is missing from the explanation step')
  return paragraph.text
}

/** The callout that says outright: a zero resultant does not mean the body is at rest. */
function restWarning(): BlockOfKind<'callout'> {
  const callout = blocksOfKind(explanationStep(), 'callout').find((block) =>
    plain(block.title ?? '').includes(plain('لا تعني أن الجسم ساكن')),
  )
  if (!callout) throw new Error('The «zero resultant does not mean rest» warning is missing from the explanation step')
  return callout
}

/** One card per concept that must be kept apart. */
function conceptCards(): Array<{ term: string; meaning: string }> {
  const [block] = blocksOfKind(explanationStep(), 'key-terms')
  if (!block) throw new Error('The four-concept key-terms block is missing from the explanation step')
  return block.terms
}

function meaningOf(term: string): string {
  const card = conceptCards().find((candidate) => plain(candidate.term) === plain(term))
  if (!card) throw new Error(`No concept card for «${term}»`)
  return plain(card.meaning)
}

/** Every string a value can show to the learner. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap((item) => strings(item))
  if (value && typeof value === 'object') return Object.values(value).flatMap((item) => strings(item))
  return []
}

/** Every unit of lesson text a statement about force and motion could hide in. */
function lessonUnits(): Array<{ where: string; text: string }> {
  const fromSteps = physicsLesson1.steps.flatMap((step) => [
    { where: `${step.id} · title/summary`, text: `${step.title}\n${step.summary ?? ''}` },
    ...step.blocks.map((block, index) => ({
      where: `${step.id} · block ${index + 1} (${block.kind})`,
      text: strings(block).join('\n'),
    })),
  ])
  const fromAssessments = (physicsLesson1.tests ?? []).flatMap((test) =>
    test.questions.map((question) => ({ where: `${test.id} · ${question.id}`, text: strings(question).join('\n') })),
  )
  return [...fromSteps, ...fromAssessments]
}

/* ---------------------------------------------------------------------------
   Tests
   ------------------------------------------------------------------------ */

describe('Physics Lesson 1 — a zero resultant force is NOT the same as rest', () => {
  describe('the legacy error cannot come back', () => {
    const LEGACY_PARAGRAPH =
      'المحصّلة قوّة وحيدة تُحدث الأثر نفسه الذي تُحدثه القوى كلها معاً؛ فإذا عرفناها عرفنا ماذا سيحدث للجسم: تسارع باتجاهها، أو سكوناً إن كانت صفراً.'

    it('has a detector that recognises the legacy wording (so the guard below cannot pass vacuously)', () => {
      expect(hasLegacyShape(LEGACY_PARAGRAPH)).toBe(true)
    })

    it.each([
      'إذا كانت محصّلة القوى صفراً فالجسم ساكن.',
      'والجسم يبقى ساكناً لأن محصّلتها صفر.',
      'محصّلة القوى الصفرية تعني السكون.',
    ])('recognises the same mistake in other words: %s', (sentence) => {
      expect(hasLegacyShape(sentence)).toBe(true)
    })

    it('accepts a statement that names both outcomes of a zero resultant', () => {
      const correct = 'إذا كانت المحصّلة صفراً بقي الجسم الساكن ساكناً وتابع الجسم المتحرك حركته بسرعة ثابتة.'
      expect(tiesZeroResultantToRest(correct)).toBe(true)
      expect(hasLegacyShape(correct)).toBe(false)
    })

    it('does not mistake yellow («صفراء», as in the parachute photo) for zero', () => {
      expect(hasLegacyShape('المحصّلة والمظلّة الصفراء ساكنة.')).toBe(false)
    })

    it('has removed the legacy clause from the whole lesson', () => {
      const lesson = plain(JSON.stringify(physicsLesson1))
      expect(lesson).not.toContain(plain('سكوناً إن كانت'))
      expect(lesson).not.toContain(plain('ماذا سيحدث للجسم'))
    })

    it('lets no step block or assessment item tie a zero resultant to rest without naming constant velocity', () => {
      const offenders = lessonUnits()
        .filter(({ text }) => hasLegacyShape(text))
        .map(({ where }) => where)
      // A non-empty list names the exact block that teaches "zero resultant ⟹ rest". Fix it by
      // stating the second outcome too (uniform motion at constant velocity) and the role of the
      // initial state — never by deleting this guard.
      expect(offenders).toEqual([])
    })

    it('really inspects the blocks that discuss rest and a zero resultant (the scan is not empty)', () => {
      const inspected = lessonUnits().filter(({ text }) => tiesZeroResultantToRest(text))
      expect(inspected.length).toBeGreaterThanOrEqual(2)
      expect(inspected.every(({ where }) => where.startsWith(EXPLANATION_STEP_ID))).toBe(true)
    })
  })

  describe('the corrected explanation (step «concurrent-explained»)', () => {
    it('derives the effect of the resultant as a change of velocity: zero resultant ⟹ zero acceleration', () => {
      const text = plain(whyResultantText())
      // The resultant fixes the CHANGE of velocity (acceleration) — not "what will happen".
      expect(text).toContain(plain('كيف تتغيّر سرعة الجسم، أي تسارعه'))
      // Non-zero resultant ⟹ acceleration along it; zero resultant ⟹ zero acceleration.
      expect(text).toContain(plain('اكتسب الجسم تسارعاً باتجاهها'))
      expect(text).toContain(plain('وإن كانت صفراً فالتسارع صفر'))
      // Zero acceleration = the velocity does not change in magnitude NOR in direction.
      expect(text).toContain(plain('لا تتغيّر سرعة الجسم لا في مقدارها ولا في اتجاهها'))
    })

    it('says outright that a zero resultant does not mean the body is at rest', () => {
      const warning = restWarning()
      expect(warning.tone).toBe('warning')
      expect(plain(warning.title ?? '')).toBe(plain('محصّلة القوى صفر لا تعني أن الجسم ساكن'))
      expect(plain(warning.text)).toContain(plain('فالمؤكّد أن التسارع صفر'))
    })

    it('teaches both outcomes, each fixed by the initial state — never by the resultant alone', () => {
      const text = plain(restWarning().text)
      expect(text).toContain(plain('أما هل الجسم ساكن أم متحرك فتحدّده حالته في البداية'))
      expect(text).toContain(plain('إن كان ساكناً بقي ساكناً'))
      expect(text).toContain(plain('إن كان متحركاً تابع حركته'))
      expect(text).toContain(plain('ما دامت المحصّلة صفراً'))
    })

    it('states constant velocity precisely: constant in magnitude and direction, along a straight line', () => {
      expect(plain(restWarning().text)).toContain(plain('على خط مستقيم بسرعة ثابتة مقداراً واتجاهاً'))

      const uniform = meaningOf('الحركة بسرعة ثابتة')
      expect(uniform).toContain(plain('لا تساوي صفراً')) // moving: velocity is not zero…
      expect(uniform).toContain(plain('لا يتغيّر مقدارها ولا اتجاهها')) // …yet constant in magnitude and direction
      expect(uniform).toContain(plain('خط مستقيم'))
      expect(uniform).toContain(plain('تسارعه صفر'))
    })

    it('gives the two outcomes concrete cases: the hanging body of page 56 and the parachutist of page 55', () => {
      const text = plain(restWarning().text)
      expect(text).toContain(plain('الجسم المعلّق في تجربة الصفحة 56 ساكن'))
      expect(text).toContain(plain('المظلّي الذي يهبط بسرعة ثابتة متحرك'))
      expect(text).toContain(plain('ومحصّلة القوى على كلٍّ منهما صفر'))
    })

    it('distinguishes zero resultant force, zero acceleration, rest and constant velocity', () => {
      expect(conceptCards().map((card) => plain(card.term))).toEqual(CONCEPTS.map(plain))

      // Zero resultant force is a statement about the FORCES, zero acceleration about the CHANGE of
      // motion: neither is defined as rest or as any particular velocity.
      const force = meaningOf('محصّلة القوى صفر')
      expect(force).toContain(plain('وصف للقوى المؤثّرة'))
      expect(force).toContain(plain('القوى تلغي أثر بعضها'))
      expect(force).not.toMatch(REST)
      expect(force).not.toMatch(CONSTANT_VELOCITY)

      const acceleration = meaningOf('التسارع صفر')
      expect(acceleration).toContain(plain('وصف لتغيّر حركة الجسم'))
      expect(acceleration).toContain(plain('سرعته لا تتغيّر لا في مقدارها ولا في اتجاهها'))
      expect(acceleration).toContain(plain('النتيجة المباشرة لكون محصّلة القوى صفراً'))
      expect(acceleration).not.toMatch(REST)

      // Rest and constant velocity are two different STATES of motion that share zero acceleration.
      const rest = meaningOf('السكون')
      expect(rest).toContain(plain('وصف لحالة الجسم'))
      expect(rest).toContain(plain('سرعته تساوي صفراً'))
      expect(rest).not.toContain(plain('لا تساوي'))
      expect(rest).toContain(plain('تسارعه صفر'))

      const uniform = meaningOf('الحركة بسرعة ثابتة')
      expect(uniform).toContain(plain('وصف لحالة الجسم'))
      expect(uniform).toContain(plain('سرعته لا تساوي صفراً'))
      expect(uniform).toContain(plain('تسارعه صفر'))
    })

    it('keeps the correction inside clearly labelled platform content (no textbook frame, no textbook wording)', () => {
      const step = explanationStep()
      expect(step.kind).toBe('explanation')
      expect(step.attribution).toBe('platform')
      expect(step.source).toBeUndefined()

      for (const block of step.blocks) {
        expect(block.kind, `${block.kind} block must not impersonate the textbook`).not.toBe('textbook-verbatim')
        expect(block.kind).not.toBe('source-image')
        if ('attribution' in block) expect(block.attribution, block.kind).toBe('platform')
      }
    })
  })

  describe('what the learner actually sees', () => {
    it('shows the corrected explanation, the four concepts and the warning on the lesson page — and not the legacy sentence', async () => {
      const user = userEvent.setup()
      const step = explanationStep()
      const { container } = renderApp(LESSON_PATH)
      await screen.findByRole('heading', { level: 1, name: /القوى المتلاقية/ })

      await user.click(screen.getByRole('button', { name: (name) => name.includes(step.title) }))
      const article = await waitFor(() => {
        const found = container.querySelector<HTMLElement>(`[data-step="${EXPLANATION_STEP_ID}"]`)
        expect(found).not.toBeNull()
        return found as HTMLElement
      })

      // The legacy sentence is gone from the rendered page; the corrected chain is on it.
      const shown = plain(article.textContent ?? '')
      expect(shown).not.toContain(plain('سكوناً إن كانت'))
      expect(shown).toContain(plain('وإن كانت صفراً فالتسارع صفر'))
      expect(shown).toContain(plain('إن كان ساكناً بقي ساكناً'))
      expect(shown).toContain(plain('إن كان متحركاً تابع حركته على خط مستقيم بسرعة ثابتة مقداراً واتجاهاً'))

      // The explicit warning is a real warning alert.
      const title = within(article).getByText(restWarning().title as string)
      expect(title.closest('.alert')).toHaveClass('alert--warning')

      // The four concepts are four distinct definition-list entries, in teaching order.
      const terms = [...article.querySelectorAll('dl.key-terms dt')].map((term) => term.textContent)
      expect(terms).toEqual(conceptCards().map((card) => card.term))

      // The step is presented as platform material, never inside a textbook frame.
      expect(article.querySelector('[data-origin="platform"]')).not.toBeNull()
      expect(article.querySelector('[data-origin="textbook"]')).toBeNull()
    })
  })
})
