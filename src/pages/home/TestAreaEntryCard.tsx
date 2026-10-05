import { Link } from 'react-router-dom'
import { ClipboardCheckGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'

/** A student-facing homepage card for the independent Test Area. */
export function TestAreaEntryCard() {
  return (
    <section className="section" aria-labelledby="test-area-entry-title">
      <div className="container">
        <article className="ta-card test-area-entry-card">
          <div className="test-area-entry-card__icon" aria-hidden="true">
            <ClipboardCheckGlyph size={24} />
          </div>
          <div className="test-area-entry-card__body">
            <p className="eyebrow">منطقة مستقلة للطالب</p>
            <h2 className="test-area-entry-card__title" id="test-area-entry-title">
              منطقة الاختبارات
            </h2>
            <p className="test-area-entry-card__text">
              اختبارات أصلية للدرس والوحدة، بمخططات معلنة وحلول تعليمية منفصلة عن مساحة المعلم.
            </p>
          </div>
          <Link className="button button--primary" to={routes.testArea}>
            دخول منطقة الاختبارات
          </Link>
        </article>
      </div>
    </section>
  )
}
