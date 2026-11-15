import { useState } from 'react'
import { LewisMolecule, ScientificNotationText } from '@/scientific'
import { ionicExamples, notebookAtoms } from './lesson2NotebookFigures'

type Tool = 'charge' | 'ionic' | 'lewis' | 'compare'
const checks: Record<Tool, { prompt: string; answers: string[]; correct: number; why: string }> = {
  charge: { prompt: 'جسيم له 8 بروتونات و10 إلكترونات؛ ما شحنته؟', answers: ['+2', '−2', '0'], correct: 1, why: 'نحسب 8−10=−2؛ الإلكترونات الزائدة سالبة.' },
  ionic: { prompt: 'كم أيون كلوريد يلزم لمعادلة Mg²⁺؟', answers: ['واحد', 'اثنان', 'ثلاثة'], correct: 1, why: '(+2)+2(−1)=0؛ كل كلوريد شحنته −1.' },
  lewis: { prompt: 'ثلاثة أزواج مشتركة تساوي كم إلكتروناً؟', answers: ['3', '6', '8'], correct: 1, why: 'كل زوج إلكترونان؛ 3×2=6.' },
  compare: { prompt: 'لماذا يوصل المصهور الأيوني ولا يوصل الصلب؟', answers: ['لتحرك الأيونات في المصهور', 'لأن البروتونات تنتقل', 'لغياب الشحنات في الصلب'], correct: 0, why: 'الأيونات موجودة في الحالتين، لكنها تتحرّك في المصهور فتَحمل التيار.' },
}
function Charge() {
  const [metalAnswer, setMetalAnswer] = useState<boolean | null>(null)
  const [symbol, setSymbol] = useState<'Na' | 'Mg' | 'Al' | 'O' | 'Cl'>('Na')
  const [delta, setDelta] = useState(0)
  const z = notebookAtoms[symbol].z
  return <div><label>الذرّة <select value={symbol} onChange={e => { setSymbol(e.target.value as typeof symbol); setDelta(0) }}>{['Na', 'Mg', 'Al', 'O', 'Cl'].map(s => <option key={s}>{s}</option>)}</select></label><label>تغيّر عدد الإلكترونات عن التعادل <input type="range" min="-3" max="3" value={delta} onChange={e => setDelta(Number(e.target.value))}/></label><output aria-live="polite" dir="ltr">p={z}; e={z + delta}; q={z}−{z + delta}={-delta}</output><p>هذا عدّ للشحنة فقط، وليس ادّعاءً باستقرار كل أيون يمكن اختياره. عدد البروتونات ثابت.</p><fieldset><legend>هل كل لا فلزّ يكتسب إلكترونات دائماً؟</legend><button onClick={() => setMetalAnswer(false)}>نعم</button><button onClick={() => setMetalAnswer(true)}>لا؛ يعتمد على الشريك</button>{metalAnswer !== null ? <p role="status">{metalAnswer ? 'صحيح: يشارك مع اللافلزّ ويكتسب مع الفلزّ في أمثلة الدرس.' : 'راجع الشريك: الهيدروجين والأكسجين يتشاركان في الماء ولا نكوّن أيونين في الجزيء.'}</p> : null}</fieldset></div>
}
function Ionic() {
  const [key, setKey] = useState<keyof typeof ionicExamples>('cao')
  const [step, setStep] = useState(0)
  const e = ionicExamples[key]
  const stages = [`قبل الانتقال: ${e.m} من ${e.metal} و${e.n} من ${e.nonmetal}.`, `المفقود ${e.m}×${e.charge} = المكتسب ${e.n}×${e.gain} = ${e.m * e.charge} إلكترون.`, `تتكوّن الأيونات: شحنة الفلزّ +${e.charge} وشحنة اللافلزّ −${e.gain}.`, `تتجاذب الأيونات؛ التحقق ${e.m}(+${e.charge})+${e.n}(−${e.gain})=0؛ الصيغة ${e.formula}.`]
  return <div><label>المثال <select value={key} onChange={ev => { setKey(ev.target.value as typeof key); setStep(0) }}>{Object.entries(ionicExamples).map(([k, v]) => <option key={k} value={k}>{v.formula}</option>)}</select></label><div>{stages.map((_, i) => <button key={i} aria-pressed={step === i} onClick={() => setStep(i)}>المرحلة {i + 1}</button>)}</div><p aria-live="polite"><ScientificNotationText>{stages[step]!}</ScientificNotationText></p><p>جميع المراحل والرسوم والحلول ظاهرة كاملة في مادة الدفتر.</p></div>
}
const molecules = [
  { s: 'H', p: 1 as const, l: [], r: [], free: 0 },
  { s: 'O', p: 2 as const, l: ['left', 'bottom'] as const, r: ['right', 'bottom'] as const, free: 4 },
  { s: 'N', p: 3 as const, l: ['left'] as const, r: ['right'] as const, free: 2 },
  { s: 'Cl', p: 1 as const, l: ['left', 'top', 'bottom'] as const, r: ['right', 'top', 'bottom'] as const, free: 6 },
]
function Lewis() {
  const [index, setIndex] = useState(0)
  const m = molecules[index]!
  return <div><label>الجزيء <select value={index} onChange={e => setIndex(Number(e.target.value))}>{molecules.map((v, i) => <option key={v.s} value={i}>{v.s}₂</option>)}</select></label><LewisMolecule left={{ symbol: m.s, lonePairSides: [...m.l] }} right={{ symbol: m.s, lonePairSides: [...m.r] }} sharedPairs={m.p}/><p aria-live="polite">{m.p} أزواج مشتركة = {2 * m.p} إلكترونات؛ حول كل ذرّة: {m.free} غير مشتركة + {2 * m.p} مشتركة = {m.free + 2 * m.p}.</p></div>
}
const compounds = [
  ['NaCl', 'أيونية', 'Na فلزّ وCl لا فلزّ', 'شبكة أيونات؛ يوصل المصهور لا الصلب'],
  ['CaO', 'أيونية', 'Ca يفقد 2 وO يكتسب 2', 'شبكة؛ نسبة 1:1'],
  ['Na₂O', 'أيونية', 'ذرّتا Na تمنحان إلكترونين إلى O', 'شبكة؛ نسبة 2:1'],
  ['MgCl₂', 'أيونية', 'Mg يمنح إلكتروناً لكل Cl', 'شبكة؛ نسبة 1:2'],
  ['H₂O', 'مشتركة', 'زوجان مشتركان حول O', 'جزيئية؛ سائلة في الظروف العادية'],
  ['HCl', 'مشتركة', 'زوج مشترك بين H وCl', 'جزيئية؛ المحلول المائي يوصل بسبب الأيونات'],
  ['AlCl₃', 'أيونية وفق نموذج الدرس فقط', 'تصنيف فلزّ ولا فلزّ؛ لا يغني عن التفسير الأوسع', 'اللامائي ذو طابع تساهمي غالب؛ لا نعمّم خواص الأملاح عليه'],
]
function Compare() {
  const [a, setA] = useState(0); const [b, setB] = useState(4)
  return <div className="l2-notebook-hetero">{([['الأول', a, setA], ['الثاني', b, setB]] as const).map(([title, index, set]) => <div key={title}><label>المركّب {title} <select value={index} onChange={e => set(Number(e.target.value))}>{compounds.map((c, i) => <option key={c[0]} value={i}>{c[0]}</option>)}</select></label>{compounds[index]!.slice(1).map(t => <p key={t}><ScientificNotationText>{t!}</ScientificNotationText></p>)}</div>)}</div>
}
export default function Lesson2NotebookTool({ tool }: { tool: Tool }) {
  const [answer, setAnswer] = useState<number | null>(null)
  const q = checks[tool]
  return <div><h5>تدريب تكميلي — لا يُنسخ في الدفتر</h5>{tool === 'charge' ? <Charge/> : tool === 'ionic' ? <Ionic/> : tool === 'lewis' ? <Lewis/> : <Compare/>}<fieldset><legend>تحقّق سريع: {q.prompt}</legend>{q.answers.map((a, i) => <button key={a} onClick={() => setAnswer(i)} aria-pressed={answer === i}>{a}</button>)}{answer !== null ? <p role="status">{answer === q.correct ? 'صحيح. ' : 'حاول مجدداً. '}{q.why}</p> : null}</fieldset></div>
}
