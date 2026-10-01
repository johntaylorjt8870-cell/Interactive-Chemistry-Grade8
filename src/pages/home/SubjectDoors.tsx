import { Link } from 'react-router-dom'
import { ChemistryGlyph, HourglassGlyph, PhysicsGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { getSubjectDefinition } from '@/data/curriculum/registry'
import { contentStatusLabel } from '@/data/source'
import type { SubjectId } from '@/data/curriculum/schema'

const GLYPHS = {
  physics: PhysicsGlyph,
  chemistry: ChemistryGlyph,
} as const

/**
 * The two entry points of the platform.
 *
 * Physics and Chemistry each have their own accent identity, illustration and
 * motif set, while typography, spacing, button behaviour and accessibility are
 * identical — one platform, one book, two tracks.
 *
 * Motifs are explicitly labelled as visual identity: they are not curriculum
 * units, and no unit or lesson is invented to fill the space.
 */
export function SubjectDoors() {
  return (
    <div className="doors">
      <SubjectDoor subject="physics" />
      <SubjectDoor subject="chemistry" />
    </div>
  )
}

function SubjectDoor({ subject }: { subject: SubjectId }) {
  const definition = getSubjectDefinition(subject)
  const Glyph = GLYPHS[subject]
  const lessonsAvailable = definition.units.length

  return (
    <section
      className="door"
      data-subject={subject}
      aria-labelledby={`door-${subject}-title`}
    >
      <div className="door__visual" aria-hidden="true">
        <Glyph size={54} />
        <span className="door__pattern" data-subject={subject} />
      </div>

      <div className="door__content">
        <p className="door__eyebrow">
          <span className="door__latin" dir="ltr">
            {definition.latinTitle}
          </span>
          <span className="door__dot" aria-hidden="true" />
          <span>مسار مستقل بهوية بصرية خاصة</span>
        </p>

        <h3 className="door__title" id={`door-${subject}-title`}>
          {definition.title}
        </h3>

        <p className="door__description">{definition.description}</p>

        <div className="door__motifs">
          <p className="door__motifs-label">رموز الهوية البصرية (ليست وحدات دراسية)</p>
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
            المحتوى: {contentStatusLabel(definition.status)} · عدد الوحدات المنشورة: {lessonsAvailable}
          </span>
        </p>

        <Link className="button button--primary door__cta" to={routes.subject(subject)}>
          الدخول إلى مسار {definition.title}
        </Link>
      </div>
    </section>
  )
}
