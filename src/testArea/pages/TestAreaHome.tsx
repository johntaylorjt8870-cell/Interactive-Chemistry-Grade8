import { Link } from 'react-router-dom'

import { routes } from '@/app/navigation'
import { EmptyState } from '@/components/EmptyState'
import { ClipboardCheckGlyph } from '@/components/Icons'
import { listComprehensiveTests, listLessonTests, listUnitTests } from '@/data/testArea/registry'
import { SCOPE_LABELS, type TestDefinition } from '@/data/testArea/types'
import { TestFacts } from '@/testArea/components/BlueprintView'

/* ============================================================================
   Test Area home
   ----------------------------------------------------------------------------
   Three honest lists: lesson tests, unit tests and comprehensive tests. A
   section is rendered only when it has real content, and the comprehensive
   section says plainly why it is empty rather than showing a card that leads
   nowhere — an empty test is never dressed up as a ready one.
   ========================================================================= */

function TestCard({ definition }: { definition: TestDefinition }) {
  const { meta } = definition
  return (
    <article className="ta-card ta-test-card">
      <header className="ta-test-card__head">
        <h3 className="ta-test-card__title">{meta.title}</h3>
        <p className="ta-test-card__summary">{meta.summary}</p>
      </header>

      <TestFacts meta={meta} />

      <div className="ta-test-card__actions">
        <Link className="ta-button ta-button--primary" to={routes.testAreaTest(meta.id)}>
          ابدأ الاختبار
        </Link>
        <Link className="ta-button" to={routes.testAreaSolutions(meta.id)}>
          حلول الاختبار
        </Link>
      </div>
    </article>
  )
}

function Section({
  title,
  description,
  definitions,
}: {
  title: string
  description: string
  definitions: TestDefinition[]
}) {
  if (definitions.length === 0) return null
  return (
    <section className="ta-section" aria-labelledby={`ta-section-${title}`}>
      <h2 className="ta-section__title" id={`ta-section-${title}`}>
        {title}
      </h2>
      <p className="ta-section__description">{description}</p>
      <div className="ta-grid">
        {definitions.map((definition) => (
          <TestCard key={definition.meta.id} definition={definition} />
        ))}
      </div>
    </section>
  )
}

export function TestAreaHome() {
  const lessonTests = listLessonTests()
  const unitTests = listUnitTests()
  const comprehensiveTests = listComprehensiveTests()

  return (
    <div className="container ta-page">
      <header className="ta-page__head">
        <p className="ta-page__eyebrow">الكيمياء · الصف الثامن</p>
        <h1 className="ta-page__title">منطقة الاختبارات</h1>
        <p className="ta-page__lead">
          اختبارات أصلية مبنية على محتوى الكتاب المدرسي المنشور، بأسئلة جديدة لا تكرّر أسئلة
          الدرس ولا أسئلة الكتاب. كل اختبار يتبع مخططاً معلناً يبيّن عدد الأسئلة وتوزيعها وصعوبتها،
          ولكل سؤال حل تعليمي كامل في قسم مستقل هو «حلول الاختبارات».
        </p>

        <ul className="ta-rules">
          <li>لا تظهر أي إجابة أو درجة أو تلميح قبل الضغط على «إرسال الإجابات».</li>
          <li>الإرسال هو ما يطلق التصحيح: درجة، ونسبة، وعدد الصحيح والخطأ وغير المُجاب.</li>
          <li>«إعادة الاختبار» يمحو كل شيء: الإجابات والحالة والنتيجة.</li>
          <li>لا حساب ولا خادم ولا قاعدة بيانات: لا يُخزَّن شيء خارج هذه الجلسة.</li>
        </ul>
      </header>

      <Section
        title={SCOPE_LABELS.lesson}
        description="اختبار لكل درس منشور: عشرون سؤالاً أصلياً تغطّي صفحات الدرس كلها."
        definitions={lessonTests}
      />

      <Section
        title={SCOPE_LABELS.unit}
        description="اختبار للوحدة بمخطط مستقل: أسئلة جديدة تربط دروس الوحدة، لا نسخة من اختبارات الدروس."
        definitions={unitTests}
      />

      {comprehensiveTests.length > 0 ? (
        <Section
          title={SCOPE_LABELS.comprehensive}
          description="اختبار شامل يُنشر فقط حين يكفي المحتوى المنشور لبنائه فعلاً."
          definitions={comprehensiveTests}
        />
      ) : (
        <section className="ta-section" aria-labelledby="ta-section-comprehensive">
          <h2 className="ta-section__title" id="ta-section-comprehensive">
            {SCOPE_LABELS.comprehensive}
          </h2>
          <EmptyState
            title="لا يوجد اختبار شامل منشور بعد"
            tone="pending-source"
            icon={<ClipboardCheckGlyph size={22} />}
          >
            <p>
              الاختبار الشامل لا يُنشر إلا إذا كان المحتوى المنشور في الكتاب يكفي لبنائه أسئلةً
              حقيقية كاملة الحلول. وحين تتوفر صفحات كافية يُبنى مخططه المستقل ويُنشر هنا.
            </p>
          </EmptyState>
        </section>
      )}
    </div>
  )
}
