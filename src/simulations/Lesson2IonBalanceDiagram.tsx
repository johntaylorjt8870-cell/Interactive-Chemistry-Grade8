import { BohrAtom, ElectronConfiguration, IonNotation, MathFormula, Sci } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   شكل تأسيسي: الذرّة المتعادلة والأيون الموجب والأيون السالب
   ----------------------------------------------------------------------------
   يبني المفهوم من الصفر بصرياً وجبرياً:
     1. لماذا الذرّة المنفردة متعادلة الشحنة؟ (البروتونات الموجبة = الإلكترونات السالبة).
     2. كيف ينشأ الأيون الموجب عند فقد إلكترون تكافؤ؟ (البروتونات ثابتة والإلكترونات تنقص).
     3. كيف ينشأ الأيون السالب عند اكتساب إلكترون؟ (البروتونات ثابتة والإلكترونات تزيد).
   ========================================================================= */

type ParticleCard = {
  id: 'neutral-na' | 'cation-na' | 'anion-cl'
  badge: string
  heading: string
  symbol: string
  shells: number[]
  charge?: string
  highlightValence?: boolean
  protons: number
  electrons: number
  equationTex: string
  equationLabel: string
  ionCharge?: string
  note: string
}

const CARDS: ParticleCard[] = [
  {
    id: 'neutral-na',
    badge: 'ذرّة متعادلة',
    heading: 'ذرّة صوديوم متعادلة',
    symbol: 'Na',
    shells: [2, 8, 1],
    highlightValence: true,
    protons: 11,
    electrons: 11,
    equationTex: 'q = 11 - 11 = 0',
    equationLabel: 'أحد عشر بروتوناً ناقص أحد عشر إلكتروناً يساوي صفراً',
    note: 'عدد البروتونات الموجبة في النواة يساوي عدد الإلكترونات السالبة حولها، فتلغي كل شحنة موجبة شحنة سالبة مقابلة وتكون الذرّة متعادلة.',
  },
  {
    id: 'cation-na',
    badge: 'أيون موجب (فقد إلكتروناً)',
    heading: 'أيون الصوديوم الموجب',
    symbol: 'Na',
    shells: [2, 8],
    charge: '+',
    protons: 11,
    electrons: 10,
    equationTex: 'q = 11 - 10 = +1',
    equationLabel: 'أحد عشر بروتوناً ناقص عشرة إلكترونات يساوي موجب واحد',
    ionCharge: '+',
    note: 'فقدت الذرّة إلكترون تكافئها السالب الوحيد وبقيت البروتونات الأحد عشر ثابتة داخل النواة، فصارت الشحنات الموجبة أكثر بواحدة.',
  },
  {
    id: 'anion-cl',
    badge: 'أيون سالب (اكتسب إلكتروناً)',
    heading: 'أيون الكلوريد السالب',
    symbol: 'Cl',
    shells: [2, 8, 8],
    charge: '-',
    protons: 17,
    electrons: 18,
    equationTex: 'q = 17 - 18 = -1',
    equationLabel: 'سبعة عشر بروتوناً ناقص ثمانية عشر إلكتروناً يساوي سالب واحد',
    ionCharge: '-',
    note: 'اكتسبت ذرّة الكلور (التي كان توزيعها 2-8-7) إلكتروناً سالباً واحداً في سويتها الأخيرة وبقيت بروتوناتها السبعة عشر ثابتة، فزادت الشحنات السالبة بواحدة.',
  },
]

export default function Lesson2IonBalanceDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l2-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l2-figure__header">
        <p className="l2-figure__eyebrow">شكل تأسيسي من إضافة المنصة · يربط بنية الذرّة بحساب شحنة الأيون</p>
        <h4 className="l2-figure__title">من الذرّة المتعادلة إلى الأيون الموجب والأيون السالب</h4>
        <p className="l2-figure__lead">
          قارن الحالات الثلاث من اليمين إلى اليسار: النواة في المركز لا يتغيّر عدد بروتوناتها أبداً،
          وإنما يتغيّر عدد إلكترونات السوية الأخيرة فقط، فيتغيّر ميزان الشحنة.
        </p>
      </header>

      <div className="l2-ion-balance__grid" dir="rtl">
        {CARDS.map((card, index) => (
          <article className="l2-ion-balance__card" key={card.id} data-particle-card={card.id}>
            <header className="l2-ion-balance__head">
              <span className="l2-observation-index" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <p className="l2-ion-balance__badge">{card.badge}</p>
                <h5 className="l2-ion-balance__title">
                  {card.heading}{' '}
                  <Sci variant="plain">
                    ({card.ionCharge ? <IonNotation formula={card.symbol} charge={card.ionCharge} size="sm" /> : card.symbol})
                  </Sci>
                </h5>
              </div>
            </header>

            <div className="l2-ion-balance__atom">
              <BohrAtom
                symbol={card.symbol}
                shells={card.shells}
                charge={card.charge}
                highlightValence={card.highlightValence}
                size={118}
              />
            </div>

            <dl className="l2-ion-balance__facts">
              <div>
                <dt>البروتونات الموجبة في النواة</dt>
                <dd dir="ltr">+{card.protons}</dd>
              </div>
              <div>
                <dt>الإلكترونات السالبة في السويات</dt>
                <dd dir="ltr">{'\u2212'}{card.electrons}</dd>
              </div>
              <div>
                <dt>التوزيع الإلكتروني</dt>
                <dd>
                  <ElectronConfiguration value={card.shells.join('-')} size="sm" />
                </dd>
              </div>
              <div>
                <dt>حساب الشحنة</dt>
                <dd>
                  <MathFormula tex={card.equationTex} display="inline" label={card.equationLabel} />
                </dd>
              </div>
            </dl>

            <p className="l2-ion-balance__note">{card.note}</p>
          </article>
        ))}
      </div>

      <ul className="l2-figure__legend" aria-label="مفتاح قراءة الذرّة والأيون">
        <li>
          <span className="l2-legend__nucleus" aria-hidden="true" />
          <span>
            <strong>النواة (ثابتة):</strong> تضم البروتونات الموجبة والنيوترونات المتعادلة؛ لا تفقد الذرّة بروتوناً ولا تكتسبه في التفاعلات الكيميائية.
          </span>
        </li>
        <li>
          <span className="l2-legend__inner" aria-hidden="true" />
          <span>
            <strong>الإلكترونات الداخلية:</strong> تشغل سويات مكتملة قريبة من النواة، وتبقى كما هي عند تكوّن الأيون.
          </span>
        </li>
        <li>
          <span className="l2-legend__valence" aria-hidden="true" />
          <span>
            <strong>إلكترونات التكافؤ (السطح):</strong> هي وحدها التي قد تُفقد فيتكوّن أيون موجب، أو يُضاف إليها إلكترون فيتكوّن أيون سالب.
          </span>
        </li>
      </ul>

      <figcaption className="l2-figure__caption">
        <p>
          <strong>قاعدة الفهم لا الحفظ:</strong> لأن الإلكترون يحمل شحنة سالبة، فإن <strong>فقد</strong> إلكترون
          سالب يجعل البروتونات الموجبة أكثر فتظهر شحنة <strong>موجبة</strong>، أمّا <strong>اكتساب</strong> إلكترون
          سالب فيجعل الإلكترونات أكثر فتظهر شحنة <strong>سالبة</strong>.
        </p>
      </figcaption>
    </figure>
  )
}
