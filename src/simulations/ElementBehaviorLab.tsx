import { useState } from 'react'
import { RtlRun } from '@/components/BidiText'
import { BohrAtom, ChemicalFormula, ElectronConfiguration, Sci, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر استنتاج سلوك الذرّات ونوع الرابطة من التوزيع الإلكتروني — إضافة من المنصة
   ----------------------------------------------------------------------------
   يعالج جوهر الفهم في الدرس الثاني:
     * لماذا لا نحفظ «اللافلز يكتسب دائماً» أو «كل ذرّة سطحها 1 تفقد دائماً»؟
     * يلاحظ الطالب أن ذرّة الكلور نفسها (2-8-7) تكتسب إلكتروناً حين تلتقي بفلزّ
       مثل الصوديوم (NaCl)، لكنها تشارك بزوج إلكترونات حين تلتقي بلافلزّ آخر (Cl₂ أو HCl)،
       وأن ذرّة الأكسجين (2-6) تكتسب مع المغنزيوم (MgO) وتشارك في (O₂)،
       وأن الهيدروجين (1) لافلزّ يشارك رغم أن في سطحه إلكتروناً واحداً فقط.
   ========================================================================= */

type PairNature = 'metal-nonmetal' | 'nonmetal-nonmetal'
type MechanismKind = 'ionic-transfer' | 'covalent-sharing'

type AtomSide = {
  symbol: string
  name: string
  atomicNumber: number
  shells: number[]
  categoryLabel: string
}

type PairCase = {
  id: string
  title: string
  formula: string
  left: AtomSide
  right: AtomSide
  expectedNature: PairNature
  expectedMechanism: MechanismKind
  resultSummary: string
  reasoning: string
  contrastNote: string
}

const PAIRS: PairCase[] = [
  {
    id: 'na-cl',
    title: 'الصوديوم مع الكلور',
    formula: 'NaCl',
    left: { symbol: 'Na', name: 'الصوديوم', atomicNumber: 11, shells: [2, 8, 1], categoryLabel: 'فلزّ' },
    right: { symbol: 'Cl', name: 'الكلور', atomicNumber: 17, shells: [2, 8, 7], categoryLabel: 'لا فلزّ' },
    expectedNature: 'metal-nonmetal',
    expectedMechanism: 'ionic-transfer',
    resultSummary: 'ينتقل إلكترون التكافؤ الوحيد من Na إلى Cl، فيتكوّن الأيونان Na⁺ وCl⁻ ثم يتجاذبان كهربائياً في بلورة NaCl.',
    reasoning:
      'الصوديوم فلزّ يحمل إلكترون تكافؤ واحداً فوق سوية مكتملة (2-8-1) فيسهل عليه فقده، والكلور لا فلزّ ينقص سطحه إلكترون واحد (2-8-7) فيكتسب ذلك الإلكترون.',
    contrastNote: 'انتبه: الكلور هنا اكتسب إلكتروناً لوجود فلزّ (الصوديوم) يمنحه إياه. جرّب الزوج الثالث لترى ماذا يفعل الكلور نفسه بلا فلزّ!',
  },
  {
    id: 'mg-o',
    title: 'المغنزيوم مع الأكسجين',
    formula: 'MgO',
    left: { symbol: 'Mg', name: 'المغنزيوم', atomicNumber: 12, shells: [2, 8, 2], categoryLabel: 'فلزّ' },
    right: { symbol: 'O', name: 'الأكسجين', atomicNumber: 8, shells: [2, 6], categoryLabel: 'لا فلزّ' },
    expectedNature: 'metal-nonmetal',
    expectedMechanism: 'ionic-transfer',
    resultSummary: 'ينتقل إلكترونا التكافؤ من Mg إلى O، فيتكوّن Mg²⁺ وO²⁻ وتتشكّل الرابطة الأيونية بالتجاذب الكهربائي الساكن في MgO.',
    reasoning:
      'المغنزيوم فلزّ في سطحه إلكترونان فوق سوية مكتملة (2-8-2)، والأكسجين لا فلزّ في سطحه 6 إلكترونات ينقصه إلكترونان؛ فيكمّل انتقال الإلكترونين سطحَيهما معاً.',
    contrastNote: 'لاحظ: الأكسجين اكتسب إلكترونين هنا لأن المغنزيوم فلزّ مستعدّ لفقدهما.',
  },
  {
    id: 'cl-cl',
    title: 'ذرّة كلور مع ذرّة كلور',
    formula: 'Cl2',
    left: { symbol: 'Cl', name: 'الكلور', atomicNumber: 17, shells: [2, 8, 7], categoryLabel: 'لا فلزّ' },
    right: { symbol: 'Cl', name: 'الكلور', atomicNumber: 17, shells: [2, 8, 7], categoryLabel: 'لا فلزّ' },
    expectedNature: 'nonmetal-nonmetal',
    expectedMechanism: 'covalent-sharing',
    resultSummary: 'تتشاطر الذرّتان زوج إلكترونات مشتركاً واحداً (رابطة مشتركة/تساهمية وحيدة) في جزيء Cl₂ المتعادل دون تكوّن أي أيونات.',
    reasoning:
      'كل ذرّة كلور لا فلزّ توزيعها 2-8-7 وتحتاج إلكتروناً واحداً ولا تميل لفقد 7 إلكترونات؛ ولعدم وجود فلزّ مانح، تساهم كل ذرّة بإلكترون واحد في زوج مشترك.',
    contrastNote: 'قارن بالزوج الأول (NaCl): ذرّة الكلور نفسها اكتسبت مع الفلزّ، وشاركت مع اللافلزّ! السلوك يتبع التركيب والطرف المقابل معاً.',
  },
  {
    id: 'o-o',
    title: 'ذرّة أكسجين مع ذرّة أكسجين',
    formula: 'O2',
    left: { symbol: 'O', name: 'الأكسجين', atomicNumber: 8, shells: [2, 6], categoryLabel: 'لا فلزّ' },
    right: { symbol: 'O', name: 'الأكسجين', atomicNumber: 8, shells: [2, 6], categoryLabel: 'لا فلزّ' },
    expectedNature: 'nonmetal-nonmetal',
    expectedMechanism: 'covalent-sharing',
    resultSummary: 'تتشارك الذرّتان بزوجين من الإلكترونات (4 إلكترونات مشتركة = رابطة مشتركة/تساهمية مضاعفة) في جزيء O₂.',
    reasoning:
      'كل ذرّة أكسجين لا فلزّ في سطحها 6 إلكترونات وتحتاج إلكترونين؛ لا تفرّط أيّ منهما بإلكتروناتها، فتساهم كل ذرّة بإلكترونين ليتكوّن زوجان مشتركان.',
    contrastNote: 'قارن بالزوج الثاني (MgO): الأكسجين نفسه اكتسب مع المغنزيوم، وشارك مع الأكسجين!',
  },
  {
    id: 'h-cl',
    title: 'الهيدروجين مع الكلور',
    formula: 'HCl',
    left: { symbol: 'H', name: 'الهيدروجين', atomicNumber: 1, shells: [1], categoryLabel: 'لا فلزّ' },
    right: { symbol: 'Cl', name: 'الكلور', atomicNumber: 17, shells: [2, 8, 7], categoryLabel: 'لا فلزّ' },
    expectedNature: 'nonmetal-nonmetal',
    expectedMechanism: 'covalent-sharing',
    resultSummary: 'تشترك ذرّة H وذرّة Cl بزوج إلكترونات واحد، فيصل الهيدروجين إلى إلكترونين في سويته الأولى والكلور إلى ثمانية في سويته الأخيرة.',
    reasoning:
      'رغم أن للهيدروجين إلكتروناً واحداً فقط مثل الصوديوم، فإن الهيدروجين غاز لا فلزّ لا يملك سوية داخلية تحت سويته الأولى (التي تكتمل بإلكترونين)، لذا يشارك بإلكترونه مع الكلور بدلاً من تكوين بلورة أيونية.',
    contrastNote: 'هذا الزوج يبطل التعميم المضلّل «كل ذرّة سطحها 1 هي فلزّ يفقد دائماً»: الهيدروجين استثناء أساسي يجب فهم بنيته.',
  },
]

const NATURE_OPTIONS: Array<{ id: PairNature; label: string }> = [
  { id: 'metal-nonmetal', label: 'فلزّ مع لا فلزّ' },
  { id: 'nonmetal-nonmetal', label: 'لا فلزّ مع لا فلزّ' },
]

const MECHANISM_OPTIONS: Array<{ id: MechanismKind; label: string }> = [
  { id: 'ionic-transfer', label: 'انتقال إلكترونات وتكوّن أيونات (رابطة أيونية)' },
  { id: 'covalent-sharing', label: 'مشاركة أزواج إلكترونات بلا أيونات (رابطة مشتركة / تساهمية)' },
]

export default function ElementBehaviorLab({ interactiveId, reducedMotion }: InteractiveProps) {
  const [pairIndex, setPairIndex] = useState(0)
  const [natureChoice, setNatureChoice] = useState<PairNature | null>(null)
  const [mechanismChoice, setMechanismChoice] = useState<MechanismKind | null>(null)
  const [checked, setChecked] = useState(false)

  const current = PAIRS[pairIndex]!
  const leftSurface = current.left.shells[current.left.shells.length - 1]!
  const rightSurface = current.right.shells[current.right.shells.length - 1]!

  const natureCorrect = natureChoice === current.expectedNature
  const mechanismCorrect = mechanismChoice === current.expectedMechanism
  const allCorrect = natureCorrect && mechanismCorrect
  const state = !checked ? 'idle' : allCorrect ? 'correct' : 'incorrect'

  const selectPair = (nextIndex: number) => {
    setPairIndex(nextIndex)
    setNatureChoice(null)
    setMechanismChoice(null)
    setChecked(false)
  }

  const resetCurrent = () => {
    setNatureChoice(null)
    setMechanismChoice(null)
    setChecked(false)
  }

  return (
    <section
      className={`lab l2-behavior-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-interactive-id={interactiveId}
      data-pair={current.id}
      data-state={state}
      aria-labelledby="l2-behavior-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · استنتاج سلوك الذرّات ونوع الرابطة</p>
          <h3 id="l2-behavior-lab-title">اقرأ التوزيع الإلكتروني وتوقّع ماذا سيحدث</h3>
        </div>
        <div className="l2-behavior-lab__picker" role="group" aria-label="اختر زوج الذرّات">
          {PAIRS.map((pair, idx) => (
            <button
              key={pair.id}
              type="button"
              className="l2-choice"
              aria-pressed={idx === pairIndex}
              onClick={() => selectPair(idx)}
            >
              <Sci variant="plain">{pair.left.symbol} + {pair.right.symbol}</Sci>
            </button>
          ))}
        </div>
      </header>

      <p className="l2-behavior-lab__status">
        <RtlRun>الزوج {pairIndex + 1} من {PAIRS.length}</RtlRun> — <strong>{current.title}</strong>
      </p>

      <div className="l2-behavior-lab__atoms" dir="rtl">
        {[current.left, current.right].map((atom, sideIdx) => {
          const surface = sideIdx === 0 ? leftSurface : rightSurface
          return (
            <article className="l2-behavior-lab__atom-card" key={`${current.id}-${sideIdx}`}>
              <BohrAtom symbol={atom.symbol} shells={atom.shells} highlightValence size={124} />
              <div className="l2-behavior-lab__atom-meta">
                <h4>
                  {atom.name} <Sci variant="plain">({atom.symbol})</Sci>
                </h4>
                <dl>
                  <div>
                    <dt>العدد الذري</dt>
                    <dd dir="ltr">{atom.atomicNumber}</dd>
                  </div>
                  <div>
                    <dt>التوزيع الإلكتروني</dt>
                    <dd>
                      <ElectronConfiguration value={atom.shells.join('-')} size="sm" />
                    </dd>
                  </div>
                  <div>
                    <dt>إلكترونات التكافؤ (السطح)</dt>
                    <dd>
                      <strong>{surface}</strong>
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          )
        })}
      </div>

      <div className="l2-behavior-lab__questions">
        <div className="l2-behavior-lab__question-group" role="group" aria-label="الخطوة الأولى: صنّف العنصرين">
          <p className="l2-behavior-lab__step-label">1. انطلاقاً من هوية العنصرين وتوزيعهما، ما طبيعة الطرفين؟</p>
          <div className="l2-behavior-lab__choices">
            {NATURE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="l2-choice l2-choice--wide"
                aria-pressed={natureChoice === opt.id}
                disabled={checked}
                onClick={() => setNatureChoice(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="l2-behavior-lab__question-group" role="group" aria-label="الخطوة الثانية: توقّع مصير الإلكترونات ونوع الرابطة">
          <p className="l2-behavior-lab__step-label">2. بناءً على ذلك، ماذا يحدث لإلكترونات التكافؤ عند ارتباطهما؟</p>
          <div className="l2-behavior-lab__choices">
            {MECHANISM_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="l2-choice l2-choice--wide"
                aria-pressed={mechanismChoice === opt.id}
                disabled={checked}
                onClick={() => setMechanismChoice(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lab__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={natureChoice === null || mechanismChoice === null || checked}
          onClick={() => setChecked(true)}
        >
          تحقّق
        </button>
        <button
          type="button"
          className="button button--quiet"
          disabled={natureChoice === null && mechanismChoice === null && !checked}
          onClick={resetCurrent}
        >
          إعادة المحاولة
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={() => selectPair((pairIndex + 1) % PAIRS.length)}
        >
          الزوج التالي
        </button>
      </div>

      <div className="l2-behavior-lab__feedback" aria-live="polite" data-feedback={state}>
        {state === 'idle' ? (
          <p>اختر تصنيف العنصرين ومصير إلكترونات التكافؤ، ثم اضغط «تحقّق» لمقارنة تفكيرك بالسبب العلمي.</p>
        ) : (
          <>
            <p className="l2-behavior-lab__verdict">
              <strong>
                {allCorrect
                  ? 'استنتاج علمي سليم!'
                  : !natureCorrect && !mechanismCorrect
                    ? 'راجع التصنيف وآلية الارتباط معاً:'
                    : !natureCorrect
                      ? 'آلية الارتباط صحيحة، لكن راجع تصنيف العنصرين:'
                      : 'تصنيف العنصرين صحيح، لكن راجع مصير الإلكترونات:'}
              </strong>{' '}
              <span>
                {current.left.name} ({current.left.categoryLabel}) + {current.right.name} ({current.right.categoryLabel}) ← المركّب الناتج{' '}
                <ChemicalFormula formula={current.formula} size="sm" />.
              </span>
            </p>
            <p>
              <strong>ماذا يحدث؟</strong> <ScientificNotationText>{current.resultSummary}</ScientificNotationText>
            </p>
            <p>
              <strong>لماذا؟</strong> <ScientificNotationText>{current.reasoning}</ScientificNotationText>
            </p>
            <p className="l2-behavior-lab__contrast">
              <ScientificNotationText>{current.contrastNote}</ScientificNotationText>
            </p>
          </>
        )}
      </div>

      <p className="lab__conclusion">
        <strong>الخلاصة التربوية:</strong> لا تتحرّك الإلكترونات بحفظ جملة جاهزة، بل لأن الفلزّ ذا
        الإلكترونات السطحية القليلة فوق سوية مكتملة يفقدها إذا التقى بلافلزّ يستقبلها (انتقال ← أيونية)،
        بينما يتشارك اللافلزّان أزواج الإلكترونات حين لا يوجد مانح يفقدها (مشاركة ← مشتركة/تساهمية).
      </p>
    </section>
  )
}
