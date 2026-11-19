import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { listSubjects } from '@/data/curriculum/registry'
import type { LessonDefinition, StudentNotebook } from '@/data/curriculum/schema'
import {
  NOTEBOOK_SOURCES_APPENDIX_CAPTION,
  collectNotebookBodyItems,
  toArabicIndicNumber,
  validateCurriculum,
  validateLesson,
  validateStudentNotebook,
} from '@/data/sourceFidelity'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderWithTheme } from './utils/renderApp'

function makeFutureNotebook(overrides: Partial<StudentNotebook> = {}): StudentNotebook {
  return {
    title: 'دفتر الطالب — درس مستقبلي نموذجي',
    introduction: 'ملخّص كامل للمراجعة والطباعة وفق المعيار الدائم للمنصّة.',
    source: {
      pages: [{ page: '60', scanId: 'p60.png' }, { page: '61', scanId: 'p61.png' }],
      verified: false,
      readability: { notes: 'أُسنِدت البنود إلى سجلّ المصدر المعتمد مع عدم إرفاق المسوح الكاملة.' },
    },
    hidePageTagsInBody: true,
    sections: [
      {
        id: 'concepts',
        title: 'المفاهيم والأهداف',
        definitions: [
          { term: '١ ـ المحلول المائيّ', text: 'مزيج متجانس يكون الماء هو المذيب فيه.', source: '' },
        ],
        points: [
          '٢ ـ يميّز الطّالب بين المذاب والمذيب في المحاليل اليوميّة.',
          '٣ ـ حلّ السّؤال التّطبيقيّ: الملح هو المذاب والماء هو المذيب.',
        ],
        notes: [
          {
            text: '٤ ـ علاقة التّركيز الكتليّ للمحلول:',
            notation: 'math',
            tex: String.raw`C = \frac{m}{V}`,
          },
        ],
        table: {
          caption: '٥ ـ مقارنة مكوّنَي المحلول المائيّ',
          columns: [
            { key: 'role', header: 'المكوّن', rowHeader: true },
            { key: 'example', header: 'مثال' },
          ],
          rows: [
            { id: 'r1', cells: { role: 'المذيب', example: 'الماء H₂O' } },
            { id: 'r2', cells: { role: 'المذاب', example: 'كلوريد الصّوديوم NaCl' } },
          ],
        },
      },
    ],
    checklist: {
      title: 'مراجعة ذاتيّة',
      items: ['أعرّف المحلول المائيّ وأحسب تركيزه الكتليّ.'],
    },
    sourcesAppendix: {
      caption: NOTEBOOK_SOURCES_APPENDIX_CAPTION,
      rows: [
        { item: '١', kind: 'تعريف', classification: 'من الكتاب بحسب السجل المعتمد', source: 'تعريف المحلول', page: '60' },
        { item: '٢', kind: 'شرح', classification: 'إضافة منصة — شرح تعليمي', source: 'شرح الدرس المستقبلي', page: '60' },
        { item: '٣', kind: 'حل سؤال', classification: 'حل تعليمي لسؤال الكتاب (إضافة منصة)', source: 'حل سؤال أختبر نفسي', page: '61' },
        { item: '٤', kind: 'قانون', classification: 'من الكتاب بحسب السجل المعتمد', source: 'صندوق القانون', page: '60' },
        { item: '٥', kind: 'جدول', classification: 'من الكتاب بحسب السجل المعتمد', source: 'جدول المكوّنات', page: '61' },
      ],
    },
    ...overrides,
  }
}

