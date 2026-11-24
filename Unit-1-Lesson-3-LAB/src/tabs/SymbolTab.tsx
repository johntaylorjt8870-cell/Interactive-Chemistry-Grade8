import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, RotateCcw, Shapes } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Atom, ChargeBadge } from '@/components/Atoms'
import { Btn, Callout, Card, DoneBanner, SectionTitle, TabIntro, Tag } from '@/components/ui'
import { Ce, Frac, Num, Rich, Tex } from '@/components/Tex'
import { shuffle } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

type Kind = 'symbol' | 'formula' | 'ion'

const BUCKETS: Record<Kind, { label: string; hint: string; cls: string; ring: string }> = {
  symbol: { label: 'رمز عنصر', hint: 'ذرّة متعادلة', cls: 'bg-mint-100 text-forest-800 hover:bg-mint-200', ring: 'ring-leaf-500' },
  formula: { label: 'صيغة مركّب', hint: 'أكثر من عنصر', cls: 'bg-gold-100 text-gold-600 hover:bg-gold-400/40', ring: 'ring-gold-500' },
  ion: { label: 'أيون / جذر', hint: 'يحمل شحنة', cls: 'bg-lagoon-100 text-lagoon-600 hover:bg-lagoon-400/40', ring: 'ring-lagoon-500' },
}

const ITEMS: Array<{ f: string; kind: Kind; why: string }> = [
  { f: 'Na', kind: 'symbol', why: 'رمز ذرّة صوديوم متعادلة: حرف كبير يتبعه صغير وبلا شحنة.' },
  { f: 'Na+', kind: 'ion', why: 'الشحنة $+$ أعلى اليمين تعني أن الذرّة فقدت إلكتروناً فصارت أيوناً.' },
  { f: 'H2O', kind: 'formula', why: 'رمزان لعنصرين مختلفين مع أُسّ سفلي: هذه صيغة مركّب.' },
  { f: 'Cl-', kind: 'ion', why: 'الشحنة $-$ تعني أن ذرّة الكلور اكتسبت إلكتروناً فصارت أيوناً سالباً.' },
  { f: 'CaO', kind: 'formula', why: 'عنصران (كالسيوم وأكسجين) في مركّب واحد بلا شحنة ظاهرة: صيغة.' },
  { f: 'Ca', kind: 'symbol', why: 'رمز ذرّة كالسيوم واحدة بلا شحنة.' },
  { f: 'SO4^2-', kind: 'ion', why: 'جذر الكبريتات يحمل شحنة $2-$؛ فهو أيون مركّب (جذر) وليس مركّباً.' },
  { f: 'Al2O3', kind: 'formula', why: 'ألمنيوم وأكسجين بنسبة 2 : 3، ولا شحنة على الصيغة كلها.' },
  { f: 'Mg^2+', kind: 'ion', why: 'شحنة $2+$: فقدت ذرّة المغنزيوم إلكترونين.' },
  { f: 'NaCl', kind: 'formula', why: 'ملح الطعام: عنصران في مركّب. الشحنات تُلغي بعضها فلا تُكتب.' },
  { f: 'O', kind: 'symbol', why: 'رمز ذرّة أكسجين واحدة بلا شحنة.' },
  { f: 'Zn', kind: 'symbol', why: 'رمز ذرّة زنك متعادلة.' },
]

