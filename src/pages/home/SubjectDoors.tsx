import { Link } from 'react-router-dom'
import { ChemistryGlyph, HourglassGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { getSubjectDefinition } from '@/data/curriculum/registry'
import { contentStatusLabel } from '@/data/source'

/** The single Chemistry course entry point. */
export function SubjectDoors() {
  const subject = 'chemistry' as const
  const definition = getSubjectDefinition(subject)

  return (
    <div className="doors">
      <section className="door" data-subject={subject} aria-labelledby="door-chemistry-title">
        <div className="door__visual" aria-hidden="true">
          <ChemistryGlyph size={54} />
          <span className="door__pattern" data-subject={subject} />
        </div>

        <div className="door__content">
          <p className="door__eyebrow">
            <span className="door__latin" dir="ltr">{definition.latinTitle}</span>
            <span className="door__dot" aria-hidden="true" />
            <span>منهج الصف الثامن</span>
          </p>

          <h3 className="door__title" id="door-chemistry-title">
            {definition.title}
          </h3>

          <p className="door__description">{definition.description}</p>

          <div className="door__motifs">
            <p className="door__motifs-label">رموز كيميائية تعريفية، وليست وحدات دراسية</p>
            <ul className="door__motif-list">
              {definition.motifs.map((motif) => (
                <li key={motif.label} className="motif-chip">
                  <span className="motif-chip__mark" aria-hidden="true" data-glyph={motif.glyph} />
                  {motif.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="door__status">
            <HourglassGlyph size={16} />
            <span>
              المحتوى: {contentStatusLabel(definition.status)} · عدد الوحدات المنشورة: {definition.units.length}
            </span>
          </p>

          <Link className="button button--primary door__cta" to={routes.chemistry}>
            الدخول إلى مسار الكيمياء
          </Link>
        </div>
      </section>
    </div>
  )
}
