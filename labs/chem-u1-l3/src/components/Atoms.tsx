import type { CSSProperties } from 'react'
import { ELEMENTS, shade } from '@/lib/chem'

/** تدرّجات الذرّات — تُعرَّف مرة واحدة وتُستخدم في كل الرسوم */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {Object.values(ELEMENTS).map((e) => (
          <radialGradient key={e.sym} id={`atom-${e.sym}`} cx="34%" cy="30%" r="82%">
            <stop offset="0" stopColor={shade(e.color, 0.55)} />
            <stop offset="0.55" stopColor={e.color} />
            <stop offset="1" stopColor={shade(e.color, -0.3)} />
          </radialGradient>
        ))}
        <radialGradient id="atom-plum" cx="34%" cy="30%" r="82%">
          <stop offset="0" stopColor="#c9b8ea" />
          <stop offset="0.55" stopColor="#8f78c0" />
          <stop offset="1" stopColor="#5b4690" />
        </radialGradient>
        <radialGradient id="atom-nucleus" cx="38%" cy="32%" r="80%">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.55" stopColor="#e3b355" />
          <stop offset="1" stopColor="#a97614" />
        </radialGradient>
        <radialGradient id="atom-electron" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#bdf0d8" />
          <stop offset="1" stopColor="#2b8666" />
        </radialGradient>
        <radialGradient id="atom-pos" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffd6c0" />
          <stop offset="1" stopColor="#c9602f" />
        </radialGradient>
        <radialGradient id="atom-neg" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#c6ecf7" />
          <stop offset="1" stopColor="#226f8a" />
        </radialGradient>
        <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#d29a2e" />
        </marker>
        <marker id="arrow-head-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#2b8666" />
        </marker>
        <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f3b2e" floodOpacity="0.28" />
        </filter>
      </defs>
    </svg>
  )
}

/** ذرّة ثلاثية الأبعاد */
export function Atom({
  el,
  x,
  y,
  r,
  label,
  className,
  style,
  fill,
  ink,
  font,
}: {
  el: string
  x: number
  y: number
  r?: number
  label?: string
  className?: string
  style?: CSSProperties
  fill?: string
  ink?: string
  font?: number
}) {
  const e = ELEMENTS[el]
  const rad = r ?? e.r
  return (
    <g transform={`translate(${x} ${y})`}>
     <g className={className} style={style}>
      <circle r={rad} fill={fill ?? `url(#atom-${el})`} filter="url(#soft-shadow)" />
      <ellipse cx={-rad * 0.3} cy={-rad * 0.42} rx={rad * 0.36} ry={rad * 0.2} fill="#fff" opacity="0.42" transform={`rotate(-28 ${-rad * 0.3} ${-rad * 0.42})`} />
      <text
        y={rad * 0.04}
        textAnchor="middle"
        dominantBaseline="central"
        className="svg-math"
        fontSize={font ?? rad * 0.98}
        fontWeight={700}
        fill={ink ?? e.ink}
      >
        {label ?? el}
      </text>
     </g>
    </g>
  )
}

/** رابطة على شكل أنبوب */
export function Bond({
  x1,
  y1,
  x2,
  y2,
  w = 6,
  className,
  style,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  w?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <g className={className} style={style}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6f8982" strokeWidth={w} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4e6dd" strokeWidth={w * 0.38} strokeLinecap="round" />
    </g>
  )
}

/* ---------------------------------------------------------------------
   تخطيطات الجذور (تمثيل مبسّط ثنائي الأبعاد)
   ------------------------------------------------------------------ */

export interface MAtom {
  el: string
  x: number
  y: number
}
export interface Layout {
  w: number
  h: number
  atoms: MAtom[]
  bonds: Array<[number, number]>
}

const star4 = (center: string): Layout => ({
  w: 120,
  h: 120,
  atoms: [
    { el: center, x: 60, y: 60 },
    { el: 'O', x: 24, y: 24 },
    { el: 'O', x: 96, y: 24 },
    { el: 'O', x: 24, y: 96 },
    { el: 'O', x: 96, y: 96 },
  ],
  bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
})

const tri3 = (center: string): Layout => ({
  w: 120,
  h: 114,
  atoms: [
    { el: center, x: 60, y: 60 },
    { el: 'O', x: 60, y: 20 },
    { el: 'O', x: 95, y: 80 },
    { el: 'O', x: 25, y: 80 },
  ],
  bonds: [[0, 1], [0, 2], [0, 3]],
})

