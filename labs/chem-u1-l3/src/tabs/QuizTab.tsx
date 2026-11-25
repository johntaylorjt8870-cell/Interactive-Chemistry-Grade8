import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Delete, RotateCcw, Star, Trophy, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Btn, Callout, Card, DoneBanner, TabIntro, Tag } from '@/components/ui'
import { Ce, Frac, Num, Rich } from '@/components/Tex'
import { normFormula } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

type Q =
  | { type: 'tf'; id: string; group: string; stem: string; answer: boolean; why: string }
  | { type: 'mc'; id: string; group: string; stem: string; options: string[]; answer: number; why: string }
  | { type: 'write'; id: string; group: string; stem: string; answer: string; why: string }

const QUESTIONS: Q[] = [
  { type: 'tf', id: 'tf1', group: 'صواب أم خطأ؟', stem: 'رمز الصوديوم هو {{Na+}}.', answer: false, why: 'رمز ذرّة الصوديوم هو {{Na}}؛ أما {{Na+}} فهو أيون الصوديوم بعد فقد إلكترون.' },
  { type: 'tf', id: 'tf2', group: 'صواب أم خطأ؟', stem: 'صيغة حمض الكبريت هي {{H2SO4}}.', answer: true, why: 'معادلة تأيّنه {{H2SO4 -> 2H+ + SO4^2-}} تؤكد الصيغة وتُظهر جذر الكبريتات.' },
  { type: 'tf', id: 'tf3', group: 'صواب أم خطأ؟', stem: 'تكافؤ البوتاسيوم يساوي $3$.', answer: false, why: 'جدول ص20 يعطي البوتاسيوم {{K}} تكافؤاً يساوي $1$؛ والذي تكافؤه $3$ هو الألمنيوم.' },
  { type: 'tf', id: 'tf4', group: 'صواب أم خطأ؟', stem: 'صيغة الماء هي {{H2O}}.', answer: true, why: 'ذرّتا هيدروجين مع ذرّة أكسجين، وهو جواب سؤال مدخل الدرس.' },

  { type: 'mc', id: 'mc1', group: 'اختر الإجابة الصحيحة', stem: 'الصيغة {{CaCO3}} تسمّى:', options: ['كربيتيد الكالسيوم', 'كبريتات الكالسيوم', 'كربون أكسيجين الكالسيوم', 'كربونات الكالسيوم'], answer: 3, why: 'الجذر السالب في الصيغة هو {{CO3^2-}} (الكربونات)، فالاسم: كربونات الكالسيوم.' },
  { type: 'mc', id: 'mc2', group: 'اختر الإجابة الصحيحة', stem: 'الصيغة الكيميائية لأكسيد الزنك هي:', options: ['{{ZnCO3}}', '{{ZnO}}', '{{ZnSO4}}', '{{ZnCl2}}'], answer: 1, why: 'تكافؤ الزنك $2$ والأكسجين $2$ فيتعادلان بذرّة من كلٍّ منهما: {{ZnO}}.' },

  { type: 'write', id: 'w1', group: 'اكتب الصيغة الكيميائية', stem: 'كبريتات الكالسيوم', answer: 'CaSO4', why: 'الكالسيوم $2$ والكبريتات $2$ فيتعادلان بأيون واحد من كلٍّ منهما: بلا أرقام ولا قوس.' },
  { type: 'write', id: 'w2', group: 'اكتب الصيغة الكيميائية', stem: 'أكسيد النحاس $\\mathrm{I}$', answer: 'Cu2O', why: 'الرقم الروماني $\\mathrm{I}$ يعني تكافؤ النحاس $1$، فيلزم أيونا نحاس لتعادل أيون أكسيد واحد.' },
  { type: 'write', id: 'w3', group: 'اكتب الصيغة الكيميائية', stem: 'هيدروكسيد الصوديوم', answer: 'NaOH', why: 'الصوديوم $1$ والهيدروكسيل $1$، والجذر يظهر مرّة واحدة فلا قوس.' },
  { type: 'write', id: 'w4', group: 'اكتب الصيغة الكيميائية', stem: 'خَلّات الزنك', answer: 'Zn(CH3COO)2', why: 'الزنك $2$ والخلّات $1$ فيلزم جذران، ولأن الجذر تكرّر نضعه بين قوسين.' },

  { type: 'mc', id: 'n1', group: 'اختر اسم المركّب', stem: '{{FeO}}', options: ['أكسيد الحديد $\\mathrm{I}$', 'أكسيد الحديد $\\mathrm{II}$', 'أكسيد الحديد $\\mathrm{III}$', 'حديد أكسيد'], answer: 1, why: 'الأكسجين $2$ إذن الحديد $2$ هنا، فنسمّيه أكسيد الحديد $\\mathrm{II}$.' },
  { type: 'mc', id: 'n2', group: 'اختر اسم المركّب', stem: '{{Al(NO3)3}}', options: ['نترات الألمنيوم', 'الألمنيوم نترات', 'كبريتات الألمنيوم', 'نترات الألمنيوم ثلاثة'], answer: 0, why: 'الجذر {{NO3-}} نترات، ولا يظهر القوس أو عدد التكرار في الاسم.' },
  { type: 'mc', id: 'n3', group: 'اختر اسم المركّب', stem: '{{NH4Cl}}', options: ['أمونيوم كلوريد', 'كلوريد الأمونيوم', 'هيدروكسيد الأمونيوم', 'كلوريد النتروجين'], answer: 1, why: 'الجزء السالب {{Cl-}} كلوريد، ثم الموجب الجذر {{NH4+}} الأمونيوم.' },
  { type: 'mc', id: 'n4', group: 'اختر اسم المركّب', stem: '{{ZnSO4}}', options: ['زنك كبريتات', 'كربونات الزنك', 'كبريتات الزنك', 'كبريتيد الزنك'], answer: 2, why: 'الجذر {{SO4^2-}} كبريتات، والفلز الزنك: كبريتات الزنك.' },

  { type: 'write', id: 'c1', group: 'من الاسم الشائع إلى الصيغة', stem: 'ملح الطعام (كلوريد الصوديوم)', answer: 'NaCl', why: '{{Na+}} و{{Cl-}} تكافؤهما $1$ و$1$ ⇒ {{NaCl}}.' },
  { type: 'write', id: 'c2', group: 'من الاسم الشائع إلى الصيغة', stem: 'الجبس (كبريتات الكالسيوم)', answer: 'CaSO4', why: 'الكالسيوم $2$ والكبريتات $2$ ⇒ {{CaSO4}}.' },
  { type: 'write', id: 'c3', group: 'من الاسم الشائع إلى الصيغة', stem: 'الحجر الكلسي (كربونات الكالسيوم)', answer: 'CaCO3', why: 'الكالسيوم $2$ والكربونات $2$ ⇒ {{CaCO3}}.' },
  { type: 'write', id: 'c4', group: 'من الاسم الشائع إلى الصيغة', stem: 'الكلس الحي (أكسيد الكالسيوم)', answer: 'CaO', why: 'الكالسيوم $2$ والأكسجين $2$ ⇒ {{CaO}} (التطبيق المحلول في الكتاب).' },
  { type: 'write', id: 'c5', group: 'من الاسم الشائع إلى الصيغة', stem: 'رائق الكلس (هيدروكسيد الكالسيوم)', answer: 'Ca(OH)2', why: 'الكالسيوم $2$ والهيدروكسيل $1$ فيلزم جذران بين قوسين ⇒ {{Ca(OH)2}}.' },
]