function makeFutureLesson(
  notebook: StudentNotebook | undefined = makeFutureNotebook(),
  overrides: Partial<LessonDefinition> = {},
): LessonDefinition {
  return {
    id: 'chem-u2-l1',
    slug: 'aqueous-solutions',
    title: 'المحاليل المائيّة',
    order: 1,
    status: 'source-verified',
    source: {
      pages: [{ page: '60', scanId: 'p60.png' }, { page: '61', scanId: 'p61.png' }],
      verified: true,
    },
    steps: [
      {
        id: 'step-1',
        kind: 'source',
        title: 'المحلول المائيّ',
        attribution: 'textbook',
        source: { pages: [{ page: '60', scanId: 'p60.png' }], verified: true },
        blocks: [
          { kind: 'definition', term: 'المحلول المائيّ', text: 'مزيج متجانس.', attribution: 'textbook' },
          { kind: 'formula', tex: String.raw`C = \frac{m}{V}`, display: 'block', attribution: 'textbook' },
        ],
      },
      {
        id: 'step-2',
        kind: 'question',
        title: 'أختبر نفسي',
        attribution: 'mixed',
        source: { pages: [{ page: '61', scanId: 'p61.png' }], verified: true },
        blocks: [
          {
            kind: 'table',
            caption: 'جدول المكوّنات',
            columns: [{ key: 'a', header: 'المكوّن' }],
            rows: [{ id: 'r1', cells: { a: 'الماء' } }],
            attribution: 'textbook',
          },
          { kind: 'question', questionId: 'u2-l1-q1' },
        ],
      },
    ],
    studentNotebook: notebook,
    tests: [
      {
        id: 'chem-u2-l1-book',
        lessonId: 'chem-u2-l1',
        origin: 'platform',
        status: 'source-verified',
        targetQuestionCount: { min: 1, max: 1 },
        questions: [
          {
            id: 'u2-l1-q1',
            type: 'short-answer',
            origin: 'textbook',
            source: { page: '61', item: 'سؤال 1' },
            prompt: 'حدّد المذاب والمذيب في الماء المالح.',
            referenceAnswer: 'الملح مذاب والماء مذيب.',
            explanation: 'حل مرجعي من المنصة.',
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('permanent platform standard — Student Notebook (دفتر الطالب)', () => {
  it('validates the entire registered curriculum and guarantees every source-verified lesson has a notebook', () => {
    expect(validateCurriculum()).toEqual([])
    const verifiedLessons = listSubjects()
      .flatMap((subject) => subject.units)
      .flatMap((unit) => unit.lessons)
      .filter((lesson) => lesson.status === 'source-verified')

    expect(verifiedLessons.length).toBeGreaterThanOrEqual(7)
    for (const lesson of verifiedLessons) {
      expect(lesson.studentNotebook, `${lesson.id} must define studentNotebook`).toBeDefined()
      expect(validateLesson(lesson, lesson.id)).toEqual([])
    }
  })

  it('enforces strict 1-to-1 numbered item provenance on Lesson 6, Lesson 7, and all future lessons', () => {
    const strictLessons = listSubjects()
      .flatMap((subject) => subject.units)
      .flatMap((unit) => unit.lessons)
      .filter((lesson) => lesson.order >= 6 && lesson.status === 'source-verified')

    expect(strictLessons.map((lesson) => lesson.id)).toEqual(
      expect.arrayContaining(['chem-u1-l6', 'chem-u1-l7']),
    )

    for (const lesson of strictLessons) {
      const nb = lesson.studentNotebook!
      expect(nb.hidePageTagsInBody).toBe(true)
      expect(nb.sourcesAppendix?.caption).toBe(NOTEBOOK_SOURCES_APPENDIX_CAPTION)
      const bodyItems = collectNotebookBodyItems(nb)
      const rows = nb.sourcesAppendix!.rows
      expect(rows).toHaveLength(bodyItems.length)
      expect(rows.map((r) => r.item)).toEqual(bodyItems.map((_, idx) => toArabicIndicNumber(idx + 1)))

      const { container, unmount } = renderWithTheme(<StudentNotebookView notebook={nb} />)
      expect(container.querySelectorAll('.student-notebook__sources')).toHaveLength(1)
      expect(container.querySelectorAll('.student-notebook__sources tbody tr')).toHaveLength(bodyItems.length)
      unmount()
    }
  })

  it('rejects any new source-verified lesson without a studentNotebook while allowing awaiting-source placeholders', () => {
    const missing = validateLesson(
      makeFutureLesson(undefined, { studentNotebook: undefined }),
      'chem-u2-l1',
    )
    expect(missing.map((issue) => issue.code)).toContain('lesson/missing-student-notebook')

    const placeholder = validateLesson(
      makeFutureLesson(undefined, {
        status: 'awaiting-source',
        studentNotebook: undefined,
        source: { pages: [], verified: false },
        steps: [],
        tests: [],
      }),
      'chem-u2-l2',
    )
    expect(placeholder).toEqual([])
  })

  it('accepts a compliant future lesson (both quantitative and conceptual-only) with zero issues', () => {
    expect(validateLesson(makeFutureLesson(), 'chem-u2-l1')).toEqual([])

    // Conceptual lesson with no formulas, tables, or textbook figures adapts dynamically without forced sections.
    const conceptualNotebook: StudentNotebook = {
      title: 'دفتر الطالب — درس مفاهيمي',
      introduction: 'ملخّص مفاهيمي كامل للمراجعة والطباعة.',
      source: { pages: [{ page: '70', scanId: 'p70.png' }], verified: true },
      hidePageTagsInBody: true,
      sections: [
        {
          id: 'intro',
          title: 'المفهوم الرّئيس',
          points: ['١ ـ تغيّر فيزيائيّ يحفظ هويّة المادّة الأصليّة.'],
        },
      ],
      sourcesAppendix: {
        caption: NOTEBOOK_SOURCES_APPENDIX_CAPTION,
        rows: [
          { item: '١', kind: 'فكرة رئيسة', classification: 'من الكتاب', source: 'فقرة التمهيد', page: '70' },
        ],
      },
    }
    const conceptualLesson = makeFutureLesson(conceptualNotebook, {
      id: 'chem-u2-l3',
      source: { pages: [{ page: '70', scanId: 'p70.png' }], verified: true },
      steps: [
        {
          id: 's1',
          kind: 'source',
          title: 'تمهيد',
          attribution: 'textbook',
          source: { pages: [{ page: '70', scanId: 'p70.png' }], verified: true },
          blocks: [{ kind: 'paragraph', text: 'تغيّر فيزيائيّ.', attribution: 'textbook' }],
        },
      ],
      tests: [],
    })
    expect(validateLesson(conceptualLesson, 'chem-u2-l3')).toEqual([])
  })

  it('catches inline page numbers, source tags, unnumbered items, interactive figures, missing pages, and misattributions', () => {
    const base = makeFutureLesson()

    // 1. Inline page number + inline source tag + visible page tags
    const noisy = makeFutureNotebook({
      hidePageTagsInBody: false,
      sections: [
        {
          ...base.studentNotebook!.sections[0]!,
          source: 'ص 60',
          definitions: [
            { term: '١ ـ المحلول (ص 60)', text: '[نص الكتاب] مزيج متجانس.\u202B', source: 'المصدر ص60' },
          ],
          figures: [
            { id: 'bad-fig', kind: 'interactive', interactiveId: 'sim-1', caption: '٦ ـ محاكاة', reconstruction: true },
          ],
        },
      ],
    })
    const noisyCodes = validateStudentNotebook(noisy, base, 'nb').map((issue) => issue.code)
    expect(noisyCodes).toEqual(
      expect.arrayContaining([
        'notebook/page-tags-visible',
        'notebook/section-source-in-body',
        'notebook/visible-definition-source',
        'notebook/inline-page-reference',
        'notebook/inline-source-tag',
        'notebook/bidi-control-char',
        'notebook/non-static-figure',
        'notebook/source-row-mismatch',
      ]),
    )

    // 2. Missing appendix & wrong caption & unverified without notes
    const noAppendixCodes = validateStudentNotebook(
      makeFutureNotebook({
        source: { pages: [{ page: '60' }], verified: false },
        sourcesAppendix: undefined,
      }),
      base,
      'nb',
    ).map((issue) => issue.code)
    expect(noAppendixCodes).toEqual(
      expect.arrayContaining([
        'notebook/uncovered-lesson-page',
        'notebook/unexplained-unverified-source',
        'notebook/missing-sources-appendix',
      ]),
    )

    // 3. Textbook row missing page, platform row claimed as textbook, missing page 61 & missing solutions
    const badRows = makeFutureNotebook({
      sourcesAppendix: {
        caption: 'ملحق مختلف',
        rows: [
          { item: '١', kind: 'تعريف', classification: 'من الكتاب', source: 'تعريف', page: '—' },
          { item: '٢', kind: 'شرح', classification: 'نص الكتاب', source: 'إضافة منصة — شرح', page: '60' },
          { item: '٣', kind: 'ملاحظة', classification: 'إضافة منصة', source: 'شرح عام', page: '—' },
          { item: '٤', kind: 'قانون', classification: 'من الكتاب', source: 'قانون', page: '60' },
          { item: '٥', kind: 'جدول', classification: 'من الكتاب', source: '', page: '60' },
        ],
      },
    })
    const badRowCodes = validateStudentNotebook(badRows, base, 'nb').map((issue) => issue.code)
    expect(badRowCodes).toEqual(
      expect.arrayContaining([
        'notebook/sources-caption',
        'notebook/textbook-row-missing-page',
        'notebook/platform-claimed-as-textbook',
        'notebook/incomplete-source-row',
        'notebook/uncovered-source-page',
        'notebook/missing-question-solutions',
      ]),
    )
  })

  it('documents the permanent Student Notebook rule across official repository guides', () => {
    const addingLessons = readFileSync('docs/ADDING_LESSONS.md', 'utf8')
    const sourceFidelity = readFileSync('docs/SOURCE_FIDELITY.md', 'utf8')
    const readme = readFileSync('README.md', 'utf8')

    for (const doc of [addingLessons, sourceFidelity, readme]) {
      expect(doc).toContain('studentNotebook')
      expect(doc).toContain(NOTEBOOK_SOURCES_APPENDIX_CAPTION)
    }
    expect(addingLessons).toContain('validateStudentNotebook')
    expect(sourceFidelity).toContain('lesson/missing-student-notebook')
    expect(readme).toContain('chemistryLesson7Notebook.ts')
  })
})
