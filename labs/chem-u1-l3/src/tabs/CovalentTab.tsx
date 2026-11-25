import { useEffect, useState } from 'react'
import { Link2, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Atom, Bond } from '@/components/Atoms'
import { Btn, Callout, Card, Chip, DoneBanner, SectionTitle, TabIntro, Tag } from '@/components/ui'
import { Ce, Num, Rich } from '@/components/Tex'
import { ELEMENTS } from '@/lib/chem'
import { useProgress } from '@/lib/progress'

type Central = 'C' | 'N' | 'O'

const CFG: Record<
  Central,
  { v: number; outer: number; formula: string; name: string; cx: number; cy: number; slots: Array<[number, number]> }
> = {
  C: {
    v: 4,
    outer: 4,
    formula: 'CH4',
    name: 'الميتان',
    cx: 230,
    cy: 150,
    slots: [[-96, -80], [96, -80], [-96, 80], [96, 80]],
  },
  N: {
    v: 3,
    outer: 5,
    formula: 'NH3',
    name: 'النشادر',
    cx: 230,
    cy: 124,
    slots: [[0, -102], [92, 80], [-92, 80]],
  },
  O: {
    v: 2,
    outer: 6,
    formula: 'H2O',
    name: 'الماء',
    cx: 230,
    cy: 112,
    slots: [[-96, 78], [96, 78]],
  },
}

const BARS: Array<{ el: string; outer: number; v: number }> = [
  { el: 'H', outer: 1, v: 1 },
  { el: 'C', outer: 4, v: 4 },
  { el: 'N', outer: 5, v: 3 },
  { el: 'O', outer: 6, v: 2 },
]

