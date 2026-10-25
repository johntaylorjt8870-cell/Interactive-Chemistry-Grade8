import { ChemicalFormula, MathFormula, Sci, ScientificNotationText, type LewisMoleculeSide } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   شكل تعليمي من إضافة المنصة: تمثيل لويس لجزيئات مختلفة الذرّات (H₂O وHCl)
   ----------------------------------------------------------------------------
   يطبّق خطوات الرسم بصرياً بنقاط DOM حقيقية معزولة الاتجاه (LTR):
     * جزيء الماء H₂O: ذرّة O مركزية تحيط بها ذرّتا H، زوجان مشتركان (4 إلكترونات)
       وزوجان غير مشتركين على O (4 إلكترونات)، بلا أزواج غير مشتركة على H.
     * جزيء كلوريد الهيدروجين HCl: زوج مشترك واحد (إلكترونان) بين H وCl،
       وثلاثة أزواج غير مشتركة حول Cl (6 إلكترونات)، بلا أزواج غير مشتركة على H.
   ========================================================================= */

type AtomDotsProps = {
  symbol: string
  loneSides: LewisMoleculeSide[]
}

function renderLoneSlot(loneSides: LewisMoleculeSide[], side: LewisMoleculeSide) {
  if (!loneSides.includes(side)) {
    return <span className={`lewis-mol__slot lewis-mol__slot--${side}`} data-side={side} data-empty="true" />
  }
  return (
    <span className={`lewis-mol__slot lewis-mol__slot--${side}`} data-side={side}>
      <span className="lewis-mol__pair" data-electron="lone-pair" data-side={side}>
        <span className="lewis-mol__dot" data-electron="lone" />
        <span className="lewis-mol__dot" data-electron="lone" />
      </span>
    </span>
  )
}

function AtomDots({ symbol, loneSides }: AtomDotsProps) {
  return (
    <span className="lewis-mol__atom" data-atom={symbol} data-lone-pairs={loneSides.length}>
      <span className="lewis-mol__atom-grid">
        {renderLoneSlot(loneSides, 'top')}
        {renderLoneSlot(loneSides, 'left')}
        <span className="lewis-mol__symbol" dir="ltr">
          {symbol}
        </span>
        {renderLoneSlot(loneSides, 'right')}
        {renderLoneSlot(loneSides, 'bottom')}
      </span>
    </span>
  )
}

function SingleSharedPair() {
  return (
    <span className="lewis-mol__shared" data-shared-pairs={1} data-shared-electrons={2}>
      <span className="lewis-mol__shared-pair" data-pair={1}>
        <span className="lewis-mol__dot" data-electron="shared" />
        <span className="lewis-mol__dot" data-electron="shared" />
      </span>
    </span>
  )
}

function SingleBondLine() {
  return <span className="l2-hetero-lewis__bond-line" aria-hidden="true" />
}

