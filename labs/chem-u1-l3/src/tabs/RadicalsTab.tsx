import { useEffect, useState } from 'react'
import { Atom as AtomIcon, Boxes, CheckCircle2, Droplets, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Atom, ChargeBadge, Cluster, RADICAL_LAYOUTS, singleAtom } from '@/components/Atoms'
import { Btn, Callout, Card, Chip, DoneBanner, SectionTitle, TabIntro, Tag } from '@/components/ui'
import { Ce, Num, Rich } from '@/components/Tex'
import { ELEMENTS, ion, ionCe, valenceOf } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

interface Ioniz {
  f: string
  kind: string
  cats: Array<[string, number]>
  an: string
  eq: string
}

const COMPOUNDS: Ioniz[] = [
  { f: 'HNO3', kind: 'حمض', cats: [['H+', 1]], an: 'NO3-', eq: 'HNO3 -> H+ + NO3-' },
  { f: 'H2SO4', kind: 'حمض', cats: [['H+', 2]], an: 'SO42-', eq: 'H2SO4 -> 2H+ + SO4^2-' },
  { f: 'H3PO4', kind: 'حمض', cats: [['H+', 3]], an: 'PO43-', eq: 'H3PO4 -> 3H+ + PO4^3-' },
  { f: 'NaOH', kind: 'أساس', cats: [['Na+', 1]], an: 'OH-', eq: 'NaOH -> Na+ + OH-' },
  { f: 'NH4OH', kind: 'أساس', cats: [['NH4+', 1]], an: 'OH-', eq: 'NH4OH -> NH4+ + OH-' },
]

const radName = (id: string) => ion(id).note ?? `جذر ${ion(id).ar}`

const SCALE: Record<string, number> = { 'OH-': 1.3, 'NO3-': 1.1, 'SO42-': 1.05, 'PO43-': 1.05 }
const ys = (n: number) => (n === 1 ? [135] : n === 2 ? [96, 174] : [72, 135, 198])

function Scene({ c, ionized }: { c: Ioniz; ionized: boolean }) {
  const cats = c.cats.flatMap(([id, n]) => Array.from({ length: n }, () => ion(id)))
  const an = ion(c.an)
  const yy = ys(cats.length)
  const RX = 335
  const CXC = 165
  const s = SCALE[an.id] ?? 1
  return (
    <svg viewBox="0 0 520 270" className="svg-ltr w-full" role="img" aria-label="تأين المركب في الماء">
      <defs>
        <linearGradient id="water-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef8fb" />
          <stop offset="1" stopColor="#d3ecf3" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="520" height="270" rx="24" fill="url(#water-bg)" />
      <path d="M0 232 Q 65 214 130 232 T 260 232 T 390 232 T 520 232 V270 H0Z" fill="#b9e0ec" opacity="0.55" />
      <path d="M0 248 Q 65 232 130 248 T 260 248 T 390 248 T 520 248 V270 H0Z" fill="#9fd2e2" opacity="0.5" />

      <g style={{ opacity: ionized ? 0 : 1, transition: 'opacity .5s' }}>
        {cats.map((_, k) => (
          <line key={k} x1={CXC + 30} y1={yy[k]} x2={RX - 62} y2={135} stroke="#6f8982" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 10" />
        ))}
      </g>

      <g style={{ transform: `translate(${ionized ? -82 : 0}px, 0)`, transition: 'transform 1s cubic-bezier(.3,.8,.3,1)' }}>
        {cats.map((ci, k) => {
          const lay = ci.radical ? RADICAL_LAYOUTS[ci.id] : singleAtom(ci.sym)
          const r = ci.radical ? 70 : ELEMENTS[ci.sym].r * 1.75
          return (
            <g key={k}>
              {ci.radical ? <Cluster layout={lay} x={CXC} y={yy[k]} s={0.82} capsule capsuleActive={ionized} /> : <Atom el={ci.sym} x={CXC} y={yy[k]} r={r} />}
              {ionized && <ChargeBadge x={CXC + (ci.radical ? 66 : r * 0.85)} y={yy[k] - (ci.radical ? 62 : r * 0.9)} text="+" tone="pos" className="anim-pop" />}
            </g>
          )
        })}
      </g>

      <g style={{ transform: `translate(${ionized ? 92 : 0}px, 0)`, transition: 'transform 1s cubic-bezier(.3,.8,.3,1)' }}>
        <Cluster layout={RADICAL_LAYOUTS[an.id]} x={RX} y={135} s={s} capsule capsuleActive={ionized} />
        {ionized && <ChargeBadge x={RX + 74} y={62} text={`${valenceOf(an) > 1 ? valenceOf(an) : ''}−`} tone="neg" r={17} className="anim-pop" />}
      </g>
    </svg>
  )
}