function Molecule({ central, count, onAdd }: { central: Central; count: number; onAdd: () => void }) {
  const c = CFG[central]
  return (
    <svg viewBox="0 0 460 300" className="svg-ltr w-full" role="img" aria-label="نموذج الرابطة المشتركة">
      {count >= c.v && <circle cx={c.cx} cy={c.cy} r="128" fill="rgba(63,164,126,0.12)" className="anim-glow" />}
      {c.slots.map(([dx, dy], i) => {
        if (i >= count) return null
        const x2 = c.cx + dx
        const y2 = c.cy + dy
        const len = Math.hypot(dx, dy)
        const px = -dy / len
        const py = dx / len
        const mx = c.cx + dx / 2
        const my = c.cy + dy / 2
        return (
          <g key={`b${i}`} className="anim-up">
            <Bond x1={c.cx} y1={c.cy} x2={x2} y2={y2} w={9} />
            <circle cx={mx + px * 6} cy={my + py * 6} r="4.5" fill="#2b8666" stroke="#fff" strokeWidth="1.5" className="anim-glow" />
            <circle cx={mx - px * 6} cy={my - py * 6} r="4.5" fill="#2b8666" stroke="#fff" strokeWidth="1.5" className="anim-glow" />
          </g>
        )
      })}
      <Atom el={central} x={c.cx} y={c.cy} r={42} />
      {c.slots.map(([dx, dy], i) => {
        const x = c.cx + dx
        const y = c.cy + dy
        return i < count ? (
          <g key={`h${i}`} style={{ transformOrigin: `${x}px ${y}px` }} className="anim-pop">
            <Atom el="H" x={x} y={y} r={27} />
          </g>
        ) : (
          <g key={`g${i}`} onClick={onAdd} className="cursor-pointer" role="button" aria-label="أضف ذرة هيدروجين">
            <circle cx={x} cy={y} r="27" fill="rgba(255,255,255,0.7)" stroke="#3fa47e" strokeWidth="2.5" strokeDasharray="6 6" className="dash-flow" />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize="26" fill="#2b8666" fontWeight="700" className="svg-math">
              +
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function CovalentTab() {
  const { mark, done } = useProgress()
  const [central, setCentral] = useState<Central>('O')
  const [count, setCount] = useState(0)
  const [built, setBuilt] = useState<Central[]>([])
  const c = CFG[central]
  const full = count === c.v

  useEffect(() => {
    if (full && !built.includes(central)) setBuilt((b) => [...b, central])
  }, [full, central, built])

  useEffect(() => {
    if (built.length === 3) mark('covalent')
  }, [built, mark])

  const pick = (k: Central) => {
    setCentral(k)
    setCount(0)
  }

  return (
    <div className="space-y-6">
      <TabIntro icon={Link2} kicker="الفكرة الثالثة · التكافؤ الكيميائي (ص19)" title="التكافؤ في المركّبات ذات الروابط المشتركة">
        عندما تتشارك الذرّات أزواجاً من الإلكترونات تتكوّن روابط مشتركة، و<b>تكافؤ الذرّة = عدد الروابط التي اشتركت بها</b>.
      </TabIntro>

      <Card>
        <SectionTitle n={1} sub="اختر الذرّة المركزية ثم اضغط على الدوائر المنقّطة لربط ذرّات الهيدروجين بها">
          مختبر تشكيل الروابط
        </SectionTitle>

        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(CFG) as Central[]).map((k) => (
            <Chip key={k} active={central === k} onClick={() => pick(k)}>
              <Ce f={k} /> {ELEMENTS[k].ar}
              {built.includes(k) && <span className="text-gold-400">✓</span>}
            </Chip>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid-bg overflow-hidden rounded-2xl border border-forest-900/10 bg-mint-50">
            <Molecule central={central} count={count} onAdd={() => setCount((n) => Math.min(c.v, n + 1))} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-mint-100 p-4">
              <p className="mb-2 text-sm font-semibold text-forest-800">عدّاد الروابط المشتركة</p>
              <div dir="ltr" className="flex items-center justify-center gap-2">
                {Array.from({ length: c.v }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'grid h-11 w-11 place-items-center rounded-full border-2 text-lg font-bold transition-all duration-500',
                      i < count ? 'scale-110 border-leaf-600 bg-leaf-500 text-white shadow-md' : 'border-dashed border-forest-900/25 bg-white text-forest-800/30',
                    )}
                  >
                    {i < count ? <Num>{i + 1}</Num> : '·'}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <Btn variant="soft" disabled={count === 0} onClick={() => setCount((n) => n - 1)}>
                  أزل ذرّة
                </Btn>
                <Btn disabled={full} onClick={() => setCount((n) => n + 1)}>
                  اربط ذرّة <Ce f="H" />
                </Btn>
                <Btn variant="ghost" onClick={() => setCount(0)} aria-label="إعادة">
                  <RotateCcw className="h-4 w-4" />
                </Btn>
              </div>
            </div>

            <div
              className={cn(
                'rounded-2xl border p-4 text-center transition-all',
                full ? 'anim-pop border-leaf-500/60 bg-mint-200/70' : 'border-forest-900/10 bg-white',
              )}
            >
              {full ? (
                <>
                  <Tag tone="gold">اكتمل التكافؤ</Tag>
                  <div className="my-2 text-4xl">
                    <Ce f={c.formula} />
                  </div>
                  <p className="text-sm font-bold">جزيء {c.name}</p>
                  <p className="mt-1 text-sm leading-7">
                    <Rich>{`تكافؤ {{${central}}} يساوي $${c.v}$ لأنها شكّلت $${c.v}$ روابط مشتركة.`}</Rich>
                  </p>
                </>
              ) : (
                <p className="text-sm leading-7 text-forest-800">
                  {count === 0 ? 'الذرّة وحيدة: لم تشكّل أي رابطة بعد.' : (
                    <Rich>{`شكّلت $${count}$ من $${c.v}$ روابط؛ ما زالت بحاجة إلى $${c.v - count}$.`}</Rich>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-forest-900/10">
          <span className="text-sm font-semibold">تقدّمك:</span>
          {(Object.keys(CFG) as Central[]).map((k) => (
            <Tag key={k} tone={built.includes(k) ? 'gold' : 'leaf'}>
              {built.includes(k) ? '✓' : '○'} {CFG[k].name} <Ce f={CFG[k].formula} />
            </Tag>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle n={2} sub="التكافؤ يُقرأ من الروابط لا من عدد إلكترونات السطح">
            إلكترونات السطح ≠ التكافؤ
          </SectionTitle>
          <div className="space-y-3.5">
            {BARS.map((b) => (
              <div key={b.el} className={cn('rounded-xl p-2.5 transition', b.el === central ? 'bg-gold-100/70 ring-1 ring-gold-400/60' : '')}>
                <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-base shadow-sm ring-1 ring-forest-900/10">
                    <Ce f={b.el} />
                  </span>
                  {ELEMENTS[b.el].ar}
                </div>
                <div dir="ltr" className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-mint-100">
                      <div className="h-full rounded-full bg-gold-400 transition-all duration-700" style={{ width: `${(b.outer / 6) * 100}%` }} />
                    </div>
                    <span className="w-6 text-sm font-bold">
                      <Num>{b.outer}</Num>
                    </span>
                    <span className="w-24 text-end text-[11px] font-semibold text-gold-600" dir="rtl">
                      إلكترونات السطح
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-mint-100">
                      <div className="h-full rounded-full bg-leaf-500 transition-all duration-700" style={{ width: `${(b.v / 6) * 100}%` }} />
                    </div>
                    <span className="w-6 text-sm font-bold">
                      <Num>{b.v}</Num>
                    </span>
                    <span className="w-24 text-end text-[11px] font-semibold text-leaf-600" dir="rtl">
                      التكافؤ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Callout kind="rule" title="استنتاج الكتاب (ص19)">
            التكافؤ الكيميائي في المركّبات ذات الروابط المشتركة يساوي <b>عدد الروابط التي اشتركت بها الذرّة</b>، أي عدد الأزواج الإلكترونية التي اشتركت بها مع ذرّة أخرى.
          </Callout>
          <Card>
            <SectionTitle>النماذج الثلاثة في الكتاب</SectionTitle>
            <div className="overflow-hidden rounded-xl border border-forest-900/10">
              <table className="w-full text-center text-sm">
                <thead className="bg-forest-800 text-white">
                  <tr>
                    <th className="p-2.5">الجزيء</th>
                    <th className="p-2.5">الذرّة المركزية</th>
                    <th className="p-2.5">عدد الروابط = التكافؤ</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(CFG) as Central[]).map((k, i) => (
                    <tr key={k} className={i % 2 ? 'bg-mint-50' : 'bg-white'}>
                      <td className="p-2.5">
                        <Ce f={CFG[k].formula} /> <span className="text-xs">{CFG[k].name}</span>
                      </td>
                      <td className="p-2.5">
                        <Ce f={k} />
                      </td>
                      <td className="p-2.5 font-bold">
                        <Num>{CFG[k].v}</Num>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm leading-7">
              وكل ذرّة هيدروجين شكّلت <b>رابطة واحدة</b> فتكافؤها <Rich>$1$</Rich>.
            </p>
          </Card>
        </div>
      </div>

      {done.has('covalent') && <DoneBanner>أحسنت! بنيت الميتان والنشادر والماء واستنتجت أن التكافؤ = عدد الروابط.</DoneBanner>}
    </div>
  )
}
