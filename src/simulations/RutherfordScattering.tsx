import { useMemo, useState } from 'react'
import type { InteractiveProps } from './registry'

type Track = 'straight' | 'deflected' | 'rebounded'

export default function RutherfordScattering({ reducedMotion }: InteractiveProps) {
  const [count, setCount] = useState(40)
  const [run, setRun] = useState(0)
  const [launched, setLaunched] = useState(false)
  const particles = useMemo(() => Array.from({ length: count }, (_, index) => {
    const track: Track = index % 19 === 0 ? 'rebounded' : index % 7 === 0 ? 'deflected' : 'straight'
    return { id: `${run}-${index}`, track, lane: index % 10, delay: reducedMotion ? 0 : (index % 12) * 45 }
  }), [count, reducedMotion, run])
  const measurements = {
    straight: particles.filter((particle) => particle.track === 'straight').length,
    deflected: particles.filter((particle) => particle.track === 'deflected').length,
    rebounded: particles.filter((particle) => particle.track === 'rebounded').length,
  }

  function launch() {
    setRun((value) => value + 1)
    setLaunched(true)
  }

  return (
    <section className="lab" aria-labelledby="rutherford-title">
      <header className="lab__header">
        <div><p className="lab__phase">إضافة من المنصة · محاكاة تفسيرية</p><h3 id="rutherford-title">حزمة ألفا وصفيحة الذهب</h3></div>
        <label className="lab__range">عدد الجسيمات: <output>{count}</output><input type="range" min="20" max="80" step="10" value={count} onChange={(event) => { setCount(Number(event.target.value)); setLaunched(false) }} /></label>
      </header>
      <div className="rutherford-stage" aria-label="تمثيل متحرك لمسارات جسيمات ألفا">
        <div className="rutherford-stage__source">α</div><div className="rutherford-stage__foil" aria-label="صفيحة الذهب" />
        <div className="rutherford-stage__nucleus" aria-label="نواة موجبة">+</div>
        {launched ? particles.map((particle) => <span key={particle.id} className={`alpha alpha--${particle.track}`} style={{ '--lane': particle.lane, '--delay': `${particle.delay}ms` } as React.CSSProperties}>α</span>) : null}
      </div>
      <div className="lab__actions"><button className="button button--primary" type="button" onClick={launch}>{launched ? 'أعد إطلاق الحزمة' : 'أطلق الحزمة'}</button></div>
      <div className="lab__measurements" aria-live="polite">
        <div><span>نفذت مستقيمة</span><strong>{launched ? measurements.straight : '—'}</strong></div>
        <div><span>انحرفت</span><strong>{launched ? measurements.deflected : '—'}</strong></div>
        <div><span>ارتدت</span><strong>{launched ? measurements.rebounded : '—'}</strong></div>
      </div>
      <p className="lab__conclusion"><strong>الاستنتاج:</strong> كثرة المسارات المستقيمة تدل على أن معظم الحجم فراغ، وندرة الانحراف والارتداد تدل على جزء صغير كثيف موجب هو النواة.</p>
    </section>
  )
}
