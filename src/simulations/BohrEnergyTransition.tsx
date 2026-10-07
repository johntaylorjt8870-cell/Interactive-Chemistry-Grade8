import { useEffect, useRef, useState } from 'react'
import { ChargeNotation } from '@/scientific'
import type { InteractiveProps } from './registry'

const LEVELS = [
  { n: 1, symbol: 'K' },
  { n: 2, symbol: 'L' },
  { n: 3, symbol: 'M' },
  { n: 4, symbol: 'N' },
] as const

type Transition = 'idle' | 'absorbed' | 'emitted'

export default function BohrEnergyTransition({ reducedMotion }: InteractiveProps) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [transition, setTransition] = useState<Transition>('idle')
  const previousIndex = useRef(0)
  const level = LEVELS[levelIndex]!

  useEffect(() => {
    if (levelIndex > previousIndex.current) setTransition('absorbed')
    else if (levelIndex < previousIndex.current) setTransition('emitted')
    previousIndex.current = levelIndex
  }, [levelIndex])

  const moveOut = () => setLevelIndex((index) => Math.min(LEVELS.length - 1, index + 1))
  const moveIn = () => setLevelIndex((index) => Math.max(0, index - 1))

  return (
    <section className="lab bohr-lab" aria-labelledby="bohr-lab-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · شرح بصري تفاعلي</p>
          <h3 id="bohr-lab-title">انتقال إلكترون بين سويات الطاقة</h3>
        </div>
        <div className="bohr-lab__current" aria-live="polite">
          <span>السوية الحالية</span>
          <strong dir="ltr">{level.symbol} · n = {level.n}</strong>
        </div>
      </header>

      <div className="bohr-stage" data-transition={transition} aria-label={`الإلكترون في السوية ${level.symbol} ورقمها ${level.n}`}>
        <div className="bohr-stage__energy" aria-hidden="true">
          <span>طاقة أعلى</span><span className="bohr-stage__energy-arrow">↑</span><span>طاقة أدنى</span>
        </div>
        <div className="bohr-stage__atom" aria-hidden="true">
          {LEVELS.map((item, index) => (
            <span className="bohr-orbit" data-active={index === levelIndex ? 'true' : undefined} key={item.symbol} style={{ '--orbit': index + 1 } as React.CSSProperties}>
              <span className="bohr-orbit__label">{item.symbol}</span>
            </span>
          ))}
          <span className="bohr-nucleus">نواة<br />موجبة</span>
          <span className={`bohr-electron ${reducedMotion ? 'bohr-electron--still' : ''}`} style={{ '--level': levelIndex + 1 } as React.CSSProperties}>
            {/* One inline notation child — never a bare `e` next to a raw sup
                element: the badge is a grid container, so two children become
                two grid items and the charge drops onto a second line. */}
            <ChargeNotation source="e⁻" className="particle-notation" />
          </span>
          {transition === 'emitted' ? <span className={`bohr-photon ${reducedMotion ? 'bohr-photon--still' : ''}`}>ضوء</span> : null}
        </div>
        <div className="bohr-stage__transition" aria-live="polite">
          {transition === 'absorbed' ? <><strong>امتصاص طاقة</strong><span>انتقل الإلكترون إلى سوية أعلى.</span></> : null}
          {transition === 'emitted' ? <><strong>إصدار طاقة على شكل ضوء</strong><span>انتقل الإلكترون إلى سوية أدنى.</span></> : null}
          {transition === 'idle' ? <><strong>ابدأ من السوية K</strong><span>استخدم الزرين ولاحظ اتجاه الانتقال والطاقة.</span></> : null}
        </div>
      </div>

      <div className="lab__actions">
        <button type="button" className="button button--primary" onClick={moveOut} disabled={levelIndex === LEVELS.length - 1}>امتصاص طاقة — انتقال إلى الخارج</button>
        <button type="button" className="button button--secondary" onClick={moveIn} disabled={levelIndex === 0}>إصدار طاقة — انتقال إلى الداخل</button>
        <button type="button" className="button button--quiet" onClick={() => { setLevelIndex(0); setTransition('idle'); previousIndex.current = 0 }}>إعادة</button>
      </div>

      <div className="lab__measurements">
        <div><span>الفعل</span><strong className="lab__measurement-text">{transition === 'absorbed' ? 'زوّدنا الذرة بالطاقة' : transition === 'emitted' ? 'عاد الإلكترون إلى الداخل' : 'لم يبدأ انتقال بعد'}</strong></div>
        <div><span>الملاحظة</span><strong className="lab__measurement-text">{transition === 'emitted' ? 'ظهرت إشارة الضوء' : transition === 'absorbed' ? 'ارتفعت سوية الإلكترون' : `الإلكترون في ${level.symbol}`}</strong></div>
        <div><span>نوع التغير</span><strong className="lab__measurement-text">{transition === 'idle' ? 'وجود في سوية' : 'انتقال بين سويتين'}</strong></div>
      </div>
      <p className="lab__conclusion"><strong>الخلاصة:</strong> بقاء الإلكترون في سوية يصف حالته الحالية. أمّا انتقاله فهو تغيّر من سوية محددة إلى أخرى، ويرافقه امتصاص الطاقة عند الصعود أو إصدارها على شكل ضوء عند الهبوط.</p>
    </section>
  )
}
