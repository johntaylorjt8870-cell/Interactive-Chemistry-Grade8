import { BohrAtom, ChemicalFormula, ElectronConfiguration, IonNotation, MathFormula, Sci } from '@/scientific'
import { chargeGlyph, normalizeCharge } from '@/utils/scientificText'
import type { InteractiveProps } from './registry'

/* ============================================================================
   شكل تعليمي: آلية الانتقال الإلكتروني في مركّب يحتاج أكثر من إلكترون
   ----------------------------------------------------------------------------
   سؤال الكتاب الثالث (ص17) يطلب رسم MgCl₂؛ وهذا الشكل يعرض الآلية نفسها
   بمراحلها الأربع لمركّبين: CaO (مثال إضافي) وMgCl₂ (مراجعة بعد المحاولة).
   الأعداد كلها مشتقّة من الأعداد الذرّية المطبوعة في الكتاب (20Ca، 12Mg، 8O،
   17Cl) وتُعرض المعادلة الحسابية لكل شحنة، فلا شيء يُطلب حفظه.
   ========================================================================= */

type IonSpec = {
  symbol: string
  atomicNumber: number
  shells: number[]
  ionShells: number[]
  charge: string
  /** عدد الإلكترونات المكتسبة أو المفقودة (بالقيمة المطلقة). */
  moved: number
  role: 'metal' | 'nonmetal'
  count: number
}

type CompoundSpec = {
  formula: string
  name: string
  metal: IonSpec
  nonmetal: IonSpec
  ratio: string
  printedOn: string
  /** ما تحتاجه الذرّة من إلكترونات ومن أي ذرّة. */
  statement: string
}

const CAO: CompoundSpec = {
  formula: 'CaO',
  name: 'أكسيد الكالسيوم',
  metal: {
    symbol: 'Ca',
    atomicNumber: 20,
    shells: [2, 8, 8, 2],
    ionShells: [2, 8, 8],
    charge: '2+',
    moved: 2,
    role: 'metal',
    count: 1,
  },
  nonmetal: {
    symbol: 'O',
    atomicNumber: 8,
    shells: [2, 6],
    ionShells: [2, 8],
    charge: '2-',
    moved: 2,
    role: 'nonmetal',
    count: 1,
  },
  ratio: '1 : 1',
  printedOn: '16',
  statement:
    'الكالسيوم سطحه إلكترونان فيميل إلى فقدهما، والأكسجين سطحه ستة فينقصه إلكترونان. العدد نفسه ⇒ ذرّة واحدة لكل ذرّة.',
}

const MGCL2: CompoundSpec = {
  formula: 'MgCl2',
  name: 'كلوريد المغنزيوم',
  metal: {
    symbol: 'Mg',
    atomicNumber: 12,
    shells: [2, 8, 2],
    ionShells: [2, 8],
    charge: '2+',
    moved: 2,
    role: 'metal',
    count: 1,
  },
  nonmetal: {
    symbol: 'Cl',
    atomicNumber: 17,
    shells: [2, 8, 7],
    ionShells: [2, 8, 8],
    charge: '-',
    moved: 1,
    role: 'nonmetal',
    count: 2,
  },
  ratio: '1 : 2',
  printedOn: '17',
  statement:
    'المغنزيوم سطحه إلكترونان فيميل إلى فقدهما، وكل ذرّة كلور ينقصها إلكترون واحد. لذلك تحتاج ذرّتا كلور لتستقبلا الإلكترونين.',
}

const SPECS: Record<string, CompoundSpec> = {
  'lesson2-transfer-cao': CAO,
  'lesson2-transfer-mgcl2': MGCL2,
}

function electronsIn(shells: number[]): number {
  return shells.reduce((total, count) => total + count, 0)
}

function formatCharge(charge: string): string {
  const normalized = normalizeCharge(charge)
  return `${chargeGlyph(normalized.sign)}${normalized.magnitude || '1'}`
}

