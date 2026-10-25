import { MathFormula, Sci, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

type AnatomyPart = {
  id: string
  badge: string
  title: string
  example: string
  meaning: string
  rule: string
}

const PARTS: AnatomyPart[] = [
  {
    id: 'reactants',
    badge: '1 · يسار السهم',
    title: 'المواد المتفاعلة (الطّرف الأول)',
    example: 'Zn(s) + 2HCl(aq)',
    meaning: 'المواد التي يبدأ بها التفاعل الكيميائي وتتغيّر روابطها لتكوين مواد جديدة.',
    rule: 'تُكتب دائماً على يسار سهم التفاعل، وتفصل إشارة (+) بين كل مادة متفاعلة وأخرى.',
  },
  {
    id: 'arrow',
    badge: '2 · اتجاه التحوّل',
    title: 'سهم التفاعل وشرطه',
    example: '⟶  /  Δ فوق السهم',
    meaning: 'يُقرأ «ينتج» أو «يتحوّل إلى»، ويفصل الطرف الأول عن الطرف الثاني.',
    rule: 'يتّجه السهم في المعادلة الرمزية دائماً من اليسار إلى اليمين، ويُكتب فوقه الرمز Δ عند الحاجة إلى التسخين.',
  },
  {
    id: 'products',
    badge: '3 · يمين السهم',
    title: 'المواد النّاتجة (الطّرف الثاني)',
    example: 'ZnCl₂(aq) + H₂(g)',
    meaning: 'المواد الجديدة المتكوّنة نتيجة إعادة ترتيب الذرات نفسها دون ضياع أو استحداث.',
    rule: 'تُكتب دائماً على يمين السهم، وتحمل الذرات ذاتها التي دخلت في المتفاعلات عدداً ونوعاً.',
  },
  {
    id: 'coefficient',
    badge: '4 · أداة الموازنة الوحيدة',
    title: 'المعامل الكيميائي الأمامي',
    example: '2 في 2HCl',
    meaning: 'عدد صحيح يُكتب على يسار الصيغة ليبين عدد وحدات المادة أو جزيئاتها المشاركة.',
    rule: 'يُضرب في جميع ذرات الصيغة التي تليه (2HCl تعني 2 H و2 Cl)، وغيابه يعني الرقم 1.',
  },
  {
    id: 'subscript',
    badge: '5 · هوية المادة الثابتة',
    title: 'الدليل الذرّي السفلي',
    example: '2 في ZnCl₂ وH₂',
    meaning: 'رقم صغير أسفل يمين رمز العنصر يدلّ على عدد ذرات ذلك العنصر وحده داخل الصيغة.',
    rule: 'يحدّده التكافؤ الكيميائي وبنية الجزيء؛ يُمنع تغييره عند موازنة المعادلة لأنه يغيّر المادة نفسها!',
  },
  {
    id: 'state',
    badge: '6 · وصف الحالة الفيزيائية',
    title: 'رمز الحالة الفيزيائيّة',
    example: '(s) · (l) · (aq) · (g)',
    meaning: 'حرف أو حرفان بين قوسين أسفل يمين الصيغة يبيّن حالة المادة أثناء التفاعل.',
    rule: 'لا يدخل في عدّ الذرات، لكنه ضروري لوصف التفاعل وصفاً علمياً دقيقاً كما في جدول ص37.',
  },
]

export default function Lesson6EquationAnatomyDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l6-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l6-figure__header">
        <p className="l6-figure__eyebrow">شكل تأسيسي من إضافة المنصة · تشريح المعادلة الكيميائيّة الموزونة</p>
        <h4 className="l6-figure__title">كيف نقرأ كل ركن ورقم ورمز في المعادلة الكيميائيّة؟</h4>
        <p className="l6-figure__lead">
          تأمّل المعادلة النموذجية الآتية؛ كل موضع حول الرمز له وظيفة علمية واحدة لا تشتبه بغيرها:
        </p>
      </header>

      <div className="l6-anatomy__showcase">
        <MathFormula
          tex="\underbrace{\mathrm{Zn}_{(s)} + 2\mathrm{HCl}_{(aq)}}_{(1)} \;\longrightarrow\; \underbrace{\mathrm{ZnCl}_{2(aq)} + \mathrm{H}_{2(g)}}_{(2)}"
          display="block"
          label="معادلة تفاعل الزنك مع حمض كلور الماء الممدد موزونة ومقسمة إلى طرف أول متفاعلات وطرف ثان نواتج"
        />
        <div className="l6-anatomy__legend-pills" dir="rtl">
          <span className="l6-pill l6-pill--reactants">الطرف الأول (1): المتفاعلات قبل السهم</span>
          <span className="l6-pill l6-pill--arrow">السهم <Sci>⟶</Sci>: دائماً من اليسار إلى اليمين</span>
          <span className="l6-pill l6-pill--products">الطرف الثاني (2): النواتج بعد السهم</span>
        </div>
      </div>

      <div className="l6-anatomy__grid" dir="rtl">
        {PARTS.map((part) => (
          <article key={part.id} className="l6-anatomy__card" data-anatomy-part={part.id}>
            <p className="l6-anatomy__badge">{part.badge}</p>
            <h5 className="l6-anatomy__card-title">{part.title}</h5>
            <p className="l6-anatomy__example">
              <ScientificNotationText>{part.example}</ScientificNotationText>
            </p>
            <p className="l6-anatomy__text">
              <ScientificNotationText>{part.meaning}</ScientificNotationText>
            </p>
            <p className="l6-anatomy__rule">
              <strong>القاعدة: </strong>
              <ScientificNotationText>{part.rule}</ScientificNotationText>
            </p>
          </article>
        ))}
      </div>
    </figure>
  )
}
