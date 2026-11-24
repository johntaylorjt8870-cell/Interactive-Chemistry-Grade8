import { useEffect, useState } from 'react'
import { CheckCircle2, RotateCcw, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Btn, Callout, Card, DoneBanner, SectionTitle, TabIntro, Tag } from '@/components/ui'
import { Ce, Num, Rich } from '@/components/Tex'
import { useProgress } from '@/lib/progress'

interface AtomDef {
  sym: string
  ar: string
  Z: number
  shells: number[]
  target: number // +: اكتساب ، −: فقد
  eq: string
}

const ATOMS: AtomDef[] = [
  { sym: 'Na', ar: 'الصوديوم', Z: 11, shells: [2, 8, 1], target: -1, eq: 'Na -> Na+ + e-' },
  { sym: 'Ca', ar: 'الكالسيوم', Z: 20, shells: [2, 8, 8, 2], target: -2, eq: 'Ca -> Ca^2+ + 2e-' },
  { sym: 'Mg', ar: 'المغنزيوم', Z: 12, shells: [2, 8, 2], target: -2, eq: 'Mg -> Mg^2+ + 2e-' },
  { sym: 'Cl', ar: 'الكلور', Z: 17, shells: [2, 8, 7], target: 1, eq: 'Cl + e- -> Cl-' },
  { sym: 'O', ar: 'الأكسجين', Z: 8, shells: [2, 6], target: 2, eq: 'O + 2e- -> O^2-' },
]

const cap = (i: number) => (i === 0 ? 2 : 8)

function shellsAfter(base: number[], change: number): number[] {
  const s = [...base]
  if (change < 0) {
    for (let i = 0; i < -change; i++) {
      s[s.length - 1]--
      if (s[s.length - 1] === 0) s.pop()
    }
  } else {
    for (let i = 0; i < change; i++) {
      if (s[s.length - 1] < cap(s.length - 1)) s[s.length - 1]++
      else s.push(1)
    }
  }
  return s
}

const ionCe = (sym: string, charge: number) => {
  if (charge === 0) return sym
  const a = Math.abs(charge)
  const sign = charge > 0 ? '+' : '-'
  return a === 1 ? `${sym}${sign}` : `${sym}^${a}${sign}`
}

const CX = 180
const CY = 180
const R0 = 56
const DR = 32

interface Fx {
  id: number
  kind: 'out' | 'in'
  x: number
  y: number
}

function Bohr({
  def,
  change,
  stable,
  fx,
  onFxEnd,
}: {
  def: AtomDef
  change: number
  stable: boolean
  fx: Fx[]
  onFxEnd: (id: number) => void
}) {
  const shells = shellsAfter(def.shells, change)
  const charge = -change
  return (
    <svg viewBox="0 0 360 360" className="svg-ltr w-full" role="img" aria-label={`نموذج بوهر لذرة ${def.ar}`}>
      <defs>
        <radialGradient id="bohr-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4f3ec" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r="176" fill="url(#bohr-bg)" />

      {shells.map((n, i) => {
        const R = R0 + i * DR
        const outer = i === shells.length - 1
        const glow = outer && stable
        return (
          <g key={`s${i}`}>
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={glow ? '#2b8666' : '#9fb9af'}
              strokeWidth={glow ? 3.5 : 1.6}
              strokeDasharray={glow ? undefined : '3 6'}
              className={glow ? 'anim-glow' : undefined}
            />
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`${i % 2 ? 360 : 0} ${CX} ${CY}`}
                to={`${i % 2 ? 0 : 360} ${CX} ${CY}`}
                dur={`${22 + i * 9}s`}
                repeatCount="indefinite"
              />
              {Array.from({ length: n }, (_, k) => {
                const a = (k / n) * Math.PI * 2 + i * 0.7
                return (
                  <circle
                    key={`e${i}-${k}`}
                    cx={CX + R * Math.cos(a)}
                    cy={CY + R * Math.sin(a)}
                    r="8.5"
                    fill="url(#atom-electron)"
                    stroke="#fff"
                    strokeWidth="1.5"
                    className="anim-pop"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                )
              })}
            </g>
          </g>
        )
      })}

      <circle cx={CX} cy={CY} r="34" fill="url(#atom-nucleus)" filter="url(#soft-shadow)" />
      <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="central" fontSize="19" fontWeight="700" fill="#fff" className="svg-math">
        +{def.Z}
      </text>

      {charge !== 0 && (
        <g className="anim-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx={318} cy={44} r="24" fill={charge > 0 ? 'url(#atom-pos)' : 'url(#atom-neg)'} stroke="#fff" strokeWidth="3" />
          <text x={318} y={45} textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="700" fill="#fff" className="svg-math">
            {Math.abs(charge) === 1 ? '' : Math.abs(charge)}
            {charge > 0 ? '+' : '−'}
          </text>
        </g>
      )}

      {fx.map((f) => (
        <circle
          key={f.id}
          cx={f.x}
          cy={f.y}
          r="9"
          fill="url(#atom-electron)"
          stroke="#fff"
          strokeWidth="1.5"
          className={f.kind === 'out' ? 'fly-out' : 'fly-in'}
          style={{ ['--dx' as string]: f.kind === 'out' ? '110px' : '120px', ['--dy' as string]: f.kind === 'out' ? '-90px' : '-110px' }}
          onAnimationEnd={() => onFxEnd(f.id)}
        />
      ))}
    </svg>
  )
}

