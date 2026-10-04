import {
  ChemicalFormula,
  ChargeValue,
  IonNotation,
  LewisStructure,
  MathFormula,
  NuclearNotation,
  ScientificTable,
  ScientificText,
  ScientificValue,
} from '@/scientific'

/**
 * Shows what the rendering foundation can do — notation capability, not
 * curriculum content. Chemistry examples use source material already present
 * in the course and illustrate LTR isolation.
 */
export function ScientificShowcase() {
  return (
    <section className="section" aria-labelledby="showcase-title">
      <div className="section-heading">
        <p className="eyebrow">البنية العلمية</p>
        <h2 id="showcase-title">عرض علمي دقيق داخل نص عربي</h2>
        <p className="lead">
          العربية تُقرأ من اليمين إلى اليسار، والصيغ العلمية تُكتب من اليسار إلى اليمين. تعزل المنصة
          كل تعبير علمي في وحدة مستقلة الاتجاه، فتظهر القيم والوحدات والصيغ بترتيبها الصحيح دائماً.
        </p>
      </div>

      <p className="showcase-note" role="note">
        الأمثلة التالية توضح أنماط الكتابة العلمية التي تدعمها المنصة، وليست محتوى دراسياً جديداً.
      </p>

      <div className="showcase-grid">
        <article className="showcase-card showcase-card--wide">
          <h3 className="showcase-card__title">القيم والوحدات داخل جملة عربية</h3>
          <ul className="showcase-list">
            <li>
              <ScientificText>كمية المادة 1 mol في هذا المثال التوضيحي.</ScientificText>
            </li>
            <li>
              <ScientificText>درجة الحرارة 25 °C في هذا المثال التوضيحي.</ScientificText>
            </li>
          </ul>
          <p className="showcase-card__hint">الرقم أولاً ثم الوحدة إلى يمينه — بلا انعكاس اتجاه.</p>
        </article>

        <article className="showcase-card">
          <h3 className="showcase-card__title">قيمة ووحدة</h3>
          <div className="showcase-row">
            <ScientificValue value={1} unit="mol" size="lg" />
            <ScientificValue value={25} unit="°C" size="lg" />
          </div>
          <div className="showcase-row">
            <ScientificValue value="6.02" exponent="23" unit="mol⁻¹" size="lg" />
          </div>
        </article>

        <article className="showcase-card">
          <h3 className="showcase-card__title">الكسور والأسس والجذور</h3>
          <div className="showcase-row">
            <MathFormula tex="\\frac{1}{2}" />
            <MathFormula tex="y = 2(n)^{2}" />
            <MathFormula tex="\\sqrt{2}" />
          </div>
          <MathFormula tex="y = 2(n)^{2}" display="block" />
        </article>

        <article className="showcase-card">
          <h3 className="showcase-card__title">الصيغ الكيميائية</h3>
          <div className="showcase-row">
            <ChemicalFormula formula="H2O" size="lg" />
            <ChemicalFormula formula="CO2" size="lg" />
            <ChemicalFormula formula="CaCO3" size="lg" />
            <ChemicalFormula formula="Ca(OH)2" size="lg" />
          </div>
          <p className="showcase-card__hint">الرموز السفلية عناصر حقيقية، لا فراغات ولا حيل نصية.</p>
        </article>

        <article className="showcase-card">
          <h3 className="showcase-card__title">الأيونات والشحنات</h3>
          <div className="showcase-row">
            <IonNotation formula="Na" charge="+" size="lg" />
            <IonNotation formula="Cl" charge="-" size="lg" />
            <IonNotation formula="Ca" charge="2+" size="lg" />
            <IonNotation formula="SO4" charge="2-" size="lg" />
          </div>
          <dl className="showcase-definition">
            <dt>شحنة مفردة</dt>
            <dd>
              <ChargeValue value="-2" size="lg" />
              <span className="showcase-inline-note">الإشارة قبل المقدار</span>
            </dd>
            <dt>شحنة موجبة</dt>
            <dd>
              <ChargeValue value="+2" size="lg" />
              <span className="showcase-inline-note">لا تُكتب 2+</span>
            </dd>
          </dl>
        </article>

        <article className="showcase-card">
          <h3 className="showcase-card__title">الترميز النووي</h3>
          <div className="showcase-row">
            <NuclearNotation symbol="C" massNumber={12} atomicNumber={6} size="lg" />
            <NuclearNotation symbol="He" massNumber={4} atomicNumber={2} size="lg" />
          </div>
          <p className="showcase-card__hint">
            العدد الكتلي أعلى اليسار، والعدد الذري أسفل اليسار، ورمز العنصر بينهما.
          </p>
        </article>

        <article className="showcase-card">
          <h3 className="showcase-card__title">بنية لويس</h3>
          <LewisStructure
            symbol="O"
            pairs={{ top: 1, bottom: 1 }}
            dots={[
              { position: 'left', slot: 0 },
              { position: 'right', slot: 0 },
            ]}
            size="lg"
            caption="كل إلكترون عنصر مستقل يمكن التحكم به منفرداً."
          />
        </article>

        <article className="showcase-card showcase-card--wide">
          <h3 className="showcase-card__title">جدول كيميائي قابل للقراءة</h3>
          <ScientificTable
            caption="الترميز النووي والجسيمات والشحنة — أمثلة من درس الذرة والعنصر"
            columns={[
              { key: 'form', header: 'الجسيم', rowHeader: true },
              { key: 'nucleus', header: 'رمز النواة', align: 'center' },
              { key: 'electrons', header: 'عدد الإلكترونات', numeric: true },
              { key: 'protons', header: 'عدد البروتونات', numeric: true },
              { key: 'sum', header: 'المجموع الجبري للشحنات', align: 'center' },
            ]}
            rows={[
              { id: 'na-atom', cells: { form: 'ذرة الصوديوم', nucleus: '²³₁₁Na', electrons: '11', protons: '11', sum: '0' } },
              { id: 'na-ion', cells: { form: 'أيون الصوديوم', nucleus: '²³₁₁Na', electrons: '10', protons: '11', sum: '+1' }, selected: true },
              { id: 'cl-atom', cells: { form: 'ذرة الكلور', nucleus: '³⁵₁₇Cl', electrons: '17', protons: '17', sum: '0' } },
              { id: 'cl-ion', cells: { form: 'أيون الكلور', nucleus: '³⁵₁₇Cl', electrons: '18', protons: '17', sum: '−1' }, active: true },
            ]}
            footnote="الأمثلة مأخوذة من محتوى الكيمياء المنشور؛ الجدول يوضح طريقة العرض فقط."
          />
        </article>
      </div>
    </section>
  )
}
