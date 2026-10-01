import { useMemo, useState } from 'react'
import { ElectronConfiguration } from '@/scientific'
import type { InteractiveProps } from './registry'

const capacities = [2, 8, 8, 2]
const labels = ['K', 'L', 'M', 'N']

export default function ElectronShellBuilder({ reducedMotion }: InteractiveProps) {
  const [electrons, setElectrons] = useState(11)
  const distribution = useMemo(() => {
    let remaining = electrons
    return capacities.map((capacity) => { const used = Math.min(capacity, remaining); remaining -= used; return used })
  }, [electrons])
  const usedLevels = distribution.filter((value) => value > 0)
  const surface = usedLevels.at(-1) ?? 0

  return (
    <section className="lab" aria-labelledby="shell-title">
      <header className="lab__header"><div><p className="lab__phase">إضافة من المنصة · باني توزيع</p><h3 id="shell-title">ابنِ السويات من الداخل إلى الخارج</h3></div><div className="electron-counter" aria-live="polite"><span>الإلكترونات</span><strong>{electrons}</strong></div></header>
      <div className={`shell-model ${reducedMotion ? 'shell-model--still' : ''}`} aria-label={`التوزع الإلكتروني ${usedLevels.join('-')}`}>
        <div className="shell-model__nucleus">+</div>
        {distribution.map((value, levelIndex) => value > 0 ? <div key={labels[levelIndex]} className="shell-ring" style={{ '--ring': levelIndex + 1 } as React.CSSProperties}><span className="shell-ring__label">{labels[levelIndex]}</span>{Array.from({ length: value }, (_, index) => <span key={index} className="shell-electron" style={{ '--angle': `${(360 / value) * index}deg` } as React.CSSProperties} />)}</div> : null)}
      </div>
      <div className="lab__actions"><button type="button" className="button button--secondary" onClick={() => setElectrons((value) => Math.max(1, value - 1))} disabled={electrons === 1}>− إلكترون</button><button type="button" className="button button--primary" onClick={() => setElectrons((value) => Math.min(20, value + 1))} disabled={electrons === 20}>+ إلكترون</button><button type="button" className="button button--quiet" onClick={() => setElectrons(11)}>Na = 11</button></div>
      <div className="lab__measurements"><div><span>التوزع</span><strong><ElectronConfiguration value={usedLevels.join('-')} /></strong></div><div><span>عدد السويات المشغولة</span><strong>{usedLevels.length}</strong></div><div><span>إلكترونات السوية الأخيرة</span><strong>{surface}</strong></div></div>
      <p className="lab__conclusion"><strong>الملاحظة:</strong> لا ينتقل الإلكترون إلى السوية التالية قبل إشغال السابقة وفق النموذج المبسط في الدرس. للصوديوم: <bdi dir="ltr">K(2), L(8), M(1)</bdi>.</p>
    </section>
  )
}