const KEYS = ['Ca', 'Zn', 'Cu', 'Na', 'Al', 'H', 'C', 'N', 'O', 'S', 'Cl', '(', ')', '2', '3', '4']

export default function QuizTab() {
  const { mark, done } = useProgress()
  const [order, setOrder] = useState<Q[]>(QUESTIONS)
  const [qi, setQi] = useState(0)
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [picked, setPicked] = useState<boolean | number | null>(null)
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)

  const finished = qi >= order.length
  const q = order[Math.min(qi, order.length - 1)]
  const score = Object.values(results).filter(Boolean).length
  const pct = Math.round((score / QUESTIONS.length) * 100)

  useEffect(() => {
    if (finished && pct >= 60) mark('quiz')
  }, [finished, pct, mark])

  const isOk = useMemo(() => {
    if (!checked) return null
    if (q.type === 'tf') return picked === q.answer
    if (q.type === 'mc') return picked === q.answer
    return normFormula(text) === normFormula(q.answer)
  }, [checked, picked, text, q])

  const submit = () => {
    if (checked) return
    const ok =
      q.type === 'write' ? normFormula(text) === normFormula(q.answer) : q.type === 'tf' ? picked === q.answer : picked === q.answer
    setResults((r) => ({ ...r, [q.id]: ok }))
    setChecked(true)
  }
  const next = () => {
    setQi((n) => n + 1)
    setPicked(null)
    setText('')
    setChecked(false)
  }
  const restart = (onlyWrong = false) => {
    const list = onlyWrong ? QUESTIONS.filter((x) => results[x.id] === false) : QUESTIONS
    setOrder(list)
    setResults((r) => (onlyWrong ? Object.fromEntries(Object.entries(r).filter(([, v]) => v)) : {}))
    setQi(0)
    setPicked(null)
    setText('')
    setChecked(false)
  }

  const canSubmit = q.type === 'write' ? normFormula(text).length > 0 : picked !== null
  const preview = /^[A-Za-z0-9()\s₀-₉]+$/.test(text) ? normFormula(text) : ''
  const mistakesNow = Object.values(results).filter((x) => !x).length

  /* ----------------------------- شاشة النتيجة ----------------------------- */
  if (finished) {
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0
    const missed = QUESTIONS.filter((x) => results[x.id] === false)
    return (
      <div className="space-y-6">
        <TabIntro icon={Trophy} kicker="المحطة الأخيرة · أختبر نفسي (ص23)" title="نتيجة الاختبار الشامل" />
        <Card className="text-center">
          <div dir="ltr" className="mb-2 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <Star key={i} className={cn('anim-pop h-14 w-14 transition', i < stars ? 'fill-gold-400 text-gold-500' : 'text-forest-900/15')} style={{ animationDelay: `${i * 160}ms` }} />
            ))}
          </div>
          <p dir="ltr" className="text-6xl font-bold text-forest-900">
            <Num>{score}</Num>
            <span className="mx-3 text-forest-800/30">/</span>
            <Num>{QUESTIONS.length}</Num>
          </p>
          <p className="mt-2 text-lg font-semibold">
            <Num>{pct}</Num>% — {pct >= 90 ? 'كيميائي بارع! 🌟' : pct >= 70 ? 'أداء جيد جداً' : pct >= 50 ? 'جيد، يمكنك التحسّن' : 'لا بأس، راجع التبويبات وأعد المحاولة'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {missed.length > 0 && (
              <Btn variant="gold" onClick={() => restart(true)}>
                أعد الأسئلة الخاطئة (<Num>{missed.length}</Num>)
              </Btn>
            )}
            <Btn onClick={() => restart(false)}>
              <RotateCcw className="h-4 w-4" /> اختبار جديد كاملاً
            </Btn>
          </div>
        </Card>

        {missed.length > 0 && (
          <Card>
            <h3 className="mb-3 text-lg font-bold text-forest-900">مراجعة الأسئلة التي أخطأت فيها</h3>
            <div className="space-y-3">
              {missed.map((m) => (
                <div key={m.id} className="rounded-2xl border border-clay-400/40 bg-clay-100/40 p-3.5 text-sm leading-7">
                  <p className="font-bold">
                    <Rich>{m.stem}</Rich>
                  </p>
                  <p className="mt-1">
                    <Rich>{m.why}</Rich>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
        {done.has('quiz') && <DoneBanner>أنجزت الاختبار الشامل — أكملت رحلة المختبر في الدرس الثالث!</DoneBanner>}
      </div>
    )
  }

  /* ----------------------------- شاشة السؤال ----------------------------- */
  return (
    <div className="space-y-6">
      <TabIntro icon={Trophy} kicker="المحطة الأخيرة · أختبر نفسي (ص23)" title="الاختبار الشامل: أسئلة الكتاب بحلّ فوري">
        <Num>{QUESTIONS.length}</Num> سؤالاً من أنواع مختلفة: صواب وخطأ، اختيار، كتابة صيغ، تسمية، وأسماء شائعة.
      </TabIntro>

      <Card>
        <div dir="ltr" className="mb-4 flex items-center gap-1">
          {order.map((o, i) => (
            <span
              key={o.id}
              className={cn(
                'h-2.5 flex-1 rounded-full transition-colors',
                results[o.id] === true ? 'bg-leaf-500' : results[o.id] === false ? 'bg-clay-500' : i === qi ? 'bg-gold-400' : 'bg-mint-200',
              )}
            />
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <Tag tone="plum">{q.group}</Tag>
          <span className="flex items-center gap-2">
            <Tag>
              السؤال <Frac a={qi + 1} b={order.length} />
            </Tag>
            <Tag tone="gold">
              نقاطك <Num>{score}</Num>
            </Tag>
          </span>
        </div>

        <div key={q.id} className="anim-up">
          <div className="rounded-2xl bg-gradient-to-b from-white to-mint-50 p-5 text-center text-2xl font-semibold leading-10 ring-1 ring-forest-900/10 sm:text-3xl">
            <Rich>{q.stem}</Rich>
          </div>

          {q.type === 'tf' && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  disabled={checked}
                  onClick={() => setPicked(v)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-xl font-bold transition active:scale-95',
                    picked === v ? (v ? 'border-leaf-600 bg-leaf-500 text-white' : 'border-clay-600 bg-clay-500 text-white') : 'border-forest-900/15 bg-white hover:bg-mint-50',
                    checked && q.answer === v && 'ring-4 ring-gold-400/70',
                  )}
                >
                  {v ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                  {v ? 'صحيحة' : 'خاطئة'}
                </button>
              ))}
            </div>
          )}

          {q.type === 'mc' && (
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {q.options.map((o, i) => (
                <button
                  key={i}
                  disabled={checked}
                  onClick={() => setPicked(i)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-start text-lg font-semibold transition active:scale-[0.98]',
                    picked === i ? 'border-forest-800 bg-forest-800 text-white' : 'border-forest-900/15 bg-white hover:bg-mint-50',
                    checked && q.answer === i && 'ring-4 ring-gold-400/70',
                  )}
                >
                  <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold', picked === i ? 'bg-white/25' : 'bg-mint-100 text-forest-800')}>{'abcd'[i]}</span>
                  <Rich>{o}</Rich>
                </button>
              ))}
            </div>
          )}

          {q.type === 'write' && (
            <div className="mt-4 space-y-3">
              <div dir="ltr" className="flex items-center gap-2">
                <input
                  value={text}
                  disabled={checked}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && (checked ? next() : submit())}
                  placeholder="Al2(SO4)3"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="اكتب الصيغة الكيميائية"
                  className="font-math h-14 min-w-0 flex-1 rounded-2xl border-2 border-forest-900/20 bg-white px-4 text-center text-2xl tracking-wide outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-400/25 disabled:bg-mint-50"
                />
                <button
                  disabled={checked || !text}
                  onClick={() => setText((t) => t.slice(0, -1))}
                  aria-label="حذف"
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-mint-100 text-forest-800 transition active:scale-90 disabled:opacity-40"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>
              <div dir="ltr" className="grid grid-cols-8 gap-1.5 sm:grid-cols-16">
                {KEYS.map((k) => (
                  <button
                    key={k}
                    disabled={checked}
                    onClick={() => setText((t) => t + k)}
                    className="font-math rounded-xl border border-forest-900/15 bg-white py-2 text-lg font-bold text-forest-800 transition hover:bg-mint-100 active:scale-90 disabled:opacity-40"
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="grid min-h-16 place-items-center rounded-2xl bg-white text-3xl ring-1 ring-forest-900/10">
                {preview ? <Ce f={preview} /> : <span className="text-sm text-forest-800/40">ستظهر صيغتك هنا بشكل منسّق</span>}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {checked ? (
              <div className={cn('anim-pop min-w-0 flex-1 rounded-2xl p-3.5 text-sm leading-7', isOk ? 'bg-mint-200/80 text-forest-950' : 'bg-clay-100 text-forest-950')}>
                <b className={isOk ? 'text-leaf-600' : 'text-clay-600'}>{isOk ? 'إجابة صحيحة! ' : 'ليست صحيحة. '}</b>
                {!isOk && q.type === 'write' && (
                  <>
                    الصواب: <Ce f={q.answer} />.{' '}
                  </>
                )}
                <Rich>{q.why}</Rich>
              </div>
            ) : (
              <span />
            )}
            {checked ? (
              <Btn onClick={next} className="ms-auto">
                {qi + 1 >= order.length ? 'عرض النتيجة' : 'السؤال التالي'} <ArrowLeft className="h-4 w-4" />
              </Btn>
            ) : (
              <Btn onClick={submit} disabled={!canSubmit} className="ms-auto px-6">
                تحقّق من إجابتي
              </Btn>
            )}
          </div>
        </div>
      </Card>

      <Callout kind="tip" title="نصيحة">
        في أسئلة الكتابة اضغط على أزرار الرموز أو اكتب بلوحة المفاتيح؛ الأرقام تتحوّل تلقائياً إلى أرقام سفلية في المعاينة. أخطأتَ حتى الآن في <Num>{mistakesNow}</Num> سؤالاً.
      </Callout>
    </div>
  )
}
