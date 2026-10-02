import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { physicsLesson1, bookQuestions, bookActivitySolutions, finalTest } from '@/data/curriculum/physicsLesson1'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { chemistryLesson2 } from '@/data/curriculum/chemistryLesson2'
import { readProjectFile } from './utils/projectFiles'
import type { ContentBlock, LessonDefinition, LessonStep } from '@/data/curriculum/schema'

/* ============================================================================
   Source-visual fidelity contract — Physics Unit 2 Lesson 1 (pp. 55–62).
   ----------------------------------------------------------------------------
   The textbook's original visuals (the p.55 parachutist photo and the printed
   figures) are NOT available as repository assets: the page scans only ever
   existed as conversation attachments in the source session. A missing source
   image is preferable to a fabricated textbook image. These tests pin that:

   - no curriculum data claims a textbook image without a real repo asset;
   - no substitute/external images were smuggled in;
   - every platform interactive reconstruction is labelled as a platform
     addition («تجربة/محاكاة تفاعلية من المنصة»), never as the textbook figure;
   - every lesson-side description of an unavailable printed figure states its
     printed page and that the original is unavailable;
   - the source-readability report classifies every visual of pp. 55–62.
   ========================================================================= */

const CURRICULUM_FILES = [
  'src/data/curriculum/physicsLesson1.ts',
  'src/data/curriculum/chemistryLesson1.ts',
  'src/data/curriculum/chemistryLesson2.ts',
]

const ALL_LESSONS: LessonDefinition[] = [physicsLesson1, chemistryLesson1, chemistryLesson2]

function allBlocks(lesson: LessonDefinition): ContentBlock[] {
  return lesson.steps.flatMap((step: LessonStep) => step.blocks)
}

function stepById(id: string): LessonStep {
  const step = physicsLesson1.steps.find((candidate) => candidate.id === id)
  expect(step, `missing step ${id}`).toBeDefined()
  return step!
}

