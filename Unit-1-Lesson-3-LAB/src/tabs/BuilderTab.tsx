import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, Swords, Wrench } from 'lucide-react'
import { cn } from '@/utils/cn'
import { SvgFormula } from '@/components/Atoms'
import { Btn, Callout, Card, Chip, DoneBanner, SectionTitle, Stepper, TabIntro, Tag } from '@/components/ui'
import { Ce, Frac, NameView, Num, Rich, Tex } from '@/components/Tex'
import { ANIONS, CATIONS, formulaPlain, ion, ionCe, nameTokens, pick, simplestRatio, valenceOf, type Ion } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

const rawPart = (i: Ion, n: number) => (n === 1 ? i.sym : i.radical ? `(${i.sym})${n}` : `${i.sym}${n}`)

/* ---------- دليل الخطوات الأربع ---------- */
const STEPS = ['أكتب رموز المكوّنات', 'أكتب التكافؤات', 'أبادل بين التكافؤات', 'أحصل على الصيغة']

function Guide({ cat, an, step }: { cat: Ion; an: Ion; step: number }) {
  const s = simplestRatio(cat, an)
  const raw = rawPart(cat, s.raw.nc) + rawPart(an, s.raw.na)
  return (
    <svg viewBox="0 0 460 260" className="svg-ltr w-full" role="img" aria-label="التبادل المتقاطع للتكافؤات">
      <rect width="460" height="260" rx="20" fill="#f3faf6" />
      <line x1="230" y1="14" x2="230" y2="246" stroke="#c9e6d7" strokeWidth="2" strokeDasharray="4 7" />

      {/* الخطوة 1: الرموز */}
      <g className={step >= 1 ? 'anim-up' : ''} opacity={step >= 1 ? 1 : 0}>
        <SvgFormula plain={cat.sym} x={125} y={78} size={56} fill="#b95d33" />
        <SvgFormula plain={an.sym} x={335} y={78} size={56} fill="#226f8a" />
      </g>

      {/* الخطوة 2: التكافؤات */}
      {step >= 2 && (
        <g className="anim-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx="125" cy="128" r="20" fill="#d9784a" stroke="#fff" strokeWidth="3" />
          <text x="125" y="129" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="22" fontWeight="700" className="svg-math">
            {valenceOf(cat)}
          </text>
          <circle cx="335" cy="128" r="20" fill="#2f8aa8" stroke="#fff" strokeWidth="3" />
          <text x="335" y="129" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="22" fontWeight="700" className="svg-math">
            {valenceOf(an)}
          </text>
        </g>
      )}

      {/* الخطوة 3: التبادل المتقاطع */}
      {step >= 3 && (
        <g>
          <path d="M143 142 L 318 198" stroke="#d29a2e" strokeWidth="4" fill="none" strokeLinecap="round" markerEnd="url(#arrow-head)" className="draw-line" style={{ ['--len' as string]: 190 }} />
          <path d="M317 142 L 142 198" stroke="#d29a2e" strokeWidth="4" fill="none" strokeLinecap="round" markerEnd="url(#arrow-head)" className="draw-line" style={{ ['--len' as string]: 190 }} />
          <g className="anim-up" style={{ animationDelay: '.5s' }}>
            <rect x="120" y="206" width="220" height="44" rx="14" fill="#fff" stroke="#e3b355" strokeWidth="2" />
            <SvgFormula plain={raw} x={230} y={238} size={32} fill="#165240" />
          </g>
        </g>
      )}
    </svg>
  )
}

/* ---------- ميزان التعادل ---------- */
function Token({ ion: i, x, y, tone }: { ion: Ion; x: number; y: number; tone: 'pos' | 'neg' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="anim-pop">
        <rect x="-21" y="-13" width="42" height="26" rx="9" fill={tone === 'pos' ? '#fbe7dc' : '#dcf0f6'} stroke={tone === 'pos' ? '#d9784a' : '#2f8aa8'} strokeWidth="2" />
        <SvgFormula plain={i.sym} x={0} y={5} size={i.sym.length > 4 ? 11 : 14} fill={tone === 'pos' ? '#b95d33' : '#226f8a'} />
      </g>
    </g>
  )
}

