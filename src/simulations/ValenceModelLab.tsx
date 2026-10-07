import { useEffect, useRef, useState } from 'react'
import { ChemicalFormula } from '@/scientific'
import { RtlRun } from '@/components/BidiText'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر التكافؤ في النماذج الجزيئية — إضافة من المنصة
   يعيد تمثيل نماذج الصفحة 19 (H₂O / NH₃ / CH₄) حركيًا: تتجهّب ذرّات الهيدروجين
   إلى الذرّة المركزية رابطةً بعد رابطة، ويظهر الزوج المشترك عند اكتمال كل رابطة،
   فتُقرأ قيمة التكافؤ كعدد الروابط التي شكّلتها الذرّة المركزية — وهو استنتاج
   الكتاب نفسه، مع بقاء النماذج المطبوعة مرجع الشكل ووسم المختبر إضافةً من المنصة.
   ========================================================================= */

type MoleculeId = 'H2O' | 'NH3' | 'CH4'

type MoleculeSpec = {
  id: MoleculeId
  formula: string
  name: string
  central: { symbol: string; label: string; fill: string; stroke: string }
  bonds: number
  /** مواقع ذرّات الهيدروجين بالنسبة لمركز الذرّة المركزية (وحدات SVG). */
  offsets: Array<{ x: number; y: number }>
  /** عدد إلكترونات السطح للذرّة المركزية قبل الارتباط (للقراءة المقارنة فقط). */
  surfaceElectrons: number
  completion: string
  note: string
}

const MOLECULES: MoleculeSpec[] = [
  {
    id: 'H2O',
    formula: 'H2O',
    name: 'الماء',
    central: { symbol: 'O', label: 'الأكسجين', fill: '#e8890c', stroke: '#a35c05' },
    bonds: 2,
    offsets: [
      { x: -62, y: -58 },
      { x: 62, y: -58 },
    ],
    surfaceElectrons: 6,
    completion: 'أكملت ذرّة الأكسجين رابطتين مشتركتين؛ بتشاركها زوجين وصلت إلى 8 إلكترونات سطحية.',
    note: 'شكّل الأكسجين رابطتين مشتركتين مع ذرّتي هيدروجين؛ فتكافؤه في الماء = 2.',
  },
  {
    id: 'NH3',
    formula: 'NH3',
    name: 'النشادر',
    central: { symbol: 'N', label: 'النتروجين', fill: '#4e9a2f', stroke: '#2f6b1b' },
    bonds: 3,
    offsets: [
      { x: 0, y: -72 },
      { x: -66, y: 48 },
      { x: 66, y: 48 },
    ],
    surfaceElectrons: 5,
    completion: 'أكمل النتروجين ثلاث روابط مشتركة؛ بتشاركه ثلاثة أزواج وصل إلى 8 إلكترونات سطحية.',
    note: 'شكّل النتروجين ثلاث روابط مشتركة مع ثلاث ذرّات هيدروجين؛ فتكافؤه في النشادر = 3.',
  },
  {
    id: 'CH4',
    formula: 'CH4',
    name: 'الميتان',
    central: { symbol: 'C', label: 'الكربون', fill: '#6b7280', stroke: '#3f4652' },
    bonds: 4,
    offsets: [
      { x: -58, y: -58 },
      { x: 58, y: -58 },
      { x: -58, y: 58 },
      { x: 58, y: 58 },
    ],
    surfaceElectrons: 4,
    completion: 'أكمل الكربون أربع روابط مشتركة؛ بتشاركه أربعة أزواج وصل إلى 8 إلكترونات سطحية.',
    note: 'شكّل الكربون أربع روابط مشتركة مع أربع ذرّات هيدروجين؛ فتكافؤه في الميتان = 4.',
  },
]

const CENTER = { x: 130, y: 128 }
const ANIMATION_MS = 560

/**
 * موضع ذرّة هيدروجين رقم `index` أثناء تشكّل رابطتها:
 * قبل الانطلاق تبقى بعيدة عند حافة الإطار، وتنتقل إلى موضعها على الرابطة.
 */
function hydrogenPosition(spec: MoleculeSpec, index: number, formed: number) {
  const target = spec.offsets[index]!
  if (index < formed) return { x: CENTER.x + target.x, y: CENTER.y + target.y }
  const angle = (index / Math.max(spec.bonds, 1)) * Math.PI * 2
  return { x: CENTER.x + Math.cos(angle) * 118, y: CENTER.y + Math.sin(angle) * 118 }
}