export default function Lesson2TransferMechanismDiagram({ interactiveId }: InteractiveProps) {
  const spec = SPECS[interactiveId] ?? CAO
  const { metal, nonmetal } = spec
  const metalElectrons = electronsIn(metal.shells)
  const nonmetalElectrons = electronsIn(nonmetal.shells)
  const metalIonElectrons = electronsIn(metal.ionShells)
  const nonmetalIonElectrons = electronsIn(nonmetal.ionShells)
  const totalLost = metal.moved * metal.count
  const totalGained = nonmetal.moved * nonmetal.count

  return (
    <figure className="l2-figure" data-diagram={interactiveId} data-compound={spec.formula}>
      <header className="l2-figure__header">
        <p className="l2-figure__eyebrow">
          شكل توضيحي من إضافة المنصة · {spec.name} <Sci variant="plain">(<ChemicalFormula formula={spec.formula} size="sm" />)</Sci>
        </p>
        <h4 className="l2-figure__title">آلية الرابطة الأيونية في أربع مراحل: {spec.name}</h4>
        <p className="l2-figure__lead">{spec.statement}</p>
      </header>

      <div className="l2-transfer__grid">
        {/* ---------------------------- المرحلة ١ ---------------------------- */}
        <section className="l2-transfer__stage" data-stage="1" aria-labelledby={`l2-transfer-${spec.formula}-1`}>
          <header className="l2-transfer__head">
            <span className="l2-observation-index" aria-hidden="true">
              1
            </span>
            <h5 id={`l2-transfer-${spec.formula}-1`}>الذرّات المتعادلة</h5>
          </header>
          <div className="l2-transfer__row" dir="ltr">
            <BohrAtom symbol={metal.symbol} shells={metal.shells} size={104} highlightValence />
            <span className="l2-transfer__plus" aria-hidden="true">
              +
            </span>
            <span className="l2-transfer__atoms" data-count={nonmetal.count}>
              {Array.from({ length: nonmetal.count }, (_unused, index) => (
                <BohrAtom
                  key={index}
                  symbol={nonmetal.symbol}
                  shells={nonmetal.shells}
                  size={104}
                  highlightValence
                />
              ))}
            </span>
          </div>
          <dl className="l2-transfer__facts">
            <div>
              <dt>
                <Sci variant="plain">
                  {metal.symbol} (Z = {metal.atomicNumber})
                </Sci>
              </dt>
              <dd>
                التوزيع <ElectronConfiguration value={metal.shells.join('-')} /> · الإلكترونات {metalElectrons} ·
                الشحنة 0
              </dd>
            </div>
            <div>
              <dt>
                <Sci variant="plain">
                  {nonmetal.symbol} (Z = {nonmetal.atomicNumber}) × {nonmetal.count}
                </Sci>
              </dt>
              <dd>
                التوزيع <ElectronConfiguration value={nonmetal.shells.join('-')} /> · الإلكترونات{' '}
                {nonmetalElectrons} · الشحنة 0
              </dd>
            </div>
          </dl>
          <p className="l2-transfer__note">
            كل الذرّات متعادلة هنا: عدد البروتونات يساوي عدد الإلكترونات في كل واحدة منها.
          </p>
        </section>

        {/* ---------------------------- المرحلة ٢ ---------------------------- */}
        <section className="l2-transfer__stage" data-stage="2" aria-labelledby={`l2-transfer-${spec.formula}-2`}>
          <header className="l2-transfer__head">
            <span className="l2-observation-index" aria-hidden="true">
              2
            </span>
            <h5 id={`l2-transfer-${spec.formula}-2`}>انتقال الإلكترونات</h5>
          </header>
          <div className="l2-transfer__row l2-transfer__row--motion" dir="ltr">
            <BohrAtom symbol={metal.symbol} shells={metal.shells} size={90} highlightValence />
            <span className="l2-transfer__arrow" aria-hidden="true">
              <svg viewBox="0 0 120 26" width="76" height="20" focusable="false">
                <path d="M4 13 H 96" />
                <path d="M86 5 L 104 13 L 86 21" />
              </svg>
              <span className="l2-transfer__arrow-label" dir="rtl">
                {metal.moved} إلكترون{metal.moved > 1 ? 'ين' : ''}
              </span>
            </span>
            <span className="l2-transfer__atoms" data-count={nonmetal.count}>
              {Array.from({ length: nonmetal.count }, (_unused, index) => (
                <BohrAtom key={index} symbol={nonmetal.symbol} shells={nonmetal.shells} size={90} highlightValence />
              ))}
            </span>
          </div>
          <p className="l2-transfer__big" dir="rtl">
            يفقد {metal.symbol} <strong>{totalLost}</strong> إلكترون
            {totalLost > 1 ? 'ين' : ''}، وتكتسب {nonmetal.count > 1 ? 'كل ذرّة ' : ''}
            {nonmetal.symbol} <strong>{nonmetal.moved}</strong> إلكترون{nonmetal.moved > 1 ? 'ين' : ''}؛
            فالمجموع المنتقل = <strong>{totalGained}</strong>.
          </p>
          <p className="l2-transfer__note">
            الانتقال إلى السوية الأخيرة فقط: إلكترونات السويات الداخلية لا تنتقل لأن سوياتها مكتملة.
          </p>
        </section>

        {/* ---------------------------- المرحلة ٣ ---------------------------- */}
        <section className="l2-transfer__stage" data-stage="3" aria-labelledby={`l2-transfer-${spec.formula}-3`}>
          <header className="l2-transfer__head">
            <span className="l2-observation-index" aria-hidden="true">
              3
            </span>
            <h5 id={`l2-transfer-${spec.formula}-3`}>الأيونات الناتجة</h5>
          </header>
          <div className="l2-transfer__row" dir="ltr">
            <BohrAtom
              symbol={metal.symbol}
              shells={metal.ionShells}
              charge={metal.charge}
              size={104}
              label={metal.symbol}
            />
            <span className="l2-transfer__plus" aria-hidden="true">
              +
            </span>
            <span className="l2-transfer__atoms" data-count={nonmetal.count}>
              {Array.from({ length: nonmetal.count }, (_unused, index) => (
                <BohrAtom
                  key={index}
                  symbol={nonmetal.symbol}
                  shells={nonmetal.ionShells}
                  charge={nonmetal.charge}
                  size={104}
                />
              ))}
            </span>
          </div>
          <dl className="l2-transfer__facts">
            <div>
              <dt>
                <IonNotation formula={metal.symbol} charge={metal.charge} size="sm" />
              </dt>
              <dd>
                <MathFormula
                  tex={`${metal.atomicNumber} - ${metalIonElectrons} = ${formatCharge(metal.charge).replace('−', '-')}`}
                  label={`${metal.atomicNumber} بروتوناً ناقص ${metalIonElectrons} إلكترونات يساوي شحنة الأيون ${formatCharge(metal.charge)}`}
                />
              </dd>
            </div>
            <div>
              <dt>
                <Sci variant="plain">
                  <IonNotation formula={nonmetal.symbol} charge={nonmetal.charge} size="sm" /> × {nonmetal.count}
                </Sci>
              </dt>
              <dd>
                <MathFormula
                  tex={`${nonmetal.atomicNumber} - ${nonmetalIonElectrons} = ${formatCharge(nonmetal.charge).replace('−', '-')}`}
                  label={`${nonmetal.atomicNumber} بروتوناً ناقص ${nonmetalIonElectrons} إلكترونات يساوي شحنة الأيون ${formatCharge(nonmetal.charge)}`}
                />
              </dd>
            </div>
          </dl>
          <p className="l2-transfer__note">
            تحقّقت قاعدة الثمانية للجميع: سطح {metal.symbol} صار 8، وسطح {nonmetal.symbol} صار 8.
          </p>
        </section>

        {/* ---------------------------- المرحلة ٤ ---------------------------- */}
        <section
          className="l2-transfer__stage l2-transfer__stage--charge"
          data-stage="4"
          aria-labelledby={`l2-transfer-${spec.formula}-4`}
        >
          <header className="l2-transfer__head">
            <span className="l2-observation-index" aria-hidden="true">
              4
            </span>
            <h5 id={`l2-transfer-${spec.formula}-4`}>التجاذب الكهربائي الساكن والصيغة</h5>
          </header>
          <div className="l2-transfer__lattice">
            <svg
              viewBox="0 0 240 120"
              role="img"
              aria-label={`تراص الأيونات: ${metal.symbol}${
                metal.charge === '2+' ? '²⁺' : '⁺'
              } في المركز وأيون ${nonmetal.symbol}${nonmetal.charge === '2-' ? '²⁻' : '⁻'} سالب ${
                nonmetal.count > 1 ? 'اثنان' : 'واحد'
              } حوله بنسبة ${spec.ratio}`}
            >
              <circle className="l2-transfer__cation" cx={110} cy={60} r={22} />
              <text className="l2-transfer__sign" x={110} y={67} textAnchor="middle" direction="ltr" unicodeBidi="isolate">
                {formatCharge(metal.charge)}
              </text>
              {Array.from({ length: nonmetal.count }, (_unused, index) => {
                const anionY = nonmetal.count > 1 ? (index === 0 ? 30 : 90) : 60
                return (
                  <g key={index}>
                    <circle className="l2-transfer__anion" cx={172} cy={anionY} r={26} />
                    <text className="l2-transfer__sign" x={172} y={anionY + 7} textAnchor="middle" direction="ltr" unicodeBidi="isolate">
                      {formatCharge(nonmetal.charge)}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div className="l2-transfer__formula">
              <ChemicalFormula formula={spec.formula} size="lg" />
              <p>
                نسبة الأيونات <Sci variant="textual">{spec.ratio}</Sci> · المجموع الجبري للشحنات يساوي صفراً لأن{' '}
                <MathFormula
                  tex={`(${formatCharge(metal.charge).replace('−', '-')}) + ${nonmetal.count} \\times (${formatCharge(nonmetal.charge).replace('−', '-')}) = 0`}
                  label={`مجموع شحنة أيون ${metal.symbol} وشحنات ${nonmetal.count} من أيون ${nonmetal.symbol} يساوي صفراً`}
                />
              </p>
            </div>
          </div>
          <p className="l2-transfer__note">
            الرابطة الأيونية هي هذا التجاذب نفسه: قوة كهربائية ساكنة بين أيون موجب وأيون سالب، تتكرّر
            في الشبكة كلها.
          </p>
        </section>
      </div>

      <figcaption className="l2-figure__caption">
        <p>
          <strong>لماذا نبدأ بالعدد الذري؟</strong> لأنه يحدّد عدد البروتونات، وهو الذي لا يتغيّر
          أبداً أثناء الرابطة. أمّا الإلكترونات فهي التي تنتقل، فتُحسب الشحنة دائماً بالطرح:
          الشحنة = البروتونات − الإلكترونات. لذلك تُظهر الأعدادُ للأيون {metal.symbol}:
          {' '}<MathFormula
            tex={`${metal.atomicNumber} - ${metalIonElectrons} = ${formatCharge(metal.charge).replace('−', '-')}`}
            label={`${metal.atomicNumber} ناقص ${metalIonElectrons} يساوي ${formatCharge(metal.charge)}`}
          />.
        </p>
        <p>
          <strong>المرجع:</strong> الأعداد الذرّية مطبوعة في صفحة {spec.printedOn} من الكتاب،
          والمركّب نفسه مذكور في صفحات الدرس. أمّا هذا الترتيب المرحلي والرسوم فمن إضافة المنصة.
        </p>
      </figcaption>
    </figure>
  )
}