/* عرض تحويل الرمز إلى أيون */
function IonToggle() {
  const [lost, setLost] = useState(false)
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-mint-50 p-3">
      <svg viewBox="0 0 300 150" className="svg-ltr w-full" role="img" aria-label="تحويل ذرة الصوديوم إلى أيون">
        <g style={{ transform: 'translate(120px, 78px)' }}>
          <Atom el="Na" x={0} y={0} r={lost ? 27 : 36} style={{ transition: 'all .6s' }} />
        </g>
        {lost && <ChargeBadge x={150} y={36} text="+" tone="pos" r={14} className="anim-pop" />}
        <g
          style={{
            transform: lost ? 'translate(250px, 28px)' : 'translate(176px, 78px)',
            transition: 'transform .9s cubic-bezier(.4,1.2,.5,1)',
          }}
        >
          <circle r="8" fill="url(#atom-electron)" />
          <text y="1" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#fff" fontWeight={700} className="svg-math">
            −
          </text>
        </g>
      </svg>
      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="text-2xl">{lost ? <Ce f="Na+" /> : <Ce f="Na" />}</div>
        <Btn variant={lost ? 'ghost' : 'clay'} onClick={() => setLost((v) => !v)} className="text-xs">
          {lost ? <RotateCcw className="h-4 w-4" /> : null}
          {lost ? 'استعد الإلكترون' : 'أفقد إلكتروناً'}
        </Btn>
      </div>
      <p className="mt-1 text-xs leading-6 text-forest-800/80">
        {lost ? 'فقدان إلكترون واحد يجعل الذرّة أيوناً موجباً: ظهرت الشحنة أعلى اليمين.' : 'ذرّة صوديوم متعادلة: لا شحنة على الرمز.'}
      </p>
    </div>
  )
}