describe('no textbook image is claimed without an actual source asset', () => {
  it('never embeds a source-image block with a fabricated or missing file', () => {
    for (const lesson of ALL_LESSONS) {
      for (const block of allBlocks(lesson)) {
        if (block.kind !== 'source-image') continue
        // Real assets only: a source scan must exist as a repository file.
        expect(block.src, `${lesson.id} source-image src`).not.toMatch(/^https?:\/\//)
        expect(existsSync(resolve(process.cwd(), block.src)), `${lesson.id} references missing asset ${block.src}`).toBe(true)
      }
    }
  })

  it('physics lesson 1 contains no substitute image for the unavailable textbook visuals', () => {
    const file = readProjectFile('src/data/curriculum/physicsLesson1.ts')
    // The originals are unavailable → the lesson must not pretend otherwise.
    expect(file).not.toContain("kind: 'source-image'")
    expect(file).not.toMatch(/\.(png|jpe?g|webp|gif|svg)['"]/i)
  })

  it('introduces no external or random image URLs anywhere in curriculum data', () => {
    for (const path of CURRICULUM_FILES) {
      const file = readProjectFile(path)
      expect(file, path).not.toMatch(/https?:\/\//)
      expect(file, path).not.toMatch(/src:\s*['"][^'"]+\.(png|jpe?g|webp|gif)/i)
    }
  })

  it('keeps the textbook verbatim figure reference of page 56 intact', () => {
    const allText = JSON.stringify(physicsLesson1)
    expect(allText).toContain('بمنتصف الخيط كما في الشكل')
  })
})

describe('platform reconstructions are labelled, never presented as textbook figures', () => {
  const LAB_STEPS: Array<{ id: string; interactiveId: string; marker: string }> = [
    { id: 'concurrent-lab', interactiveId: 'concurrent-forces-lab', marker: 'تجربة تفاعلية من المنصة' },
    { id: 'parallelogram-lab-step', interactiveId: 'parallelogram-lab', marker: 'محاكاة تفاعلية من المنصة' },
    { id: 'components-lab', interactiveId: 'force-components-lab', marker: 'محاكاة تفاعلية من المنصة' },
  ]

  it.each(LAB_STEPS)('$id is platform material with an explicit reconstruction callout', ({ id, interactiveId, marker }) => {
    const step = stepById(id)
    expect(step.attribution).toBe('platform')
    const texts = JSON.stringify(step.blocks)
    expect(texts).toContain(marker)
    // the callout states the printed original is unavailable
    expect(texts).toContain('غير متوفر')
    expect(texts).toMatch(/لا صو(رة|ر) الكتاب/)
    // the interactive itself is registered and captioned as a platform addition
    const interactive = step.blocks.find((block) => block.kind === 'interactive')
    expect(interactive).toBeDefined()
    if (interactive?.kind === 'interactive') {
      expect(interactive.interactiveId).toBe(interactiveId)
      expect(interactive.caption ?? '').toContain('من المنصة')
    }
  })

  it('the figure descriptions state their printed page and that the original is unavailable', () => {
    const parachutist = stepById('entry-parachute').blocks.find(
      (block) => block.kind === 'paragraph' && block.text.includes('مظلّي'),
    )
    expect(parachutist, 'p55 parachutist note').toBeDefined()
    if (parachutist?.kind === 'paragraph') {
      expect(parachutist.attribution).toBe('platform')
      expect(parachutist.text).toContain('الصفحة 55')
      expect(parachutist.text).toContain('غير متوفرة')
      expect(parachutist.text).toContain('لا تُعرض هنا أي صورة بديلة')
    }

    const springFigure = stepById('concurrent-experiment').blocks.find(
      (block) => block.kind === 'paragraph' && block.text.includes('شكل التجربة'),
    )
    expect(springFigure, 'p56 figure note').toBeDefined()
    if (springFigure?.kind === 'paragraph') {
      expect(springFigure.attribution).toBe('platform')
      expect(springFigure.text).toContain('الصفحة 56')
      expect(springFigure.text).toContain('غير متوفرَين')
      expect(springFigure.text).toContain('شكل الاستنتاج')
    }

    const inclineFigure = stepById('incline-activity').blocks.find(
      (block) => block.kind === 'paragraph' && block.text.includes('شكل النشاط'),
    )
    expect(inclineFigure, 'p60 incline figure note').toBeDefined()
    if (inclineFigure?.kind === 'paragraph') {
      expect(inclineFigure.attribution).toBe('platform')
      expect(inclineFigure.text).toContain('الصفحة 60')
      expect(inclineFigure.text).toContain('غير متوفر')
      expect(inclineFigure.text).toContain('R⃗')
    }
  })
})

describe('source-image UI always states textbook origin', () => {
  it('renders textbook scans with «من الكتاب المدرسي — الصفحة X», never as generic platform art', () => {
    // 1×1 transparent GIF: an inline, self-contained stand-in so the label can
    // be asserted without requiring any repository image asset to exist.
    const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    const { container } = render(
      <ContentBlocks
        blocks={[
          {
            kind: 'source-image',
            src: TRANSPARENT_GIF,
            alt: 'اختبار',
            source: { page: '56', item: 'شكل التجربة' },
          },
        ]}
      />,
    )
    const figure = container.querySelector('figure.source-image')!
    expect(figure).toHaveAttribute('data-origin', 'textbook')
    expect(figure.querySelector('.source-image__ref')?.textContent).toContain('من الكتاب المدرسي — الصفحة 56')
  })
})

describe('source report classifies every textbook visual of pp. 55–62', () => {
  const report = readProjectFile('docs/source-reports/physics-lesson1-concurrent-forces-readability.md')

  it('records that the original page images are unavailable as repository assets', () => {
    expect(report).toContain('جرد الأشكال المصوّرة وتصنيف أصلها')
    expect(report).toContain('لم تُحفظ في مساحة المستودع قط')
    expect(report).toContain('لا يمكن عرض أي شكل من الكتاب كصورة مصدرية')
  })

  it('classifies the named visuals and maps each page to its platform treatment', () => {
    expect(report).toContain('مظلّيٌّ يهبط بمظلّة حمراء–صفراء')
    expect(report).toContain('شكل التجربة: ربيعتان')
    expect(report).toContain('الصفحة 59')
    expect(report).toContain('شكل نشاط المستوي المائل')
    // one classification row per printed page 55..62
    for (const page of ['55', '56', '57', '58', '59', '60', '61', '62']) {
      expect(report, `missing row for page ${page}`).toMatch(new RegExp(`\\| ${page} \\|`))
    }
    // B (unavailable) and C (platform reconstruction) are distinguished
    expect(report).toContain('ب + جـ')
    expect(report).toContain('إعادة بناء لا صورة الكتاب')
  })

  it('states that no substitute images were introduced', () => {
    expect(report).toContain('لم تُضَف أي صورة إلى الدرس')
    expect(report).toContain('لم تُستخدم أي صور إنترنت أو صور مولّدة')
    expect(report).toContain('source-image')
  })
})

describe('book source material around the visuals remains complete', () => {
  it('keeps all book questions, activity solutions and the final test untouched in count and origin', () => {
    expect(bookQuestions).toHaveLength(8)
    expect(bookActivitySolutions).toHaveLength(7)
    expect(finalTest.questions).toHaveLength(14)
    expect(bookQuestions.every((question) => question.origin === 'textbook')).toBe(true)
  })
})
