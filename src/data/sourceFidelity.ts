import { curriculum } from './curriculum/registry'
export { hasErrors } from './source'
import type { ContentBlock, Curriculum, LessonDefinition, LessonStep, UnitDefinition } from './curriculum/schema'
import type { FidelityIssue, SourceReference } from './source'

/**
 * Source-fidelity checks.
 *
 * These validators exist so that losing, paraphrasing or inventing textbook
 * material becomes a *detectable* event rather than a silent one. They are
 * used by the automated tests and are safe to run at build time later.
 */

const TEXTBOOK_ATTRIBUTIONS = new Set(['textbook', 'mixed'])

function blocksWithText(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((block) => block.kind === 'textbook-verbatim' || block.kind === 'source-image')
}

/** Validates one lesson. Returns every issue found, never throws. */
export function validateLesson(lesson: LessonDefinition, path: string): FidelityIssue[] {
  const issues: FidelityIssue[] = []

  if (lesson.title.trim() === '') {
    issues.push({
      severity: 'error',
      code: 'lesson/empty-title',
      message: 'Lesson title is empty. Titles must be copied from the textbook.',
      path,
    })
  }

  if (lesson.status !== 'awaiting-source' && lesson.steps.length === 0) {
    issues.push({
      severity: 'error',
      code: 'lesson/no-steps',
      message: 'A published lesson must contain at least one step.',
      path,
    })
  }

  if (lesson.status === 'source-verified' && !lesson.source.verified) {
    issues.push({
      severity: 'error',
      code: 'lesson/unverified-source',
      message: 'A lesson marked "source-verified" must carry a verified source reference.',
      path,
    })
  }

  if (lesson.steps.length > 0 && !lesson.source.pages.length) {
    issues.push({
      severity: 'error',
      code: 'lesson/missing-pages',
      message: 'A lesson built from the textbook must list the pages it was read from.',
      path,
    })
  }

  lesson.steps.forEach((step, index) => {
    issues.push(...validateStep(step, `${path}.step[${index}]:${step.id}`))
  })

  return issues
}

export function validateStep(step: LessonStep, path: string): FidelityIssue[] {
  const issues: FidelityIssue[] = []

  if (TEXTBOOK_ATTRIBUTIONS.has(step.attribution) && !hasUsableSource(step.source)) {
    issues.push({
      severity: 'error',
      code: 'step/missing-source',
      message: `Step "${step.id}" claims textbook material but has no verified page reference.`,
      path,
    })
  }

  for (const block of blocksWithText(step.blocks)) {
    if (block.kind === 'textbook-verbatim' && block.text.trim() === '') {
      issues.push({
        severity: 'error',
        code: 'block/empty-verbatim',
        message: `Step "${step.id}" contains an empty verbatim block.`,
        path,
      })
    }
    if (block.kind === 'source-image') {
      if (block.src.trim() === '' || /^https?:\/\//i.test(block.src.trim())) {
        issues.push({
          severity: 'error',
          code: 'block/invalid-source-image',
          message: `Step "${step.id}" contains a source-image block with an empty or external src.`,
          path,
        })
      }
      if (block.alt.trim() === '' || block.source.page.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'block/unlabelled-source-image',
          message: `Step "${step.id}" contains a source-image block without alt text or page reference.`,
          path,
        })
      }
    }
  }

  if (step.blocks.length === 0 && step.kind !== 'final-test') {
    issues.push({
      severity: 'error',
      code: 'step/empty',
      message: `Step "${step.id}" has no content blocks.`,
      path,
    })
  }

  if (step.kind === 'final-test' && !step.testId) {
    issues.push({
      severity: 'error',
      code: 'step/missing-test',
      message: `Final-test step "${step.id}" must reference a test definition.`,
      path,
    })
  }

  return issues
}

export function validateUnit(unit: UnitDefinition, path: string): FidelityIssue[] {
  const issues: FidelityIssue[] = []

  if (unit.title.trim() === '') {
    issues.push({
      severity: 'error',
      code: 'unit/empty-title',
      message: 'Unit title is empty. Titles must be copied from the textbook.',
      path,
    })
  }

  if (unit.status !== 'awaiting-source' && unit.lessons.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'unit/no-lessons',
      message: 'This unit has no lessons yet.',
      path,
    })
  }

  unit.lessons.forEach((lesson, index) => {
    issues.push(...validateLesson(lesson, `${path}.lesson[${index}]:${lesson.slug}`))
  })

  return issues
}

export function validateCurriculum(source: Curriculum = curriculum): FidelityIssue[] {
  return Object.values(source).flatMap((subject) =>
    subject.units.flatMap((unit, index) => validateUnit(unit, `${subject.id}.unit[${index}]:${unit.slug}`)),
  )
}

/** A source reference is usable when it names at least one page and was read. */
export function hasUsableSource(source: SourceReference | undefined): boolean {
  if (!source) return false
  if (!source.verified) return false
  return source.pages.length > 0 && source.pages.every((page) => page.page.trim() !== '')
}

/** Summarises the readability report supplied with a set of textbook pages. */
export function summariseReadability(source: SourceReference): string {
  const report = source.readability
  if (!report) return 'لم يُسجَّل تقرير وضوح لهذه الصفحات.'
  const entries: Array<[string, string | undefined]> = [
    ['النص العربي', report.arabicText],
    ['النص اللاتيني', report.latinText],
    ['المعادلات', report.equations],
    ['الأرقام', report.numbers],
    ['الوحدات', report.units],
    ['الجداول', report.tables],
    ['الأشكال', report.diagrams],
    ['التجارب', report.experiments],
    ['الأسئلة', report.questions],
  ]
  const labels: Record<string, string> = {
    clear: 'واضح',
    partial: 'جزئي',
    unreadable: 'غير مقروء',
  }
  const parts = entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, level]) => `${label}: ${labels[level] ?? level}`)
  return parts.length ? parts.join(' · ') : 'لم يُسجَّل تقرير وضوح لهذه الصفحات.'
}

/** True when every recorded readability level is clear enough to publish. */
export function isFullyReadable(source: SourceReference): boolean {
  const report = source.readability
  if (!report) return false
  return Object.entries(report).every(([key, level]) => key === 'notes' || level === 'clear' || level === undefined)
}