function Pan({ x, y, ion: i, n, tone, total }: { x: number; y: number; ion: Ion; n: number; tone: 'pos' | 'neg'; total: number }) {
  const rows: number[][] = []
  for (let k = 0; k < n; k += 3) rows.push(Array.from({ length: Math.min(3, n - k) }, (_, j) => k + j))
  return (
    <g style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform .8s cubic-bezier(.3,1.3,.5,1)' }}>
      <line x1="0" y1="0" x2="-58" y2="46" stroke="#8aa69c" strokeWidth="2" />
      <line x1="0" y1="0" x2="58" y2="46" stroke="#8aa69c" strokeWidth="2" />
      <rect x="-70" y="44" width="140" height="10" rx="5" fill="#6f8982" />
      {rows.map((r, ri) =>
        r.map((k, ci) => <Token key={k} ion={i} x={(ci - (r.length - 1) / 2) * 48} y={44 - 17 - ri * 32} tone={tone} />),
      )}
      <text x="0" y="-18" textAnchor="middle" fontSize="22" fontWeight="700" fill={tone === 'pos' ? '#b95d33' : '#226f8a'} className="svg-math">
        {tone === 'pos' ? '+' : '−'}
        {total}
      </text>
    </g>
  )
}

function Balance({ cat, an, nc, na }: { cat: Ion; an: Ion; nc: number; na: number }) {
  const pos = valenceOf(cat) * nc
  const neg = valenceOf(an) * na
  const theta = Math.max(-17, Math.min(17, (neg - pos) * 6))
  const r = (theta * Math.PI) / 180
  const L = 158
  const PX = 240
  const PY = 112
  const lx = PX - L * Math.cos(r)
  const ly = PY - L * Math.sin(r)
  const rx = PX + L * Math.cos(r)
  const ry = PY + L * Math.sin(r)
  const ok = pos === neg
  return (
    <svg viewBox="0 0 480 280" className="svg-ltr w-full" role="img" aria-label="ميزان التعادل الكهربائي">
      <defs>
        <linearGradient id="beam-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ccaa6" />
          <stop offset="1" stopColor="#1d6a50" />
        </linearGradient>
      </defs>
      <polygon points={`${PX},${PY} ${PX - 36},238 ${PX + 36},238`} fill="url(#beam-grad)" opacity="0.9" />
      <rect x="186" y="236" width="108" height="14" rx="7" fill="#165240" />
      <g style={{ transform: `translate(${PX}px, ${PY}px) rotate(${theta}deg)`, transition: 'transform .8s cubic-bezier(.3,1.3,.5,1)' }}>
        <rect x={-L} y="-5" width={L * 2} height="10" rx="5" fill="url(#beam-grad)" />
      </g>
      <Pan x={lx} y={ly} ion={cat} n={nc} tone="pos" total={pos} />
      <Pan x={rx} y={ry} ion={an} n={na} tone="neg" total={neg} />
      <circle cx={PX} cy={PY} r="11" fill={ok ? '#e3b355' : '#fff'} stroke="#165240" strokeWidth="3" className={ok ? 'anim-glow' : undefined} />
    </svg>
  )
}

/* ---------- التحديات ---------- */
const POOL: Array<[string, string]> = [
  ['Al3+', 'SO42-'], ['Ca2+', 'OH-'], ['Fe3+', 'O2-'], ['Mg2+', 'Cl-'], ['Na+', 'CO32-'], ['NH4+', 'SO42-'],
  ['Zn2+', 'CH3COO-'], ['Cu+', 'O2-'], ['Al3+', 'Cl-'], ['Ca2+', 'PO43-'], ['K+', 'S2-'], ['Al3+', 'NO3-'],
  ['Ca2+', 'O2-'], ['Zn2+', 'SO42-'], ['Fe2+', 'Cl-'], ['Ag+', 'NO3-'],
]
const PRESETS: Array<[string, string]> = [['Zn2+', 'Cl-'], ['Al3+', 'O2-'], ['Al3+', 'SO42-'], ['Ca2+', 'O2-']]
const WINS_NEEDED = 3

