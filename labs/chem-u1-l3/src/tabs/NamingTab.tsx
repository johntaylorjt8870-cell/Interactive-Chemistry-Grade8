import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, Droplets, Flame, Mountain, RotateCcw, Sparkles, Tags } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Btn, Callout, Card, Chip, DoneBanner, SectionTitle, TabIntro, Tag } from '@/components/ui'
import { Ce, NameView, Num, Rich, Tex } from '@/components/Tex'
import {
  ANIONS,
  CATIONS,
  formulaPlain,
  ion,
  ionCe,
  nameTokens,
  pick,
  shuffle,
  simplestRatio,
  tokensKey,
  valenceOf,
  type Ion,
  type NameToken,
} from '@/lib/chem'
import { useProgress } from '@/lib/progress'

const partPlain = (i: Ion, n: number) => (n === 1 ? i.sym : i.radical ? `(${i.sym})${n}` : `${i.sym}${n}`)
const compoundPlain = (c: Ion, a: Ion) => {
  const s = simplestRatio(c, a)
  return formulaPlain(c, a, s.nc, s.na)
}

/* ------------------------- A) من الصيغة إلى الاسم ------------------------- */

const EXPLORE: Array<[string, string]> = [
  ['Na+', 'Cl-'], ['Ca2+', 'O2-'], ['Zn2+', 'SO42-'], ['NH4+', 'Cl-'],
  ['Al3+', 'NO3-'], ['Ca2+', 'OH-'], ['Ca2+', 'CO32-'], ['Zn2+', 'CH3COO-'],
]

