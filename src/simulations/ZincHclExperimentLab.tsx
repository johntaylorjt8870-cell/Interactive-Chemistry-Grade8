import { useId, useState } from 'react'
import { RtlRun } from '@/components/BidiText'
import { MathFormula, Sci, ScientificNotationText, WordEquation } from '@/scientific'
import type { InteractiveProps } from './registry'

type StageSpec = {
  index: 0 | 1 | 2 | 3
  title: string
  actionLabel: string
  observation: string
  interpretation: string
  whatChanges: string
  whatStaysConstant: string
}

const STAGES: readonly StageSpec[] = [
  {
    index: 0,
    title: 'التجهيز الآمن: وضع مسحوق الزّنك في أنبوب الاختبار',
    actionLabel: 'أضف قطرات حمض كلور الماء',
    observation: 'يوجد في قاع أنبوب الاختبار مسحوق رمادي صلب من الزّنك، ولا يحدث تفاعل بعد لأن الحمض لم يُضف.',
    interpretation: 'الزّنك عنصر فلزّي في الحالة الصلبة يُمثَّل بالرمز المقرون بحالته الفيزيائية: Zn(s)، ونمسك الأنبوب بالملقط الخشبي التزاماً بقواعد السلامة المخبرية.',
    whatChanges: 'لم يبدأ التفاعل الكيميائي بعد.',
    whatStaysConstant: 'ذرات الزنك الصلبة Zn(s) في قاع الأنبوب.',
  },
  {
    index: 1,
    title: 'الخطوة 2: إضافة قطرات محلول حمض كلور الماء الممدّد',
    actionLabel: 'قرّب عود الثقاب المشتعل بحذر',
    observation: 'فوران واضح وتصاعد فقاعات غازية عديمة اللون داخل المحلول وتناقص تدريجي في مسحوق الزّنك.',
    interpretation: 'تفاعل الزّنك Zn(s) مع محلول الحمض HCl(aq) فتكوّن محلول كلوريد الزّنك ZnCl₂(aq) الذائب في الماء وانطلق غاز جديد نصعد للكشف عنه.',
    whatChanges: 'انحلال جزء من الزنك وتكوّن مركّب ذائب وتصاعد فقاعات غازية.',
    whatStaysConstant: 'أنواع الذرات (Zn وH وCl) ومجموع أعدادها الكلية قبل التفاعل وبعده.',
  },
  {
    index: 2,
    title: 'الخطوة 3: تقريب عود الثقاب المشتعل من فوهة الأنبوب',
    actionLabel: 'اعرض تمثيل التفاعل بالمعادلة',
    observation: 'يشتعل الغاز المتصاعد بلهب واضح عند فوهة أنبوب الاختبار (مع فرقعة مخبرية خفيفة مميّزة).',
    interpretation: 'الاشتعال دليل عملي على أن الغاز الناتج قابل للاشتعال، وهو غاز الهدروجين الثنائي الذرة H₂(g).',
    whatChanges: 'اشتعال الغاز المتصاعد عند الفوهة كاشفاً هويته القابلة للاشتعال.',
    whatStaysConstant: 'محلول كلوريد الزنك ZnCl₂(aq) المتبقي داخل الأنبوب.',
  },
  {
    index: 3,
    title: 'الربط بالمعادلة الكيميائيّة الموزونة وحالات المواد',
    actionLabel: 'اكتملت المراحل الأربع',
    observation: 'أصبح لدينا وصف كامل لمواد البداية ومواد النهاية وحالة كلٍّ منها أثناء التجربة.',
    interpretation: 'نترجم التجربة إلى معادلة لفظية ثم رمزية مقرونة برموز الحالة الفيزيائية، ونضع المعامل 2 قبل HCl ليتساوى عدد ذرات H وCl في الطرفين.',
    whatChanges: 'انتقلنا من المشاهدة العيانية في الأنبوب إلى التمثيل الرمزي الموزون.',
    whatStaysConstant: 'ذرة Zn واحدة، وذرتا H، وذرتا Cl في كل طرف من طرفي المعادلة.',
  },
]