function RadicalCard({ id, asOne }: { id: string; asOne: boolean }) {
  const i = ion(id)
  const lay = RADICAL_LAYOUTS[id]
  const s = id === 'CH3COO-' ? 0.7 : id === 'OH-' ? 1 : 0.8
  const pos = i.charge > 0
  return (
    <div className="group rounded-2xl border border-forest-900/10 bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative mx-auto grid h-32 place-items-center">
        {asOne ? (
          <div
            key="one"
            className="anim-pop grid h-24 w-24 place-items-center rounded-full text-white shadow-lg"
            style={{ background: 'radial-gradient(circle at 35% 30%, #c9b8ea, #8f78c0 55%, #5b4690)' }}
          >
            <Ce f={i.sym} className="text-xl" />
          </div>
        ) : (
          <svg key="many" viewBox="0 0 150 130" className="svg-ltr anim-pop h-32 w-full">
            <Cluster layout={lay} x={75} y={65} s={s} capsule capsuleActive />
          </svg>
        )}
      </div>
      <p className="mt-1 text-sm font-bold text-forest-900">{radName(id)}</p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <span className="text-lg">
          <Ce f={ionCe(i)} />
        </span>
        <span className={cn('grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-white', pos ? 'bg-clay-500' : 'bg-lagoon-500')}>
          <Num>{valenceOf(i)}</Num>
        </span>
      </div>
      <p className="text-[11px] text-forest-800/60">تكافؤ <Num>{valenceOf(i)}</Num></p>
    </div>
  )
}

const BOOK_ORDER = ['NO3-', 'HCOO-', 'SO42-', 'CH3COO-', 'CO32-', 'OH-', 'PO43-', 'NH4+']

