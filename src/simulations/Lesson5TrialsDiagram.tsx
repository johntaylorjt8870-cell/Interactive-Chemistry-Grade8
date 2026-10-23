import type { InteractiveProps } from './registry'
import './lesson5-labs.css'

/**
 * Schematic SVG reconstruction of the three lead/sulfur trials printed on
 * page 32. Dark piles = lead / lead sulfide, yellow piles = sulfur, exactly
 * the printed masses. The book's trials are studied here as printed data
 * only — lead and its compounds are toxic and are NOT to be re-run in a
 * school laboratory.
 */
type Trial = {
  n: string
  lead: string
  sulfur: string
  product: string
  leftover?: { label: string; kind: 'dark' | 'yellow'; small?: boolean }
}

const TRIALS: Trial[] = [
  { n: '(1)', lead: '10g رصاص', sulfur: '1.56g كبريت', product: '11.56g كبريتيد الرصاص' },
  { n: '(2)', lead: '10g رصاص', sulfur: '3g كبريت', product: '11.56g كبريتيد الرصاص', leftover: { label: '1.44g كبريت متبقّي', kind: 'yellow' } },
  { n: '(3)', lead: '18g رصاص', sulfur: '1.56g كبريت', product: '11.56g كبريتيد الرصاص', leftover: { label: '8g رصاص متبقّي', kind: 'dark', small: true } },
]

function Pile({ x, y, kind, large = false }: { x: number; y: number; kind: 'dark' | 'yellow'; large?: boolean }) {
  const w = large ? 52 : 40
  const h = large ? 30 : 22
  return (
    <path
      d={`M${x - w} ${y} Q${x - w / 2} ${y - h - 8} ${x - 8} ${y - h + 4} Q${x + 6} ${y - h - 6} ${x + w / 2} ${y - 10} Q${x + w} ${y - 4} ${x + w} ${y} Z`}
      className={kind === 'dark' ? 'l5-fig__pile-dark' : 'l5-fig__pile-yellow'}
    />
  )
}

export default function Lesson5TrialsDiagram({ reducedMotion }: InteractiveProps) {
  return (
    <figure className={reducedMotion ? 'l5-source-figure l5-source-figure--still' : 'l5-source-figure'} data-source-reconstruction="p32-trials">
      <svg
        viewBox="0 0 780 340"
        role="img"
        aria-label="إعادة بناء تخطيطية من المنصة لشكل تجارب ص32: التجربة واحد عشرة غرامات رصاص مع 1.56 غرام كبريت يعطيان 11.56 غرام كبريتيد الرصاص، والتجربة اثنان عشرة غرامات رصاص مع ثلاثة غرامات كبريت يعطيان المركب نفسه ويبقى 1.44 غرام كبريت، والتجربة ثلاثة ثمانية عشر غرام رصاص مع 1.56 غرام كبريت يعطيان المركب نفسه ويبقى ثمانية غرامات رصاص"
        className="l5-source-figure__svg"
      >
        <rect x="14" y="10" width="752" height="288" rx="14" className="l5-fig__card" />
        {TRIALS.map((trial, row) => {
          const baseY = 92 + row * 96
          const labelY = baseY + 24
          return (
            <g key={trial.n}>
              <text x="742" y={baseY - 6} textAnchor="middle" direction="ltr" className="l5-fig__count">{trial.n}</text>
              <Pile x={96} y={baseY} kind="dark" large={row === 2} />
              <text x="96" y={labelY} textAnchor="middle" className="l5-fig__pile-label">{trial.lead}</text>
              <text x="176" y={baseY - 8} textAnchor="middle" className="l5-fig__operator">+</text>
              <Pile x={262} y={baseY} kind="yellow" large={row === 1} />
              <text x="262" y={labelY} textAnchor="middle" className="l5-fig__pile-label">{trial.sulfur}</text>
              <line x1="330" y1={baseY - 14} x2="392" y2={baseY - 14} className="l5-fig__arrow" />
              <path d={`M392 ${baseY - 14} l-13 -6 v12 z`} className="l5-fig__arrow-head" />
              <Pile x={486} y={baseY} kind="dark" />
              <text x="486" y={labelY} textAnchor="middle" className="l5-fig__pile-label">{trial.product}</text>
              {trial.leftover ? (
                <>
                  <text x="578" y={baseY - 8} textAnchor="middle" className="l5-fig__operator">+</text>
                  <Pile x={648} y={baseY} kind={trial.leftover.kind} large={!trial.leftover.small} />
                  <text x="648" y={labelY} textAnchor="middle" className="l5-fig__pile-label">{trial.leftover.label}</text>
                </>
              ) : null}
            </g>
          )
        })}
        <text x="390" y="324" textAnchor="middle" className="l5-fig__note">بيانات مطبوعة للتحليل فقط؛ لا تُعاد تجربة الرصاص عملياً لسمّيته.</text>
      </svg>
      <figcaption className="l5-source-figure__caption">
        إعادة رسم تخطيطية من المنصة لشكل التجارب الثلاث ص32 بالقيم المطبوعة نفسها — ليست صورة الكتاب الأصلية.
      </figcaption>
    </figure>
  )
}