export default function ZincHclExperimentLab({ interactiveId, reducedMotion }: InteractiveProps) {
  const uid = useId()
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0)
  const current = STAGES[stage]!

  return (
    <section
      className={`lab l6-lab ${reducedMotion ? 'l6-lab--still' : ''}`}
      data-interactive-id={interactiveId}
      data-stage={stage}
      aria-labelledby={`${uid}-title`}
    >
      <header className="lab__header l6-lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر افتراضي تفاعلي لتجربة ص37</p>
          <h3 id={`${uid}-title`}>مختبر تفاعل الزّنك مع محلول حمض كلور الماء الممدّد</h3>
        </div>
        <RtlRun className="l6-lab__counter">{`المرحلة ${stage + 1} من 4`}</RtlRun>
      </header>

      <div className="l6-exp__layout">
        <div className="l6-exp__visual">
          <svg
            viewBox="0 0 360 250"
            className="l6-exp__svg"
            role="img"
            aria-label={`مشهد المرحلة ${stage + 1}: ${current.title}`}
          >
            <rect x="8" y="8" width="344" height="234" rx="14" className="l6-svg-panel" />
            {/* Wooden stand base */}
            <rect x="44" y="206" width="272" height="26" rx="6" fill="#7c4f2b" />

            {/* Wooden clamp holding tube */}
            <rect x="88" y="108" width="68" height="10" rx="4" fill="#b45309" />
            <rect x="148" y="104" width="12" height="18" rx="3" fill="#92400e" />

            {/* Dropper in stage 1 */}
            {stage === 1 && (
              <g>
                <rect x="174" y="18" width="12" height="26" rx="4" fill="#475569" />
                <path d="M176 44 H184 L182 64 H178 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
                <circle cx="180" cy="74" r="3.5" fill="#60a5fa" />
                <circle cx="180" cy="88" r="3.5" fill="#60a5fa" />
              </g>
            )}

            {/* Acid liquid when stage >= 1 */}
            {stage >= 1 && (
              <path
                d="M158 134 H202 V194 A22 22 0 0 1 158 194 Z"
                fill="#dbeafe"
                fillOpacity="0.92"
              />
            )}

            {/* Zinc granules at bottom */}
            <g fill="#64748b" stroke="#334155" strokeWidth="1.2">
              <circle cx="171" cy="201" r={stage >= 2 ? 4 : 6} />
              <circle cx="182" cy="203" r={stage >= 2 ? 4.5 : 6.5} />
              <circle cx="190" cy="199" r={stage >= 2 ? 3.5 : 5.5} />
              {stage === 0 && <circle cx="177" cy="193" r="5" />}
            </g>

            {/* Bubbles in stages 1, 2, 3 */}
            {stage >= 1 && (
              <g fill="#ffffff" stroke="#2563eb" strokeWidth="1.3">
                <circle cx="172" cy="180" r="3.5" />
                <circle cx="187" cy="168" r="4" />
                <circle cx="175" cy="153" r="4.2" />
                <circle cx="185" cy="140" r="3.5" />
                <circle cx="179" cy="116" r="4" />
              </g>
            )}

            {/* Test tube outline */}
            <path
              d="M152 76 H208 M156 76 V194 A24 24 0 0 0 204 194 V76"
              fill="none"
              stroke="#334155"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Match & flame in stage 2 */}
            {stage === 2 && (
              <g>
                <path
                  d="M180 34 C166 48 166 66 180 74 C194 66 194 48 180 34 Z"
                  fill="#f97316"
                />
                <path
                  d="M180 45 C172 54 172 64 180 70 C188 64 188 54 180 45 Z"
                  fill="#fde047"
                />
                <line x1="186" y1="60" x2="278" y2="28" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                <circle cx="185" cy="60" r="4" fill="#dc2626" />
              </g>
            )}

            {/* Labels */}
            {stage === 0 ? (
              <text x="268" y="198" textAnchor="middle" className="l6-svg-arabic">
                مسحوق الزنك
              </text>
            ) : (
              <text x="268" y="198" textAnchor="middle" direction="ltr" className="l6-svg-latin">
                ZnCl<tspan dy="4" fontSize="11">2</tspan><tspan dy="-4">(aq) + Zn</tspan>
              </text>
            )}
            {stage >= 1 && (
              <text x="268" y="122" textAnchor="middle" direction="ltr" className="l6-svg-latin">
                H<tspan dy="4" fontSize="11">2</tspan><tspan dy="-4">(g) ↑</tspan>
              </text>
            )}
          </svg>

          <div className="l6-exp__step-pills" role="tablist" aria-label="مراحل التجربة">
            {STAGES.map((item) => (
              <button
                key={item.index}
                type="button"
                role="tab"
                aria-selected={stage === item.index}
                className={`button ${stage === item.index ? 'button--primary' : 'button--quiet'}`}
                onClick={() => setStage(item.index)}
              >
                <RtlRun>{`${item.index + 1}`}</RtlRun>
              </button>
            ))}
          </div>
        </div>

        <div className="l6-exp__details" role="status" aria-live="polite">
          <h4 className="l6-exp__stage-title">{current.title}</h4>

          <div className="l6-exp__cards">
            <div className="l6-exp__card l6-exp__card--obs">
              <p className="l6-exp__card-label">الملاحظة الحسية (ما نراه ونسمعه)</p>
              <p><ScientificNotationText>{current.observation}</ScientificNotationText></p>
            </div>
            <div className="l6-exp__card l6-exp__card--interp">
              <p className="l6-exp__card-label">التفسير العلمي (ما يحدث كيميائياً)</p>
              <p><ScientificNotationText>{current.interpretation}</ScientificNotationText></p>
            </div>
          </div>

          <div className="l6-exp__invariants">
            <p>
              <strong>ما يتغيّر: </strong>
              <ScientificNotationText>{current.whatChanges}</ScientificNotationText>
            </p>
            <p>
              <strong>ما يبقى ثابتاً: </strong>
              <ScientificNotationText>{current.whatStaysConstant}</ScientificNotationText>
            </p>
          </div>

          {stage === 3 && (
            <div className="l6-exp__equations">
              <WordEquation
                reactants={['الزّنك (صلب)', 'حمض كلور الماء (محلول)']}
                products={['كلوريد الزّنك (محلول)', 'الهدروجين (غاز)']}
              />
              <MathFormula
                tex="\mathrm{Zn}_{(s)} + 2\mathrm{HCl}_{(aq)} \longrightarrow \mathrm{ZnCl}_{2(aq)} + \mathrm{H}_{2(g)}"
                display="block"
                label="المعادلة الموزونة لتفاعل الزنك مع محلول حمض كلور الماء"
              />
              <p className="l6-exp__eq-note">
                لاحظ الرموز أسفل اليمين: <Sci>(s)</Sci> صلب، <Sci>(aq)</Sci> محلول مائي، و<Sci>(g)</Sci> غاز.
              </p>
            </div>
          )}

          <div className="l6-lab__controls">
            <button
              type="button"
              className="button button--quiet"
              disabled={stage === 0}
              onClick={() => setStage((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2 | 3) : 0))}
            >
              الخطوة السابقة
            </button>
            <button
              type="button"
              className="button button--primary"
              disabled={stage === 3}
              onClick={() => setStage((prev) => (prev < 3 ? ((prev + 1) as 0 | 1 | 2 | 3) : 3))}
            >
              {current.actionLabel}
            </button>
            <button
              type="button"
              className="button button--quiet"
              disabled={stage === 0}
              onClick={() => setStage(0)}
            >
              إعادة ضبط التجربة
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
