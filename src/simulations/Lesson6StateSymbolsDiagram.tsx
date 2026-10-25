import { MathFormula, Sci, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

type StateCard = {
  id: 's' | 'l' | 'aq' | 'g'
  symbol: string
  originWord: string
  arabicState: string
  visualHint: string
  examples: string
  distinction: string
}

const STATE_CARDS: StateCard[] = [
  {
    id: 's',
    symbol: '(s)',
    originWord: 'solid',
    arabicState: 'الحالة الصلبة',
    visualHint: 'جسيمات متراصّة في مواضع منتظمة',
    examples: 'Zn(s) · Al(s) · MgO(s) · Cu(s)',
    distinction: 'تُكتَب أيضاً للمادة التي «تترسّب» في المحلول مثل: ويترسّب الزّنك Zn(s).',
  },
  {
    id: 'l',
    symbol: '(l) / (ℓ)',
    originWord: 'liquid',
    arabicState: 'الحالة السائلة (مادة نقية)',
    visualHint: 'جسيمات متقاربة تنزلق فوق بعضها بلا مذيب آخر',
    examples: 'H₂O(l)',
    distinction: 'تخصّ السائل النقي وحده، ولا تُكتَب لمادة صلبة أو غازية ذائبة في الماء!',
  },
  {
    id: 'aq',
    symbol: '(aq)',
    originWord: 'aqueous',
    arabicState: 'المحلول المائي (مذاب في الماء)',
    visualHint: 'دقائق المذاب منتشرة بين جزيئات الماء',
    examples: 'HCl(aq) · ZnCl₂(aq) · CuSO₄(aq)',
    distinction: 'كلما وردت كلمة «محلول» في نص التفاعل فرمز الحالة الفيزيائية هو (aq) لا (l).',
  },
  {
    id: 'g',
    symbol: '(g)',
    originWord: 'gas',
    arabicState: 'الحالة الغازية',
    visualHint: 'جزيئات متباعدة حرة الحركة تملأ الحيز',
    examples: 'H₂(g) · O₂(g) · CO₂(g) · H₂O(g)',
    distinction: 'تُكتَب للغازات وللبخار الساخن أيضاً، مثل بخار الماء H₂O(g) الناتج عن احتراق الميثان.',
  },
]

export default function Lesson6StateSymbolsDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l6-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l6-figure__header">
        <p className="l6-figure__eyebrow">شكل توضيحي من إضافة المنصة · دلالات الرموز الخمسة في جدول ص37</p>
        <h4 className="l6-figure__title">رموز الحالات الفيزيائيّة الأربعة مقابل رمز التسخين</h4>
        <p className="l6-figure__lead">
          الأربعة الأولى تصف حالة المادة وتُكتب أسفل يمين صيغتها، أمّا الخامس فيصف شرط التفاعل ويُكتب فوق السهم:
        </p>
      </header>

      <div className="l6-states__grid" dir="rtl">
        {STATE_CARDS.map((card) => (
          <article key={card.id} className="l6-states__card" data-state-card={card.id}>
            <header className="l6-states__head">
              <Sci className="l6-states__symbol">{card.symbol}</Sci>
              <div>
                <h5 className="l6-states__title">{card.arabicState}</h5>
                <p className="l6-states__origin">
                  من الإنكليزية: <Sci>{card.originWord}</Sci>
                </p>
              </div>
            </header>

            <svg
              viewBox="0 0 180 76"
              className="l6-states__mini-svg"
              role="img"
              aria-label={`${card.arabicState}: ${card.visualHint}`}
            >
              <rect x="4" y="4" width="172" height="68" rx="10" className="l6-svg-box" />
              {card.id === 's' && (
                <g className="l6-svg-dots--solid">
                  {[0, 1, 2, 3].map((col) =>
                    [0, 1].map((row) => (
                      <circle key={`${col}-${row}`} cx={54 + col * 24} cy={34 + row * 22} r="9" />
                    )),
                  )}
                </g>
              )}
              {card.id === 'l' && (
                <>
                  <path d="M12 34 Q52 28 90 34 T168 34 V66 H12 Z" fill="#bae6fd" fillOpacity="0.55" />
                  <g className="l6-svg-dots--liquid">
                    <circle cx="42" cy="48" r="8" />
                    <circle cx="68" cy="54" r="8" />
                    <circle cx="94" cy="46" r="8" />
                    <circle cx="120" cy="55" r="8" />
                    <circle cx="144" cy="47" r="8" />
                  </g>
                </>
              )}
              {card.id === 'aq' && (
                <>
                  <path d="M12 28 H168 V66 H12 Z" fill="#dbeafe" fillOpacity="0.65" />
                  {/* Water background small circles + distinct solute circles */}
                  <g fill="#93c5fd">
                    <circle cx="32" cy="40" r="4.5" />
                    <circle cx="76" cy="38" r="4.5" />
                    <circle cx="114" cy="56" r="4.5" />
                    <circle cx="150" cy="40" r="4.5" />
                    <circle cx="60" cy="58" r="4.5" />
                  </g>
                  <g className="l6-svg-dots--solute">
                    <circle cx="50" cy="43" r="8" />
                    <circle cx="96" cy="45" r="8" />
                    <circle cx="134" cy="51" r="8" />
                  </g>
                </>
              )}
              {card.id === 'g' && (
                <g className="l6-svg-dots--gas">
                  <circle cx="34" cy="24" r="7" />
                  <circle cx="88" cy="54" r="7" />
                  <circle cx="142" cy="22" r="7" />
                  <circle cx="122" cy="56" r="7" />
                </g>
              )}
            </svg>

            <p className="l6-states__examples">
              <strong>أمثلة من الدرس: </strong>
              <ScientificNotationText>{card.examples}</ScientificNotationText>
            </p>
            <p className="l6-states__note">
              <ScientificNotationText>{card.distinction}</ScientificNotationText>
            </p>
          </article>
        ))}
      </div>

      <div className="l6-states__delta-banner" dir="rtl">
        <div>
          <h5 className="l6-states__delta-title">
            انتبه لموضع الرمز الخامس في الجدول: التسخين <Sci>Δ</Sci>
          </h5>
          <p className="l6-states__delta-body">
            الرمز <Sci>Δ</Sci> (حرف دلتا اليوناني) <strong>ليس حالة فيزيائية للمادة</strong>، بل هو{' '}
            <strong>شرط لحدوث التفاعل</strong>، لذلك يُكتب دائماً <strong>فوق سهم التفاعل</strong> لا أسفل يمين الصيغة:
          </p>
        </div>
        <MathFormula
          tex="2\mathrm{Mg}_{(s)} + \mathrm{O}_{2(g)} \xrightarrow{\Delta} 2\mathrm{MgO}_{(s)}"
          display="block"
          label="اثنان مغنزيوم صلب زائد غاز الأكسجين بوجود التسخين دلتا فوق السهم ينتج اثنان أكسيد المغنزيوم الصلب"
        />
      </div>
    </figure>
  )
}
