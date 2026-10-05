import {
  COGNITIVE_LABELS,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  SCOPE_LABELS,
  type TestBlueprint,
  type TestMeta,
} from '@/data/testArea/types'
import { formatPageRefs } from '@/data/testArea/curriculumScope'

/* ============================================================================
   BlueprintView — the auditable design of a test, shown to the student
   ----------------------------------------------------------------------------
   A blueprint is not an answer key: it says how many questions there are, what
   they cover, how hard they are and which types they use. It is safe to show
   before the attempt (it reveals no answer) and it makes the test reviewable:
   a teacher can check the spread against the lesson without opening a single
   question.
   ========================================================================= */

function Chip({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <span className={`ta-chip${tone ? ` ta-chip--${tone}` : ''}`}>{children}</span>
}

/** Compact facts for a card, built from the eagerly-shipped metadata. */
export function TestFacts({ meta }: { meta: TestMeta }) {
  return (
    <div className="ta-facts">
      <Chip tone="scope">{SCOPE_LABELS[meta.scope]}</Chip>
      <Chip>{meta.questionCount} سؤالاً</Chip>
      <Chip>الصفحات {meta.pageRange}</Chip>
      {DIFFICULTIES.filter((level) => meta.difficulty[level] > 0).map((level) => (
        <Chip key={level} tone={level}>
          {DIFFICULTY_LABELS[level]} {meta.difficulty[level]}
        </Chip>
      ))}
    </div>
  )
}

/** The full blueprint: difficulty, types, cognitive demand, coverage, errors. */
export function BlueprintView({ blueprint }: { blueprint: TestBlueprint }) {
  const usedTypes = QUESTION_TYPES.filter((type) => blueprint.types[type] > 0)
  const cognitive = (Object.keys(blueprint.cognitive) as Array<keyof typeof blueprint.cognitive>)
    .filter((key) => blueprint.cognitive[key] > 0)

  return (
    <div className="ta-blueprint">
      <div className="ta-blueprint__grid">
        <section className="ta-blueprint__block">
          <h4 className="ta-blueprint__title">توزيع الصعوبة</h4>
          <ul className="ta-blueprint__list">
            {DIFFICULTIES.map((level) => (
              <li key={level}>
                <span className={`ta-dot is-${level}`} aria-hidden="true" />
                <span className="ta-blueprint__key">{DIFFICULTY_LABELS[level]}</span>
                <span className="ta-blueprint__value">{blueprint.difficulty[level]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ta-blueprint__block">
          <h4 className="ta-blueprint__title">أنواع الأسئلة</h4>
          <ul className="ta-blueprint__list">
            {usedTypes.map((type) => (
              <li key={type}>
                <span className="ta-dot is-type" aria-hidden="true" />
                <span className="ta-blueprint__key">{QUESTION_TYPE_LABELS[type]}</span>
                <span className="ta-blueprint__value">{blueprint.types[type]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ta-blueprint__block">
          <h4 className="ta-blueprint__title">المطالب المعرفية</h4>
          <ul className="ta-blueprint__list">
            {cognitive.map((key) => (
              <li key={key}>
                <span className="ta-dot is-cognitive" aria-hidden="true" />
                <span className="ta-blueprint__key">{COGNITIVE_LABELS[key]}</span>
                <span className="ta-blueprint__value">{blueprint.cognitive[key]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="ta-blueprint__block ta-blueprint__block--wide">
        <h4 className="ta-blueprint__title">المفاهيم المقيسة</h4>
        <ul className="ta-blueprint__concepts">
          {blueprint.concepts.map((concept) => (
            <li key={concept.id}>
              <span className="ta-blueprint__key">{concept.label}</span>
              <span className="ta-blueprint__meta">
                {concept.questionIds.length} سؤالاً · الصفحات{' '}
                {formatPageRefs(concept.pageRefs)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ta-blueprint__block ta-blueprint__block--wide">
        <h4 className="ta-blueprint__title">سياسة التصحيح</h4>
        <p className="ta-blueprint__policy">
          {blueprint.scoring.allowPartial
            ? 'تُحتسب الدرجات الجزئية في الاختيار المتعدد والترتيب والمطابقة: الاختيار المتعدد يساوي (الإجابات الصحيحة المحددة − الخيارات الخاطئة) ÷ عدد الإجابات الصحيحة، والترتيب يساوي نسبة المواضع الصحيحة، والمطابقة تساوي نسبة الأزواج الصحيحة. تُحصر النتيجة بين صفر وواحد.'
            : 'لا توجد درجات جزئية في هذا الاختبار؛ الاختيار المتعدد والترتيب والمطابقة تُحتسب صحيحة فقط عند اكتمال الإجابة.'}
        </p>
      </section>

      <section className="ta-blueprint__block ta-blueprint__block--wide">
        <h4 className="ta-blueprint__title">الأخطاء الشائعة التي يستهدفها الاختبار</h4>
        <ul className="ta-blueprint__concepts">
          {blueprint.commonErrors.map((error) => (
            <li key={error.id}>
              <span className="ta-blueprint__key">{error.label}</span>
              <span className="ta-blueprint__meta">{error.questionIds.length} سؤالاً</span>
            </li>
          ))}
        </ul>
      </section>

      {blueprint.crossTopicConnections && blueprint.crossTopicConnections.length > 0 ? (
        <section className="ta-blueprint__block ta-blueprint__block--wide">
          <h4 className="ta-blueprint__title">الروابط بين الدروس</h4>
          <ul className="ta-blueprint__concepts">
            {blueprint.crossTopicConnections.map((connection) => (
              <li key={connection.label}>
                <span className="ta-blueprint__key">{connection.label}</span>
                <span className="ta-blueprint__meta">
                  {connection.questionIds.length} سؤالاً
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
