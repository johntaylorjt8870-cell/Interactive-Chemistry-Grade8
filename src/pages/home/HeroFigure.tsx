/**
 * Course-home Chemistry illustration.
 *
 * A static SVG combines a water molecule with a hexagonal molecular lattice.
 * It is decorative rather than curriculum material and is labelled for
 * assistive technology.
 */

const WIDTH = 660
const HEIGHT = 440

/** Flat-top hexagon centred on (cx, cy). */
function hexagonPath(cx: number, cy: number, radius: number): string {
  const points: string[] = []
  for (let corner = 0; corner < 6; corner += 1) {
    const angle = (Math.PI / 3) * corner
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`)
  }
  return `M ${points.join(' L ')} Z`
}

const LATTICE: Array<[number, number]> = [
  [436, 96],
  [496, 96],
  [466, 148],
  [526, 148],
  [496, 200],
  [436, 200],
]

export function HeroFigure() {
  return (
    <svg
      className="hero-figure"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="تمثيل كيميائي يجمع جزيء الماء وشبكة سداسية"
    >
      <rect x="1" y="1" width={WIDTH - 2} height={HEIGHT - 2} rx="22" className="hero-figure__panel" />
      <rect x="1" y="1" width={WIDTH - 2} height={HEIGHT - 2} rx="22" fill="url(#hero-grid)" opacity="0.5" />
      <rect x="1" y="1" width={WIDTH - 2} height={HEIGHT - 2} rx="22" className="hero-figure__border" />

      <defs>
        <pattern id="hero-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="var(--grid-line-strong)" strokeWidth="1" />
        </pattern>
        <linearGradient id="hero-lattice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--subject-chemistry)" />
          <stop offset="100%" stopColor="var(--subject-support)" />
        </linearGradient>
      </defs>

      <g className="hero-figure__chemistry">
        <g className="hero-figure__lattice">
          {LATTICE.map(([cx, cy], index) => (
            <path key={index} d={hexagonPath(cx, cy, 30)} stroke="url(#hero-lattice)" />
          ))}
        </g>

        <g className="hero-figure__molecule">
          <line x1="228" y1="372" x2="290" y2="342" />
          <line x1="290" y1="342" x2="352" y2="372" />
          <circle cx="290" cy="342" r="17" className="hero-figure__atom hero-figure__atom--oxygen" />
          <circle cx="228" cy="372" r="11" className="hero-figure__atom hero-figure__atom--hydrogen" />
          <circle cx="352" cy="372" r="11" className="hero-figure__atom hero-figure__atom--hydrogen" />
          <text x="290" y="348" className="hero-figure__atom-label" textAnchor="middle">
            O
          </text>
          <text x="228" y="377" className="hero-figure__atom-label hero-figure__atom-label--small" textAnchor="middle">
            H
          </text>
          <text x="352" y="377" className="hero-figure__atom-label hero-figure__atom-label--small" textAnchor="middle">
            H
          </text>
        </g>

        <text x="586" y="74" className="hero-figure__caption" textAnchor="end">
          الكيمياء
        </text>
      </g>
    </svg>
  )
}
