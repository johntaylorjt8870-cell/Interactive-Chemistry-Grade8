import { useState } from 'react'
import { BohrAtom, ChemicalFormula, IonNotation, MathFormula, Sci } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   منصّة خطوات تكوّن الرابطة الأيونية — إضافة من المنصة
   ----------------------------------------------------------------------------
   الطالب يمشي في الآلية مرحلةً مرحلة: السابق / التالي / إعادة. لكل مركّب
   بياناته المشتقّة من الأعداد الذرّية المطبوعة في الكتاب، والعدادات
   (بروتونات، إلكترونات، شحنة) تتغيّر بالفعل مع المرحلة. زرّ «التالي» لا يسبق
   شرح المرحلة، وزرّ «السابق» يعيد الحالة السابقة نفسها.
   ========================================================================= */

type CompoundKey = 'NaCl' | 'MgCl2' | 'CaO'

type IonSpec = {
  symbol: string
  atomicNumber: number
  shells: number[]
  ionShells: number[]
  charge: string
  moved: number
  count: number
  role: 'metal' | 'nonmetal'
}

type Compound = {
  key: CompoundKey
  formula: string
  name: string
  metal: IonSpec
  nonmetal: IonSpec
  ratio: string
}

const COMPOUNDS: Compound[] = [
  {
    key: 'NaCl',
    formula: 'NaCl',
    name: 'كلوريد الصوديوم',
    metal: { symbol: 'Na', atomicNumber: 11, shells: [2, 8, 1], ionShells: [2, 8], charge: '+', moved: 1, count: 1, role: 'metal' },
    nonmetal: { symbol: 'Cl', atomicNumber: 17, shells: [2, 8, 7], ionShells: [2, 8, 8], charge: '-', moved: 1, count: 1, role: 'nonmetal' },
    ratio: '1 : 1',
  },
  {
    key: 'MgCl2',
    formula: 'MgCl2',
    name: 'كلوريد المغنزيوم',
    metal: { symbol: 'Mg', atomicNumber: 12, shells: [2, 8, 2], ionShells: [2, 8], charge: '2+', moved: 2, count: 1, role: 'metal' },
    nonmetal: { symbol: 'Cl', atomicNumber: 17, shells: [2, 8, 7], ionShells: [2, 8, 8], charge: '-', moved: 1, count: 2, role: 'nonmetal' },
    ratio: '1 : 2',
  },
  {
    key: 'CaO',
    formula: 'CaO',
    name: 'أكسيد الكالسيوم',
    metal: { symbol: 'Ca', atomicNumber: 20, shells: [2, 8, 8, 2], ionShells: [2, 8, 8], charge: '2+', moved: 2, count: 1, role: 'metal' },
    nonmetal: { symbol: 'O', atomicNumber: 8, shells: [2, 6], ionShells: [2, 8], charge: '2-', moved: 2, count: 1, role: 'nonmetal' },
    ratio: '1 : 1',
  },
]

const STAGE_TITLES = [
  'الذرّات المتعادلة',
  'الميل: من يفقد ومن يكتسب؟',
  'انتقال الإلكترونات',
  'الأيونات الناتجة',
  'التجاذب والصيغة',
] as const

function totalElectrons(shells: number[]): number {
  return shells.reduce((total, count) => total + count, 0)
}

function chargeReadout(charge: number): string {
  if (charge === 0) return '0'
  return charge > 0 ? `+${charge}` : `\u2212${Math.abs(charge)}`
}

function signedCharge(charge: string): string {
  if (charge === '+') return '+1'
  if (charge === '-') return '−1'
  return charge.replace('-', '−')
}

