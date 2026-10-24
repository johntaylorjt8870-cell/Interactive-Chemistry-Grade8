import { useMemo, useState } from 'react'
import { ElectronConfiguration, Sci, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'
import './lesson1-labs.css'

/* ============================================================================
   Electron shell builder (pages 5–6)
   ----------------------------------------------------------------------------
   Two numbers are kept apart on purpose:

     * the *theoretical capacity* of a level, y = 2(n)²  (K 2, L 8, M 18, N 32);
     * the *occupancy* used by the printed textbook examples, where the lesson
       fills K first and then never puts more than eight electrons in a shell
       (this is the printed rule «السوية الأخيرة لا تحوي أكثر من ثمانية» as it
       is applied in the Ca = 2-8-8-2 example).

   The lab therefore shows the capacity column from the law and the occupancy
   column from the printed examples, and never presents one as the other.
   ========================================================================= */

const LETTERS = ['K', 'L', 'M', 'N'] as const

const theoreticalCapacity = (n: number) => 2 * n * n
/** Occupancy used by the printed examples: K = 2, later shells at most 8. */
const occupancyLimit = (n: number) => (n === 1 ? 2 : 8)

function distribute(electrons: number): number[] {
  const shells: number[] = []
  let remaining = electrons
  for (let n = 1; n <= LETTERS.length && remaining > 0; n += 1) {
    const used = Math.min(occupancyLimit(n), remaining)
    shells.push(used)
    remaining -= used
  }
  return shells
}

const PRESETS = [
  { label: 'H = 1', electrons: 1 },
  { label: 'C = 6', electrons: 6 },
  { label: 'O = 8', electrons: 8 },
  { label: 'Na = 11', electrons: 11 },
  { label: 'Cl = 17', electrons: 17 },
  { label: 'Ca = 20', electrons: 20 },
]

export default function ElectronShellBuilder({ reducedMotion }: InteractiveProps) {
  const [electrons, setElectrons] = useState(11)
  const distribution = useMemo(() => distribute(electrons), [electrons])
  const surface = distribution.at(-1) ?? 0
  const capacityRow = distribution.map((_, index) => theoreticalCapacity(index + 1))

  return (
    <section className="lab" aria-labelledby="shell-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · باني توزيع</p>
          <h3 id="shell-title">ابنِ السويات من الداخل إلى الخارج</h3>
        </div>
        <div className="electron-counter" aria-live="polite">
          <span>الإلكترونات</span>
          <strong>{electrons}</strong>
        </div>
      </header>

      <div
        className={`shell-model ${reducedMotion ? 'shell-model--still' : ''}`}
        aria-label={`التوزع الإلكتروني ${distribution.join('-')}`}
      >
        <div className="shell-model__nucleus">+</div>
        {distribution.map((value, levelIndex) =>
          value > 0 ? (
            <div
              key={LETTERS[levelIndex]}
              className="shell-ring"
              style={{ '--ring': levelIndex + 1 } as React.CSSProperties}
            >
              <span className="shell-ring__label">{LETTERS[levelIndex]}</span>
              {Array.from({ length: value }, (_, index) => (
                <span
                  key={index}
                  className="shell-electron"
                  style={{ '--angle': `${(360 / value) * index}deg` } as React.CSSProperties}
                />
              ))}
            </div>
          ) : null,
        )}
      </div>

      <div className="lab__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setElectrons((value) => Math.max(1, value - 1))}
          disabled={electrons === 1}
        >
          − إلكترون
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => setElectrons((value) => Math.min(20, value + 1))}
          disabled={electrons === 20}
        >
          + إلكترون
        </button>
        <button type="button" className="button button--quiet" onClick={() => setElectrons(11)}>
          <ScientificNotationText>إعادة الضبط (Na = 11)</ScientificNotationText>
        </button>
      </div>

      <div className="atom-presets" role="group" aria-label="أمثلة من الدرس">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="button button--quiet button--small"
            onClick={() => setElectrons(preset.electrons)}
          >
            <Sci variant="plain">{preset.label}</Sci>
          </button>
        ))}
      </div>

      <div className="lab__measurements">
        <div>
          <span>التوزع</span>
          <strong>
            <ElectronConfiguration value={distribution.join('-')} />
          </strong>
        </div>
        <div>
          <span>عدد السويات المشغولة</span>
          <strong>{distribution.length}</strong>
        </div>
        <div>
          <span>إلكترونات السوية الأخيرة</span>
          <strong>{surface}</strong>
        </div>
      </div>

      <table className="capacity-table">
        <caption><ScientificNotationText>مقارنة: السعة النظرية y = 2(n)² مقابل الإشغال في أمثلة الكتاب</ScientificNotationText></caption>
        <thead>
          <tr>
            <th scope="col">السوية</th>
            <th scope="col">n</th>
            <th scope="col">السعة النظرية 2(n)²</th>
            <th scope="col">الحد المطبق في الدرس</th>
            <th scope="col">الإلكترونات فعلاً</th>
          </tr>
        </thead>
        <tbody>
          {distribution.map((value, index) => (
            <tr key={LETTERS[index]}>
              <th scope="row">{LETTERS[index]}</th>
              <td dir="ltr">{index + 1}</td>
              <td dir="ltr">{capacityRow[index]}</td>
              <td dir="ltr">{occupancyLimit(index + 1)}</td>
              <td dir="ltr">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="lab__conclusion">
        <strong>الملاحظة:</strong> لا ينتقل الإلكترون إلى السوية التالية قبل إشغال السابقة وفق النموذج المبسّط في
        الدرس. للصوديوم: <bdi dir="ltr">K(2), L(8), M(1)</bdi>، وللكالسيوم: <bdi dir="ltr">2-8-8-2</bdi>. لاحظ أن
        سعة M النظرية 18، لكن الدرس لا يضع فيها أكثر من ثمانية في الأمثلة المطبوعة.
      </p>
    </section>
  )
}
