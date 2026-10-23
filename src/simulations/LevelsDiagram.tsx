import type { InteractiveProps } from './registry'
import './lesson1-labs.css'

/* ============================================================================
   Reconstruction of the page-5 figure: the seven principal energy levels.
   ----------------------------------------------------------------------------
   This is a *platform recreation*, not the textbook scan. It keeps the printed
   labels only: seven numbered levels n = 1 … 7 and their letter names
   K, L, M, N, O, P, Q, with the nucleus at the centre. No electron counts are
   drawn, because the printed figure shows no occupancy — the capacities belong
   to the law y = 2(n)² and are shown in the capacity lab instead.
   ========================================================================= */

const LEVELS = [
  { n: 1, letter: 'K' },
  { n: 2, letter: 'L' },
  { n: 3, letter: 'M' },
  { n: 4, letter: 'N' },
  { n: 5, letter: 'O' },
  { n: 6, letter: 'P' },
  { n: 7, letter: 'Q' },
] as const

export default function LevelsDiagram({ reducedMotion }: InteractiveProps) {
  const size = 340
  const center = size / 2

  return (
    <figure className="levels-diagram">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="إعادة رسم من المنصة: سبع سويات طاقة حول النواة، أرقامها 1 إلى 7 وحروفها K إلى Q"
        className={reducedMotion ? 'levels-diagram__svg levels-diagram__svg--still' : 'levels-diagram__svg'}
      >
        <circle cx={center} cy={center} r={13} className="levels-diagram__nucleus" />
        <text x={center} y={center + 4} textAnchor="middle" className="levels-diagram__nucleus-label">
          +
        </text>
        {LEVELS.map((level) => {
          const radius = 26 + level.n * 19
          // Labels sit on the ring itself at the 45° upper-right diagonal, so
          // each letter is visibly attached to the circle it names instead of
          // floating in a horizontal row beside the nucleus.
          const angle = -Math.PI / 4
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return (
            <g key={level.letter}>
              <circle cx={center} cy={center} r={radius} className="levels-diagram__orbit" />
              <rect
                x={x - 17}
                y={y - 10}
                width={34}
                height={20}
                rx={5}
                className="levels-diagram__label-plate"
              />
              <text x={x} y={y + 4} textAnchor="middle" className="levels-diagram__label">
                <tspan className="levels-diagram__letter">{level.letter}</tspan>
                <tspan className="levels-diagram__number" dx={3}>
                  {level.n}
                </tspan>
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="levels-diagram__caption">
        <strong>السويات الرئيسية السبع.</strong> الرقم الخارجي هو n، والحرف هو اسم السوية. الشكل إعادة رسم من
        المنصة لشكل صفحة 5؛ صورة الكتاب الأصلية غير محفوظة كملف في المستودع، ولم تُضف أي إلكترونات لأن الشكل
        المطبوع لا يعرض إشغالاً.
      </figcaption>
    </figure>
  )
}
