import { useId, useState } from 'react'
import { ScientificDiagram, ScientificNotationText } from '@/scientific'
import { ObservationDrawing } from './Lesson4Visuals'
import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

const SCENARIOS = [
  { id: 'lemon' as const, label: 'الليمون والبيكربونات', action: 'إضافة قطرات افتراضياً', before: 'بيكربونات الصوديوم وحامض الليمون', observation: 'تظهر فقاعات ورغوة في الكأس.', inference: 'انطلق غاز أثناء التفاعل؛ أصبحت مواد البداية جزءاً من تحول كيميائي. تسمية الغاز بثنائي أكسيد الكربون شرح إضافي من المنصة.' },
  { id: 'cloth' as const, label: 'ماء جافيل والصباغ', action: 'مشاهدة القطرة الافتراضية', before: 'ثوب ملون وماء جافيل', observation: 'تصبح بقعة الصباغ أفتح من بقية الثوب.', inference: 'تغير صباغ القماش بفعل ماء جافيل. الملاحظة تغير لون، والتفسير تغير في المادة. لا يمزج ماء جافيل مع الليمون أو أي حمض.' },
  { id: 'lime' as const, label: 'الغاز ورائق الكلس', action: 'تمرير الغاز افتراضياً', before: 'غاز ثنائي أكسيد الكربون ورائق الكلس الصافي', observation: 'يتعكر رائق الكلس ويظهر راسب أبيض.', inference: 'تكونت مادة صلبة بيضاء. تعكر رائق الكلس عند بدء تمرير الغاز هو اختبار الدرس للكشف عن ثنائي أكسيد الكربون، وليس عن CO.' },
]

export default function ReactionObservationLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [scenarioId, setScenarioId] = useState<'lemon' | 'cloth' | 'lime'>('lemon')
  const [phase, setPhase] = useState<'before' | 'observe' | 'infer'>('before')
  const scenario = SCENARIOS.find((entry) => entry.id === scenarioId)!
  const observed = phase !== 'before'
  return <section className={`lab reaction-lab observation-lab ${reducedMotion ? 'reaction-lab--still' : ''}`} data-phase={phase} data-scenario={scenarioId} aria-labelledby={`${id}-title`}>
    <header className="lab__header"><div><p className="lab__phase">إضافة من المنصة · ملاحظة ثم استنتاج</p><h3 id={`${id}-title`}>لا تخلط ما تراه بما تفسره</h3></div></header>
    <div className="reaction-lab__choices" role="group" aria-label="اختر مشهد الملاحظة">
      {SCENARIOS.map((entry) => <button type="button" key={entry.id} className="button button--quiet" aria-pressed={scenarioId === entry.id} onClick={() => { setScenarioId(entry.id); setPhase('before') }}>{entry.label}</button>)}
    </div>
    <ScientificDiagram title={scenario.label} description={`${scenario.before}؛ ${observed ? scenario.observation : 'المشهد قبل التفاعل.'}`} viewBox="0 0 560 310" interactive caption="رسم تخطيطي نوعي من المنصة؛ الدوائر والبقع ليست أعداداً لجسيمات أو قياسات، ولا تعيد رسم صور الصفحة 24.">
      <ObservationDrawing scenario={scenarioId} observed={observed} />
    </ScientificDiagram>
    <div className="reaction-lab__readouts"><div><small>مواد البداية</small><strong>{scenario.before}</strong></div><div><small>الملاحظة</small><strong>{observed ? scenario.observation : 'نفذ المشهد لتسجل المشاهدة.'}</strong></div></div>
    <div className="lab__actions">
      <button type="button" className="button button--primary" disabled={observed} onClick={() => setPhase('observe')}>{scenario.action}</button>
      <button type="button" className="button button--secondary" disabled={phase !== 'observe'} onClick={() => setPhase('infer')}>فسر الملاحظة</button>
      <button type="button" className="button button--quiet" disabled={!observed} onClick={() => setPhase('before')}>إعادة المشهد</button>
    </div>
    <p className="lab__conclusion" role="status"><strong>{phase === 'infer' ? 'التفسير: ' : 'سجل المشاهدة: '}</strong><ScientificNotationText>{phase === 'infer' ? scenario.inference : observed ? scenario.observation : 'ابدأ بالفعل ثم صف ما ترى قبل طلب التفسير.'}</ScientificNotationText></p>
    <p className="reaction-lab__note">هذا عرض افتراضي، لا تعليمات تجربة منزلية. لا تخلط مواد المشاهد المختلفة، ولا تستعمل اللون أو الفقاعات وحدها للحكم على كل تغير.</p>
  </section>
}
