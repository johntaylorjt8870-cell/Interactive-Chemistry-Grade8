import { MathFormula, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

export default function Lesson6CoeffVsSubscriptDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l6-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l6-figure__header">
        <p className="l6-figure__eyebrow">مقارنة بصرية حاسمة من إضافة المنصة · القاعدة الذهبية للموازنة</p>
        <h4 className="l6-figure__title">لماذا نكتب المعامل 2 على يسار HCl ولا نكتب H₂Cl₂ أو ZnCl؟</h4>
        <p className="l6-figure__lead">
          عند موازنة معادلة الزنك وحمض كلور الماء، نحتاج ذرّتَي كلور وذرّتَي هدروجين في المتفاعلات. قارن بين الإجراء الصحيح والخطأين الممنوعين:
        </p>
      </header>

      <div className="l6-compare-cards" dir="rtl">
        <article className="l6-compare-card l6-compare-card--valid" data-case="valid-coefficient">
          <p className="l6-compare-card__status">إجراء صحيح علمياً ✔</p>
          <h5 className="l6-compare-card__title">ضرب الصيغة بمعامل أمامي على يسارها</h5>
          <MathFormula tex="2\mathrm{HCl}_{(aq)}" display="block" label="اثنان HCl في المحلول المائي" />

          <svg
            viewBox="0 0 240 88"
            className="l6-compare-card__svg"
            role="img"
            aria-label="جزيئان منفصلان من HCl، كل جزيء مكون من ذرة H متصلة بذرة Cl، فيكون المجموع ذرتي H وذرتي Cl مع بقاء المادة نفسها"
          >
            <rect x="6" y="6" width="228" height="76" rx="12" className="l6-svg-box" />
            {/* Molecule 1 */}
            <circle cx="52" cy="44" r="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
            <text x="52" y="49" textAnchor="middle" direction="ltr" className="l6-svg-atom-txt">H</text>
            <circle cx="84" cy="44" r="18" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
            <text x="84" y="49" textAnchor="middle" direction="ltr" className="l6-svg-atom-txt">Cl</text>
            {/* Molecule 2 */}
            <circle cx="152" cy="44" r="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
            <text x="152" y="49" textAnchor="middle" direction="ltr" className="l6-svg-atom-txt">H</text>
            <circle cx="184" cy="44" r="18" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
            <text x="184" y="49" textAnchor="middle" direction="ltr" className="l6-svg-atom-txt">Cl</text>
          </svg>

          <p className="l6-compare-card__body">
            <ScientificNotationText>
              المادة ما زالت حمض كلور الماء HCl نفسه، لكن أخذنا منه وحدتين اثنتين، فأصبح لدينا 2 H و2 Cl دون المساس بهوية المركّب.
            </ScientificNotationText>
          </p>
        </article>

        <article className="l6-compare-card l6-compare-card--invalid" data-case="invalid-subscript">
          <p className="l6-compare-card__status">خطأ ممنوع ✘</p>
          <h5 className="l6-compare-card__title">تغيير الأرقام السفلية داخل الصيغة</h5>
          <MathFormula tex="\mathrm{H}_{2}\mathrm{Cl}_{2} \;\; , \;\; \mathrm{ZnCl}" display="block" label="صيغتان خاطئتان H2Cl2 وZnCl" />

          <svg
            viewBox="0 0 240 88"
            className="l6-compare-card__svg"
            role="img"
            aria-label="صيغة محرّفة تخالف قواعد التكافؤ الكيميائي وتغير هوية المادة المتفاعلة أو الناتجة"
          >
            <rect x="6" y="6" width="228" height="76" rx="12" className="l6-svg-box l6-svg-box--warn" />
            <circle cx="86" cy="32" r="13" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
            <circle cx="114" cy="32" r="15" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
            <circle cx="86" cy="58" r="15" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
            <circle cx="114" cy="58" r="13" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
            <line x1="154" y1="26" x2="192" y2="64" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
            <line x1="192" y1="26" x2="154" y2="64" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <p className="l6-compare-card__body">
            <ScientificNotationText>
              كتابة H₂Cl₂ تخترع صيغة وهمية غير موجودة للحمض، وتغيير ZnCl₂ إلى ZnCl يخالف تكافؤ الزنك الثنائي (2) وتكافؤ الكلور الأحادي (1)!
            </ScientificNotationText>
          </p>
        </article>
      </div>
    </figure>
  )
}
