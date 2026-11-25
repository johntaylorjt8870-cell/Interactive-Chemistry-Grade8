import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, CheckCircle2, Search, SearchCheck, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Callout, Card, Chip, DoneBanner, SectionTitle, TabIntro, Tag } from '@/components/ui'
import { Frac, Num, Rich } from '@/components/Tex'
import { shuffle } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

interface Opt {
  text: string
  ok?: boolean
  why?: string
}
interface Case {
  claim: string
  options: Opt[]
  fix: string
  note: string
}

const CASES: Case[] = [
  {
    claim: 'رمز الصوديوم هو {{Na+}}',
    options: [
      { text: '{{Na+}} أيون له شحنة، أما رمز الذرّة المتعادلة فهو {{Na}}.', ok: true },
      { text: 'الرمز الصحيح للصوديوم هو {{So}}.', why: 'رمز الصوديوم حرفان من اسمه اللاتيني: {{Na}}، ولا علاقة له بـ {{So}}.' },
      { text: 'الشحنة تُكتب أسفل الرمز لا أعلاه.', why: 'الشحنة تُكتب دائماً أعلى يمين الرمز، والأرقام السفلية للصيغ فقط.' },
    ],
    fix: '{{Na}}',
    note: 'الشحنة لا تُكتب إلا للأيون؛ فالرمز يدلّ على الذرّة المتعادلة.',
  },
  {
    claim: 'تكافؤ الأكسجين {{O}} يساوي $6$',
    options: [
      { text: 'العدد $6$ هو عدد إلكترونات السطح، أما التكافؤ فهو $2$.', ok: true },
      { text: 'تكافؤ الأكسجين $1$ لأنه عنصر واحد.', why: 'الأكسجين يكتسب إلكترونين (أو يشكّل رابطتين) فتكافؤه $2$ لا $1$.' },
      { text: 'الأكسجين ليس له تكافؤ.', why: 'لكل عنصر في الجدول تكافؤ، وللأكسجين $2$ (جدول ص20).' },
    ],
    fix: 'تكافؤ {{O}} يساوي $2$',
    note: 'التكافؤ يُقرأ من الروابط أو من الفقد والاكتساب، لا من عدد إلكترونات السطح.',
  },
  {
    claim: 'صيغة كبريتات الألمنيوم هي {{Al2SO43}}',
    options: [
      { text: 'القوس مفقود: العدد $3$ يخصّ جذر الكبريتات كله لا الأكسجين الأخير.', ok: true },
      { text: 'الألمنيوم تكافؤه $2$ لذلك يجب أن نكتب {{Al2}} مرتين.', why: 'الألمنيوم تكافؤه $3$ والكبريتات $2$؛ والأعداد صحيحة لكن شكل الكتابة ينقصه القوس.' },
      { text: 'يجب كتابة {{Al}} وحده بلا أعداد.', why: 'التعادل يتطلب أيونين من الألمنيوم وثلاثة جذور كبريتات.' },
    ],
    fix: '{{Al2(SO4)3}}',
    note: 'إذا تكرّر الجذر وضعناه بين قوسين ثم كتبنا عدد تكراره.',
  },
  {
    claim: 'صيغة أكسيد الكالسيوم هي {{Ca2O2}}',
    options: [
      { text: 'التكافؤان متساويان ($2$ و $2$) فنكتب أبسط نسبة: ذرّة من كل عنصر.', ok: true },
      { text: 'تكافؤ الكالسيوم $1$ لذلك نحتاج ذرّتين.', why: 'تكافؤ الكالسيوم $2$ وفق جدول ص20.' },
      { text: 'الأكسجين لا يتّحد مع الكالسيوم.', why: 'يتّحدان فعلاً لتكوين أكسيد الكالسيوم (الكلس الحي).' },
    ],
    fix: '{{CaO}}',
    note: 'عند تساوي التكافؤين نكتب الصيغة بأبسط نسبة صحيحة.',
  },
  {
    claim: '{{Cu2O}} يُسمّى أكسيد النحاس $\\mathrm{II}$',
    options: [
      { text: 'الرقم الروماني هو تكافؤ النحاس لا عدد ذرّاته، وتكافؤ النحاس هنا $1$.', ok: true },
      { text: 'الاسم صحيح لأن في الصيغة ذرّتي نحاس.', why: 'هذا هو الخلط الشائع: الرقم الروماني ليس عدد الذرّات.' },
      { text: 'يجب أن نبدأ الاسم باسم النحاس.', why: 'في الاسم العربي نبدأ بالجزء السالب «أكسيد».' },
    ],
    fix: 'أكسيد النحاس $\\mathrm{I}$',
    note: 'أما {{CuO}} ففيه النحاس ثنائي التكافؤ: أكسيد النحاس $\\mathrm{II}$.',
  },
  {
    claim: 'صيغة أكسيد الألمنيوم هي {{AlO}}',
    options: [
      { text: 'غير متعادلة: $+3 - 2 = +1$؛ يلزم أيونا ألمنيوم وثلاثة أيونات أكسيد.', ok: true },
      { text: 'تكافؤ الأكسجين $3$.', why: 'تكافؤ الأكسجين $2$ والذي تكافؤه $3$ هو الألمنيوم.' },
      { text: 'تكافؤ الألمنيوم $2$.', why: 'تكافؤ الألمنيوم $3$ وفق جدول ص20.' },
    ],
    fix: '{{Al2O3}}',
    note: 'تحقّق دائماً: $2 \\times (+3) + 3 \\times (-2) = 0$.',
  },
  {
    claim: 'صيغة هيدروكسيد الكالسيوم هي {{CaOH2}}',
    options: [
      { text: 'حول الجذر {{OH}} أقواس مفقودة؛ بدونها يخصّ العدد $2$ الهيدروجين وحده.', ok: true },
      { text: 'الجذر لا يُوضع بين قوسين أبداً.', why: 'يوضع بين قوسين متى تكرّر أكثر من مرة.' },
      { text: 'الكالسيوم تكافؤه $1$.', why: 'تكافؤ الكالسيوم $2$ والهيدروكسيل $1$، لذلك يلزم جذران.' },
    ],
    fix: '{{Ca(OH)2}}',
    note: 'القوس يجمع الجذر كله ويضرب العدد بعده ذرّاته جميعاً.',
  },
  {
    claim: 'اسم {{ZnSO4}} هو «زنك كبريتات»',
    options: [
      { text: 'في الاسم العربي نبدأ بالجزء السالب: كبريتات الزنك.', ok: true },
      { text: 'يجب إضافة رقم روماني بعد الزنك.', why: 'للزنك تكافؤ واحد ($2$) فلا يحتاج إلى رقم روماني.' },
      { text: 'جذر الكبريتات يُكتب بين قوسين في الاسم.', why: 'القوس والأعداد لا يظهران في الاسم العربي.' },
    ],
    fix: 'كبريتات الزنك',
    note: 'الصيغة تُكتب بالموجب أولاً، لكن الاسم يبدأ بالسالب.',
  },
]

