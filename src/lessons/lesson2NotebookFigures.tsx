import { BohrAtom, IonicTransferDiagram, LewisMolecule, LewisStructure, ScientificNotationText } from '@/scientific'
import type { NotebookFigure } from '@/data/curriculum/schema'

type Key = Extract<NotebookFigure, { kind: 'lesson2-static' }>['figureKey']
// Audited teaching-model counts; shared by static drawings and supplementary tools.
export const notebookAtoms = {
  H: { z: 1, shells: [1] }, Na: { z: 11, shells: [2, 8, 1] },
  Mg: { z: 12, shells: [2, 8, 2] }, Al: { z: 13, shells: [2, 8, 3] },
  Ca: { z: 20, shells: [2, 8, 8, 2] }, O: { z: 8, shells: [2, 6] },
  Cl: { z: 17, shells: [2, 8, 7] },
} as const
export const ionicExamples = {
  nacl: { metal: 'Na', nonmetal: 'Cl', m: 1, n: 1, charge: 1, gain: 1, formula: 'NaCl' },
  cao: { metal: 'Ca', nonmetal: 'O', m: 1, n: 1, charge: 2, gain: 2, formula: 'CaO' },
  na2o: { metal: 'Na', nonmetal: 'O', m: 2, n: 1, charge: 1, gain: 2, formula: 'Na₂O' },
  mgcl2: { metal: 'Mg', nonmetal: 'Cl', m: 1, n: 2, charge: 2, gain: 1, formula: 'MgCl₂' },
} as const
// Static-only completion: keep the supplementary tool's existing choices unchanged.
const staticIonicExamples = {
  ...ionicExamples,
  mgo: { metal: 'Mg', nonmetal: 'O', m: 1, n: 1, charge: 2, gain: 2, formula: 'MgO' },
} as const
function Atom({ symbol, ion = false }: { symbol: keyof typeof notebookAtoms; ion?: boolean }) {
  const atom = notebookAtoms[symbol]
  const metal = ['Na', 'Mg', 'Ca', 'Al'].includes(symbol)
  const charge = metal ? atom.shells[atom.shells.length - 1]! : -(8 - atom.shells[atom.shells.length - 1]!)
  const shells = ion ? metal ? atom.shells.slice(0, -1) : [...atom.shells.slice(0, -1), 8] : [...atom.shells]
  return <div className="l2-notebook-atom" data-atom-symbol={symbol} data-electrons={shells.reduce((a, b) => a + b, 0)} data-protons={atom.z} data-charge={ion ? charge : 0} data-shells={shells.join('-')}>
    <BohrAtom symbol={symbol} shells={shells} size={150} label={symbol} {...(ion ? { charge: `${Math.abs(charge) === 1 ? '' : Math.abs(charge)}${charge > 0 ? '+' : '-'}` } : {})} />
    <p dir="ltr">{shells.join('-')} · p={atom.z} · e={shells.reduce((a, b) => a + b, 0)}</p>
  </div>
}
function IonStages({ example }: { example: keyof typeof staticIonicExamples }) {
  const e = staticIonicExamples[example]
  return <div className="l2-notebook-stages" data-ionic-example={example}>
    <section><h6>١. الذرّات قبل الانتقال</h6><div className="l2-notebook-atoms" dir="ltr">{Array.from({ length: e.m }, (_, i) => <Atom key={`m${i}`} symbol={e.metal} />)}{Array.from({ length: e.n }, (_, i) => <Atom key={`n${i}`} symbol={e.nonmetal} />)}</div></section>
    <section><h6>٢. انتقال الإلكترونات</h6><p><ScientificNotationText>{`${e.m} × ${e.metal} يفقد كل منها ${e.charge} إلكترون؛ ${e.n} × ${e.nonmetal} يكتسب كل منها ${e.gain} إلكترون. المفقود = المكتسب = ${e.m * e.charge}.`}</ScientificNotationText></p><svg style={{ direction: 'ltr', unicodeBidi: 'isolate' }} viewBox="0 0 320 48" role="img" aria-label="انتقال الإلكترونات من الفلز إلى اللافلز" className="l2-notebook-arrow"><text x="10" y="30" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{e.metal}</text><path d="M60 24 H250 l-12 -8 m12 8 l-12 8" stroke="currentColor" fill="none" strokeWidth="2"/><text x="270" y="30">{e.nonmetal}</text><text x="145" y="16" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{e.m * e.charge}e⁻</text></svg></section>
    <section><h6>٣. الأيونات بعد الانتقال</h6><div className="l2-notebook-atoms" dir="ltr">{Array.from({ length: e.m }, (_, i) => <Atom key={`m${i}`} symbol={e.metal} ion />)}{Array.from({ length: e.n }, (_, i) => <Atom key={`n${i}`} symbol={e.nonmetal} ion />)}</div></section>
    <section><h6>٤. التجاذب والتعادل</h6><p><ScientificNotationText>{`تتجاذب الأيونات في شبكة بلورية بنسبة ${e.m}:${e.n}. ${e.m}(+${e.charge}) + ${e.n}(−${e.gain}) = 0 ⇒ ${e.formula}.`}</ScientificNotationText></p></section>
    {example === 'mgcl2' ? <div className="l2-notebook-ionic-lewis"><h6>لويس: إلكترونا المغنزيوم ينتقلان، واحد إلى كل كلور</h6><p dir="ltr">Cl (7e⁻) ← ·Mg· → Cl (7e⁻)</p><div dir="ltr" className="l2-notebook-atoms"><ScientificNotationText>[Mg]²⁺</ScientificNotationText>{[1, 2].map(i => <span key={i} className="l2-notebook-ion-bracket">[<LewisStructure symbol="Cl" pairs={{ top: 1, right: 1, bottom: 1, left: 1 }} label="أيون كلوريد: أربعة أزواج، ثمانية إلكترونات تكافؤ"/>]⁻</span>)}</div><p>كل كلوريد محاط بأربعة أزواج؛ المغنزيوم فقد إلكتروني تكافئه. المجموع الجبري للشحنات صفر.</p></div> : null}
  </div>
}
function Hetero() {
  return <div className="l2-notebook-hetero">
    <div><h6>الماء: زوجان مشتركان وزوجان حرّان على الأكسجين</h6><svg viewBox="0 0 240 130" width="240" role="img" aria-label="لويس الماء: زوجان مشتركان وزوجان حران على O" data-water-lewis style={{ direction: 'ltr', unicodeBidi: 'isolate' }}><text x="25" y="78">H</text><text x="112" y="78">O</text><text x="202" y="78">H</text>{[[70,65],[70,78],[165,65],[165,78]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill="currentColor" data-water-electron="shared"/>)}{[[110,42],[123,42],[110,100],[123,100]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill="currentColor" data-water-electron="lone"/>)}</svg><p dir="ltr">H–O–H · O: 4+4=8 · H: 2</p><p>التمثيل الخطي للاتصال فقط؛ الشكل الفعلي للماء منحنٍ.</p></div>
    <div><h6>كلوريد الهيدروجين: زوج مشترك وثلاثة أزواج حرّة على الكلور</h6><LewisMolecule left={{ symbol: 'H' }} right={{ symbol: 'Cl', lonePairSides: ['top', 'bottom', 'right'] }} sharedPairs={1} /><p dir="ltr">H–Cl · Cl: 2+6=8 · H: 2</p></div>
  </div>
}
/** Flat Lewis connectivity drawings, not molecular spatial geometries. */
function ResearchLewis() {
  const positions = {
    left: { h: [28, 137], pair: [[78, 124], [78, 136]] },
    right: { h: [232, 137], pair: [[182, 124], [182, 136]] },
    bottom: { h: [130, 239], pair: [[124, 182], [136, 182]] },
    top: { h: [130, 35], pair: [[124, 78], [136, 78]] },
  } as const
  return <div className="l2-notebook-hetero l2-notebook-research-lewis">
    {(['NH3', 'CH4'] as const).map(formula => {
      const ammonia = formula === 'NH3'
      const bonds = ammonia ? ['left', 'right', 'bottom'] as const : ['left', 'right', 'bottom', 'top'] as const
      return <div key={formula} data-research-lewis={formula}>
        <h6>{ammonia ? 'NH₃: ثلاثة أزواج مشتركة وزوج حرّ على N' : 'CH₄: أربعة أزواج مشتركة ولا أزواج حرّة على C'}</h6>
        <svg viewBox="0 0 260 260" width="260" height="260" role="img" aria-label={ammonia ? 'لويس النشادر: N مرتبط بثلاث ذرات H بثلاثة أزواج مشتركة، وزوج حر على N' : 'لويس الميتان: C مرتبط بأربع ذرات H بأربعة أزواج مشتركة، دون أزواج حرة'} style={{ direction: 'ltr', unicodeBidi: 'isolate', maxWidth: '100%', height: 'auto' }}>
          <text x="130" y="137" textAnchor="middle" data-central-atom>{ammonia ? 'N' : 'C'}</text>
          {bonds.map(side => <g key={side} data-shared-pair={side}>
            <text x={positions[side].h[0]} y={positions[side].h[1]} textAnchor="middle" data-hydrogen>H</text>
            {positions[side].pair.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="currentColor" data-lewis-electron="shared" />)}
          </g>)}
          {ammonia ? <g data-lone-pair="N">{[124, 136].map(x => <circle key={x} cx={x} cy="78" r="3.5" fill="currentColor" data-lewis-electron="lone" />)}</g> : null}
        </svg>
        <p dir="ltr">{ammonia ? '5 + 3×1 = 8; N: 6 + 2 = 8; H: 2' : '4 + 4×1 = 8; C: 8 + 0 = 8; H: 2'}</p>
        <p>التمثيل يبيّن اتصال الذرّات والأزواج، ولا يمثّل الشكل الفراغي للجزيء.</p>
      </div>
    })}
  </div>
}
function Drawing({ k }: { k: Key }) {
  if (k === 'nacl') return <IonicTransferDiagram />
  if (k === 'mgo' || k === 'cao' || k === 'na2o' || k === 'mgcl2') return <IonStages example={k} />
  if (k === 'research-lewis') return <ResearchLewis />
  if (k === 'hetero') return <Hetero />
  if (k === 'valence') return <div className="l2-notebook-atoms">{(['Na', 'Mg', 'H', 'O', 'Cl'] as const).map(s => <div key={s} data-valence-only={s}><p>{s}</p><svg viewBox="0 0 140 140" width="140" role="img" aria-label={`${s}: إلكترونات السوية الخارجية فقط`}><circle cx="70" cy="70" r="48" fill="none" stroke="currentColor"/><text x="70" y="76" textAnchor="middle">{s}</text>{Array.from({ length: notebookAtoms[s].shells.at(-1)! }, (_, i) => <circle key={i} data-valence-electron cx={70 + 48 * Math.cos(i * 2 * Math.PI / notebookAtoms[s].shells.at(-1)!)} cy={70 + 48 * Math.sin(i * 2 * Math.PI / notebookAtoms[s].shells.at(-1)!)} r="4" fill="currentColor"/>)}</svg><p>الإلكترونات الداخلية غير معروضة</p></div>)}</div>
  if (k === 'charge') return <div className="l2-notebook-atoms"><div><Atom symbol="Na"/><p dir="ltr">11−11=0</p></div><div><Atom symbol="Na" ion/><p dir="ltr">11−10=+1</p></div><div><Atom symbol="Cl" ion/><p dir="ltr">17−18=−1</p></div></div>
  return <div className="l2-notebook-hetero"><div><h6>انتقال إلكترون ثم تجاذب أيوني</h6><p dir="ltr">Na → e⁻ → Cl</p><p dir="ltr">Na⁺ … Cl⁻</p><p>شبكة أيونات متعاكسة الشحنة</p></div><div><h6>اشتراك بزوج إلكتروني</h6><LewisMolecule left={{ symbol: 'H' }} right={{ symbol: 'H' }} sharedPairs={1}/><p>الزوج مشترك ويُحسب حول الذرّتين</p></div></div>
}
export function Lesson2NotebookFigure({ figure }: { figure: Extract<NotebookFigure, { kind: 'lesson2-static' }> }) {
  return <figure className="student-notebook__figure l2-notebook-static" data-notebook-figure={figure.id}><Drawing k={figure.figureKey}/><figcaption><ScientificNotationText>{figure.caption}</ScientificNotationText></figcaption></figure>
}