export default function IonicTab() {
  const { mark, done } = useProgress()
  const [sel, setSel] = useState(0)
  const [changes, setChanges] = useState<number[]>(() => ATOMS.map(() => 0))
  const [reg, setReg] = useState<boolean[]>(() => ATOMS.map(() => false))
  const [fx, setFx] = useState<Fx[]>([])
  const [fxId, setFxId] = useState(1)

  const def = ATOMS[sel]
  const change = changes[sel]
  const shells = shellsAfter(def.shells, change)
  const last = shells.length - 1
  const stable = shells[last] === cap(last)
  const electrons = def.Z + change
  const charge = -change
  const isTarget = change === def.target

  const setChange = (v: number) => setChanges((c) => c.map((x, i) => (i === sel ? v : x)))

  const act = (dir: -1 | 1) => {
    const next = change + dir
    if (next < -4 || next > 4) return
    // موضع التأثير على السوية الخارجية
    const sBefore = shellsAfter(def.shells, change)
    const sAfter = shellsAfter(def.shells, next)
    const R = R0 + (dir < 0 ? sBefore.length - 1 : sAfter.length - 1) * DR
    const a = -0.5
    setFx((f) => [...f, { id: fxId, kind: dir < 0 ? 'out' : 'in', x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }])
    setFxId((n) => n + 1)
    setChange(next)
  }

  const register = () => setReg((r) => r.map((x, i) => (i === sel ? true : x)))
  const allDone = reg.every(Boolean)

  useEffect(() => {
    if (allDone) mark('ionic')
  }, [allDone, mark])

  return (
    <div className="space-y-6">
      <TabIntro icon={Zap} kicker="الفكرة الرابعة · التكافؤ في المركّبات الأيونية (ص19)" title="فقد الإلكترونات واكتسابها: تكافؤ الأيونات">
        في المركّبات الأيونية <b>تنتقل الإلكترونات</b> من ذرّة إلى أخرى؛ وتكافؤ العنصر هو <b>عدد الإلكترونات التي فقدها أو اكتسبها</b>.
      </TabIntro>

      <Card>
        <SectionTitle n={1} sub="اختر ذرّة من المعادلات الخمس ثم أفقدها أو أكسبها إلكترونات حتى تصبح سويتها الخارجية مكتملة">
          مختبر الأيونات
        </SectionTitle>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {ATOMS.map((a, i) => (
            <button
              key={a.sym}
              onClick={() => setSel(i)}
              className={cn(
                'relative rounded-2xl border p-2.5 text-center transition active:scale-95',
                i === sel ? 'border-forest-800 bg-forest-800 text-white shadow-md' : 'border-forest-900/15 bg-white hover:bg-mint-100',
              )}
            >
              {reg[i] && <CheckCircle2 className={cn('absolute end-1.5 top-1.5 h-4 w-4', i === sel ? 'text-gold-400' : 'text-leaf-500')} />}
              <div className="text-sm font-bold">{a.ar}</div>
              <div className="mt-1 text-[15px]">
                <Ce f={a.eq} />
              </div>
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-mint-50 p-2">
            <Bohr def={def} change={change} stable={stable && change !== 0} fx={fx} onFxEnd={(id) => setFx((f) => f.filter((x) => x.id !== id))} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-gold-100/80 p-3">
                <p className="text-[11px] font-bold text-gold-600">البروتونات</p>
                <p className="text-2xl font-bold">
                  <Num>{`+${def.Z}`}</Num>
                </p>
              </div>
              <div className="rounded-2xl bg-mint-100 p-3">
                <p className="text-[11px] font-bold text-leaf-600">الإلكترونات</p>
                <p className="text-2xl font-bold">
                  <Num>{electrons}</Num>
                </p>
              </div>
              <div className={cn('rounded-2xl p-3 transition-colors', charge > 0 ? 'bg-clay-100' : charge < 0 ? 'bg-lagoon-100' : 'bg-white ring-1 ring-forest-900/10')}>
                <p className="text-[11px] font-bold text-forest-800">الشحنة الصافية</p>
                <p className="text-2xl font-bold">
                  <Num>{charge === 0 ? '0' : `${charge > 0 ? '+' : '-'}${Math.abs(charge)}`}</Num>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-forest-900/10 bg-white p-4 text-center">
              <p className="text-xs font-semibold text-forest-800/70">النوع الآن</p>
              <div className="my-1 text-4xl">
                <Ce f={ionCe(def.sym, charge)} />
              </div>
              <p className="text-sm leading-7">
                {change === 0 && 'ذرّة متعادلة: عدد الإلكترونات يساوي عدد البروتونات.'}
                {change < 0 && (
                  <Rich>{`فقدت $${-change}$ من الإلكترونات ⇒ صارت أيوناً موجباً.`}</Rich>
                )}
                {change > 0 && (
                  <Rich>{`اكتسبت $${change}$ من الإلكترونات ⇒ صارت أيوناً سالباً.`}</Rich>
                )}
              </p>
              <div className="mt-2">
                {change !== 0 && (stable ? <Tag tone="gold">السوية الخارجية مكتملة ✓ مستقر</Tag> : <Tag tone="clay">غير مستقر: السوية الخارجية غير مكتملة</Tag>)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Btn variant="clay" onClick={() => act(-1)} disabled={change <= -4}>
                فقد إلكترون <Ce f="e-" />
              </Btn>
              <Btn variant="lagoon" onClick={() => act(1)} disabled={change >= 4}>
                اكتساب إلكترون <Ce f="e-" />
              </Btn>
              <Btn variant="soft" onClick={() => setChange(0)}>
                <RotateCcw className="h-4 w-4" /> إعادة
              </Btn>
              <Btn variant="gold" onClick={register} disabled={!isTarget || reg[sel]}>
                {reg[sel] ? 'سُجّل ✓' : 'سجّل في الجدول'}
              </Btn>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle n={2} sub="يمتلئ الجدول عند تسجيل كل أيون مستقر في المختبر أعلاه">
          جدول نشاط الأيونات (ص19)
        </SectionTitle>
        <div className="overflow-x-auto rounded-2xl border border-forest-900/10">
          <table className="w-full min-w-[560px] text-center">
            <colgroup>
              <col className="w-44" />
            </colgroup>
            <thead>
              <tr className="bg-forest-800 text-white">
                <th className="p-3 text-sm">الذرّة</th>
                {ATOMS.map((a) => (
                  <th key={a.sym} className="p-3 text-lg">
                    <Ce f={a.sym} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="bg-mint-100 p-3 text-sm font-bold">الأيون</td>
                {ATOMS.map((a, i) => (
                  <td key={a.sym} className="p-3 text-xl">
                    {reg[i] ? <span className="anim-pop inline-block"><Ce f={ionCe(a.sym, -a.target)} /></span> : <span className="text-forest-800/25">؟</span>}
                  </td>
                ))}
              </tr>
              <tr className="bg-mint-50">
                <td className="bg-mint-100 p-3 text-sm font-bold">عدد الإلكترونات التي فقدتها أو اكتسبتها</td>
                {ATOMS.map((a, i) => (
                  <td key={a.sym} className="p-3 text-xl font-bold">
                    {reg[i] ? <span className="anim-pop inline-block"><Num>{Math.abs(a.target)}</Num></span> : <span className="text-forest-800/25">؟</span>}
                  </td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="bg-mint-100 p-3 text-sm font-bold">فقد أم اكتساب؟</td>
                {ATOMS.map((a, i) => (
                  <td key={a.sym} className="p-3 text-sm font-bold">
                    {reg[i] ? <span className={cn('anim-pop inline-block', a.target < 0 ? 'text-clay-600' : 'text-lagoon-600')}>{a.target < 0 ? 'فقد' : 'اكتساب'}</span> : <span className="text-forest-800/25">؟</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout kind="rule" title="استنتاج الكتاب">
          التكافؤ الكيميائي في المركّبات ذات الروابط الأيونية هو <b>عدد الإلكترونات التي تكتسبها أو تفقدها ذرّة عنصر ما</b> عند ارتباطها بذرّة عنصر آخر.
        </Callout>
        <Callout kind="info" title="لماذا موجب أو سالب؟">
          البروتونات موجبة وثابتة في النواة. فقدُ إلكترون سالب يجعل الذرّة <b>موجبة</b>، واكتسابُه يجعلها <b>سالبة</b>. الفلزّات تفقد وتصبح أيونات موجبة، واللافلزّات تكسب وتصبح أيونات سالبة.
        </Callout>
      </div>

      {done.has('ionic') && <DoneBanner>رائع! أكملت جدول نشاط الأيونات: التكافؤ = عدد الإلكترونات المفقودة أو المكتسبة.</DoneBanner>}
    </div>
  )
}
