import { useState } from 'react'
import { BondModel, ChemicalFormula, LewisMolecule, type LewisMoleculeSide } from '@/scientific'
import type { InteractiveProps } from './registry'

type MoleculeId = 'H2' | 'O2' | 'N2'
type ViewId = 'both' | 'lewis' | 'model'

type MoleculeSpec = {
  id: MoleculeId
  formula: string
  symbol: string
  sharedPairs: 1 | 2 | 3
  leftLonePairSides: LewisMoleculeSide[]
  rightLonePairSides: LewisMoleculeSide[]
  bondName: string
  /** Surface (outer-shell) electrons of each atom after bonding. */
  surfaceAfterBond: number
  /** Electrons each atom contributes to the shared pairs. */
  contributedPerAtom: number
  note: string
}

const MOLECULES: MoleculeSpec[] = [
  {
    id: 'H2',
    formula: 'H2',
    symbol: 'H',
    sharedPairs: 1,
    leftLonePairSides: [],
    rightLonePairSides: [],
    bondName: 'رابطة وحيدة',
    surfaceAfterBond: 2,
    contributedPerAtom: 1,
    note: 'لكل ذرّة هيدروجين إلكترون سطحي واحد؛ تشترك الذرّتان بزوج واحد فيصبح لكل منهما إلكترونات السوية الأولى مكتملة (2).',
  },
  {
    id: 'O2',
    formula: 'O2',
    symbol: 'O',
    sharedPairs: 2,
    leftLonePairSides: ['left', 'bottom'],
    rightLonePairSides: ['right', 'bottom'],
    bondName: 'رابطة مضاعفة',
    surfaceAfterBond: 8,
    contributedPerAtom: 2,
    note: 'لكل ذرّة أكسجين 6 إلكترونات سطحية؛ تحتاج كلٌّ منها إلكترونين إضافيين، فتشتركان بزوجين (4 إلكترونات) ويبقى لكل ذرّة زوجان غير مشتركين.',
  },
  {
    id: 'N2',
    formula: 'N2',
    symbol: 'N',
    sharedPairs: 3,
    leftLonePairSides: ['left'],
    rightLonePairSides: ['right'],
    bondName: 'رابطة ثلاثية',
    surfaceAfterBond: 8,
    contributedPerAtom: 3,
    note: 'لكل ذرّة نيتروجين 5 إلكترونات سطحية؛ تحتاج كلٌّ منها 3 إلكترونات، فتشتركان بثلاثة أزواج (6 إلكترونات) ويبقى لكل ذرّة زوج غير مشترك واحد.',
  },
]

const VIEW_LABELS: Record<ViewId, string> = {
  both: 'كما في الكتاب: لويس والنموذج',
  lewis: 'تمثيل لويس فقط',
  model: 'النموذج فقط',
}

/**
 * Platform addition — shared-pair laboratory for the textbook figure of
 * page 15 (H₂, O₂, N₂).
 *
 * The student picks a molecule, reads the shared-pair count, the lone pairs
 * and the bond order from live measurements, and switches between the Lewis
 * column and the ball-and-stick model to see that both notations describe the
 * same science. The highlight control isolates the shared pairs from the lone
 * pairs. All dot placement follows the finalized source map of page 15.
 */
export default function CovalentBondLab({ reducedMotion }: InteractiveProps) {
  const [moleculeId, setMoleculeId] = useState<MoleculeId>('H2')
  const [view, setView] = useState<ViewId>('both')
  const [highlightShared, setHighlightShared] = useState(false)

  const molecule = MOLECULES.find((item) => item.id === moleculeId)!
  const left = { symbol: molecule.symbol, lonePairSides: molecule.leftLonePairSides }
  const right = { symbol: molecule.symbol, lonePairSides: molecule.rightLonePairSides }

  return (
    <section
      className={`lab covalent-bond-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-molecule={molecule.id}
      data-view={view}
      data-highlight-shared={highlightShared ? 'true' : undefined}
      aria-labelledby="covalent-bond-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر الأزواج المشتركة</p>
          <h3 id="covalent-bond-lab-title">كيف تتشارك الذرّتان الإلكترونات؟</h3>
        </div>
        <div className="covalent-bond-lab__picker" role="group" aria-label="اختر الجزيء">
          {MOLECULES.map((item) => (
            <button
              type="button"
              key={item.id}
              className="covalent-bond-lab__choice"
              aria-pressed={item.id === moleculeId}
              onClick={() => setMoleculeId(item.id)}
            >
              <ChemicalFormula formula={item.formula} />
            </button>
          ))}
        </div>
      </header>

      <div className="covalent-bond-lab__controls">
        <div className="covalent-bond-lab__views" role="group" aria-label="اختر طريقة التمثيل">
          {(Object.keys(VIEW_LABELS) as ViewId[]).map((id) => (
            <button
              type="button"
              key={id}
              className="button button--quiet"
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              {VIEW_LABELS[id]}
            </button>
          ))}
        </div>
        <label className="covalent-bond-lab__highlight">
          <input
            type="checkbox"
            checked={highlightShared}
            onChange={(event) => setHighlightShared(event.target.checked)}
          />
          إبراز الأزواج المشتركة وتخفيت الأزواج غير المشتركة
        </label>
      </div>

      <div className="covalent-bond-lab__figure">
        {view === 'model' ? (
          <span className="covalent-bond-lab__model-only">
            <BondModel left={left} right={right} sharedPairs={molecule.sharedPairs} />
          </span>
        ) : (
          <LewisMolecule
            left={left}
            right={right}
            sharedPairs={molecule.sharedPairs}
            showModel={view === 'both'}
            size="lg"
            label={`تمثيل الجزيء ${molecule.formula}: ${molecule.sharedPairs} أزواج مشتركة و${molecule.leftLonePairSides.length} زوج غير مشترك حول كل ذرّة.`}
          />
        )}
      </div>

      <div className="lab__measurements">
        <div>
          <span>الإلكترونات المشتركة</span>
          <strong>{molecule.sharedPairs * 2}</strong>
        </div>
        <div>
          <span>الأزواج المشتركة</span>
          <strong>{molecule.sharedPairs}</strong>
        </div>
        <div>
          <span>رتبة الرابطة</span>
          <strong className="lab__measurement-text">{molecule.bondName}</strong>
        </div>
        <div>
          <span>أزواج غير مشتركة لكل ذرّة</span>
          <strong>{molecule.leftLonePairSides.length}</strong>
        </div>
        <div>
          <span>إلكترونات السطح لكل ذرّة بعد الارتباط</span>
          <strong>{molecule.surfaceAfterBond}</strong>
        </div>
        <div>
          <span>ما تسهم به كل ذرّة في المشاركة</span>
          <strong>{molecule.contributedPerAtom}</strong>
        </div>
      </div>

      <p className="lab__conclusion" aria-live="polite">
        <strong>الاستنتاج:</strong> {molecule.note}
      </p>
    </section>
  )
}
