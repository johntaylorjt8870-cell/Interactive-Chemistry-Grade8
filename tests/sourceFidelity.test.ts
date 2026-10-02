import { describe, expect, it } from 'vitest'
import {
  hasErrors,
  hasUsableSource,
  isFullyReadable,
  summariseReadability,
  validateCurriculum,
  validateLesson,
  validateStep,
  validateUnit,
} from '@/data/sourceFidelity'
import { NO_SOURCE, type SourceReference } from '@/data/source'
import {
  curriculumStats,
  getLesson,
  getStep,
  getSubjectDefinition,
  getUnit,
  curriculum,
  isCurriculumEmpty,
  isSubjectPopulated,
  listSubjects,
  listUnits,
} from '@/data/curriculum/registry'
import { SUBJECT_IDS } from '@/data/curriculum/schema'
import { fixtureLesson } from './fixtures/lesson'

const verifiedSource: SourceReference = {
  pages: [{ page: '12', item: 'نشاط 1' }],
  verified: true,
  readability: {
    arabicText: 'clear',
    latinText: 'clear',
    equations: 'clear',
    numbers: 'clear',
    units: 'clear',
    tables: 'clear',
    diagrams: 'clear',
    experiments: 'clear',
    questions: 'clear',
  },
}

describe('curriculum registry — first verified chemistry lesson', () => {
  it('exposes both subjects', () => {
    expect(listSubjects().map((subject) => subject.id)).toEqual([...SUBJECT_IDS])
  })

  it('publishes the verified chemistry and physics units', () => {
    expect(listUnits('physics')).toHaveLength(1)
    expect(isSubjectPopulated('physics')).toBe(true)
    expect(getSubjectDefinition('physics').status).toBe('source-verified')
    expect(getLesson('physics', 'motion-and-forces', 'concurrent-forces')?.title).toContain('القوى المتلاقية')

    expect(listUnits('chemistry')).toHaveLength(1)
    expect(isSubjectPopulated('chemistry')).toBe(true)
    expect(getSubjectDefinition('chemistry').status).toBe('source-verified')
    expect(getLesson('chemistry', 'structural-chemistry', 'atom-and-element')?.title).toContain('الذرّة والعنصر')
    expect(isCurriculumEmpty()).toBe(false)
    expect(curriculumStats()).toEqual({ units: 2, lessons: 3, steps: 57 })
  })

  it('returns nothing for unknown slugs instead of falling back to fabricated content', () => {
    expect(getUnit('physics', 'unit-1')).toBeUndefined()
    expect(getLesson('physics', 'unit-1', 'lesson-1')).toBeUndefined()
    expect(getStep('chemistry', 'unit-1', 'lesson-1', 'step-1')).toBeUndefined()
    expect(getUnit('physics', '')).toBeUndefined()
  })

  it('labels subject motifs as visual identity, not curriculum', () => {
    for (const subject of SUBJECT_IDS) {
      const definition = getSubjectDefinition(subject)
      expect(definition.motifs.length).toBeGreaterThan(0)
      for (const motif of definition.motifs) {
        // Motif labels are single words of identity, never "الوحدة الأولى…".
        expect(motif.label).not.toMatch(/وحدة|درس|فصل/)
      }
    }
  })

  it('passes its own fidelity validation', () => {
    expect(validateCurriculum()).toEqual([])
  })
})

