import {
  SUBJECT_IDS,
  type Curriculum,
  type LessonDefinition,
  type LessonStep,
  type SubjectDefinition,
  type SubjectId,
  type UnitDefinition,
} from './schema'
import { chemistryLesson1 } from './chemistryLesson1'
import { chemistryLesson2 } from './chemistryLesson2'
import { chemistryLesson3 } from './chemistryLesson3'
import { chemistryLesson4 } from './chemistryLesson4'
import { chemistryLesson5 } from './chemistryLesson5'
import { chemistryLesson6 } from './chemistryLesson6'
import { chemistryLesson7 } from './chemistryLesson7'

/* ============================================================================
   Curriculum registry
   ----------------------------------------------------------------------------
   The single place where curriculum structure is declared.

   Currently registered content (all `source-verified`):
   - Chemistry — unit 1 «الكيمياء البنيوية»: lessons 1–7 (pages 3–49), complete.
   Unit 1 is complete: lesson 7 ends on p49 by explicit source approval.
   The validators in @/data/sourceFidelity keep published content honest.
   ========================================================================= */

const CHEMISTRY: SubjectDefinition = {
  id: 'chemistry',
  title: 'الكيمياء',
  latinTitle: 'Chemistry',
  description:
    'مسار الكيمياء للصف الثامن، ويبدأ بالكيمياء البنيوية وبناء فهم دقيق للذرّة والعنصر.',
  motifs: [
    { label: 'ذرات', glyph: 'atom' },
    { label: 'جزيئات', glyph: 'lattice' },
    { label: 'تفاعلات', glyph: 'reaction' },
    { label: 'مختبر', glyph: 'flask' },
  ],
  status: 'source-verified',
  units: [
    {
      id: 'chem-u1',
      slug: 'structural-chemistry',
      title: 'الوحدة الأولى — الكيمياء البنيوية',
      order: 1,
      status: 'source-verified',
      source: { pages: Array.from({ length: 47 }, (_, index) => ({ page: String(index + 3) })), verified: true },
      lessons: [
        chemistryLesson1,
        chemistryLesson2,
        chemistryLesson3,
        chemistryLesson4,
        chemistryLesson5,
        chemistryLesson6,
        chemistryLesson7,
      ],
    },
  ],
}

export const curriculum: Curriculum = {
  chemistry: CHEMISTRY,
}

/* --- Accessors ----------------------------------------------------------- */

export function getSubjectDefinition(id: SubjectId): SubjectDefinition {
  return curriculum[id]
}

export function listSubjects(): SubjectDefinition[] {
  return SUBJECT_IDS.map((id) => curriculum[id])
}

export function listUnits(subject: SubjectId): UnitDefinition[] {
  return curriculum[subject].units
}

export function getUnit(subject: SubjectId, unitSlug: string): UnitDefinition | undefined {
  return curriculum[subject].units.find((unit) => unit.slug === unitSlug)
}

export function getLesson(
  subject: SubjectId,
  unitSlug: string,
  lessonSlug: string,
): LessonDefinition | undefined {
  return getUnit(subject, unitSlug)?.lessons.find((lesson) => lesson.slug === lessonSlug)
}

export function getStep(
  subject: SubjectId,
  unitSlug: string,
  lessonSlug: string,
  stepId: string,
): LessonStep | undefined {
  return getLesson(subject, unitSlug, lessonSlug)?.steps.find((step) => step.id === stepId)
}

/* --- Aggregate state ----------------------------------------------------- */

export type CurriculumStats = {
  units: number
  lessons: number
  steps: number
}

export function curriculumStats(source: Curriculum = curriculum): CurriculumStats {
  let units = 0
  let lessons = 0
  let steps = 0

  for (const subject of Object.values(source)) {
    units += subject.units.length
    for (const unit of subject.units) {
      lessons += unit.lessons.length
      for (const lesson of unit.lessons) steps += lesson.steps.length
    }
  }

  return { units, lessons, steps }
}

/** True when a subject already has units read from the textbook. */
export function isSubjectPopulated(subject: SubjectId): boolean {
  return curriculum[subject].units.length > 0
}

/** True when nothing has been published in the curriculum yet. */
export function isCurriculumEmpty(): boolean {
  const stats = curriculumStats()
  return stats.units === 0 && stats.lessons === 0
}