function Mirror() {
  const [idx, setIdx] = useState(2)
  const [hover, setHover] = useState<'cat' | 'an' | null>(null)
  const cat = ion(EXPLORE[idx][0])
  const an = ion(EXPLORE[idx][1])
  const s = simplestRatio(cat, an)
  const hasParen = (cat.radical && s.nc > 1) || (an.radical && s.na > 1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {EXPLORE.map(([c, a], i) => (
          <Chip key={c + a} active={i === idx} onClick={() => setIdx(i)}>
            <Ce f={compoundPlain(ion(c), ion(a))} />
          </Chip>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-forest-900/10 bg-white">
        <div dir="ltr" className="flex flex-wrap items-center justify-center gap-4 bg-gradient-to-r from-clay-100/60 via-white to-lagoon-100/60 px-4 py-6">
          <span className="rounded-lg bg-forest-900/90 px-2 py-0.5 text-[11px] font-bold text-white" dir="rtl">الصيغة: الموجب ثم السالب</span>
          <ArrowRight className="h-6 w-6 text-forest-800/60" />
          <button
            onMouseEnter={() => setHover('cat')}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover('cat')}
            onBlur={() => setHover(null)}
            className={cn('rounded-2xl border-2 px-5 py-3 text-5xl transition', hover === 'cat' ? 'scale-110 border-clay-500 bg-clay-100 shadow-lg' : 'border-clay-400/40 bg-white')}
          >
            <Ce f={partPlain(cat, s.nc)} />
          </button>
          <button
            onMouseEnter={() => setHover('an')}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover('an')}
            onBlur={() => setHover(null)}
            className={cn('rounded-2xl border-2 px-5 py-3 text-5xl transition', hover === 'an' ? 'scale-110 border-lagoon-500 bg-lagoon-100 shadow-lg' : 'border-lagoon-400/40 bg-white')}
          >
            <Ce f={partPlain(an, s.na)} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 bg-mint-50 py-1.5 text-xs font-semibold text-forest-800/70">
          <span className="h-px w-16 bg-forest-900/20" /> ننقل ما نقرأه إلى العربية بعكس الترتيب <span className="h-px w-16 bg-forest-900/20" />
        </div>

        <div dir="rtl" className="flex flex-wrap items-center justify-center gap-4 bg-gradient-to-l from-lagoon-100/60 via-white to-clay-100/60 px-4 py-6">
          <span className="rounded-lg bg-forest-900/90 px-2 py-0.5 text-[11px] font-bold text-white">الاسم: السالب ثم الموجب</span>
          <ArrowLeft className="h-6 w-6 text-forest-800/60" />
          <span
            className={cn('rounded-2xl border-2 px-5 py-3 text-2xl font-bold transition sm:text-3xl', hover === 'an' ? 'scale-110 border-lagoon-500 bg-lagoon-100 shadow-lg' : 'border-lagoon-400/40 bg-white')}
            style={{ color: '#226f8a' }}
          >
            {an.ar}
          </span>
          <span
            className={cn('rounded-2xl border-2 px-5 py-3 text-2xl font-bold transition sm:text-3xl', hover === 'cat' ? 'scale-110 border-clay-500 bg-clay-100 shadow-lg' : 'border-clay-400/40 bg-white')}
            style={{ color: '#b95d33' }}
          >
            <NameView tokens={[cat.ar, ...(cat.roman ? [{ roman: cat.roman }] : [])]} />
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-lagoon-100/70 p-3 text-sm leading-7">
          <Tag tone="lagoon"><Num>1</Num> الجزء السالب أولاً</Tag>
          <p className="mt-1">اسم <Ce f={ionCe(an)} /> هو «{an.ar}».</p>
        </div>
        <div className="rounded-2xl bg-clay-100/70 p-3 text-sm leading-7">
          <Tag tone="clay"><Num>2</Num> ثم الجزء الموجب</Tag>
          <p className="mt-1">اسم <Ce f={ionCe(cat)} /> هو «{cat.ar}».</p>
        </div>
        <div className="rounded-2xl bg-gold-100/70 p-3 text-sm leading-7">
          <Tag tone="gold"><Num>3</Num> القوس والعدد لا يُقرآن</Tag>
          <p className="mt-1">{hasParen ? 'القوس وعدد تكرار الجذر لا يظهران في الاسم العربي.' : 'الأعداد السفلية لا تدخل في الاسم، فنسمّي الأيونين فقط.'}</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- B) الرقم الروماني ------------------------- */

const METALS: Record<string, string[]> = { Fe: ['Fe2+', 'Fe3+'], Cu: ['Cu+', 'Cu2+'] }

function RomanLab() {
  const [metal, setMetal] = useState<'Fe' | 'Cu'>('Cu')
  const [k, setK] = useState(0)
  const [anId, setAnId] = useState('O2-')
  const cat = ion(METALS[metal][k])
  const an = ion(anId)
  const s = simplestRatio(cat, an)
  const v = valenceOf(cat)
  const trap = s.nc > 1

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-bold text-forest-800">الفلز</p>
          <div className="flex gap-2">
            {(['Fe', 'Cu'] as const).map((m) => (
              <Chip key={m} tone="gold" active={metal === m} onClick={() => { setMetal(m); setK(0) }}>
                <Ce f={m} /> {m === 'Fe' ? 'الحديد' : 'النحاس'}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-bold text-forest-800">تكافؤ الفلز (الرقم الروماني)</p>
          <div className="flex gap-2">
            {METALS[metal].map((id, i) => (
              <Chip key={id} tone="clay" active={k === i} onClick={() => setK(i)}>
                <Tex tex={`\\mathrm{${ion(id).roman}}`} /> <span className="text-[11px] opacity-80">تكافؤ <Num>{valenceOf(ion(id))}</Num></span>
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-bold text-forest-800">الجزء السالب</p>
          <div className="flex gap-2">
            {(['O2-', 'Cl-'] as const).map((id) => (
              <Chip key={id} tone="lagoon" active={anId === id} onClick={() => setAnId(id)}>
                <Ce f={ionCe(ion(id))} /> {ion(id).ar}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-forest-900/10 bg-gradient-to-b from-white to-mint-50 p-4 text-center">
        <div key={`${metal}${k}${anId}`} className="anim-pop">
          <div className="text-5xl">
            <Ce f={compoundPlain(cat, an)} />
          </div>
          <p className="mt-2 text-2xl font-bold text-forest-900">
            <NameView tokens={nameTokens(cat, an)} colors={['text-lagoon-600', 'text-clay-600', 'text-gold-600']} />
          </p>
          <div dir="ltr" className="my-3 flex flex-wrap items-center justify-center gap-1.5">
            {Array.from({ length: s.nc }, (_, i) => (
              <span key={`c${i}`} className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-clay-400 to-clay-600 text-xs font-bold text-white shadow">
                <Ce f={`${cat.sym}^${v === 1 ? '' : v}+`} />
              </span>
            ))}
            <span className="mx-1 text-forest-800/40">+</span>
            {Array.from({ length: s.na }, (_, i) => (
              <span key={`a${i}`} className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-lagoon-400 to-lagoon-600 text-xs font-bold text-white shadow">
                <Ce f={`${an.sym}^${valenceOf(an) === 1 ? '' : valenceOf(an)}-`} />
              </span>
            ))}
          </div>
          <p className="text-sm leading-7">
            {trap ? (
              <Rich>{`انتبه: في الصيغة $${s.nc}$ ذرّات من {{${cat.sym}}}، لكن الرقم الروماني يدلّ على تكافؤه وهو $${v}$ وليس على عدد الذرّات.`}</Rich>
            ) : (
              <Rich>{`الرقم الروماني يخبرنا بتكافؤ {{${cat.sym}}} في هذا المركّب: $${v}$.`}</Rich>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- C) تدرّب على التسمية ------------------------- */

const PRACTICE: Array<[string, string]> = [
  ['Fe2+', 'O2-'], ['Al3+', 'NO3-'], ['NH4+', 'Cl-'], ['Zn2+', 'SO42-'],
  ['Cu+', 'O2-'], ['Fe3+', 'O2-'], ['Ca2+', 'OH-'], ['Ca2+', 'CO32-'],
]

interface Q {
  cat: Ion
  an: Ion
  options: NameToken[][]
  correct: string
}

function makeQ([c, a]: [string, string]): Q {
  const cat = ion(c)
  const an = ion(a)
  const correct = nameTokens(cat, an)
  const cands: NameToken[][] = [correct]
  // ترتيب خاطئ
  cands.push([cat.ar, ...(cat.roman ? [{ roman: cat.roman }] : []), an.ar])
  // جزء سالب خاطئ
  const otherAn = pick(ANIONS.filter((x) => x.ar !== an.ar))
  cands.push([otherAn.ar, cat.ar, ...(cat.roman ? [{ roman: cat.roman }] : [])])
  if (cat.roman) {
    const other = cat.roman === 'I' ? 'II' : cat.roman === 'II' ? (cat.sym === 'Fe' ? 'III' : 'I') : 'II'
    cands.push([an.ar, cat.ar, { roman: other }])
  } else {
    const otherCat = pick(CATIONS.filter((x) => !x.roman && x.ar !== cat.ar))
    cands.push([an.ar, otherCat.ar])
  }
  const seen = new Set<string>()
  const uniq = cands.filter((t) => {
    const k = tokensKey(t)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  return { cat, an, options: shuffle(uniq), correct: tokensKey(correct) }
}

function Practice({ onDone }: { onDone: () => void }) {
  const make = () => shuffle(PRACTICE).map(makeQ)
  const [qs, setQs] = useState<Q[]>(make)
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const finished = qi >= qs.length
  const q = qs[Math.min(qi, qs.length - 1)]
  const need = 6

  useEffect(() => {
    if (finished && score >= need) onDone()
  }, [finished, score, onDone])

  const choose = (key: string) => {
    if (picked) return
    setPicked(key)
    if (key === q.correct) setScore((n) => n + 1)
  }
  const restart = () => {
    setQs(make())
    setQi(0)
    setPicked(null)
    setScore(0)
  }

  if (finished)
    return (
      <div className="anim-pop rounded-2xl bg-mint-100 p-6 text-center">
        <p dir="ltr" className="my-2 text-5xl font-bold text-forest-900">
          <Num>{score}</Num>
          <span className="mx-2 text-forest-800/40">/</span>
          <Num>{qs.length}</Num>
        </p>
        <p className="mb-4 text-sm leading-7">{score >= need ? 'ممتاز! تسمّي المركّبات بإتقان.' : 'قريب! أعد المحاولة (المطلوب 6 على الأقل).'}</p>
        <Btn onClick={restart}>
          <RotateCcw className="h-4 w-4" /> أعد التدريب
        </Btn>
      </div>
    )

  return (
    <div>
      <div dir="ltr" className="mb-3 flex items-center gap-1.5">
        {qs.map((_, i) => (
          <span key={i} className={cn('h-2 flex-1 rounded-full', i < qi ? 'bg-leaf-500' : i === qi ? 'bg-gold-400' : 'bg-mint-200')} />
        ))}
      </div>
      <div key={qi} className="anim-pop rounded-2xl bg-gradient-to-b from-white to-mint-50 p-5 text-center ring-1 ring-forest-900/10">
        <p className="text-sm font-semibold text-forest-800">ما اسم المركّب؟</p>
        <p className="mt-1 text-5xl">
          <Ce f={compoundPlain(q.cat, q.an)} />
        </p>
      </div>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((o) => {
          const key = tokensKey(o)
          const right = picked !== null && key === q.correct
          const wrong = picked === key && key !== q.correct
          return (
            <button
              key={key}
              onClick={() => choose(key)}
              className={cn(
                'rounded-2xl border-2 px-3 py-3.5 text-lg font-bold transition active:scale-[0.98]',
                right && 'border-leaf-500 bg-leaf-500 text-white',
                wrong && 'anim-shake border-clay-500 bg-clay-100 text-clay-600',
                !right && !wrong && 'border-forest-900/15 bg-white hover:bg-mint-100',
              )}
            >
              <NameView tokens={o} className="justify-center" />
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="anim-up mt-3 flex items-start gap-3 rounded-2xl bg-white p-3 ring-1 ring-forest-900/10">
          <p className="flex-1 text-sm leading-7">
            <b className={picked === q.correct ? 'text-leaf-600' : 'text-clay-600'}>{picked === q.correct ? 'صحيح! ' : 'ليس تماماً. '}</b>
            نبدأ بالجزء السالب «{q.an.ar}» ثم الموجب «{q.cat.ar}»
            {q.cat.roman ? (
              <>
                {' '}ونضيف الرقم الروماني <Tex tex={`\\mathrm{${q.cat.roman}}`} /> لأنّ تكافؤ الفلز هنا <Num>{valenceOf(q.cat)}</Num>
              </>
            ) : null}
            .
          </p>
          <Btn
            onClick={() => {
              setPicked(null)
              setQi((n) => n + 1)
            }}
            className="shrink-0"
          >
            التالي <ArrowLeft className="h-4 w-4" />
          </Btn>
        </div>
      )}
    </div>
  )
}

/* ------------------------- D) الأسماء الشائعة ------------------------- */

const COMMONS = [
  { common: 'ملح الطعام', sci: 'كلوريد الصوديوم', f: 'NaCl', icon: Sparkles },
  { common: 'الجبس', sci: 'كبريتات الكالسيوم', f: 'CaSO4', icon: Building2 },
  { common: 'الحجر الكلسي', sci: 'كربونات الكالسيوم', f: 'CaCO3', icon: Mountain },
  { common: 'الكلس الحي', sci: 'أكسيد الكالسيوم', f: 'CaO', icon: Flame },
  { common: 'رائق الكلس', sci: 'هيدروكسيد الكالسيوم', f: 'Ca(OH)2', icon: Droplets },
]

function Flips() {
  const [open, setOpen] = useState<boolean[]>(() => COMMONS.map(() => false))
  const toggle = (i: number) => setOpen((o) => o.map((x, j) => (j === i ? !x : x)))
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {COMMONS.map((c, i) => (
          <button key={c.f} onClick={() => toggle(i)} className="flip-scene h-44 text-center" aria-label={`اقلب بطاقة ${c.common}`}>
            <div className={cn('flip-card h-full w-full', open[i] && 'is-flipped')}>
              <div className="flip-face grid place-items-center rounded-2xl border-2 border-forest-900/10 bg-gradient-to-br from-white to-mint-100 p-3 shadow-sm">
                <div>
                  <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-forest-800 text-white shadow">
                    <c.icon className="h-7 w-7" />
                  </div>
                  <p className="text-lg font-bold text-forest-900">{c.common}</p>
                  <p className="mt-1 text-[11px] font-semibold text-forest-800/60">اضغط لتعرف اسمه العلمي</p>
                </div>
              </div>
              <div className="flip-face flip-back grid place-items-center rounded-2xl border-2 border-leaf-500 bg-gradient-to-br from-forest-800 to-leaf-600 p-3 text-white shadow-md">
                <div>
                  <p className="text-base font-bold leading-6">{c.sci}</p>
                  <div className="mt-2 rounded-xl bg-white/15 px-2 py-1 text-2xl">
                    <Ce f={c.f} />
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NamingTab() {
  const { mark, done } = useProgress()

  return (
    <div className="space-y-6">
      <TabIntro icon={Tags} kicker="الفكرة الثامنة · تسمية بعض المركّبات (ص22–23)" title="ورشة التسمية: من الصيغة إلى الاسم">
        قاعدة واحدة بثلاث حالات: <b>نذكر اسم الجزء السالب أولاً ثم الموجب</b>، ونضيف رقماً رومانياً للفلزّ متعدّد التكافؤ.
      </TabIntro>

      <Card>
        <SectionTitle n={1} sub="مرّر المؤشر فوق أي جزء من الصيغة لترى اسمه">
          مرآة الصيغة والاسم
        </SectionTitle>
        <Mirror />
      </Card>

      <Card>
        <SectionTitle n={2} sub="الحديد والنحاس لكلٍّ منهما أكثر من تكافؤ">
          مختبر الرقم الروماني
        </SectionTitle>
        <RomanLab />
        <Callout kind="warn" title="المعيار" className="mt-4">
          الرقم الروماني = <b>تكافؤ الفلز</b> لا عدد ذرّاته: <Ce f="Cu2O" /> هو أكسيد النحاس <Tex tex="\mathrm{I}" /> رغم وجود ذرّتي نحاس.
        </Callout>
      </Card>

      <Card>
        <SectionTitle n={3} sub="ثمانية مركّبات، اختر الاسم الصحيح لكل منها">
          تدرّب على التسمية
        </SectionTitle>
        <Practice onDone={() => mark('naming')} />
      </Card>

      <Card>
        <SectionTitle n={4} sub="السؤال الخامس في الكتاب: ابحث عن الاسم العلمي لكل مادة ثم اكتب صيغتها">
          من الاسم الشائع إلى الصيغة
        </SectionTitle>
        <Flips />
      </Card>

      {done.has('naming') && <DoneBanner>أتقنت التسمية: السالب أولاً، ثم الموجب، ثم الرقم الروماني عند الحاجة.</DoneBanner>}
    </div>
  )
}
