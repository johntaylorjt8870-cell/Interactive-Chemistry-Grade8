import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Table2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Btn, Callout, Card, Chip, DoneBanner, SectionTitle, TabIntro, Tag } from '@/components/ui'
import { Ce, Num, Rich, Tex } from '@/components/Tex'
import { VALENCE_TABLE, ion, ionCe, shuffle, type ValenceItem } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

type Filter = 'all' | '1' | '2' | '3' | 'multi'

const keyOf = (v: ValenceItem) => `${v.sym}-${v.roman ?? ''}-${v.v}`

function Tile({ v, selected, onClick }: { v: ValenceItem; selected: boolean; onClick: () => void }) {
  const pos = v.sign > 0
  return (
    <button
      onClick={onClick}
      className={cn(
        'anim-pop group relative rounded-2xl border-2 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md active:scale-95',
        pos ? 'border-clay-400/40 bg-clay-100/50' : 'border-lagoon-400/40 bg-lagoon-100/50',
        selected && (pos ? 'border-clay-500 bg-clay-100 shadow-md ring-2 ring-clay-400/40' : 'border-lagoon-500 bg-lagoon-100 shadow-md ring-2 ring-lagoon-400/40'),
      )}
    >
      <span
        className={cn(
          'absolute start-2 top-2 grid h-7 w-7 place-items-center rounded-full text-sm font-bold text-white',
          pos ? 'bg-clay-500' : 'bg-lagoon-500',
        )}
      >
        <Num>{v.v}</Num>
      </span>
      <div className="font-math text-[40px] font-bold leading-[1.15] text-forest-900">
        <span dir="ltr" className="ltr-iso inline-block">
          {v.sym}
          {v.roman && (
            <span className="ms-1 align-top text-[15px] font-semibold text-gold-600">
              (<span className="font-math">{v.roman}</span>)
            </span>
          )}
        </span>
      </div>
      <div className="text-sm font-semibold text-forest-800">{v.ar}</div>
      <div className="mt-1 text-sm">
        <Ce f={ionCe(ion(v.ionId))} />
      </div>
    </button>
  )
}

function Detail({ v }: { v: ValenceItem }) {
  const pos = v.sign > 0
  const i = ion(v.ionId)
  const multi = !!v.roman
  const eq = pos
    ? `${v.sym} -> ${ionCe(i)} + ${v.v > 1 ? v.v : ''}e-`
    : `${v.sym} + ${v.v > 1 ? v.v : ''}e- -> ${ionCe(i)}`
  return (
    <div key={keyOf(v)} className="anim-up rounded-2xl border border-forest-900/10 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn('grid h-14 w-14 place-items-center rounded-2xl text-2xl font-bold text-white', pos ? 'bg-clay-500' : 'bg-lagoon-500')}>
          <Ce f={v.sym} />
        </span>
        <div>
          <p className="font-bold text-forest-900">
            {v.ar} {v.roman && <Tex tex={`\\mathrm{${v.roman}}`} />}
          </p>
          <p className="text-sm text-forest-800/80">
            تكافؤه <b><Num>{v.v}</Num></b> — {pos ? 'يفقد' : 'يكتسب'} <Num>{v.v}</Num> {v.v === 1 ? 'إلكتروناً' : v.v === 2 ? 'إلكترونين' : 'إلكترونات'}
          </p>
        </div>
        <Tag tone={pos ? 'clay' : 'lagoon'}>{pos ? 'أيون موجب' : 'أيون سالب'}</Tag>
      </div>
      <div className="mt-3 rounded-xl bg-mint-50 p-3 text-center text-xl">
        <Ce f={eq} />
      </div>
      <div dir="ltr" className="mt-3 flex items-center justify-center gap-1.5">
        {Array.from({ length: v.v }, (_, k) => (
          <span key={k} className="anim-pop grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-mint-200 to-leaf-600 text-xs font-bold text-white shadow" style={{ animationDelay: `${k * 120}ms` }}>
            <Tex tex="-" />
          </span>
        ))}
      </div>
      {multi && (
        <Callout kind="warn" className="mt-3" title="فلزّ متعدد التكافؤ">
          <Rich>{`لـ ${v.ar} أكثر من تكافؤ في الجدول، لذلك نكتب في الاسم رقماً رومانياً يدلّ على تكافؤه هنا (${v.v}).`}</Rich>
        </Callout>
      )}
    </div>
  )
}

/* ---------------------------- تحدّي السرعة ---------------------------- */

const ROUNDS = 10

