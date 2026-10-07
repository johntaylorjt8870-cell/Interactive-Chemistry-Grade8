import { useState } from 'react'
import { ChemicalEquation, ChargeNotation, IonNotation } from '@/scientific'
import { RtlRun } from '@/components/BidiText'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر المعادلات الأيونية — إضافة من المنصة
   يحوّل المعادلات الخمس المطبوعة في الصفحة 19 إلى انتقال إلكترونات مرئي خطوة
   بخطوة: ذرّة تفقد إلكتروناتها السطحية أو تكتسب غيرها، مع قراءة حيّة للشحنة
   والمعادلة نفسها بنفس صيغتها المطبوعة. المعادلات نص الكتاب؛ والحركة وصفٌ
   بصري من المنصة.
   ========================================================================= */

type EquationId = 'Na' | 'Ca' | 'Mg' | 'Cl' | 'O'

type EquationSpec = {
  id: EquationId
  symbol: string
  name: string
  /** عدد الإلكترونات المنتقلة في المعادلة المطبوعة. */
  transfer: number
  /** موجب = فقد، سالب = اكتساب. */
  direction: 1 | -1
  charge: { magnitude: string; sign: '+' | '-' }
  /** التوزع الإلكتروني قبل وبعد الانتقال (معرفة سابقة من الدرسين الأول والثاني). */
  distributionBefore: string
  distributionAfter: string
  reactants: string[]
  products: string[]
}

const EQUATIONS: EquationSpec[] = [
  {
    id: 'Na', symbol: 'Na', name: 'الصوديوم', transfer: 1, direction: 1,
    charge: { magnitude: '1', sign: '+' },
    distributionBefore: '2-8-1', distributionAfter: '2-8',
    reactants: ['Na'], products: ['Na^+', 'e^-'],
  },
  {
    id: 'Ca', symbol: 'Ca', name: 'الكالسيوم', transfer: 2, direction: 1,
    charge: { magnitude: '2', sign: '+' },
    distributionBefore: '2-8-8-2', distributionAfter: '2-8-8',
    reactants: ['Ca'], products: ['Ca^2+', '2e^-'],
  },
  {
    id: 'Mg', symbol: 'Mg', name: 'المغنزيوم', transfer: 2, direction: 1,
    charge: { magnitude: '2', sign: '+' },
    distributionBefore: '2-8-2', distributionAfter: '2-8',
    reactants: ['Mg'], products: ['Mg^2+', '2e^-'],
  },
  {
    id: 'Cl', symbol: 'Cl', name: 'الكلور', transfer: 1, direction: -1,
    charge: { magnitude: '1', sign: '-' },
    distributionBefore: '2-8-7', distributionAfter: '2-8-8',
    reactants: ['Cl', 'e^-'], products: ['Cl^-'],
  },
  {
    id: 'O', symbol: 'O', name: 'الأكسجين', transfer: 2, direction: -1,
    charge: { magnitude: '2', sign: '-' },
    distributionBefore: '2-6', distributionAfter: '2-8',
    reactants: ['O', '2e^-'], products: ['O^2-'],
  },
]

const PROTONS: Record<EquationId, number> = { Na: 11, Ca: 20, Mg: 12, Cl: 17, O: 8 }
/** إلكترونات السوية الأخيرة قبل الانتقال — هي مسرح الحركة. */
const VALENCE_ELECTRONS: Record<EquationId, number> = { Na: 1, Ca: 2, Mg: 2, Cl: 7, O: 6 }