export default function BuilderTab() {
  const { mark, done } = useProgress()
  const [catId, setCatId] = useState('Al3+')
  const [anId, setAnId] = useState('SO42-')
  const [nc, setNc] = useState(1)
  const [na, setNa] = useState(1)
  const [step, setStep] = useState(4)
  const [mode, setMode] = useState<'explore' | 'challenge'>('explore')
  const [wins, setWins] = useState(0)
  const [counted, setCounted] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const cat = ion(catId)
  const an = ion(anId)
  const s = useMemo(() => simplestRatio(cat, an), [cat, an])
  const pos = valenceOf(cat) * nc
  const neg = valenceOf(an) * na
  const diff = pos - neg
  const balanced = diff === 0
  const simplest = nc === s.nc && na === s.na
  const locked = mode === 'challenge'
  const solvedNow = locked && balanced && simplest

  useEffect(() => {
    if (solvedNow && !counted) {
      setCounted(true)
      setWins((w) => w + 1)
      setStep(4)
    }
  }, [solvedNow, counted])

  useEffect(() => {
    if (wins >= WINS_NEEDED) mark('builder')
  }, [wins, mark])

  const setPair = (c: string, a: string, forceBig = false) => {
    setCatId(c)
    setAnId(a)
    const r = simplestRatio(ion(c), ion(a))
    // في التحدّي: إن كانت أبسط نسبة 1:1 نبدأ بـ 2:2 ليتدرّب الطالب على الاختصار
    const big = forceBig && r.nc === 1 && r.na === 1
    setNc(big ? 2 : 1)
    setNa(big ? 2 : 1)
  }

  const newChallenge = () => {
    let p = pick(POOL)
    while (p[0] === catId && p[1] === anId) p = pick(POOL)
    setPair(p[0], p[1], true)
    setMode('challenge')
    setCounted(false)
    setRevealed(false)
    setStep(0)
  }

  const showGuide = !locked || solvedNow || revealed
  const plain = formulaPlain(cat, an, nc, na)

  const status = balanced
    ? simplest
      ? { cls: 'bg-mint-200 text-forest-900', text: 'متعادلة وبأبسط نسبة ✓ — هذه هي الصيغة الصحيحة!' }
      : { cls: 'bg-gold-100 text-gold-600', text: `متعادلة لكن غير مختصرة: اقسم الأعداد على ${s.g} لتحصل على أبسط نسبة.` }
    : diff > 0
      ? { cls: 'bg-clay-100 text-clay-600', text: `الشحنة الموجبة أكبر بمقدار ${diff}: زد الأيونات السالبة أو أنقص الموجبة.` }
      : { cls: 'bg-lagoon-100 text-lagoon-600', text: `الشحنة السالبة أكبر بمقدار ${-diff}: زد الأيونات الموجبة أو أنقص السالبة.` }

  return (
    <div className="space-y-6">
      <TabIntro icon={Wrench} kicker="الفكرة السابعة · كتابة الصيغة الكيميائية (ص21–22)" title="ورشة بناء الصيغة: التبادل المتقاطع والتعادل الكهربائي">
        الصيغة الصحيحة هي التي <b>يتعادل فيها مجموع الشحنات الموجبة مع مجموع الشحنات السالبة</b>. جرّب بنفسك على الميزان!
      </TabIntro>

      <div className="flex flex-wrap items-center gap-2">
        <Chip active={mode === 'explore'} onClick={() => setMode('explore')}>
          <Eye className="h-4 w-4" /> استكشاف حر
        </Chip>
        <Chip active={mode === 'challenge'} tone="gold" onClick={newChallenge}>
          <Swords className="h-4 w-4" /> {mode === 'challenge' ? 'تحدٍّ جديد' : 'ابدأ تحدّي البناء'}
        </Chip>
        {mode === 'challenge' && (
          <Tag tone="gold">
            انتصارات <Frac a={wins} b={WINS_NEEDED} />
          </Tag>
        )}
      </div>

      <Card>
        <SectionTitle n={1} sub={locked ? 'مكوّنا التحدّي مقفلان: اضبط الأعداد على الميزان فقط' : 'اختر الأيون الموجب والأيون السالب'}>
          اختر المكوّنات
        </SectionTitle>
        {locked ? (
          <div className="rounded-2xl bg-gold-100/70 p-4 text-center">
            <p className="text-sm font-semibold text-gold-600">المطلوب: اكتب صيغة المركّب</p>
            <p className="my-1 text-xl font-bold text-forest-900">
              <NameView tokens={nameTokens(cat, an)} />
            </p>
            <p className="text-lg">
              <Ce f={ionCe(cat)} /> <span className="mx-1 text-forest-800/50">+</span> <Ce f={ionCe(an)} />
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-bold text-clay-600">الأيونات الموجبة (فلزّات + الجذر الموجب)</p>
              <div className="flex flex-wrap gap-1.5">
                {CATIONS.map((c) => (
                  <Chip key={c.id} tone="clay" active={c.id === catId} onClick={() => setPair(c.id, anId)}>
                    <Ce f={ionCe(c)} />
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold text-lagoon-600">الأيونات السالبة (لافلزّات + جذور)</p>
              <div className="flex flex-wrap gap-1.5">
                {ANIONS.map((a) => (
                  <Chip key={a.id} tone="lagoon" active={a.id === anId} onClick={() => setPair(catId, a.id)}>
                    <Ce f={ionCe(a)} />
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-forest-900/10 pt-3">
              <span className="text-xs font-bold text-forest-800">أمثلة الكتاب:</span>
              {PRESETS.map(([c, a]) => (
                <Chip key={c + a} onClick={() => { setPair(c, a); setStep(1) }}>
                  <Ce f={formulaPlain(ion(c), ion(a), simplestRatio(ion(c), ion(a)).nc, simplestRatio(ion(c), ion(a)).na)} />
                </Chip>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle n={2} sub="مراحل الكتاب الأربع لكتابة أي صيغة">
            الدليل خطوة بخطوة
          </SectionTitle>
          {showGuide ? (
            <>
              <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {STEPS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setStep(i + 1)}
                    className={cn(
                      'rounded-xl px-2 py-2 text-center text-[12px] font-semibold leading-5 transition',
                      step === i + 1 ? 'bg-forest-800 text-white shadow' : step > i + 1 ? 'bg-mint-200 text-forest-800' : 'bg-mint-50 text-forest-800/60',
                    )}
                  >
                    <span className="mb-0.5 grid h-5 w-5 mx-auto place-items-center rounded-full bg-white/25 text-[11px] font-bold">
                      <Num>{i + 1}</Num>
                    </span>
                    {t}
                  </button>
                ))}
              </div>
              <Guide cat={cat} an={an} step={step} />
              <div className="mt-3 flex items-center justify-between gap-2">
                <Btn variant="soft" disabled={step <= 1} onClick={() => setStep((n) => n - 1)}>
                  <ArrowRight className="h-4 w-4" /> السابق
                </Btn>
                <div className="text-center">
                  {step >= 4 && (
                    <div className="anim-pop">
                      <div className="text-3xl">
                        <Ce f={compound(cat, an)} />
                      </div>
                      {s.g > 1 && (
                        <p className="mt-1 text-xs leading-6 text-gold-600">
                          <Rich>{`التبادل أعطى {{${rawPart(cat, s.raw.nc) + rawPart(an, s.raw.na)}}} فاختصرنا على $${s.g}$.`}</Rich>
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Btn disabled={step >= 4} onClick={() => setStep((n) => n + 1)}>
                  التالي <ArrowLeft className="h-4 w-4" />
                </Btn>
              </div>
            </>
          ) : (
            <div className="grid min-h-64 place-items-center rounded-2xl bg-mint-50 p-6 text-center">
              <div>
                <p className="mb-3 text-sm leading-7">الدليل مخفي أثناء التحدّي. حاول أولاً على الميزان!</p>
                <Btn variant="gold" onClick={() => { setRevealed(true); setStep(4) }}>
                  <Eye className="h-4 w-4" /> أرني الحل
                </Btn>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle n={3} sub="اضبط عدد الأيونات حتى يتوازن الميزان">
            ميزان التعادل الكهربائي
          </SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-gradient-to-b from-white to-mint-50">
            <Balance cat={cat} an={an} nc={nc} na={na} />
          </div>
          <div dir="ltr" className="mt-3 grid grid-cols-2 gap-3">
            <Stepper value={nc} onChange={setNc} min={1} max={6} tone="clay" label={<span className="inline-flex items-center gap-1">عدد <Ce f={ionCe(cat)} /></span>} />
            <Stepper value={na} onChange={setNa} min={1} max={6} tone="lagoon" label={<span className="inline-flex items-center gap-1">عدد <Ce f={ionCe(an)} /></span>} />
          </div>
          <div className="mt-3 rounded-2xl bg-white p-3 text-center ring-1 ring-forest-900/10">
            <Tex tex={`(+${valenceOf(cat)})(${nc}) + (-${valenceOf(an)})(${na}) = ${diff > 0 ? '+' : ''}${diff}`} />
          </div>
          <div className={cn('mt-3 rounded-2xl p-3 text-center text-sm font-semibold leading-7 transition-colors', status.cls)}>
            <Rich>{status.text}</Rich>
          </div>
          <div className="mt-3 rounded-2xl border border-forest-900/10 bg-white p-3 text-center">
            <p className="text-xs font-semibold text-forest-800/70">الصيغة الحالية</p>
            <div className={cn('text-4xl transition', balanced && simplest && 'anim-glow')}>
              <Ce f={plain} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Callout kind="rule" title="مراحل الكتابة (ص22)">
          <Num>1</Num> رموز المكوّنات ← <Num>2</Num> التكافؤات ← <Num>3</Num> أبادل بينها لتحقيق التعادل ← <Num>4</Num> أحصل على الصيغة.
        </Callout>
        <Callout kind="tip" title="متى القوس؟">
          فقط إذا تكرّر <b>الجذر</b> أكثر من مرّة: <Ce f="Al2(SO4)3" /> و<Ce f="Ca(OH)2" />. أما <Ce f="NaOH" /> فبلا قوس.
        </Callout>
        <Callout kind="warn" title="أبسط نسبة">
          عند تساوي التكافؤين نكتب <Ce f="CaO" /> لا <Ce f="Ca2O2" />.
        </Callout>
      </div>

      {done.has('builder') && <DoneBanner>بطل البناء! ربحت {WINS_NEEDED} تحدّيات وأتقنت التبادل المتقاطع.</DoneBanner>}
    </div>
  )
}

function compound(cat: Ion, an: Ion) {
  const s = simplestRatio(cat, an)
  return formulaPlain(cat, an, s.nc, s.na)
}
