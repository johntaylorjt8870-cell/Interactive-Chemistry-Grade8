import type { InteractiveProps } from './registry'
import './lesson5-labs.css'

/**
 * Schematic SVG reconstruction of the two-pan balance figure on page 30:
 * «المتفاعلات» CH3COOH + NaHCO3 (حمض الخل + بيكربونات الصوديوم) balanced
 * against «النواتج» CH3COONa + H2O + CO2, with the printed atom counts
 * 3C / 5H / 5O / 1Na beside each pan. The original textbook artwork is not
 * stored in the repository; atom dots are counting symbols only — they show
 * no molecular geometry, bond order, or relative atomic sizes.
 */
const COUNTS = [
  { symbol: 'C', count: 3 },
  { symbol: 'H', count: 5 },
  { symbol: 'O', count: 5 },
  { symbol: 'Na', count: 1 },
]

function Flask() {
  return (
    <>
      <path d="M-14 -58 h28 l4 40 26 58 a6 6 0 0 1 -5 9 h-66 a6 6 0 0 1 -5 -9 l26 -58 z" className="l5-fig__flask" />
      <rect x="-18" y="-66" width="36" height="9" rx="3" className="l5-fig__flask-lip" />
      <path d="M-26 6 l-10 24 a5 5 0 0 0 4 7 h64 a5 5 0 0 0 4 -7 l-10 -24 z" className="l5-fig__liquid" />
    </>
  )
}

export default function Lesson5BalanceDiagram({ reducedMotion }: InteractiveProps) {
  return (
    <figure className={reducedMotion ? 'l5-source-figure l5-source-figure--still' : 'l5-source-figure'} data-source-reconstruction="p30-balance">
      <svg
        viewBox="0 0 780 330"
        role="img"
        aria-label="إعادة بناء تخطيطية من المنصة لشكل ص30: ميزان متوازن، كفة المتفاعلات حمض الخل وبيكربونات الصوديوم، وكفة النواتج خلات الصوديوم والماء وثنائي أكسيد الكربون، وبجانب كل كفة العد المطبوع ثلاث ذرات كربون وخمس هيدروجين وخمس أكسجين وذرة صوديوم واحدة"
        className="l5-source-figure__svg"
      >
        {/* Beam and pillar */}
        <line x1="90" y1="52" x2="690" y2="52" className="l5-fig__beam" />
        <circle cx="390" cy="52" r="9" className="l5-fig__pivot" />
        <line x1="390" y1="52" x2="390" y2="238" className="l5-fig__pillar" />
        <ellipse cx="390" cy="252" rx="62" ry="13" className="l5-fig__base" />
        <rect x="330" y="258" width="120" height="10" rx="5" className="l5-fig__base" />

        {/* Pan hangers */}
        <path d="M130 52 L78 196 M130 52 L182 196 M130 52 L130 196" className="l5-fig__hanger" />
        <path d="M650 52 L598 196 M650 52 L702 196 M650 52 L650 196" className="l5-fig__hanger" />
        <path d="M58 196 a72 20 0 0 0 144 0 z" className="l5-fig__pan" />
        <path d="M578 196 a72 20 0 0 0 144 0 z" className="l5-fig__pan" />

        <text x="130" y="30" textAnchor="middle" className="l5-fig__panel-title">المتفاعلات</text>
        <text x="650" y="30" textAnchor="middle" className="l5-fig__panel-title">النواتج</text>

        <g transform="translate(130 140)"><Flask /></g>
        <g transform="translate(650 140)"><Flask /></g>

        {/* Printed counts beside each pan (as in the book) */}
        {COUNTS.map((entry, index) => (
          <g key={entry.symbol}>
            <text x="252" y={104 + index * 34} textAnchor="end" direction="ltr" className="l5-fig__count">{entry.count} {entry.symbol}</text>
            <text x="528" y={104 + index * 34} textAnchor="start" direction="ltr" className="l5-fig__count">{entry.count} {entry.symbol}</text>
          </g>
        ))}

        {/* Printed formula strips under the pans */}
        <rect x="18" y="282" width="300" height="38" rx="8" className="l5-fig__strip" />
        <rect x="462" y="282" width="300" height="38" rx="8" className="l5-fig__strip" />
        <text x="168" y="300" textAnchor="middle" direction="ltr" className="l5-fig__strip-formula">CH3COOH + NaHCO3</text>
        <text x="168" y="316" textAnchor="middle" className="l5-fig__strip-label">حمض الخل + بيكربونات الصوديوم</text>
        <text x="612" y="300" textAnchor="middle" direction="ltr" className="l5-fig__strip-formula">CH3COONa + H2O + CO2</text>
        <text x="612" y="316" textAnchor="middle" className="l5-fig__strip-label">خلات الصوديوم + ماء + ثنائي أكسيد الكربون</text>
      </svg>
      <figcaption className="l5-source-figure__caption">
        إعادة رسم تخطيطية من المنصة لشكل ص30 — ليست صورة الكتاب الأصلية. الدورقان والكفتان رموز للمقارنة والعد فقط.
      </figcaption>
    </figure>
  )
}