function Speed({ onDone }: { onDone: () => void }) {
  const [qs, setQs] = useState(() => shuffle(VALENCE_TABLE).slice(0, ROUNDS))
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const finished = qi >= ROUNDS
  const q = qs[Math.min(qi, ROUNDS - 1)]

  useEffect(() => {
    if (picked === null) return
    const t = setTimeout(() => {
      setPicked(null)
      setQi((n) => n + 1)
    }, 950)
    return () => clearTimeout(t)
  }, [picked])

  useEffect(() => {
    if (finished && score >= 8) onDone()
  }, [finished, score, onDone])

  const choose = (n: number) => {
    if (picked !== null) return
    setPicked(n)
    if (n === q.v) setScore((s) => s + 1)
  }
  const restart = () => {
    setQs(shuffle(VALENCE_TABLE).slice(0, ROUNDS))
    setQi(0)
    setPicked(null)
    setScore(0)
  }

  if (finished)
    return (
      <div className="anim-pop rounded-2xl bg-mint-100 p-6 text-center">
        <p className="text-sm font-semibold">نتيجتك في تحدّي السرعة</p>
        <p dir="ltr" className="my-2 text-5xl font-bold text-forest-900">
          <Num>{score}</Num>
          <span className="mx-2 text-forest-800/40">/</span>
          <Num>{ROUNDS}</Num>
        </p>
        <p className="mb-4 text-sm leading-7">{score >= 8 ? 'ذاكرة تكافؤات ممتازة! ✨' : 'تحتاج إلى مراجعة سريعة للبطاقات أعلاه، ثم أعد المحاولة (المطلوب 8 على الأقل).'}</p>
        <Btn onClick={restart}>
          <RotateCcw className="h-4 w-4" /> جولة جديدة
        </Btn>
      </div>
    )

  return (
    <div>
      <div className="mb-3 flex items-center gap-2" dir="ltr">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span key={i} className={cn('h-2 flex-1 rounded-full transition-colors', i < qi ? 'bg-leaf-500' : i === qi ? 'bg-gold-400' : 'bg-mint-200')} />
        ))}
      </div>
      <div key={qi} className="anim-pop rounded-2xl bg-gradient-to-b from-white to-mint-50 p-5 text-center ring-1 ring-forest-900/10">
        <p className="text-sm font-semibold text-forest-800">ما تكافؤ العنصر؟</p>
        <p className="my-1 text-5xl">
          <Ce f={q.sym} />
          {q.roman && <span className="ms-2 text-2xl text-gold-600"><Tex tex={`(\\mathrm{${q.roman}})`} /></span>}
        </p>
        <p className="text-sm text-forest-800/70">{q.ar}</p>
      </div>
      <div dir="ltr" className="mt-3 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((n) => {
          const right = picked !== null && n === q.v
          const wrong = picked === n && n !== q.v
          return (
            <button
              key={n}
              onClick={() => choose(n)}
              className={cn(
                'rounded-2xl border-2 py-4 text-3xl font-bold transition active:scale-95',
                right && 'border-leaf-500 bg-leaf-500 text-white',
                wrong && 'anim-shake border-clay-500 bg-clay-100 text-clay-600',
                !right && !wrong && 'border-forest-900/15 bg-white hover:bg-mint-100',
              )}
            >
              <Num>{n}</Num>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ValenceTableTab() {
  const { mark, done } = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState<ValenceItem>(VALENCE_TABLE[9])

  const list = useMemo(
    () =>
      VALENCE_TABLE.filter((v) => {
        if (filter === 'all') return true
        if (filter === 'multi') return !!v.roman
        return v.v === Number(filter)
      }),
    [filter],
  )

  const FILTERS: Array<[Filter, string]> = [
    ['all', 'الكل'],
    ['1', 'تكافؤ 1'],
    ['2', 'تكافؤ 2'],
    ['3', 'تكافؤ 3'],
    ['multi', 'متعدد التكافؤ'],
  ]

  return (
    <div className="space-y-6">
      <TabIntro icon={Table2} kicker="الفكرة الخامسة · جدول تكافؤات بعض العناصر (ص20)" title="بطاقات التكافؤ: ستة عشر عنصراً في مكان واحد">
        استكشف الجدول المطبوع في الكتاب: كل بطاقة تُظهر العنصر وتكافؤه وأيونه. <span className="text-gold-400">الأحمر الطيني</span> للأيونات الموجبة و<span className="text-lagoon-400">الأزرق البحري</span> للسالبة.
      </TabIntro>

      <Card>
        <SectionTitle n={1} sub="صفِّ البطاقات حسب التكافؤ، وانقر على أي بطاقة لتفاصيلها">
          مستكشف الجدول
        </SectionTitle>
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map(([k, label]) => (
            <Chip key={k} active={filter === k} tone={k === 'multi' ? 'gold' : 'leaf'} onClick={() => setFilter(k)}>
              {k === 'all' || k === 'multi' ? label : (
                <>
                  تكافؤ <Num>{k}</Num>
                </>
              )}
            </Chip>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {list.map((v) => (
              <Tile key={keyOf(v)} v={v} selected={keyOf(sel) === keyOf(v)} onClick={() => setSel(v)} />
            ))}
          </div>
          <Detail v={sel} />
        </div>
      </Card>

      <Card>
        <SectionTitle n={2} sub="عشر بطاقات عشوائية: أجب بسرعة وحاول الوصول إلى 8 إجابات صحيحة">
          تحدّي السرعة
        </SectionTitle>
        <Speed onDone={() => mark('table')} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout kind="rule" title="كيف أقرأ الجدول؟">
          التكافؤ عدد صحيح موجب <b>بلا إشارة</b>: <Rich>$1, 2, 3$</Rich>. أما الشحنة فتحمل إشارة وتُكتب أعلى يمين الرمز.
        </Callout>
        <Callout kind="warn" title="فلزّات برقمين">
          للحديد (<Tex tex="\mathrm{II}" /> و<Tex tex="\mathrm{III}" />) وللنحاس (<Tex tex="\mathrm{I}" /> و<Tex tex="\mathrm{II}" />) أكثر من تكافؤ؛ لذلك نضيف الرقم الروماني بعد الاسم.
        </Callout>
      </div>

      {done.has('table') && <DoneBanner>ممتاز! حفظت جدول التكافؤات — جاهز للجذور الكيميائية.</DoneBanner>}
    </div>
  )
}