export default function RadicalsTab() {
  const { mark, done } = useProgress()
  const [sel, setSel] = useState(1)
  const [ionized, setIonized] = useState(false)
  const [seen, setSeen] = useState<string[]>([])
  const [asOne, setAsOne] = useState(false)
  const c = COMPOUNDS[sel]

  useEffect(() => {
    if (ionized && !seen.includes(c.f)) setSeen((s) => [...s, c.f])
  }, [ionized, c.f, seen])

  useEffect(() => {
    if (seen.length === COMPOUNDS.length) mark('radicals')
  }, [seen, mark])

  const pick = (i: number) => {
    setSel(i)
    setIonized(false)
  }

  const an = ion(c.an)

  return (
    <div className="space-y-6">
      <TabIntro icon={Boxes} kicker="الفكرة السادسة · بعض الجذور الكيميائية (ص20–21)" title="الجذر الكيميائي: مجموعة ذرّات تتصرّف كذرّة واحدة">
        تنتج الجذور عن <b>تأيّن</b> مركّبات الحموض أو الأسس في الماء: يتفكك المركّب إلى أيونات، لكن ذرّات الجذر تبقى متماسكة معاً.
      </TabIntro>

      <Card>
        <SectionTitle n={1} sub="اختر مركّباً ثم أذِبه في الماء وشاهد ماذا يحدث للجذر">
          ورشة التأيّن
        </SectionTitle>

        <div className="mb-4 flex flex-wrap gap-2">
          {COMPOUNDS.map((x, i) => (
            <Chip key={x.f} active={i === sel} tone={x.kind === 'حمض' ? 'clay' : 'lagoon'} onClick={() => pick(i)}>
              <Ce f={x.f} /> <span className="text-[11px] opacity-80">{x.kind}</span>
              {seen.includes(x.f) && <CheckCircle2 className="h-4 w-4" />}
            </Chip>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-lagoon-400/30">
            <Scene c={c} ionized={ionized} />
          </div>
          <div className="flex flex-col gap-3">
            <Btn variant={ionized ? 'ghost' : 'lagoon'} onClick={() => setIonized((v) => !v)} className="py-3 text-base">
              {ionized ? <RotateCcw className="h-5 w-5" /> : <Droplets className="h-5 w-5" />}
              {ionized ? 'أعد التجميع' : 'أذِب في الماء (تأيّن)'}
            </Btn>

            <div className="rounded-2xl border border-forest-900/10 bg-white p-4 text-center">
              <p className="text-xs font-semibold text-forest-800/70">معادلة التأيّن</p>
              <div className="my-1 overflow-x-auto text-2xl">
                <Ce f={ionized ? c.eq : c.f} />
              </div>
              {ionized ? (
                <div className="anim-up space-y-1 text-sm leading-7">
                  <p>
                    الجذر الناتج: <b>{radName(an.id)}</b> <Ce f={ionCe(an)} />
                  </p>
                  <p>
                    <Rich>{`تكافؤه $${valenceOf(an)}$ = مقدار شحنته.`}</Rich>
                  </p>
                  <Tag tone="plum">ذرّاته بقيت داخل الكبسولة متماسكة</Tag>
                </div>
              ) : (
                <p className="text-sm leading-7 text-forest-800/80">اضغط «أذِب في الماء» ليتفكك {c.kind === 'حمض' ? 'الحمض' : 'الأساس'} إلى أيونات.</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold">أنجزتَ:</span>
              {COMPOUNDS.map((x) => (
                <Tag key={x.f} tone={seen.includes(x.f) ? 'gold' : 'leaf'}>
                  <Ce f={x.f} />
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <SectionTitle n={2} sub="الجذور الثمانية المطبوعة في الكتاب مع تكافؤاتها">
            معرض الجذور الكيميائية
          </SectionTitle>
          <div className="flex items-center gap-1.5 rounded-2xl bg-mint-100 p-1">
            <button onClick={() => setAsOne(false)} className={cn('flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition', !asOne ? 'bg-forest-800 text-white shadow' : 'text-forest-800')}>
              <AtomIcon className="h-4 w-4" /> ذرّاته
            </button>
            <button onClick={() => setAsOne(true)} className={cn('flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition', asOne ? 'bg-plum-500 text-white shadow' : 'text-forest-800')}>
              ● كوحدة واحدة
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BOOK_ORDER.map((id) => (
            <RadicalCard key={id} id={id} asOne={asOne} />
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-forest-800/60">الرسوم تمثيل مبسّط ثنائي الأبعاد لترابط الذرّات داخل كل جذر.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout kind="rule" title="تعريف الكتاب (ص20)">
          الجذر الكيميائي: <b>مجموعة ذرّات مترابطة بقوّة تسلك سلوك أيون أو ذرّة عنصر.</b>
        </Callout>
        <Callout kind="tip" title="لماذا نعدّه كذرّة واحدة؟">
          عند كتابة الصيغ نتعامل مع الجذر كلّه <b>كوحدة واحدة</b> لها تكافؤ واحد، فنضعه بين قوسين إذا تكرّر، مثل <Ce f="Ca(OH)2" />.
        </Callout>
      </div>

      {done.has('radicals') && <DoneBanner>أتممت تأيّن المركّبات الخمسة، وعرفت الجذور الثمانية وتكافؤاتها.</DoneBanner>}
    </div>
  )
}