export default function Lesson2HeteroLewisDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l2-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l2-figure__header">
        <p className="l2-figure__eyebrow">شكل توضيحي من إضافة المنصة · تمثيل لويس لجزيئات مختلفة الذرّات</p>
        <h4 className="l2-figure__title">
          <ScientificNotationText>كيف يظهر تمثيل لويس النقطي والخطي في H₂O وHCl؟</ScientificNotationText>
        </h4>
        <p className="l2-figure__lead">
          لاحظ في الجزيئين كيف تكتفي كل ذرّة هيدروجين بزوج مشترك واحد دون أي نقاط حرّة حولها، بينما
          تحمل ذرّة الأكسجين زوجين غير مشتركين وتحمل ذرّة الكلور ثلاثة أزواج غير مشتركة لإكمال الثمانية.
        </p>
      </header>

      <ul className="l2-lewis__legend" aria-label="مفتاح قراءة التمثيل النقطي والخطي">
        <li data-marker="shared">
          <span className="l2-legend__marker l2-legend__marker--shared" aria-hidden="true" />
          <span>النقطتان بين الرمزين = زوج إلكترونات مشترك واحد.</span>
        </li>
        <li data-marker="lone">
          <span className="l2-legend__marker l2-legend__marker--lone" aria-hidden="true" />
          <span>النقطتان على أطراف الرمز = زوج إلكترونات غير مشترك.</span>
        </li>
        <li data-marker="order">
          <span className="l2-legend__marker l2-legend__marker--order" aria-hidden="true" />
          <span>الخط (—) في التمثيل الخطي يحلّ محلّ الزوج المشترك الواحد.</span>
        </li>
      </ul>

      <div className="l2-hetero-lewis__grid" dir="rtl">
        {/* ----------------------- البطاقة ١: الماء H₂O ----------------------- */}
        <article className="l2-lewis__card l2-hetero-lewis__card" data-hetero-molecule="H2O">
          <header className="l2-lewis__card-head">
            <span className="l2-observation-index" aria-hidden="true">
              1
            </span>
            <h5>
              جزيء الماء <ChemicalFormula formula="H2O" size="sm" />
            </h5>
          </header>

          <div className="l2-hetero-lewis__stage" dir="ltr">
            <div
              className="lewis-mol__lewis l2-hetero-lewis__dots"
              role="img"
              aria-label="تمثيل لويس النقطي لجزيء الماء: ذرة أكسجين في الوسط حولها زوجان غير مشتركين أعلى وأسفل، وتشترك بزوج إلكتروني واحد مع كل ذرة هيدروجين على الجانبين دون أزواج غير مشتركة على الهيدروجين."
            >
              <AtomDots symbol="H" loneSides={[]} />
              <SingleSharedPair />
              <AtomDots symbol="O" loneSides={['top', 'bottom']} />
              <SingleSharedPair />
              <AtomDots symbol="H" loneSides={[]} />
            </div>

            <span className="l2-hetero-lewis__equiv" aria-hidden="true">
              ⇕
            </span>

            <div
              className="lewis-mol__lewis l2-hetero-lewis__lines"
              role="img"
              aria-label="التمثيل الخطي لجزيء الماء: خط رابطة وحيدة بين كل هيدروجين والأكسجين مع بقاء الزوجين غير المشتركين على الأكسجين."
            >
              <AtomDots symbol="H" loneSides={[]} />
              <SingleBondLine />
              <AtomDots symbol="O" loneSides={['top', 'bottom']} />
              <SingleBondLine />
              <AtomDots symbol="H" loneSides={[]} />
            </div>
          </div>

          <dl className="l2-lewis__facts">
            <div>
              <dt>الأزواج المشتركة في الجزيء</dt>
              <dd>2 (رابطتان وحيدتان = 4 إلكترونات مشتركة)</dd>
            </div>
            <div>
              <dt>الأزواج غير المشتركة</dt>
              <dd>
                2 على <Sci variant="plain">O</Sci> (4 إلكترونات) · 0 على كل <Sci variant="plain">H</Sci>
              </dd>
            </div>
            <div>
              <dt>
                التحقّق حول <Sci variant="plain">O</Sci>
              </dt>
              <dd>
                <MathFormula tex="4 + 4 = 8" label="أربعة إلكترونات مشتركة زائد أربعة غير مشتركة يساوي ثمانية" />
              </dd>
            </div>
            <div>
              <dt>
                التحقّق حول كل <Sci variant="plain">H</Sci>
              </dt>
              <dd>
                <MathFormula tex="2 + 0 = 2" label="إلكترونان مشتركان زائد صفر غير مشترك يساوي اثنين" />
              </dd>
            </div>
          </dl>
        </article>

        {/* ---------------- البطاقة ٢: كلوريد الهيدروجين HCl ---------------- */}
        <article className="l2-lewis__card l2-hetero-lewis__card" data-hetero-molecule="HCl">
          <header className="l2-lewis__card-head">
            <span className="l2-observation-index" aria-hidden="true">
              2
            </span>
            <h5>
              جزيء كلوريد الهيدروجين <ChemicalFormula formula="HCl" size="sm" />
            </h5>
          </header>

          <div className="l2-hetero-lewis__stage" dir="ltr">
            <div
              className="lewis-mol__lewis l2-hetero-lewis__dots"
              role="img"
              aria-label="تمثيل لويس النقطي لجزيء كلوريد الهيدروجين: زوج إلكتروني مشترك واحد بين الهيدروجين والكلور، وثلاثة أزواج غير مشتركة حول ذرة الكلور، وصفر أزواج غير مشتركة حول الهيدروجين."
            >
              <AtomDots symbol="H" loneSides={[]} />
              <SingleSharedPair />
              <AtomDots symbol="Cl" loneSides={['top', 'right', 'bottom']} />
            </div>

            <span className="l2-hetero-lewis__equiv" aria-hidden="true">
              ⇕
            </span>

            <div
              className="lewis-mol__lewis l2-hetero-lewis__lines"
              role="img"
              aria-label="التمثيل الخطي لجزيء كلوريد الهيدروجين: خط رابطة وحيدة بين H وCl مع بقاء ثلاثة أزواج غير مشتركة حول Cl."
            >
              <AtomDots symbol="H" loneSides={[]} />
              <SingleBondLine />
              <AtomDots symbol="Cl" loneSides={['top', 'right', 'bottom']} />
            </div>
          </div>

          <dl className="l2-lewis__facts">
            <div>
              <dt>الأزواج المشتركة في الجزيء</dt>
              <dd>1 (رابطة وحيدة = إلكترونان مشتركان)</dd>
            </div>
            <div>
              <dt>الأزواج غير المشتركة</dt>
              <dd>
                3 على <Sci variant="plain">Cl</Sci> (6 إلكترونات) · 0 على <Sci variant="plain">H</Sci>
              </dd>
            </div>
            <div>
              <dt>
                التحقّق حول <Sci variant="plain">Cl</Sci>
              </dt>
              <dd>
                <MathFormula tex="2 + 6 = 8" label="إلكترونان مشتركان زائد ستة غير مشتركة يساوي ثمانية" />
              </dd>
            </div>
            <div>
              <dt>
                التحقّق حول <Sci variant="plain">H</Sci>
              </dt>
              <dd>
                <MathFormula tex="2 + 0 = 2" label="إلكترونان مشتركان زائد صفر غير مشترك يساوي اثنين" />
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <figcaption className="l2-figure__caption">
        <p>
          <strong>قاعدة التحقّق المزدوج في أي تمثيل لويس:</strong> (1) مجموع النقاط المرسومة في
          الشكل كله يجب أن يساوي مجموع إلكترونات التكافؤ للذرّات الداخلة في الجزيء (
          <MathFormula tex="6 + 1 + 1 = 8" label="ستة زائد واحد زائد واحد يساوي ثمانية" /> في{' '}
          <ChemicalFormula formula="H2O" size="sm" />، و
          <MathFormula tex="1 + 7 = 8" label="واحد زائد سبعة يساوي ثمانية" /> في{' '}
          <ChemicalFormula formula="HCl" size="sm" />). (2) حول كل ذرّة على حدة تكتمل السوية
          الأولى للهيدروجين بـ 2 وتكتمل السوية الخارجية لبقية الذرّات الممثّلة بـ 8.
        </p>
      </figcaption>
    </figure>
  )
}