export default function DetectiveTab() {
  const { mark, done } = useProgress()
  const [idx, setIdx] = useState(0)
  const [solved, setSolved] = useState<number[]>([])
  const [wrong, setWrong] = useState<Record<number, number[]>>({})
  const [mistakes, setMistakes] = useState(0)
  const orders = useMemo(() => CASES.map((c) => shuffle(c.options.map((_, i) => i))), [])
  const c = CASES[idx]
  const isSolved = solved.includes(idx)
  const wr = wrong[idx] ?? []

  useEffect(() => {
    if (solved.length === CASES.length) mark('detective')
  }, [solved, mark])

  const choose = (oi: number) => {
    if (isSolved || wr.includes(oi)) return
    if (c.options[oi].ok) {
      setSolved((s) => [...s, idx])
    } else {
      setWrong((w) => ({ ...w, [idx]: [...(w[idx] ?? []), oi] }))
      setMistakes((m) => m + 1)
    }
  }

  const lastWrong = wr.length ? c.options[wr[wr.length - 1]] : null

  return (
    <div className="space-y-6">
      <TabIntro icon={SearchCheck} kicker="الفكرة التاسعة · الأخطاء الشائعة في الصيغ والتكافؤ" title="محقق الأخطاء: اكتشف أين أخطأ الطالب!">
        ثمانية ملفات قضايا، في كل واحد منها ادّعاء <b>خاطئ</b>. اختر السبب الحقيقي للخطأ لتحلّ القضية.
      </TabIntro>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {CASES.map((_, i) => (
            <Chip key={i} tone={solved.includes(i) ? 'gold' : 'leaf'} active={i === idx} onClick={() => setIdx(i)}>
              {solved.includes(i) ? <CheckCircle2 className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              <Num>{i + 1}</Num>
            </Chip>
          ))}
          <span className="ms-auto flex items-center gap-2">
            <Tag tone="gold">
              محلولة <Frac a={solved.length} b={CASES.length} />
            </Tag>
            <Tag tone="clay">
              محاولات خاطئة <Num>{mistakes}</Num>
            </Tag>
          </span>
        </div>

        <div key={idx} className="anim-up grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionTitle n={idx + 1} sub="ملف القضية">
              ادّعاء الطالب
            </SectionTitle>
            <div className="relative rounded-2xl border-2 border-dashed border-clay-400/60 bg-clay-100/40 p-5 text-center">
              <span className="absolute -top-3 start-4 rounded-lg bg-clay-500 px-2.5 py-0.5 text-xs font-bold text-white">مشتبه به</span>
              <p className="text-xl font-semibold leading-10 text-forest-950 sm:text-2xl">
                <Rich>{c.claim}</Rich>
              </p>
              {isSolved && (
                <span className="anim-stamp absolute -bottom-4 end-3 rounded-xl border-4 border-leaf-600 bg-white/90 px-3 py-1 text-sm font-extrabold text-leaf-600 shadow">
                  <BadgeCheck className="me-1 inline h-4 w-4" /> تم حلّ القضية
                </span>
              )}
            </div>

            {isSolved && (
              <div className="anim-pop mt-8 rounded-2xl border border-leaf-500/50 bg-mint-100 p-4 text-center">
                <p className="text-xs font-bold text-leaf-600">التصحيح</p>
                <p className="my-1 text-2xl font-bold text-forest-900">
                  <Rich>{c.fix}</Rich>
                </p>
                <p className="text-sm leading-7">
                  <Rich>{c.note}</Rich>
                </p>
              </div>
            )}
          </div>

          <div>
            <SectionTitle sub="اختر الإجابة الصحيحة">ما سبب الخطأ؟</SectionTitle>
            <div className="space-y-2.5">
              {orders[idx].map((oi) => {
                const o = c.options[oi]
                const bad = wr.includes(oi)
                const good = isSolved && o.ok
                return (
                  <button
                    key={oi}
                    onClick={() => choose(oi)}
                    disabled={isSolved && !o.ok}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-start text-[15px] leading-8 transition active:scale-[0.99]',
                      good && 'border-leaf-500 bg-mint-200/70',
                      bad && 'anim-shake border-clay-500 bg-clay-100/70 text-forest-900/70',
                      !good && !bad && 'border-forest-900/15 bg-white hover:bg-mint-50',
                      isSolved && !o.ok && 'opacity-45',
                    )}
                  >
                    {good ? <CheckCircle2 className="mt-1.5 h-5 w-5 shrink-0 text-leaf-600" /> : bad ? <XCircle className="mt-1.5 h-5 w-5 shrink-0 text-clay-600" /> : <span className="mt-2 h-4 w-4 shrink-0 rounded-full border-2 border-forest-900/25" />}
                    <Rich>{o.text}</Rich>
                  </button>
                )
              })}
            </div>
            {!isSolved && lastWrong?.why && (
              <Callout kind="warn" title="ليس هذا السبب" className="anim-up mt-3">
                <Rich>{lastWrong.why}</Rich>
              </Callout>
            )}
          </div>
        </div>
      </Card>

      {done.has('detective') && (
        <DoneBanner>
          لقب «محقّق كيميائي» لك! حللت القضايا الثمانية بـ <Num>{mistakes}</Num> محاولات خاطئة فقط.
        </DoneBanner>
      )}
    </div>
  )
}