export const RADICAL_LAYOUTS: Record<string, Layout> = {
  'NO3-': tri3('N'),
  'CO32-': tri3('C'),
  'SO42-': star4('S'),
  'PO43-': star4('P'),
  'OH-': {
    w: 110,
    h: 60,
    atoms: [
      { el: 'O', x: 34, y: 30 },
      { el: 'H', x: 80, y: 30 },
    ],
    bonds: [[0, 1]],
  },
  'NH4+': {
    w: 120,
    h: 120,
    atoms: [
      { el: 'N', x: 60, y: 60 },
      { el: 'H', x: 24, y: 24 },
      { el: 'H', x: 96, y: 24 },
      { el: 'H', x: 24, y: 96 },
      { el: 'H', x: 96, y: 96 },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
  'HCOO-': {
    w: 120,
    h: 112,
    atoms: [
      { el: 'C', x: 60, y: 48 },
      { el: 'H', x: 60, y: 12 },
      { el: 'O', x: 24, y: 84 },
      { el: 'O', x: 96, y: 84 },
    ],
    bonds: [[0, 1], [0, 2], [0, 3]],
  },
  'CH3COO-': {
    w: 176,
    h: 120,
    atoms: [
      { el: 'C', x: 52, y: 60 },
      { el: 'H', x: 20, y: 22 },
      { el: 'H', x: 20, y: 98 },
      { el: 'H', x: 52, y: 12 },
      { el: 'C', x: 110, y: 60 },
      { el: 'O', x: 148, y: 24 },
      { el: 'O', x: 148, y: 96 },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5], [4, 6]],
  },
}

export const singleAtom = (el: string): Layout => ({ w: 0, h: 0, atoms: [{ el, x: 0, y: 0 }], bonds: [] })

/** عنقود ذرّات (جذر) مرسوم حول المركز (x,y) بمقياس s */
export function Cluster({
  layout,
  x,
  y,
  s = 1,
  capsule,
  capsuleActive,
  className,
  style,
}: {
  layout: Layout
  x: number
  y: number
  s?: number
  capsule?: boolean
  capsuleActive?: boolean
  className?: string
  style?: CSSProperties
}) {
  const pos = layout.atoms.map((a) => ({
    el: a.el,
    x: (a.x - layout.w / 2) * s,
    y: (a.y - layout.h / 2) * s,
    r: ELEMENTS[a.el].r * s * 0.92,
  }))
  const minX = Math.min(...pos.map((p) => p.x - p.r))
  const maxX = Math.max(...pos.map((p) => p.x + p.r))
  const minY = Math.min(...pos.map((p) => p.y - p.r))
  const maxY = Math.max(...pos.map((p) => p.y + p.r))
  const pad = 12 * s + 4
  return (
    <g transform={`translate(${x} ${y})`}>
     <g className={className} style={style}>
      {capsule && (
        <rect
          x={minX - pad}
          y={minY - pad}
          width={maxX - minX + pad * 2}
          height={maxY - minY + pad * 2}
          rx={Math.min(34, (maxY - minY + pad * 2) / 2)}
          fill={capsuleActive ? 'rgba(123,100,171,0.14)' : 'rgba(123,100,171,0.06)'}
          stroke="#7b64ab"
          strokeWidth={2}
          strokeDasharray="7 6"
          className={capsuleActive ? 'dash-flow' : undefined}
          style={{ transition: 'fill .6s' }}
        />
      )}
      {layout.bonds.map(([a, b], i) => (
        <Bond key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} w={6 * s} />
      ))}
      {pos.map((p, i) => (
        <Atom key={i} el={p.el} x={p.x} y={p.y} r={p.r} />
      ))}
     </g>
    </g>
  )
}

/** حدود العنقود التقريبية (للتموضع) */
export function clusterSize(layout: Layout, s = 1) {
  const pad = 12 * s + 4
  const xs = layout.atoms.map((a) => ELEMENTS[a.el].r * s * 0.92)
  const w = layout.w ? layout.w * s : xs[0] * 2
  const h = layout.h ? layout.h * s : xs[0] * 2
  return { w: w + pad * 2, h: h + pad * 2 }
}

/** شارة شحنة/تكافؤ داخل SVG */
export function ChargeBadge({
  x,
  y,
  text,
  tone,
  r = 15,
  className,
  style,
}: {
  x: number
  y: number
  text: string
  tone: 'pos' | 'neg'
  r?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className} style={style}>
        <circle r={r} fill={tone === 'pos' ? 'url(#atom-pos)' : 'url(#atom-neg)'} stroke="#fff" strokeWidth={2.5} />
        <text textAnchor="middle" dominantBaseline="central" y={1} fill="#fff" fontWeight={700} fontSize={r * 0.95} className="svg-math">
          {text}
        </text>
      </g>
    </g>
  )
}

/* ---------- نص SVG لصيغة: الأرقام تصير أرقاماً سفلية ---------- */
export function SvgFormula({
  plain,
  x,
  y,
  size,
  fill,
  anchor = 'middle',
}: {
  plain: string
  x: number
  y: number
  size: number
  fill: string
  anchor?: 'middle' | 'start'
}) {
  const toks = plain.match(/\d+|[A-Za-z]+|[()]/g) ?? []
  const d = size * 0.26
  let low = false
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={700} fill={fill} className="svg-math">
      {toks.map((t, i) => {
        if (/^\d/.test(t)) {
          const dy = low ? 0 : d
          low = true
          return (
            <tspan key={i} fontSize={size * 0.62} dy={dy}>
              {t}
            </tspan>
          )
        }
        const dy = low ? -d : 0
        low = false
        return (
          <tspan key={i} dy={dy}>
            {t}
          </tspan>
        )
      })}
    </text>
  )
}