function Sorter({ onDone }: { onDone: () => void }) {
  const [order, setOrder] = useState(() => shuffle(ITEMS))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Kind | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const finished = i >= order.length
  const cur = order[Math.min(i, order.length - 1)]

  useEffect(() => {
    if (finished && score >= Math.ceil(order.length * 0.75)) onDone()
  }, [finished, score, order.length, onDone])

  const choose = (k: Kind) => {
    if (picked) return
    setPicked(k)
    if (k === cur.kind) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
    } else setStreak(0)
  }
  const next = () => {
    setPicked(null)
    setI((x) => x + 1)
  }
  const restart = () => {
    setOrder(shuffle(ITEMS))
    setI(0)
    setPicked(null)
    setScore(0)
    setStreak(0)
  }

  const pct = useMemo(() => Math.round((Math.min(i, order.length) / order.length) * 100), [i, order.length])

  if (finished) {
    const ok = score >= Math.ceil(order.length * 0.75)
    return (
      <div className="anim-pop rounded-2xl bg-mint-100 p-6 text-center">
        <p className="text-sm font-semibold text-forest-800">نتيجتك</p>
        <p dir="ltr" className="my-2 text-5xl font-bold text-forest-900">
          <Num>{score}</Num>
          <span className="mx-2 text-forest-800/40">/</span>
          <Num>{order.length}</Num>
        </p>
        <p className="mb-4 text-sm leading-7">{ok ? 'ممتاز! أصبحت تفرّق بين الرمز والصيغة والأيون.' : 'قريب جداً! أعد المحاولة وانتبه للشحنة والأرقام السفلية.'}</p>
        <Btn onClick={restart}>
          <RotateCcw className="h-4 w-4" /> أعد اللعب
        </Btn>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mint-200">
          <div className="h-full rounded-full bg-gradient-to-l from-leaf-500 to-forest-700 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <Tag tone="gold">
          سلسلة <Num>{streak}</Num>
        </Tag>
        <Tag>
          <Frac a={Math.min(i + 1, order.length)} b={order.length} />
        </Tag>
      </div>

      <div
        key={i}
        className={cn(
          'anim-pop grid min-h-36 place-items-center rounded-2xl border-2 border-dashed bg-white text-5xl sm:text-6xl',
          picked === null && 'border-forest-900/20',
          picked !== null && picked === cur.kind && 'border-leaf-500 bg-mint-50',
          picked !== null && picked !== cur.kind && 'anim-shake border-clay-500 bg-clay-100/50',
        )}
      >
        <Ce f={cur.f} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {(Object.keys(BUCKETS) as Kind[]).map((k) => {
          const b = BUCKETS[k]
          const isRight = picked !== null && k === cur.kind
          return (
            <button
              key={k}
              disabled={picked !== null}
              onClick={() => choose(k)}
              className={cn(
                'rounded-2xl px-2 py-3 text-center transition active:scale-95 disabled:cursor-default',
                b.cls,
                isRight && `ring-4 ${b.ring}`,
                picked !== null && !isRight && picked === k && 'opacity-60',
              )}
            >
              <span className="block text-sm font-bold sm:text-base">{b.label}</span>
              <span className="block text-[11px] opacity-75">{b.hint}</span>
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="anim-up mt-4 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-forest-900/10">
          <p className="flex-1 text-sm leading-7">
            <b className={picked === cur.kind ? 'text-leaf-600' : 'text-clay-600'}>{picked === cur.kind ? 'صحيح! ' : `الصحيح: ${BUCKETS[cur.kind].label}. `}</b>
            <Rich>{cur.why}</Rich>
          </p>
          <Btn onClick={next} className="shrink-0">
            التالي <ArrowLeft className="h-4 w-4" />
          </Btn>
        </div>
      )}
    </div>
  )
}

export default function SymbolTab() {
  const { mark, done } = useProgress()

  return (
    <div className="space-y-6">
      <TabIntro icon={Shapes} kicker="الفكرة الثانية · هدف: يميّز بين الرمز والصيغة" title="رمز العنصر · صيغة المركّب · رمز الأيون">
        ثلاثة أشكال تبدو متشابهة لكنها تعني أشياء مختلفة. تعلّم أن تقرأها بنظرة واحدة.
      </TabIntro>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-leaf-500">
          <Tag>رمز العنصر</Tag>
          <div className="my-3 text-5xl text-forest-800">
            <Ce f="Na" />
          </div>
          <ul className="space-y-1.5 text-sm leading-7">
            <li>• يدلّ على <b>نوع العنصر</b> وقد يمثّل ذرّة واحدة.</li>
            <li>• حرف كبير أو حرف كبير يتبعه صغير.</li>
            <li>• <b>لا شحنة</b> عليه ولا أرقام.</li>
          </ul>
        </Card>
        <Card className="border-t-4 border-t-gold-500">
          <Tag tone="gold">صيغة المركّب</Tag>
          <div className="my-3 text-5xl text-gold-600">
            <Ce f="Al2(SO4)3" />
          </div>
          <ul className="space-y-1.5 text-sm leading-7">
            <li>• تجمع رموز <b>عنصرين أو أكثر</b>.</li>
            <li>• الأرقام السفلية تبيّن <b>نسبة الذرّات</b>.</li>
            <li>• المركّب كله متعادل كهربائياً.</li>
          </ul>
        </Card>
        <Card className="border-t-4 border-t-lagoon-500">
          <Tag tone="lagoon">رمز الأيون</Tag>
          <div className="my-3 text-5xl text-lagoon-600">
            <Ce f="SO4^2-" />
          </div>
          <ul className="space-y-1.5 text-sm leading-7">
            <li>• له <b>شحنة</b> أعلى اليمين: موجبة أو سالبة.</li>
            <li>• ينتج عن فقد إلكترونات أو اكتسابها.</li>
            <li>• قد يكون ذرّة أو جذراً.</li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
        <Card>
          <SectionTitle n={1} sub="اضغط وراقب ما يحدث للرمز">
            حوّل الرمز إلى أيون
          </SectionTitle>
          <IonToggle />
          <Callout kind="warn" title="خطأ شائع" className="mt-4">
            «رمز الصوديوم هو <Tex tex="\mathrm{Na^+}" />» <b>خطأ!</b> الرمز هو <Ce f="Na" />، أما <Ce f="Na+" /> فهو أيون الصوديوم.
          </Callout>
        </Card>

        <Card>
          <SectionTitle n={2} sub="اختر الخانة الصحيحة لكل تعبير يظهر لك">
            لعبة الفرز السريع
          </SectionTitle>
          <Sorter onDone={() => mark('symbol')} />
        </Card>
      </div>

      {done.has('symbol') && <DoneBanner>أنجزت محطة «الرمز والصيغة والأيون» — واصل إلى التكافؤ في الروابط المشتركة.</DoneBanner>}
    </div>
  )
}
