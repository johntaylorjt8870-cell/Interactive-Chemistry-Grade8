import { useMemo, useState } from 'react'
import { ElectronConfiguration, ChargeNotation, IonNotation, ScientificNotationText } from '@/scientific'
import { RtlRun } from '@/components/BidiText'
import type { InteractiveProps } from './registry'

type IonExample = {
  symbol: 'K' | 'F' | 'Ca' | 'O'
  name: string
  protons: number
  neutralDistribution: string
  transfer: number
  charge: string
}

const EXAMPLES: IonExample[] = [
  { symbol: 'K', name: 'البوتاسيوم', protons: 19, neutralDistribution: '2-8-8-1', transfer: -1, charge: '+' },
  { symbol: 'F', name: 'الفلور', protons: 9, neutralDistribution: '2-7', transfer: 1, charge: '-' },
  { symbol: 'Ca', name: 'الكالسيوم', protons: 20, neutralDistribution: '2-8-8-2', transfer: -2, charge: '2+' },
  { symbol: 'O', name: 'الأكسجين', protons: 8, neutralDistribution: '2-6', transfer: 2, charge: '2-' },
]

export default function IonFormationLab({ reducedMotion }: InteractiveProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<IonExample['symbol']>('K')
  const [moved, setMoved] = useState(0)
  const example = EXAMPLES.find((item) => item.symbol === selectedSymbol)!
  const direction = Math.sign(example.transfer)
  const completed = moved === Math.abs(example.transfer)
  const electrons = example.protons + direction * moved
  const netCharge = example.protons - electrons
  const dots = useMemo(() => Array.from({ length: Math.min(electrons, 20) }, (_, index) => index), [electrons])

  function choose(symbol: IonExample['symbol']) {
    setSelectedSymbol(symbol)
    setMoved(0)
  }

  function transferElectron() {
    setMoved((value) => Math.min(Math.abs(example.transfer), value + 1))
  }

  return (
    <section className="lab ion-lab" aria-labelledby="ion-lab-title">
      <header className="lab__header">
        <div><p className="lab__phase">إضافة من المنصة · انتقال إلكترون تفاعلي</p><h3 id="ion-lab-title">من الذرّة المتعادلة إلى الأيون</h3></div>
        <div className="ion-lab__picker" role="group" aria-label="اختر مثال الأيون">
          {EXAMPLES.map((item) => <button type="button" key={item.symbol} className="ion-lab__choice" aria-pressed={item.symbol === selectedSymbol} onClick={() => choose(item.symbol)}>{item.symbol}</button>)}
        </div>
      </header>

      <div className="ion-process" data-direction={direction < 0 ? 'loss' : 'gain'} data-complete={completed ? 'true' : undefined}>
        <div className="ion-process__state">
          <span className="ion-process__caption">قبل الانتقال: ذرّة متعادلة</span>
          <strong className="ion-process__symbol" dir="ltr">{example.symbol}</strong>
          <span>{example.protons} بروتوناً = {example.protons} إلكتروناً</span>
          <ElectronConfiguration value={example.neutralDistribution} />
        </div>

        <div className="ion-atom" aria-label={`${electrons} إلكتروناً حول نواة فيها ${example.protons} بروتوناً`}>
          <span className="ion-atom__nucleus"><b>{example.protons}</b><small><ScientificNotationText>p⁺</ScientificNotationText></small></span>
          {dots.map((dot) => <span key={`${selectedSymbol}-${dot}`} className="ion-electron" style={{ '--electron': dot } as React.CSSProperties}>−</span>)}
          {direction > 0 && !completed ? Array.from({ length: Math.abs(example.transfer) - moved }, (_, index) => <span key={`incoming-${index}`} className={`ion-electron ion-electron--incoming ${reducedMotion ? 'ion-electron--still' : ''}`} style={{ '--incoming': index } as React.CSSProperties}>−</span>) : null}
          {moved > 0 ? <span key={`${selectedSymbol}-${moved}`} className={`ion-transfer-particle ion-transfer-particle--${direction < 0 ? 'out' : 'in'} ${reducedMotion ? 'ion-transfer-particle--still' : ''}`} aria-hidden="true">
            <ChargeNotation source="e⁻" className="particle-notation" />
          </span> : null}
        </div>

        <div className="ion-process__arrow" aria-live="polite">
          <span aria-hidden="true">
            <ScientificNotationText>{direction < 0 ? '⟶ e⁻' : 'e⁻ ⟶'}</ScientificNotationText>
          </span>
          <strong>{direction < 0 ? 'فقد إلكترون' : 'اكتساب إلكترون'}</strong>
          <RtlRun as="small">
            {moved} من {Math.abs(example.transfer)}
          </RtlRun>
        </div>

        <div className="ion-process__state ion-process__state--result">
          <span className="ion-process__caption">بعد الانتقال</span>
          {completed ? <IonNotation formula={example.symbol} charge={example.charge} size="lg" /> : <strong className="ion-process__pending">أكمل النقل</strong>}
          <span>{example.protons} بروتوناً، {electrons} إلكتروناً</span>
          <span>الشحنة الكلية: <bdi dir="ltr">{netCharge > 0 ? `+${netCharge}` : netCharge < 0 ? `−${Math.abs(netCharge)}` : '0'}</bdi></span>
        </div>
      </div>

      <div className="lab__actions">
        <button type="button" className="button button--primary" onClick={transferElectron} disabled={completed}>{direction < 0 ? 'افقد إلكتروناً' : 'اكتسب إلكتروناً'}</button>
        <button type="button" className="button button--quiet" onClick={() => setMoved(0)} disabled={moved === 0}>إعادة الذرّة المتعادلة</button>
      </div>

      <div className="lab__measurements">
        <div><span>البروتونات (+)</span><strong>{example.protons}</strong></div>
        <div><span>الإلكترونات (−)</span><strong>{electrons}</strong></div>
        <div><span>المجموع الجبري</span><strong>{netCharge > 0 ? `+${netCharge}` : netCharge < 0 ? `−${Math.abs(netCharge)}` : '0'}</strong></div>
      </div>
      <p className="lab__conclusion"><strong>الاستنتاج:</strong> {completed ? direction < 0 ? `فقدت ذرّة ${example.name} شحنة سالبة؛ فأصبح عدد البروتونات أكبر من عدد الإلكترونات وتكوّن أيون موجب.` : `اكتسبت ذرّة ${example.name} شحنة سالبة؛ فأصبح عدد الإلكترونات أكبر من عدد البروتونات وتكوّن أيون سالب.` : 'عدد البروتونات لا يتغير عند تشكّل الأيون. انقل الإلكترون ولاحظ كيف يتغير الفرق بين الشحنات.'}</p>
    </section>
  )
}
