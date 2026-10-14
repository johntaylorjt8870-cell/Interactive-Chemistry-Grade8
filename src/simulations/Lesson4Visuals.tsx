import { useId } from 'react'

/** Qualitative platform shapes, not reconstructions of textbook photographs.
 * No particle count, length, colour intensity or animation duration is data. */
export function BurnerDrawing({ complete, plate, soot }: { complete: boolean; plate: boolean; soot: boolean }) {
  const gradient = useId().replace(/:/g, '')
  return (
    <g className="reaction-lab__burner-drawing">
      <defs>
        <linearGradient id={gradient} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={complete ? 'var(--status-info-text)' : 'var(--accent-strong)'} />
          <stop offset="100%" stopColor={complete ? 'var(--status-info-border)' : 'var(--palette-chem-glow)'} />
        </linearGradient>
      </defs>
      <path d="M205 280 Q205 256 230 251 L330 251 Q355 256 355 280Z" className="reaction-lab__metal" />
      <rect x="263" y="173" width="34" height="84" rx="6" className="reaction-lab__metal" />
      <circle cx="280" cy="226" r="9" className={complete ? 'reaction-lab__air-hole' : 'reaction-lab__air-hole reaction-lab__air-hole--closed'} />
      <path d={complete ? 'M265 174 C256 145 276 126 280 86 C287 127 305 145 295 174Z' : 'M261 174 C235 140 280 112 278 52 C314 101 302 114 316 134 C330 156 301 178 261 174Z'} fill={`url(#${gradient})`} className="reaction-lab__flame" />
      <path d="M273 174 C269 159 280 152 280 137 C286 151 292 161 287 174Z" className={complete ? 'reaction-lab__flame-core' : 'reaction-lab__flame-core reaction-lab__flame-core--yellow'} />
      {plate ? <g className="reaction-lab__plate">
        <ellipse cx="280" cy="48" rx="78" ry="13" className="reaction-lab__ceramic" />
        <ellipse cx="280" cy="49" rx="40" ry="6" className="reaction-lab__soot" opacity={soot ? 0.95 : 0} />
        <path d="M358 48 H425" className="reaction-lab__handle" />
      </g> : null}
    </g>
  )
}

export function MagnesiumDrawing({ phase }: { phase: 'ready' | 'burning' | 'product' }) {
  return <g>
    <path d="M110 53 L271 111 L287 98 L128 41" className="reaction-lab__tongs" />
    {phase !== 'product' ? <path d="M280 104 Q259 139 273 162 Q294 180 278 207" className={`reaction-lab__ribbon ${phase === 'burning' ? 'reaction-lab__ribbon--burning' : ''}`} /> : null}
    {phase === 'burning' ? <g className="reaction-lab__mg-light" aria-hidden="true">
      <circle cx="277" cy="152" r="43" className="reaction-lab__mg-glow" />
      <path d="M277 119V109 M277 195V184 M244 152H233 M321 152H309 M253 128L247 120 M304 177L312 185 M255 178L247 185 M303 128L312 120" className="reaction-lab__light-rays" />
    </g> : null}
    <path d="M177 260 Q190 292 280 294 Q370 292 383 260Z" className="reaction-lab__ceramic" />
    <ellipse cx="280" cy="259" rx="103" ry="15" className="reaction-lab__sand" />
    {phase === 'product' ? <g className="reaction-lab__powder">
      <path d="M242 258 Q262 219 280 237 Q307 222 326 260Z" className="reaction-lab__oxide" />
      <path d="M251 258L269 242 M278 254L290 238 M301 257L312 244" className="reaction-lab__oxide-lines" />
    </g> : null}
    <rect x="270" y="213" width="20" height="30" rx="4" className="reaction-lab__metal" />
    {phase === 'burning' ? <path d="M271 214Q258 193 280 174Q297 197 288 214Z" className="reaction-lab__flame-core" /> : null}
  </g>
}

export function ObservationDrawing({ scenario, observed }: { scenario: 'lemon' | 'cloth' | 'lime'; observed: boolean }) {
  if (scenario === 'cloth') return <g>
    <path d="M149 80 L208 45 L228 70 H332 L352 45 L411 80 L382 137 L360 123 V269 H200 V123 L178 137Z" className="reaction-lab__cloth" />
    <path d="M247 103 Q270 108 278 137 Q249 170 238 205 L262 228 L288 206 Q301 181 288 159 Q323 120 300 113Z" className="reaction-lab__cloth-patch" opacity={observed ? 1 : 0} />
    <path d="M276 74 Q263 91 276 100 Q289 91 276 74Z" className="reaction-lab__drop" />
  </g>
  return <g>
    <path d="M184 98 L204 270 Q280 285 356 270 L376 98" className="reaction-lab__glass" />
    <path d="M199 170 L212 262 Q280 273 348 262 L362 170Z" className={scenario === 'lime' && observed ? 'reaction-lab__cloudy' : 'reaction-lab__liquid'} />
    <ellipse cx="280" cy="98" rx="96" ry="13" className="reaction-lab__glass-rim" />
    {scenario === 'lime' ? <path d="M372 53 H323 V235" className="reaction-lab__tube" /> : <g className="reaction-lab__lemon">
      <path d="M115 231 Q148 189 169 237 Q146 268 115 231Z" className="reaction-lab__lemon-slice" />
      <path d="M277 66 Q264 84 277 92 Q290 84 277 66Z" className="reaction-lab__drop" />
    </g>}
    {observed && scenario === 'lemon' ? <g className="reaction-lab__bubbles">
      {[[-40, 188, 8], [18, 161, 10], [45, 119, 8], [-8, 112, 12], [-60, 132, 6]].map(([dx, y, radius], index) => <circle key={index} cx={280 + dx!} cy={y} r={radius} className="reaction-lab__bubble" style={{ animationDelay: `${index * 70}ms` }} />)}
      <path d="M198 174 Q212 144 230 156 Q243 139 261 149 Q281 125 304 145 Q329 132 350 151 Q366 150 366 174" className="reaction-lab__foam" />
    </g> : null}
    {observed && scenario === 'lime' ? <path d="M224 251 H334" className="reaction-lab__precipitate" /> : null}
  </g>
}
