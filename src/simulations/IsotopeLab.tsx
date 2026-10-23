import { useMemo, useState } from 'react'
import { ElectronConfiguration, NuclearNotation } from '@/scientific'
import type { InteractiveProps } from './registry'
import './lesson1-labs.css'

/* ============================================================================
   Isotope lab (pages 10–11)
   ----------------------------------------------------------------------------
   The fixed quantity is the proton count (the element); the variable is the
   neutron count. Everything shown is derived:

       Z = protons,  N = chosen neutrons,  A = Z + N
       name = the textbook isotope name when the pair is one the lesson names,
              otherwise «العنصر-العدد الكتلي» with an explicit note
       distribution = textbook fill order, which does not depend on N — that is
                      precisely why isotopes keep their chemical behaviour.

   All neutron ranges are real stable/known isotopes of the element; no invented
   combination is presented as a named isotope.
   ========================================================================= */

type IsotopeCase = {
  symbol: string
  name: string
  protons: number
  neutrons: Array<{ n: number; label: string; note: string }>
}

const CASES: IsotopeCase[] = [
  {
    symbol: 'H',
    name: 'الهيدروجين',
    protons: 1,
    neutrons: [
      { n: 0, label: 'الهيدروجين العادي (البروتيوم)', note: 'بروتون واحد بلا نيوترون' },
      { n: 1, label: 'الديوتيريوم', note: 'بروتون ونيوترون واحد' },
      { n: 2, label: 'التريتيوم', note: 'بروتون ونيوترونان' },
    ],
  },
  {
    symbol: 'O',
    name: 'الأكسجين',
    protons: 8,
    neutrons: [
      { n: 8, label: 'أكسجين-16', note: 'النظير الأكثر شيوعاً' },
      { n: 9, label: 'أكسجين-17', note: 'نيوترون إضافي واحد' },
      { n: 10, label: 'أكسجين-18', note: 'النظير الأثقل: 8 بروتونات و10 نيوترونات' },
    ],
  },
  {
    symbol: 'Cl',
    name: 'الكلور',
    protons: 17,
    neutrons: [
      { n: 18, label: 'كلور-35', note: 'النظير الأخف' },
      { n: 20, label: 'كلور-37', note: 'النظير الأثقل' },
    ],
  },
]

function distributionOf(electrons: number): number[] {
  const shells: number[] = []
  let remaining = electrons
  for (let n = 1; n <= 4 && remaining > 0; n += 1) {
    const capacity = n === 1 ? 2 : 8
    const used = Math.min(capacity, remaining)
    shells.push(used)
    remaining -= used
  }
  return shells
}

export default function IsotopeLab({ reducedMotion }: InteractiveProps) {
  const [caseIndex, setCaseIndex] = useState(0)
  const [neutronIndex, setNeutronIndex] = useState(0)

  const current = CASES[caseIndex]!
  const isotope = current.neutrons[Math.min(neutronIndex, current.neutrons.length - 1)]!
  const mass = current.protons + isotope.n
  const distribution = useMemo(() => distributionOf(current.protons), [current.protons])

  function chooseCase(index: number) {
    setCaseIndex(index)
    setNeutronIndex(0)
  }

  return (
    <section className="lab" aria-labelledby="isotope-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر نظائر</p>
          <h3 id="isotope-title">ثبّت الهوية وغيّر الكتلة</h3>
        </div>
        <div className="ion-lab__picker" role="group" aria-label="اختر العنصر">
          {CASES.map((item, index) => (
            <button
              type="button"
              key={item.symbol}
              className="ion-lab__choice"
              aria-pressed={index === caseIndex}
              onClick={() => chooseCase(index)}
            >
              {item.symbol}
            </button>
          ))}
        </div>
      </header>

      <div className="lab__measurements">
        <div>
          <span>العنصر</span>
          <strong className="lab__measurement-text">{current.name}</strong>
        </div>
        <div>
          <span>الرمز النووي</span>
          <strong>
            <NuclearNotation symbol={current.symbol} atomicNumber={current.protons} massNumber={mass} size="lg" />
          </strong>
        </div>
        <div>
          <span>النظير الحالي</span>
          <strong className="lab__measurement-text">{isotope.label}</strong>
        </div>
      </div>

      <div
        className={`nucleus-builder ${reducedMotion ? 'nucleus-builder--still' : ''}`}
        aria-label={`نواة فيها ${current.protons} بروتوناً و${isotope.n} نيوتروناً`}
      >
        {Array.from({ length: current.protons }, (_, index) => (
          <span className="nucleon nucleon--proton" key={`p${index}`}>
            +
          </span>
        ))}
        {Array.from({ length: isotope.n }, (_, index) => (
          <span className="nucleon nucleon--neutron" key={`n${index}`}>
            n
          </span>
        ))}
      </div>

      <label className="lab__range">
        عدد النيوترونات: <output>{isotope.n}</output>
        <input
          type="range"
          min={0}
          max={current.neutrons.length - 1}
          step={1}
          value={neutronIndex}
          onChange={(event) => setNeutronIndex(Number(event.target.value))}
        />
      </label>

      <div className="lab__measurements">
        <div>
          <span>البروتونات = العدد الذري Z</span>
          <strong>{current.protons}</strong>
        </div>
        <div>
          <span>النيوترونات N</span>
          <strong>{isotope.n}</strong>
        </div>
        <div>
          <span>العدد الكتلي A = Z + N</span>
          <strong>{mass}</strong>
        </div>
        <div>
          <span>التوزيع الإلكتروني</span>
          <strong>
            <ElectronConfiguration value={distribution.join('-')} />
          </strong>
        </div>
      </div>

      <p className="capacity-note">
        <strong>{isotope.label}:</strong> {isotope.note}. البروتونات ثابتة في كل نظائر {current.name} (
        {current.protons})، ولذلك يبقى العنصر واحداً وتتشابه الخواص الكيميائية. أما العدد الكتلي فيتغير من {current.protons + current.neutrons[0]!.n} إلى{' '}
        {current.protons + current.neutrons.at(-1)!.n}، لأن النيوترونات هي المتغير.
      </p>

      <p className="lab__conclusion">
        <strong>الاستنتاج:</strong> بقي عدد البروتونات {current.protons}، لذلك بقي العنصر {current.name}. تغيّر عدد
        النيوترونات فصار النظير {isotope.label} بعدد كتلي {mass}. ولو تغيّر عدد البروتونات لتغيّر العنصر نفسه، لا
        النظير.
      </p>
    </section>
  )
}
