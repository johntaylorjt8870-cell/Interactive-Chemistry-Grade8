import { useEffect, useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Atom, Bond } from '@/components/Atoms'
import { Callout, Card, Chip, DoneBanner, SectionTitle, Stepper, TabIntro } from '@/components/ui'
import { Ce, Num, Rich } from '@/components/Tex'
import { ELEMENTS, parseFormula, shade, splitCoef } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

/* ------------------------------ اصنع جزيء الماء ------------------------------ */

function WaterLab({ onDone }: { onDone: () => void }) {
  const [h, setH] = useState(0)
  const [o, setO] = useState(0)
  const water = h === 2 && o === 1

  useEffect(() => {
    if (water) onDone()
  }, [water, onDone])

  const hPos = Array.from({ length: h }, (_, i) =>
    water ? { x: i === 0 ? 168 : 312, y: 168 } : { x: 240 + (i - (h - 1) / 2) * 62, y: 190 },
  )
  const oPos = Array.from({ length: o }, (_, i) =>
    water ? { x: 240, y: 98 } : { x: 240 + (i - (o - 1) / 2) * 84, y: 84 },
  )

  const tex = h === 0 && o === 0 ? '' : `${h ? 'H' + (h > 1 ? h : '') : ''}${o ? 'O' + (o > 1 ? o : '') : ''}`
  let msg: { kind: 'idle' | 'ok' | 'no'; text: string }
  if (h === 0 && o === 0) msg = { kind: 'idle', text: 'أضف ذرّات من الهيدروجين والأكسجين لتبدأ التجربة.' }
  else if (water)
    msg = {
      kind: 'ok',
      text: 'اتّحدت ذرّتا هيدروجين مع ذرّة أكسجين وتكوّن جزيء الماء. الرقم 2 يخصّ الهيدروجين فقط، ولا نكتب العدد 1 بعد الأكسجين.',
    }
  else if (h === 2 && o === 2)
    msg = { kind: 'no', text: 'هذه {{H2O2}}: نسبة مختلفة تعطي مادة مختلفة (الماء الأكسجيني) وليست الماء.' }
  else if (h === 0 || o === 0) msg = { kind: 'no', text: 'لا يتكوّن مركّب من عنصر واحد؛ المركّب يحتاج عنصرين مختلفين على الأقل.' }
  else msg = { kind: 'no', text: 'ليست صيغة الماء. الماء يحتاج بالضبط ذرّتي هيدروجين وذرّة أكسجين في الجزيء الواحد.' }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid-bg relative overflow-hidden rounded-2xl border border-forest-900/10 bg-mint-50">
        <svg viewBox="0 0 480 270" className="svg-ltr w-full" role="img" aria-label="مختبر بناء جزيء الماء">
          {water && <circle cx="240" cy="140" r="112" fill="rgba(91,176,202,0.13)" className="anim-glow" />}
          {water && (
            <g className="anim-up">
              <Bond x1={240} y1={98} x2={168} y2={168} w={8} />
              <Bond x1={240} y1={98} x2={312} y2={168} w={8} />
              <circle cx="204" cy="133" r="4.5" fill="#2b8666" className="anim-glow" />
              <circle cx="276" cy="133" r="4.5" fill="#2b8666" className="anim-glow" />
            </g>
          )}
          {oPos.map((p, i) => (
            <g key={`O${i}`} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform .9s cubic-bezier(.3,1.25,.5,1)' }}>
              <g className={cn(!water && 'anim-bob')} style={{ animationDelay: `${i * 0.3}s` }}>
                <Atom el="O" x={0} y={0} r={36} />
              </g>
            </g>
          ))}
          {hPos.map((p, i) => (
            <g key={`H${i}`} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform .9s cubic-bezier(.3,1.25,.5,1)' }}>
              <g className={cn(!water && 'anim-bob')} style={{ animationDelay: `${i * 0.25 + 0.1}s` }}>
                <Atom el="H" x={0} y={0} r={25} />
              </g>
            </g>
          ))}
          {h === 0 && o === 0 && (
            <text x="240" y="140" textAnchor="middle" fontSize="15" fill="#6b8a80" direction="rtl" fontFamily="IBM Plex Sans Arabic">
              مساحة المختبر فارغة
            </text>
          )}
        </svg>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-mint-100 p-4">
          <Stepper
            value={h}
            onChange={setH}
            max={4}
            label={
              <span className="inline-flex items-center gap-1.5">
                ذرّات الهيدروجين <Ce f="H" />
              </span>
            }
          />
          <Stepper
            value={o}
            onChange={setO}
            max={3}
            tone="clay"
            label={
              <span className="inline-flex items-center gap-1.5">
                ذرّات الأكسجين <Ce f="O" />
              </span>
            }
          />
        </div>

        <div
          className={cn(
            'rounded-2xl border p-4 text-center transition',
            msg.kind === 'ok' ? 'border-leaf-500/50 bg-mint-200/70' : 'border-forest-900/10 bg-white',
          )}
        >
          <p className="text-xs font-semibold text-forest-800/70">الصيغة الكيميائية الناتجة</p>
          <div className="my-1 min-h-14 text-4xl">{tex ? <Ce f={tex} /> : <span className="text-forest-800/30">—</span>}</div>
          <p className={cn('text-sm leading-7', msg.kind === 'no' && 'text-clay-600', msg.kind === 'ok' && 'text-forest-900')}>
            <Rich>{msg.text}</Rich>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ قارئ الصيغ ------------------------------ */

type TokKind = 'coef' | 'sym' | 'sub' | 'open' | 'close' | 'gsub'
interface Tok {
  k: TokKind
  t: string
}

function tokenize(f: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  const m = /^(\d+)/.exec(f)
  if (m) {
    out.push({ k: 'coef', t: m[1] })
    i = m[1].length
  }
  let afterClose = false
  while (i < f.length) {
    const ch = f[i]
    if (ch === '(') {
      out.push({ k: 'open', t: '(' })
      i++
      afterClose = false
    } else if (ch === ')') {
      out.push({ k: 'close', t: ')' })
      i++
      afterClose = true
    } else if (/[A-Z]/.test(ch)) {
      let s = ch
      i++
      while (i < f.length && /[a-z]/.test(f[i])) s += f[i++]
      out.push({ k: 'sym', t: s })
      afterClose = false
    } else if (/\d/.test(ch)) {
      let s = ''
      while (i < f.length && /\d/.test(f[i])) s += f[i++]
      out.push({ k: afterClose ? 'gsub' : 'sub', t: s })
      afterClose = false
    } else i++
  }
  return out
}

const TOK_STYLE: Record<TokKind, { bar: string; text: string; label: string; size: string }> = {
  coef: { bar: 'bg-gold-400', text: 'text-gold-600', label: 'معامل', size: 'text-[58px]' },
  sym: { bar: 'bg-leaf-500', text: 'text-forest-800', label: 'رمز العنصر', size: 'text-[58px]' },
  sub: { bar: 'bg-lagoon-500', text: 'text-lagoon-600', label: 'أُسّ سفلي', size: 'text-[30px]' },
  open: { bar: 'bg-plum-500', text: 'text-plum-600', label: 'قوس', size: 'text-[58px]' },
  close: { bar: 'bg-plum-500', text: 'text-plum-600', label: 'قوس', size: 'text-[58px]' },
  gsub: { bar: 'bg-clay-500', text: 'text-clay-600', label: 'عدد الجذر', size: 'text-[30px]' },
}

const EXAMPLES: Array<{ f: string; note: string }> = [
  { f: 'H2O', note: 'ذرّتان من {{H}} وذرّة واحدة من {{O}}. العدد 1 لا يُكتب بعد الرمز.' },
  { f: 'CO2', note: 'ذرّة كربون واحدة وذرّتا أكسجين: الأُسّ السفلي يخصّ الرمز الذي قبله مباشرة.' },
  { f: 'NaCl', note: 'ذرّة {{Na}} وذرّة {{Cl}}: لا أرقام سفلية لأن كل عدد يساوي 1.' },
  { f: '2H2O', note: 'المعامل 2 يضرب الصيغة كلها: جزيئان من الماء = 4 ذرّات {{H}} وذرّتا {{O}}.' },
  { f: 'Ca(OH)2', note: 'الرقم 2 خارج القوس يضرب الجذر كله: ذرّتا {{O}} وذرّتا {{H}} (وذرّة {{Ca}} واحدة).' },
  { f: 'Al2(SO4)3', note: 'الرقم 3 يضرب ما داخل القوس: 3 ذرّات {{S}} و$3 \\times 4 = 12$ ذرّة {{O}}، مع ذرّتي {{Al}}.' },
]

function FormulaReader({ onCorrect }: { onCorrect: () => void }) {
  const [idx, setIdx] = useState(5)
  const [answer, setAnswer] = useState<number | null>(null)
  const ex = EXAMPLES[idx]
  const toks = useMemo(() => tokenize(ex.f), [ex.f])
  const [coef, base] = useMemo(() => splitCoef(ex.f), [ex.f])
  const counts = useMemo(() => {
    const c = parseFormula(base)
    const out: Record<string, number> = {}
    for (const k in c) out[k] = c[k] * coef
    return out
  }, [base, coef])
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  // سؤال: العنصر الأكثر ذرّات
  const target = useMemo(() => Object.entries(counts).sort((a, b) => b[1] - a[1])[0], [counts])
  const options = useMemo(() => {
    const c = target[1]
    const set = new Set<number>([c, c + 1, c * 2, Math.max(1, c - 1), c + 3])
    return [...set].slice(0, 4).sort((a, b) => a - b)
  }, [target])

  useEffect(() => setAnswer(null), [idx])
  useEffect(() => {
    if (answer !== null && answer === target[1]) onCorrect()
  }, [answer, target, onCorrect])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e, i) => (
          <Chip key={e.f} active={i === idx} onClick={() => setIdx(i)}>
            <Ce f={e.f} />
          </Chip>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-forest-900/10 bg-gradient-to-b from-white to-mint-50 p-4 sm:p-6">
        <div dir="ltr" className="mx-auto flex w-max items-end justify-center gap-1.5 sm:gap-2">
          {toks.map((t, i) => {
            const s = TOK_STYLE[t.k]
            return (
              <div key={`${ex.f}-${i}`} className="anim-pop flex flex-col items-center" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="flex h-[72px] items-end">
                  <span className={cn('font-math font-bold leading-none', s.size, s.text)}>{t.t}</span>
                </div>
                <span className={cn('mt-2 h-1.5 w-full min-w-6 rounded-full', s.bar)} />
                <span className={cn('mt-1 whitespace-nowrap text-[11px] font-bold', s.text)}>{s.label}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-center text-sm leading-7 text-forest-900">
          <Rich>{ex.note}</Rich>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-forest-900/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-forest-900">عدّاد الذرّات</h4>
            <span className="rounded-xl bg-forest-800 px-3 py-1 text-sm font-bold text-white">
              المجموع <Num>{total}</Num>
            </span>
          </div>
          <div className="space-y-2.5">
            {Object.entries(counts).map(([el, n]) => {
              const e = ELEMENTS[el]
              return (
                <div key={`${ex.f}-${el}`} className="flex items-center gap-3">
                  <div className="w-24 shrink-0 text-sm font-semibold text-forest-800">
                    <Ce f={el} /> <span className="text-xs font-medium text-forest-800/70">{e.ar}</span>
                  </div>
                  <div dir="ltr" className="flex flex-1 flex-wrap gap-1">
                    {Array.from({ length: n }, (_, i) => (
                      <span
                        key={i}
                        className="anim-pop grid h-7 w-7 place-items-center rounded-full font-math text-[11px] font-bold shadow-sm"
                        style={{
                          animationDelay: `${i * 35}ms`,
                          color: e.ink,
                          background: `radial-gradient(circle at 35% 30%, ${shade(e.color, 0.55)}, ${e.color} 60%, ${shade(e.color, -0.3)})`,
                        }}
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                  <span className="w-8 text-end text-lg font-bold">
                    <Num>{n}</Num>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gold-400/40 bg-gold-100/60 p-4">
          <h4 className="mb-2 font-bold text-forest-900">اختبر نفسك</h4>
          <p className="mb-3 text-sm leading-7">
            كم ذرّة من العنصر <Ce f={target[0]} /> في الصيغة <Ce f={ex.f} />؟
          </p>
          <div dir="ltr" className="grid grid-cols-4 gap-2">
            {options.map((n) => {
              const right = answer === n && n === target[1]
              const wrong = answer === n && n !== target[1]
              return (
                <button
                  key={n}
                  onClick={() => setAnswer(n)}
                  className={cn(
                    'rounded-xl border py-2.5 text-lg font-bold transition active:scale-95',
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
          {answer !== null && (
            <p className={cn('mt-3 text-sm font-semibold leading-7', answer === target[1] ? 'text-leaf-600' : 'text-clay-600')}>
              {answer === target[1] ? 'أحسنت! ' : 'ليس بعد، أعد العدّ: '}
              <Rich>{counts && target[1] > 1 && base.includes('(') ? 'اضرب الرقم خارج القوس في الرقم داخله.' : 'اجمع ما يخصّ الرمز ثم اضرب في المعامل.'}</Rich>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ التبويب ------------------------------ */

export default function FormulaTab() {
  const { mark, done } = useProgress()
  const [water, setWater] = useState(false)
  const [quiz, setQuiz] = useState(false)

  useEffect(() => {
    if (water && quiz) mark('formula')
  }, [water, quiz, mark])

  return (
    <div className="space-y-6">
      <TabIntro icon={FlaskConical} kicker="الفكرة الأولى · مدخل الدرس (ص18)" title="ما الصيغة الكيميائية؟ ولماذا نحتاجها؟">
        الاسم «ماء» لا يخبرنا بعدد الذرّات. الصيغة الكيميائية لغة عالمية مختصرة تصف <b>عدد ذرّات كل عنصر</b> في الجزيء الواحد.
      </TabIntro>

      <Card>
        <SectionTitle n={1} sub="تتّحد ذرّتا هيدروجين مع ذرّة أكسجين فيتكوّن جزيء الماء، فما صيغته؟">
          اصنع جزيء الماء بنفسك
        </SectionTitle>
        <WaterLab onDone={() => setWater(true)} />
      </Card>

      <Card>
        <SectionTitle n={2} sub="اختر صيغة وانظر كيف تُقرأ أجزاؤها: المعامل، الرمز، الأُسّ السفلي، والقوس.">
          قارئ الصيغ الكيميائية
        </SectionTitle>
        <FormulaReader onCorrect={() => setQuiz(true)} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout kind="rule" title="قاعدة ذهبية">
          الأُسّ السفلي يخصّ الرمز الذي قبله مباشرة، والمعامل يضرب الصيغة كلها، والقوس يجمع الجذر كله.
        </Callout>
        <Callout kind="info" title="تذكّر">
          الرقم <Rich>$1$</Rich> لا يُكتب في الصيغ الكيميائية: نكتب {' '}
          <Ce f="H2O" /> وليس <Ce f="H2O1" />.
        </Callout>
      </div>

      {done.has('formula') && <DoneBanner>أنجزت محطة «ما الصيغة؟» — جاهز للانتقال إلى الرمز والصيغة والأيون!</DoneBanner>}
    </div>
  )
}
