import type { ReactNode } from 'react'
import type { StepKind } from '@/data/curriculum/schema'
import {
  AlertGlyph,
  BookGlyph,
  CheckGlyph,
  ClipboardCheckGlyph,
  FlaskGlyph,
  InfoGlyph,
  ListGlyph,
  PlayGlyph,
} from '@/components/Icons'

/**
 * Presentation metadata for every step kind.
 *
 * The kind list is the contract between lesson data and the lesson engine:
 * adding a new kind here plus a renderer in `stepRenderers.tsx` is all that is
 * needed to extend the lesson format — no changes to LessonShell/Flow.
 */
export type StepKindMeta = {
  label: string
  /** Shown in the outline under the step title. */
  intention: string
  tone: 'source' | 'explain' | 'practice' | 'interact' | 'assess' | 'reflect'
  icon: (props: { size?: number }) => ReactNode
}

export const STEP_KIND_META: Record<StepKind, StepKindMeta> = {
  source: {
    label: 'المصدر',
    intention: 'نص الكتاب المدرسي كما هو، مع رقم الصفحة',
    tone: 'source',
    icon: BookGlyph,
  },
  explanation: {
    label: 'شرح',
    intention: 'تفكيك المفهوم خطوة بخطوة',
    tone: 'explain',
    icon: ListGlyph,
  },
  example: {
    label: 'مثال',
    intention: 'تطبيق محلول مع طريقة التفكير',
    tone: 'explain',
    icon: ListGlyph,
  },
  experiment: {
    label: 'تجربة',
    intention: 'خطوات عملية وقياسات ونتيجة',
    tone: 'interact',
    icon: FlaskGlyph,
  },
  simulation: {
    label: 'محاكاة',
    intention: 'تغيير متغيّر ومراقبة أثره',
    tone: 'interact',
    icon: PlayGlyph,
  },
  activity: {
    label: 'نشاط',
    intention: 'عمل موجّه بخطوات واضحة',
    tone: 'interact',
    icon: PlayGlyph,
  },
  question: {
    label: 'سؤال',
    intention: 'سؤال موجّه للتفكير',
    tone: 'practice',
    icon: InfoGlyph,
  },
  apply: {
    label: 'تطبيق',
    intention: 'استخدام القانون في حالة جديدة',
    tone: 'practice',
    icon: CheckGlyph,
  },
  note: {
    label: 'ملاحظة',
    intention: 'تنبيه مهم أثناء الشرح',
    tone: 'reflect',
    icon: InfoGlyph,
  },
  'common-error': {
    label: 'خطأ شائع',
    intention: 'خطأ متكرر وطريقة تجنّبه',
    tone: 'reflect',
    icon: AlertGlyph,
  },
  summary: {
    label: 'خلاصة',
    intention: 'تجميع ما تم تعلّمه',
    tone: 'reflect',
    icon: CheckGlyph,
  },
  'final-test': {
    label: 'اختبار نهائي',
    intention: 'اختبار شامل بعد إنهاء الدرس',
    tone: 'assess',
    icon: ClipboardCheckGlyph,
  },
}

export function stepKindLabel(kind: StepKind): string {
  return STEP_KIND_META[kind].label
}
