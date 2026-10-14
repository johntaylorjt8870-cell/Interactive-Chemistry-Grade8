import { useId, useState } from 'react'
import { ScientificDiagram, ScientificNotationText, ScientificTable, WordEquation } from '@/scientific'
import { BurnerDrawing } from './Lesson4Visuals'
import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

export default function CombustionAirLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [condition, setCondition] = useState<1 | 2>(1)
  const [plate, setPlate] = useState(false)
  const [compare, setCompare] = useState(false)
  const complete = condition === 1
  function choose(next: 1 | 2) { setCondition(next); setPlate(false); setCompare(false) }
  const observation = plate ? complete ? 'الحالة (1): اللهب أزرق، ولا تظهر طبقة سوداء على الصحن في نموذج الموقد.' : 'الحالة (2): اللهب أصفر، وتظهر طبقة سوداء من الكربون (السخام) على الصحن.' : 'اختر فتحة الهواء، ثم ضع الصحن الافتراضي فوق اللهب لتسجل الملاحظة.'
  return <section className={`lab reaction-lab combustion-lab ${reducedMotion ? 'reaction-lab--still' : ''}`} data-condition={condition} data-plate={plate ? 'true' : 'false'} aria-labelledby={`${id}-title`}>
    <header className="lab__header"><div><p className="lab__phase">إضافة من المنصة · من السبب إلى الملاحظة ثم النواتج</p><h3 id={`${id}-title`}>الهواء يغير تمام الاحتراق</h3></div></header>
    <fieldset className="reaction-lab__fieldset"><legend>فتحة دخول الهواء فوق الصمام — ليست صمام الوقود</legend><div className="reaction-lab__choices">
      <button type="button" className="button button--quiet" aria-pressed={complete} onClick={() => choose(1)}>الحالة (1): دخول الهواء</button>
      <button type="button" className="button button--quiet" aria-pressed={!complete} onClick={() => choose(2)}>الحالة (2): إغلاق الثقب جزئياً</button>
    </div></fieldset>
    <ScientificDiagram title={`الحالة (${condition}) — ${complete ? 'لهب أزرق' : 'لهب أصفر'}`} description={plate ? observation : `موقد بلهب ${complete ? 'أزرق' : 'أصفر'}؛ فتحة الهواء ${complete ? 'مفتوحة' : 'مغلقة جزئياً'}.`} viewBox="0 0 560 310" interactive caption="نموذج نوعي لمعنى تجربة ص26، لا إعادة رسم لشكلها. لا نسبة عددية للأكسجين أو درجة حرارة أو زمن ترسب في المصدر.">
      <BurnerDrawing complete={complete} plate={plate} soot={plate && !complete} />
    </ScientificDiagram>
    <div className="lab__actions"><button type="button" className="button button--primary" disabled={plate} onClick={() => setPlate(true)}>ضع صحن الخزف فوق اللهب</button><button type="button" className="button button--secondary" onClick={() => setCompare((value) => !value)} aria-expanded={compare}>{compare ? 'أخف المقارنة' : 'قارن الحالتين'}</button><button type="button" className="button button--quiet" disabled={!plate && !compare && complete} onClick={() => choose(1)}>إعادة تجربة الموقد</button></div>
    <p className="lab__conclusion" role="status"><ScientificNotationText>{observation}</ScientificNotationText></p>
    {plate ? <div className="reaction-lab__result"><h4>{complete ? 'الاستنتاج: احتراق تام' : 'الاستنتاج: احتراق غير تام'}</h4><p><ScientificNotationText>{complete ? 'الأكسجين كافٍ في ظروف الموقد. لاحتراق البوتان التام ناتجان: ثنائي أكسيد الكربون والماء.' : 'الأكسجين غير كافٍ؛ ترسب السخام يبين تكون الكربون. يمكن أن يتكون CO و/أو الكربون مع الماء، وقد يوجد CO₂ أيضاً؛ لا خليط ثابت أو نسب مفترضة.'}</ScientificNotationText></p>{complete ? <WordEquation reactants={['البوتان', 'الأكسجين']} products={['ثنائي أكسيد الكربون', 'الماء']} /> : null}</div> : null}
    {compare ? <ScientificTable caption="مقارنة تعليمية إضافية لشروط موقد الكتاب" columns={[{ key: 'condition', header: 'الحالة', rowHeader: true }, { key: 'air', header: 'الأكسجين' }, { key: 'flame', header: 'اللهب' }, { key: 'plate', header: 'الصحن' }]} rows={[
      { id: '1', cells: { condition: '(1): احتراق تام', air: 'كافٍ', flame: 'أزرق', plate: 'دون طبقة سوداء' } },
      { id: '2', cells: { condition: '(2): احتراق غير تام', air: 'غير كافٍ', flame: 'أصفر', plate: 'كربون مترسب' } },
    ]} /> : null}
    <p className="reaction-lab__note">اللون هنا يخص موقد الوقود في المصدر، وليس قانوناً لكل مادة محترقة. هذه محاكاة، وليست تعليمات لتعديل جهاز غاز منزلي.</p>
  </section>
}