export default function IonEquationLab({ reducedMotion }: InteractiveProps) {
  const [equationId, setEquationId] = useState<EquationId>('Na')
  const [moved, setMoved] = useState(0)

  const equation = EQUATIONS.find((item) => item.id === equationId)!
  const protons = PROTONS[equation.id]
  const complete = moved >= equation.transfer
  const electronsDelta = equation.direction === 1 ? -moved : moved
  const electronsNow = VALENCE_ELECTRONS[equation.id] + electronsDelta
  const netCharge = protons - (protons + electronsDelta)
  const chargeLabel = netCharge === 0 ? '0' : netCharge > 0 ? `+${netCharge}` : `−${Math.abs(netCharge)}`
  const ionChargeLabel = equation.charge.magnitude === '1'
    ? equation.charge.sign
    : `${equation.charge.magnitude}${equation.charge.sign}`

  function choose(id: EquationId) {
    setEquationId(id)
    setMoved(0)
  }

  function step() {
    setMoved((value) => Math.min(equation.transfer, value + 1))
  }

  const incoming = equation.direction === -1
  const remain = equation.transfer - moved

  return (
    <section
      className={`lab ion-equation-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-equation={equation.id}
      data-complete={complete ? 'true' : undefined}
      aria-labelledby="ion-equation-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر المعادلات الأيونية</p>
          <h3 id="ion-equation-lab-title">منذ المعادلة المطبوعة إلى حركة الإلكترونات</h3>
        </div>
        <div className="ion-equation-lab__picker" role="group" aria-label="اختر معادلة من معادلات الكتاب">
          {EQUATIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              className="ion-equation-lab__choice"
              aria-pressed={item.id === equationId}
              onClick={() => choose(item.id)}
            >
              <span dir="ltr">{item.symbol}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="ion-equation-lab__process" data-direction={equation.direction === 1 ? 'loss' : 'gain'}>
        <div className="ion-equation-lab__atom-state">
          <span className="ion-equation-lab__caption">
            {equation.direction === 1 ? 'قبل الفقد: ذرّة متعادلة' : 'قبل الاكتساب: ذرّة متعادلة'}
          </span>
          <strong dir="ltr">{equation.symbol}</strong>
          <span>{protons} بروتوناً = {protons} إلكتروناً</span>
          <span>التوزع: {equation.distributionBefore}</span>
          <div className="ion-equation-lab__shell" aria-label={`إلكترونات السوية الأخيرة: ${electronsNow}`}>
            {Array.from({ length: VALENCE_ELECTRONS[equation.id] }, (_, index) => (
              <span
                key={`${equation.id}-shell-${index}`}
                className={`ion-equation-lab__electron ${index < electronsNow ? '' : 'ion-equation-lab__electron--gone'}`}
              >
                −
              </span>
            ))}
            {Array.from({ length: incoming ? moved : 0 }, (_, index) => (
              <span
                key={`${equation.id}-incoming-${index}`}
                className={`ion-equation-lab__electron ion-equation-lab__electron--arrived ${reducedMotion ? 'ion-equation-lab__electron--still' : ''}`}
              >
                −
              </span>
            ))}
          </div>
        </div>

        <div className="ion-equation-lab__channel" aria-hidden="true">
          {moved > 0 ? (
            <span
              className={`ion-equation-lab__particle ion-equation-lab__particle--${equation.direction === 1 ? 'out' : 'in'} ${reducedMotion ? 'ion-equation-lab__particle--still' : ''}`}
            >
              {/* One inline notation child — see BohrEnergyTransition. */}
              <ChargeNotation source="e⁻" className="particle-notation" />
            </span>
          ) : null}
          <span className="ion-equation-lab__arrow">{equation.direction === 1 ? '⟵' : '⟶'}</span>
          <small>{equation.direction === 1 ? 'إلكترونات تفقدَها الذرّة' : 'إلكترونات اكتسبَتها الذرّة'}</small>
        </div>

        <div className="ion-equation-lab__atom-state ion-equation-lab__atom-state--result">
          <span className="ion-equation-lab__caption">بعد اكتمال الانتقال</span>
          {complete ? (
            <IonNotation formula={equation.symbol} charge={ionChargeLabel} size="lg" />
          ) : (
            <strong className="ion-equation-lab__pending" dir="ltr">{equation.symbol}</strong>
          )}
          <span>{protons} بروتوناً، {protons + electronsDelta} إلكتروناً</span>
          <span>التوزع: {complete ? equation.distributionAfter : equation.distributionBefore}</span>
          <span>
            الشحنة الكلية: <bdi dir="ltr">{chargeLabel}</bdi>
          </span>
        </div>
      </div>

      <div className="lab__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={step}
          disabled={complete}
        >
          {equation.direction === 1 ? 'انقل إلكتروناً من الذرّة' : 'انقل إلكتروناً إلى الذرّة'}
        </button>
        <button type="button" className="button button--quiet" onClick={() => setMoved(0)} disabled={moved === 0}>
          إعادة الذرّة المتعادلة
        </button>
        {remain > 0 && moved > 0 ? (
          <RtlRun className="ion-equation-lab__remain">
            تبقّى {remain} من {equation.transfer}
          </RtlRun>
        ) : null}
      </div>

      <div className="ion-equation-lab__equation" dir="ltr">
        <ChemicalEquation
          reactants={equation.reactants}
          products={equation.products}
          arrow="forward"
        />
      </div>

      <div className="lab__measurements">
        <div>
          <span>إلكترونات فقدَتها أو اكتسبَتها الذرّة</span>
          <RtlRun as="strong">
            {moved} من {equation.transfer}
          </RtlRun>
        </div>
        <div>
          <span>تكافؤ العنصر في المركّبات الأيونية</span>
          <strong>{equation.transfer}</strong>
        </div>
        <div>
          <span>سوية الأخيرة بعد الانتقال</span>
          <strong>{complete ? 'مكتملة (8)' : 'غير مكتملة بعد'}</strong>
        </div>
      </div>

      <p className="lab__conclusion" role="status">
        <strong>الاستنتاج:</strong>{' '}
        {complete
          ? `تحقّقت المعادلة كما في الكتاب: ${equation.direction === 1 ? `فقدت ذرّة ${equation.name} ${equation.transfer === 1 ? 'إلكتروناً واحداً' : `إلكترونَيْن`} فصارت أيون ${equation.symbol} موجباً` : `اكتسبت ذرّة ${equation.name} ${equation.transfer === 1 ? 'إلكتروناً واحداً' : 'إلكترونَيْن'} فصارت أيون ${equation.symbol} سالباً`}؛ وعدد الإلكترونات المنتقلة هو تكافؤ العنصر في مركّباته الأيونية.`
          : 'أكمل الانتقالات ولاحظ: البروتونات ثابتة، وما يتغيّر هو الإلكترونات؛ والفرق بينهما هو شحنة الأيون.'}
      </p>
    </section>
  )
}
