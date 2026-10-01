/**
 * Course-home hero figure.
 *
 * One instrument-panel drawing that carries both subject identities: a
 * travelling wave and vector frame for physics, a hexagonal lattice and a
 * covalent molecule for chemistry. Drawn as vector geometry (no raster art),
 * described for assistive technology, and intentionally static — motion here
 * would be decoration, not explanation.
 */

const WIDTH = 660
const HEIGHT = 440

/** Samples a sine wave into an SVG path (a real travelling wave, not a squiggle). */
function wavePath(x0: number, x1: number, midY: number, amplitude: number, wavelength: number): string {
  const steps = 120
  const points: string[] = []
  for (let index = 0; index <= steps; index += 1) {
    const x = x0 + ((x1 - x0) * index) / steps
    const y = midY - amplitude * Math.sin((2 * Math.PI * (x - x0)) / wavelength)
    points.push(`${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return points.join(' ')
}

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
      aria-label="لوحة قياس تجمع بين منحنى موجة ومتجهات حركة في الفيزياء، وشبكة سداسية وجزيء في الكيمياء"
    >
      {/* Panel background and measurement grid */}
      <rect x="1" y="1" width={WIDTH - 2} height={HEIGHT - 2} rx="22" className="hero-figure__panel" />
      <rect x="1" y="1" width={WIDTH - 2} height={HEIGHT - 2} rx="22" fill="url(#hero-grid)" opacity="0.5" />
      <rect x="1" y="1" width={WIDTH - 2} height={HEIGHT - 2} rx="22" className="hero-figure__border" />

      <defs>
        <pattern id="hero-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="var(--grid-line-strong)" strokeWidth="1" />
        </pattern>
        <linearGradient id="hero-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--subject-physics)" stopOpacity="0.25" />
          <stop offset="45%" stopColor="var(--subject-physics)" />
          <stop offset="100%" stopColor="var(--subject-physics)" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="hero-lattice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--subject-chemistry)" />
          <stop offset="100%" stopColor="var(--subject-physics)" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* --- Physics block ------------------------------------------------- */}
      <g className="hero-figure__physics" transform="translate(0, 0)">
        <line x1="46" y1="286" x2="330" y2="286" className="hero-figure__axis" />
        <line x1="66" y1="316" x2="66" y2="86" className="hero-figure__axis" />

        {/* Measurement ticks — real ruler spacing */}
        <g className="hero-figure__ticks">
          {Array.from({ length: 12 }, (_unused, index) => (
            <line key={`x-${index}`} x1={66 + index * 22} y1="286" x2={66 + index * 22} y2={index % 5 === 0 ? 274 : 280} />
          ))}
          {Array.from({ length: 8 }, (_unused, index) => (
            <line key={`y-${index}`} x1="66" y1={286 - index * 26} x2={index % 4 === 0 ? 80 : 74} y2={286 - index * 26} />
          ))}
        </g>

        {/* Travelling wave (amplitude, wavelength) */}
        <path d={wavePath(66, 320, 200, 44, 152)} className="hero-figure__wave" stroke="url(#hero-wave)" />
        <line x1="66" y1="200" x2="320" y2="200" className="hero-figure__guide" />

        {/* Wavelength annotation with arrowheads on both ends */}
        <g className="hero-figure__measure">
          <line x1="142" y1="252" x2="242" y2="252" />
          <line x1="142" y1="246" x2="142" y2="258" />
          <line x1="242" y1="246" x2="242" y2="258" />
        </g>

        {/* Vector: velocity with magnitude arrow */}
        <g className="hero-figure__vector">
          <line x1="196" y1="322" x2="286" y2="322" />
          <path d="M286 322 l-11 -5 l0 10 z" />
        </g>

        <text x="252" y="240" className="hero-figure__label" textAnchor="middle">
          λ
        </text>
        <text x="238" y="340" className="hero-figure__label" textAnchor="middle">
          v
        </text>
        <text x="46" y="74" className="hero-figure__caption" textAnchor="start">
          الفيزياء
        </text>
      </g>

      {/* --- Chemistry block ----------------------------------------------- */}
      <g className="hero-figure__chemistry" transform="translate(0, 0)">
        <g className="hero-figure__lattice">
          {LATTICE.map(([cx, cy], index) => (
            <path key={index} d={hexagonPath(cx, cy, 30)} stroke="url(#hero-lattice)" />
          ))}
        </g>

        {/* Covalent molecule with bond geometry */}
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

      {/* --- Shared dividing scale ----------------------------------------- */}
      <g className="hero-figure__divider">
        <line x1="372" y1="62" x2="372" y2="392" />
        <circle cx="372" cy="228" r="13" />
        <path d="M366 228 h12 M372 222 v12" />
      </g>
    </svg>
  )
}
