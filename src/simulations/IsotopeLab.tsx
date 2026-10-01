import { useState } from 'react'
import type { InteractiveProps } from './registry'
import { NuclearNotation } from '@/scientific'

export default function IsotopeLab({ reducedMotion }: InteractiveProps) {
  const [neutrons, setNeutrons] = useState(8)
  const protons = 8
  const mass = protons + neutrons
  return (
    <section className="lab" aria-labelledby="isotope-title">
      <header className="lab__header"><div><p className="lab__phase">إضافة من المنصة · مختبر نظائر</p><h3 id="isotope-title">ثبّت الهوية وغيّر الكتلة</h3></div><NuclearNotation symbol="O" atomicNumber={protons} massNumber={mass} size="lg" /></header>
      <div className={`nucleus-builder ${reducedMotion ? 'nucleus-builder--still' : ''}`} aria-label={`نواة فيها ${protons} بروتونات و${neutrons} نيوترونات`}>
        {Array.from({ length: protons }, (_, index) => <span className="nucleon nucleon--proton" key={`p${index}`}>+</span>)}
        {Array.from({ length: neutrons }, (_, index) => <span className="nucleon nucleon--neutron" key={`n${index}`}>n</span>)}
      </div>
      <label className="lab__range">عدد النيوترونات: <output>{neutrons}</output><input type="range" min="8" max="10" value={neutrons} onChange={(event) => setNeutrons(Number(event.target.value))} /></label>
      <div className="lab__measurements"><div><span>البروتونات / العدد الذري</span><strong>8</strong></div><div><span>النيوترونات</span><strong>{neutrons}</strong></div><div><span>العدد الكتلي</span><strong>{mass}</strong></div></div>
      <p className="lab__conclusion"><strong>الاستنتاج:</strong> بقي عدد البروتونات 8، لذلك بقي العنصر أكسجيناً. تغيّر عدد النيوترونات فصار النظير أكسجين-{mass}.</p>
    </section>
  )
}