describe('fidelity validators', () => {
  it('rejects a textbook step with no verified page reference', () => {
    const issues = validateStep(
      {
        id: 's1',
        kind: 'source',
        title: 'نص',
        attribution: 'textbook',
        source: NO_SOURCE,
        blocks: [{ kind: 'paragraph', text: 'نص', attribution: 'textbook' }],
      },
      'path',
    )

    expect(issues.map((issue) => issue.code)).toContain('step/missing-source')
    expect(hasErrors(issues)).toBe(true)
  })

  it('accepts a textbook step with a verified, non-empty page reference', () => {
    const issues = validateStep(
      {
        id: 's1',
        kind: 'source',
        title: 'نص',
        attribution: 'textbook',
        source: verifiedSource,
        blocks: [{ kind: 'textbook-verbatim', text: 'نص منقول', source: { page: '12' } }],
      },
      'path',
    )

    expect(issues).toEqual([])
  })

  it('rejects empty steps and empty verbatim blocks', () => {
    const emptyStep = validateStep(
      { id: 's2', kind: 'explanation', title: 'شرح', attribution: 'platform', blocks: [] },
      'path',
    )
    expect(emptyStep.map((issue) => issue.code)).toContain('step/empty')

    const emptyVerbatim = validateStep(
      {
        id: 's3',
        kind: 'source',
        title: 'نص',
        attribution: 'textbook',
        source: verifiedSource,
        blocks: [{ kind: 'textbook-verbatim', text: '   ', source: { page: '12' } }],
      },
      'path',
    )
    expect(emptyVerbatim.map((issue) => issue.code)).toContain('block/empty-verbatim')
  })

  it('requires a final-test step to reference a test', () => {
    const issues = validateStep(
      { id: 'final', kind: 'final-test', title: 'اختبار', attribution: 'platform', blocks: [] },
      'path',
    )
    expect(issues.map((issue) => issue.code)).toContain('step/missing-test')
  })

  it('flags a lesson that claims to be source-verified without a verified source', () => {
    const issues = validateLesson(
      { ...fixtureLesson, status: 'source-verified', source: NO_SOURCE },
      'fixture',
    )
    const codes = issues.map((issue) => issue.code)

    expect(codes).toContain('lesson/unverified-source')
    expect(codes).toContain('lesson/missing-pages')
  })

  it('flags a unit with an empty title', () => {
    const issues = validateUnit(
      { id: 'u1', slug: 'u1', title: '  ', order: 1, status: 'in-progress', lessons: [] },
      'path',
    )
    expect(issues.map((issue) => issue.code)).toContain('unit/empty-title')
  })

  it('reports a warning — not an error — for a unit without lessons', () => {
    const issues = validateUnit({ id: 'u1', slug: 'u1', title: 'وحدة', order: 1, status: 'in-progress', lessons: [] }, 'path')
    expect(issues).toHaveLength(1)
    expect(issues[0]!.severity).toBe('warning')
    expect(hasErrors(issues)).toBe(false)
  })

  it('accepts a well-formed fixture lesson', () => {
    expect(validateLesson(fixtureLesson, 'fixture')).toEqual([])
  })

  it('treats an unverified or empty source as unusable', () => {
    expect(hasUsableSource(NO_SOURCE)).toBe(false)
    expect(hasUsableSource({ pages: [{ page: '4' }], verified: false })).toBe(false)
    expect(hasUsableSource({ pages: [{ page: '  ' }], verified: true })).toBe(false)
    expect(hasUsableSource(verifiedSource)).toBe(true)
  })

  it('summarises a readability report without inventing values', () => {
    expect(summariseReadability(verifiedSource)).toContain('النص العربي: واضح')
    expect(summariseReadability(NO_SOURCE)).toBe('لم يُسجَّل تقرير وضوح لهذه الصفحات.')
    expect(isFullyReadable(verifiedSource)).toBe(true)
  })

  it('refuses to call a page fully readable when a part is unreadable', () => {
    const partial: SourceReference = {
      pages: [{ page: '7' }],
      verified: true,
      readability: { arabicText: 'clear', diagrams: 'unreadable' },
    }
    expect(isFullyReadable(partial)).toBe(false)
    expect(summariseReadability(partial)).toContain('الأشكال: غير مقروء')
  })

  it('ships the verified chemistry lesson with pages 3–12', () => {
    const lesson = curriculum.chemistry.units[0]!.lessons[0]!
    expect(lesson.source.verified).toBe(true)
    expect(lesson.source.pages.map((page) => page.page)).toEqual(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    expect(lesson.tests?.find((test) => test.id.endsWith('final'))?.questions).toHaveLength(15)
  })

  it('ships the verified physics lesson with pages 55–62', () => {
    expect(curriculum.physics.units).toHaveLength(1)
    const lesson = curriculum.physics.units[0]!.lessons[0]!
    expect(lesson.source.verified).toBe(true)
    expect(lesson.source.pages.map((page) => page.page)).toEqual(['55', '56', '57', '58', '59', '60', '61', '62'])
  })
})