export default function ValenceModelLab({ reducedMotion }: InteractiveProps) {
  const [moleculeId, setMoleculeId] = useState<MoleculeId>('H2O')
  const [formed, setFormed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

  const molecule = MOLECULES.find((item) => item.id === moleculeId)!
  const complete = formed >= molecule.bonds

  useEffect(() => {
    if (!playing || complete) {
      setPlaying(false)
      return
    }
    timer.current = window.setTimeout(() => {
      setFormed((value) => Math.min(molecule.bonds, value + 1))
    }, reducedMotion ? 160 : ANIMATION_MS)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [playing, formed, complete, molecule.bonds, reducedMotion])

  function choose(id: MoleculeId) {
    setMoleculeId(id)
    setFormed(0)
    setPlaying(false)
  }

  function reset() {
    setFormed(0)
    setPlaying(false)
  }

  const statusMessage = complete
    ? `اكتمل الجزيء: ${molecule.note}`
    : `تشكّلت ${formed} من ${molecule.bonds} روابط في جزيء ${molecule.formula === 'H2O' ? 'الماء' : molecule.formula === 'NH3' ? 'النشادر' : 'الميتان'}.`

  return (
    <section
      className={`lab valence-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-molecule={molecule.id}
      data-bonds-formed={formed}
      aria-labelledby="valence-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر التكافؤ في النماذج</p>
          <h3 id="valence-lab-title">كيف تتكوّن الروابط المشتركة في النماذج الثلاثة؟</h3>
        </div>
        <div className="valence-lab__picker" role="group" aria-label="اختر الجزيء">
          {MOLECULES.map((item) => (
            <button
              type="button"
              key={item.id}
              className="valence-lab__choice"
              aria-pressed={item.id === moleculeId}
              onClick={() => choose(item.id)}
            >
              <ChemicalFormula formula={item.formula} />
              <small>{item.name}</small>
            </button>
          ))}
        </div>
      </header>

      <div className="valence-lab__stage-wrap">
        <svg
          className="valence-lab__stage"
          viewBox="0 0 260 256"
          role="img"
          aria-label={`نموذج جزيء ${molecule.name}: ${statusMessage}`}
        >
          {/* خطوط الروابط — يظهر كل خط لحظة تشكّل رابطته */}
          {molecule.offsets.map((_offset, index) => (
            <line
              key={`bond-${index}`}
              className="valence-lab__bond"
              data-formed={index < formed ? 'true' : 'false'}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={hydrogenPosition(molecule, index, formed).x}
              y2={hydrogenPosition(molecule, index, formed).y}
              style={{ transitionDuration: reducedMotion ? '0ms' : `${ANIMATION_MS}ms` }}
            />
          ))}

          {/* الزوج المشترك عند منتصف كل رابطة مكتملة */}
          {molecule.offsets.map((_offset, index) => {
            if (index >= formed) return null
            const point = hydrogenPosition(molecule, index, formed)
            return (
              <g
                key={`pair-${index}`}
                className="valence-lab__shared-pair"
                transform={`translate(${(CENTER.x + point.x) / 2}, ${(CENTER.y + point.y) / 2})`}
              >
                <circle className="valence-lab__shared-dot" r="3.2" cy="-3.4" />
                <circle className="valence-lab__shared-dot" r="3.2" cy="3.4" />
              </g>
            )
          })}

          {/* ذرّات الهيدروجين المتجهّبة */}
          {molecule.offsets.map((_offset, index) => {
            const point = hydrogenPosition(molecule, index, formed)
            return (
              <g
                key={`h-${index}`}
                className="valence-lab__hydrogen"
                data-attached={index < formed ? 'true' : 'false'}
                transform={`translate(${point.x}, ${point.y})`}
                style={{ transitionDuration: reducedMotion ? '0ms' : `${ANIMATION_MS}ms` }}
              >
                <circle r="15" className="valence-lab__hydrogen-body" />
                <text y="5" textAnchor="middle">H</text>
              </g>
            )
          })}

          {/* الذرّة المركزية */}
          <g className="valence-lab__central" transform={`translate(${CENTER.x}, ${CENTER.y})`}>
            <circle r="26" fill={molecule.central.fill} stroke={molecule.central.stroke} strokeWidth="2" />
            <text y="7" textAnchor="middle">{molecule.central.symbol}</text>
          </g>
        </svg>

        <div className="valence-lab__panel">
          <p className="valence-lab__status" role="status" aria-live="polite">{statusMessage}</p>
          <div className="lab__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => setFormed((value) => Math.min(molecule.bonds, value + 1))}
              disabled={complete || playing}
            >
              كوّن رابطة مشتركة
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setPlaying(true)}
              disabled={complete || playing}
            >
              تشغيل التكوين كاملاً
            </button>
            <button type="button" className="button button--quiet" onClick={reset} disabled={formed === 0 && !playing}>
              إعادة الجزيء
            </button>
          </div>
          <p className="valence-lab__reading">
            كل ذرّة هيدروجين تسهم بإلكترون واحد؛ فالزوج المشترك على الرابطة إلكترونان:
            واحد من الهيدروجين وواحد من الذرّة المركزية.
          </p>
        </div>
      </div>

      <div className="lab__measurements">
        <div>
          <span>الروابط المشتركة المُتكوّنة</span>
          <RtlRun as="strong">
            {formed} من {molecule.bonds}
          </RtlRun>
        </div>
        <div>
          <span>الإلكترونات المشتركة</span>
          <strong>{formed * 2}</strong>
        </div>
        <div>
          <span>تكافؤ الذرّة المركزية عند الاكتمال</span>
          <strong>{molecule.bonds}</strong>
        </div>
        <div>
          <span>إلكترونات سطح الذرّة المركزية قبل الارتباط</span>
          <strong>{molecule.surfaceElectrons}</strong>
        </div>
      </div>

      <p className="lab__conclusion" aria-live="polite">
        <strong>الاستنتاج:</strong> {complete ? molecule.completion : 'أكمل الروابط واحداً تلو الآخر ولاحظ أن عدد الروابط هو ما يحدد التكافؤ، لا عدد إلكترونات السطح.'}
      </p>
    </section>
  )
}
