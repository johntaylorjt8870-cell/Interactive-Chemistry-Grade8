import { useId, useState } from 'react'
import { MathFormula, PlatformAddition, Sci, ScientificDiagram, ScientificTable } from '@/scientific'
import type { InteractiveProps } from './registry'
import { calculateGasSample, formatModelNumber as fmt, MOLAR_GASES, type GasSample, type MolarGasId } from './lesson7Models'
import './lesson7-labs.css'

export default function MolarVolumeLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [gasId, setGasId] = useState<MolarGasId>('he')
  const [moles, setMoles] = useState('1')
  const [result, setResult] = useState<GasSample | null>(null)
  const [error, setError] = useState('')
  function reset() { setGasId('he'); setMoles('1'); setResult(null); setError('') }
  function measure() {
    const next = calculateGasSample(gasId, Number(moles))
    if (moles.trim() === '' || next === null) { setResult(null); setError('أدخل عدد مولات بين 0 و10.'); return }
    setError(''); setResult(next)
  }
  const comparison = result ? MOLAR_GASES.map((gas) => calculateGasSample(gas.id, result.moles)!) : []
  const height = result ? Math.max(2, result.volume / 224 * 150) : 2
  return (
    <section className={`lab l7-lab ${reducedMotion ? 'l7-lab--still' : ''}`} data-lab="molar-volume" aria-labelledby={`${id}-title`}>
      <header className="l7-lab__header"><div><PlatformAddition /><h3 id={`${id}-title`}>مختبر الحجم المولي في الشرطين النظاميين</h3><p>الشروط مثبتة في هذا النموذج: <Sci variant="plain">273 K = 0°C</Sci> و<Sci variant="plain">1 atm</Sci>. غيّر الغاز وعدد المولات ثم احسب الحجم.</p></div></header>
      <div className="l7-lab__fields">
        <label className="field" htmlFor={`${id}-gas`}><span className="field__label">الغاز</span><select id={`${id}-gas`} className="field__input" value={gasId} onChange={(event) => { setGasId(event.target.value as MolarGasId); setResult(null) }}>{MOLAR_GASES.map((gas) => <option key={gas.id} value={gas.id}>{gas.name} — {gas.formula}</option>)}</select></label>
        <label className="field" htmlFor={`${id}-moles`}><span className="field__label">عدد المولات (mol)</span><input id={`${id}-moles`} className="field__input" type="number" inputMode="decimal" min="0" max="10" step="0.1" value={moles} onChange={(event) => { setMoles(event.target.value); setResult(null) }} /></label>
      </div>
      <div className="l7-lab__actions"><button type="button" className="button button--primary" onClick={measure}>احسب الحجم</button><button type="button" className="button button--quiet" onClick={reset}>إعادة تعيين</button></div>
      {error ? <p role="alert" className="l7-lab__error">{error}</p> : null}
      <ScientificDiagram title="تمثيل حجم الغاز المحسوب" description={`أسطوانة تخطيطية يرتفع مؤشر الحجم فيها إلى ${result ? fmt(result.volume) : 0} لتر. الرسم نموذج من المنصة وليس جهاز قياس.`} sourceRef="نموذج حسابي من المنصة وفق قانون الحجم المولي في ص44" viewBox="0 0 360 220" caption="المؤشر يتناسب مع الحجم المحسوب؛ لا يمثل شكلاً أصلياً من الكتاب.">
        <rect x="110" y="25" width="140" height="170" rx="14" className="l7-lab__cylinder" />
        <rect x="116" y={189 - height} width="128" height={height} rx="8" className={`l7-lab__gas l7-lab__gas--${gasId}`} />
        <text x="180" y="115" textAnchor="middle" direction="ltr" className="l7-lab__svg-value">{result ? `${fmt(result.volume)} L` : '— L'}</text>
        <text x="180" y="212" textAnchor="middle" direction="ltr" className="l7-lab__svg-label">273 K · 1 atm</text>
      </ScientificDiagram>
      {result ? <div className="l7-lab__result" role="status" aria-live="polite"><h4>الملاحظة والاستنتاج</h4><MathFormula display="block" tex={`V=${fmt(result.moles)}\\times22.4=${fmt(result.volume)}\\;\\mathrm{L}`} /><p>كتلة العينة المحسوبة: <Sci variant="plain">{fmt(result.mass)} g</Sci>. عند العدد نفسه من المولات والشروط نفسها تتساوى حجوم الغازات الثلاثة في النموذج، رغم اختلاف كتلها.</p><ScientificTable caption="مقارنة الغازات الثلاثة عند عدد المولات نفسه" columns={[{ key: 'gas', header: 'الغاز', rowHeader: true }, { key: 'moles', header: 'n (mol)', numeric: true }, { key: 'volume', header: 'V (L)', numeric: true }, { key: 'mass', header: 'm (g)', numeric: true }]} rows={comparison.map((sample) => ({ id: sample.gasId, selected: sample.gasId === result.gasId, cells: { gas: sample.formula, moles: fmt(sample.moles), volume: fmt(sample.volume), mass: fmt(sample.mass) } }))} /><p className="l7-lab__conclusion">الاستنتاج: الحجم يتناسب مع عدد المولات عند ثبات الحرارة والضغط، ولا يتحدد بنوع الغاز في هذا النموذج. هذه قراءة حسابية لا تجربة مخبرية.</p></div> : <p className="l7-lab__placeholder">لم يُحسب حجم بعد. اضغط «احسب الحجم» لقراءة النموذج ومقارنة الغازات.</p>}
    </section>
  )
}