export default function BondStepsLab({ reducedMotion }: InteractiveProps) {
  const [compoundKey, setCompoundKey] = useState<CompoundKey>('NaCl')
  const [stage, setStage] = useState(0)

  const compound = COMPOUNDS.find((item) => item.key === compoundKey)!
  const { metal, nonmetal } = compound
  const showIons = stage >= 3

  const metalShells = showIons ? metal.ionShells : metal.shells
  const nonmetalShells = showIons ? nonmetal.ionShells : nonmetal.shells
  const metalElectrons = totalElectrons(metalShells)
  const nonmetalElectrons = totalElectrons(nonmetalShells)
  const metalCharge = metal.atomicNumber - metalElectrons
  const nonmetalCharge = nonmetal.atomicNumber - nonmetalElectrons

  const selectCompound = (key: CompoundKey) => {
    setCompoundKey(key)
    setStage(0)
  }

  const reset = () => {
    setStage(0)
    setCompoundKey('NaCl')
  }

  return (
    <section
      className={`lab l2-steps-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-compound={compound.key}
      data-stage={stage}
      aria-labelledby="l2-steps-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · خطوات تكوّن الرابطة الأيونية</p>
          <h3 id="l2-steps-lab-title">امشِ في الآلية خطوةً خطوة</h3>
        </div>
        <div className="l2-steps-lab__picker" role="group" aria-label="اختر المركّب">
          {COMPOUNDS.map((item) => (
            <button
              key={item.key}
              type="button"
              className="l2-choice"
              aria-pressed={item.key === compound.key}
              onClick={() => selectCompound(item.key)}
            >
              <ChemicalFormula formula={item.formula} size="sm" />
            </button>
          ))}
        </div>
      </header>

      <ol className="l2-steps-lab__timeline" aria-label="مراحل تكوّن الرابطة">
        {STAGE_TITLES.map((title, index) => (
          <li key={title} data-active={index === stage ? 'true' : undefined} data-done={index < stage ? 'true' : undefined}>
            <span className="l2-observation-index" aria-hidden="true">
              {index + 1}
            </span>
            <span>{title}</span>
          </li>
        ))}
      </ol>

      <div className="l2-steps-lab__scene" dir="ltr">
        <div className="l2-steps-lab__group" data-side="metal">
          <BohrAtom
            symbol={metal.symbol}
            shells={metalShells}
            charge={showIons ? metal.charge : undefined}
            highlightValence={!showIons}
            size={128}
          />
        </div>

        <div className={`l2-steps-lab__transfer ${stage >= 2 ? 'is-active' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 120 26" width={120} height={26} focusable="false">
            <path d="M4 13 H 96" />
            <path d="M86 5 L 104 13 L 86 21" />
          </svg>
          <span className="l2-steps-lab__transfer-label">
            {metal.moved} e⁻
          </span>
        </div>

        <div className="l2-steps-lab__group l2-steps-lab__group--multi" data-side="nonmetal">
          {Array.from({ length: nonmetal.count }, (_unused, index) => (
            <BohrAtom
              key={index}
              symbol={nonmetal.symbol}
              shells={nonmetalShells}
              charge={showIons ? nonmetal.charge : undefined}
              highlightValence={!showIons}
              size={nonmetal.count > 1 ? 112 : 128}
            />
          ))}
        </div>
      </div>

      <div className="lab__measurements l2-steps-lab__counters">
        <div>
          <span>{metal.symbol}: البروتونات</span>
          <strong>{metal.atomicNumber}</strong>
        </div>
        <div>
          <span>{metal.symbol}: الإلكترونات</span>
          <strong>{metalElectrons}</strong>
        </div>
        <div>
          <span>{metal.symbol}: الشحنة</span>
          <strong>{chargeReadout(metalCharge)}</strong>
        </div>
        <div>
          <span>{nonmetal.symbol}: البروتونات</span>
          <strong>{nonmetal.atomicNumber}</strong>
        </div>
        <div>
          <span>{nonmetal.symbol}: الإلكترونات</span>
          <strong>{nonmetalElectrons}</strong>
        </div>
        <div>
          <span>{nonmetal.symbol}: الشحنة</span>
          <strong>{chargeReadout(nonmetalCharge)}</strong>
        </div>
      </div>

      <div className="lab__actions">
        <button type="button" className="button button--quiet" onClick={() => setStage((value) => Math.max(0, value - 1))} disabled={stage === 0}>
          السابق
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => setStage((value) => Math.min(STAGE_TITLES.length - 1, value + 1))}
          disabled={stage === STAGE_TITLES.length - 1}
        >
          التالي
        </button>
        <button type="button" className="button button--quiet" onClick={reset} disabled={stage === 0 && compound.key === 'NaCl'}>
          إعادة
        </button>
      </div>

      <div className="l2-steps-lab__explain" aria-live="polite" data-explanation={stage}>
        <h4 className="l2-steps-lab__explain-title">
          المرحلة {stage + 1}: {STAGE_TITLES[stage]}
        </h4>
        <p>{STAGE_TEXT[stage](compound)}</p>
        {stage === 4 ? (
          <p className="l2-steps-lab__formula">
            <ChemicalFormula formula={compound.formula} size="md" />
            <span>
              نسبة الأيونات <Sci variant="plain">{compound.ratio}</Sci> · مجموع الشحنات:{' '}
              <MathFormula
                tex={`(${signedCharge(metal.charge).replace('−', '-')}) + ${nonmetal.count} \\times (${signedCharge(nonmetal.charge).replace('−', '-')}) = 0`}
                label={`مجموع شحنة أيون ${metal.symbol} وشحنات ${nonmetal.count} من أيون ${nonmetal.symbol} يساوي صفراً`}
              />
            </span>
          </p>
        ) : null}
      </div>

      <p className="lab__conclusion">
        <strong>المفتاح الثابت في المركّبات الثلاثة:</strong> البروتونات لا تتغيّر أبداً، والإلكترونات
        وحدها تنتقل، والشحنة تُحسب بالطرح: الشحنة = عدد البروتونات − عدد الإلكترونات. في{' '}
        {compound.name} تكون النسبة {compound.ratio} بين الأيونين حتى يكون المجموع صفراً.
      </p>

      <p className="l2-steps-lab__ions" aria-hidden="true">
        <IonNotation formula={metal.symbol} charge={metal.charge} size="sm" />
        <span>+</span>
        <IonNotation formula={nonmetal.symbol} charge={nonmetal.charge} size="sm" />
        <span>بنسبة {compound.ratio}</span>
      </p>
    </section>
  )
}

const STAGE_TEXT: Array<(compound: Compound) => string> = [
  (compound) =>
    `ذرّات متعادلة: ${compound.metal.symbol} توزيعه ${compound.metal.shells.join('-')}، و${compound.nonmetal.symbol} توزيعه ${compound.nonmetal.shells.join('-')}. عدد البروتونات يساوي عدد الإلكترونات في كل ذرّة، لذلك الشحنة صفر.`,
  (compound) =>
    `${compound.metal.symbol} سطحه ${compound.metal.shells[compound.metal.shells.length - 1]} إلكتروناً فوق سوية مكتملة فيميل إلى فقدها، و${compound.nonmetal.symbol} سطحه ${compound.nonmetal.shells[compound.nonmetal.shells.length - 1]} فينقصه ${compound.nonmetal.moved} للوصول إلى ثمانية. الميلان معاكسان، وهذا شرط الانتقال.`,
  (compound) =>
    `تنتقل ${compound.metal.moved} إلكترون${compound.metal.moved > 1 ? 'ين' : ''} من ${compound.metal.symbol} إلى ${compound.nonmetal.count > 1 ? 'ذرّتَي' : 'ذرّة'} ${compound.nonmetal.symbol}. لا تنتقل البروتونات ولا النيوترونات: لهذا يبقى العنصر هو نفسه.`,
  (compound) =>
    `الأيونات الناتجة: ${compound.metal.symbol} فقد إلكترونات فصار موجباً، و${compound.nonmetal.symbol} اكتسب فصار سالباً. الأعداد الجديدة: ${compound.metal.atomicNumber} − ${totalElectrons(compound.metal.ionShells)} و${compound.nonmetal.atomicNumber} − ${totalElectrons(compound.nonmetal.ionShells)}؛ وكلٌّ منهما سطحه مكتمل.`,
  (compound) =>
    `الأيون الموجب والسالبة يتجاذبان كهربائياً تجاذباً ساكناً، فيتراصّان بنسبة ${compound.ratio} وتتكوّن بلورة ${compound.formula} المتعادلة كهربائياً. هذه القوة هي الرابطة الأيونية.`,
]
