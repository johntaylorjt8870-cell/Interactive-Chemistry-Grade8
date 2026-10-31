import { useId, useState } from 'react'
import { MathFormula, PlatformAddition, Sci, ScientificTable } from '@/scientific'
import type { InteractiveProps } from './registry'
import { calculateMolarSample, formatModelNumber as fmt, MOLAR_SUBSTANCES, particleExponent, type MolarSample } from './lesson7Models'
import './lesson7-labs.css'

export default function MolarMassLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [substanceId, setSubstanceId] = useState('water')
  const [mode, setMode] = useState<'mass' | 'moles'>('moles')
  const [amount, setAmount] = useState('2')
  const [result, setResult] = useState<MolarSample | null>(null)
  const [error, setError] = useState('')
  const substance = MOLAR_SUBSTANCES.find((entry) => entry.id === substanceId)!
  function reset() { setSubstanceId('water'); setMode('moles'); setAmount('2'); setResult(null); setError('') }
  function calculate() {
    const next = calculateMolarSample(substance.formula, Number(amount), mode)
    if (amount.trim() === '' || next === null) { setResult(null); setError('أدخل قيمة من 0 إلى 10000.'); return }
    setError(''); setResult(next)
  }
  const particles = result ? particleExponent(result.particles) : null
  return (
    <section className={`lab l7-lab ${reducedMotion ? 'l7-lab--still' : ''}`} data-lab="molar-mass" aria-labelledby={`${id}-title`}>
      <header className="l7-lab__header"><div><PlatformAddition /><h3 id={`${id}-title`}>مختبر الكتلة المولية وكمية المادة</h3><p>فعل: اختر مادة وكمية واحسب. ملاحظة: اقرأ مساهمات الذرات والكتلة وعدد المولات. استنتاج: قارن اتجاه التحويل بوحدته.</p></div></header>
      <div className="l7-lab__fields">
        <label className="field" htmlFor={`${id}-substance`}><span className="field__label">المادة</span><select id={`${id}-substance`} className="field__input" value={substanceId} onChange={(event) => { setSubstanceId(event.target.value); setResult(null) }}>{MOLAR_SUBSTANCES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} — {entry.formula}</option>)}</select></label>
        <label className="field" htmlFor={`${id}-mode`}><span className="field__label">المعطى</span><select id={`${id}-mode`} className="field__input" value={mode} onChange={(event) => { setMode(event.target.value as 'mass' | 'moles'); setResult(null) }}><option value="moles">عدد المولات (mol)</option><option value="mass">الكتلة (g)</option></select></label>
        <label className="field" htmlFor={`${id}-amount`}><span className="field__label">القيمة</span><input id={`${id}-amount`} className="field__input" type="number" inputMode="decimal" min="0" max="10000" step="any" value={amount} onChange={(event) => { setAmount(event.target.value); setResult(null) }} /></label>
      </div>
      <div className="l7-lab__actions"><button type="button" className="button button--primary" onClick={calculate}>احسب العينة</button><button type="button" className="button button--quiet" onClick={reset}>إعادة تعيين</button></div>
      {error ? <p role="alert" className="l7-lab__error">{error}</p> : null}
      {result ? (
        <div className="l7-lab__result" role="status" aria-live="polite">
          <h4>قراءة النموذج الحسابي</h4>
          <ScientificTable caption={`مساهمات الذرات في ${substance.formula}`} columns={[{ key: 'element', header: 'العنصر', rowHeader: true }, { key: 'count', header: 'عدد الذرات', numeric: true }, { key: 'mass', header: 'الكتلة الذرية', numeric: true }, { key: 'total', header: 'المساهمة', numeric: true }]} rows={result.contributions.map((atom) => ({ id: atom.element, cells: { element: atom.element, count: String(atom.count), mass: fmt(atom.atomicMass), total: fmt(atom.contribution) } }))} />
          <div className="l7-lab__readings"><p><span>الكتلة المولية</span><Sci variant="plain">{fmt(result.molarMass)} g·mol⁻¹</Sci></p><p><span>عدد المولات</span><Sci variant="plain">{fmt(result.moles)} mol</Sci></p><p><span>الكتلة</span><Sci variant="plain">{fmt(result.mass)} g</Sci></p></div>
          {particles ? <MathFormula display="block" tex={`N=${particles.mantissa}\\times10^{${particles.exponent}}`} label="عدد الجسيمات المحسوب وفق قيمة أفوغادرو في الكتاب" /> : null}
          <p className="l7-lab__conclusion">الاستنتاج: {mode === 'moles' ? 'ضربنا عدد المولات في الكتلة المولية فحصلنا على الكتلة.' : 'قسمنا الكتلة على الكتلة المولية فحصلنا على عدد المولات.'} هذه نتائج نموذج حسابي وليست قياساً مخبرياً.</p>
        </div>
      ) : <p className="l7-lab__placeholder">لم تُحسب عينة بعد. اختر المعطى ثم اضغط «احسب العينة».</p>}
    </section>
  )
}
