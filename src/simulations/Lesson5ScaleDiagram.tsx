import type { InteractiveProps } from './registry'
import './lesson5-labs.css'

/**
 * Schematic SVG reconstruction of the electronic-balance figure on page 31:
 * left panel a flask of HCl with CaO pieces beside it on a balance reading
 * 125.100; right panel the reacted flask labelled CaCl2 + H2O on a balance
 * also reading 125.100. No unit is printed next to the reading, and none is
 * added here. The original textbook artwork is not stored in the repository.
 */
function Balance({ reading }: { reading: string }) {
  return (
    <>
      <rect x="-95" y="52" width="190" height="16" rx="6" className="l5-fig__scale-top" />
      <path d="M-85 68 L-68 118 h136 L85 68 z" className="l5-fig__scale-body" />
      <rect x="-44" y="84" width="88" height="24" rx="4" className="l5-fig__scale-screen" />
      <text x="0" y="102" textAnchor="middle" direction="ltr" className="l5-fig__scale-reading">{reading}</text>
    </>
  )
}

export default function Lesson5ScaleDiagram({ reducedMotion }: InteractiveProps) {
  return (
    <figure className={reducedMotion ? 'l5-source-figure l5-source-figure--still' : 'l5-source-figure'} data-source-reconstruction="p31-scale">
      <svg
        viewBox="0 0 780 300"
        role="img"
        aria-label="إعادة بناء تخطيطية من المنصة لشكل ص31: لوحتان لميزان إلكتروني، اليسرى فيها دورق حمض كلور الماء وقطع أكسيد الكالسيوم بقراءة 125.100، واليمنى دورق النواتج كلوريد الكالسيوم والماء بالقراءة نفسها 125.100 دون وحدة مطبوعة"
        className="l5-source-figure__svg"
      >
        <rect x="14" y="14" width="364" height="236" rx="14" className="l5-fig__card" />
        <rect x="402" y="14" width="364" height="236" rx="14" className="l5-fig__card" />
        <line x1="390" y1="14" x2="390" y2="250" className="l5-fig__divider" />

        {/* Left: before — HCl flask + CaO pieces */}
        <g transform="translate(168 96)">
          <path d="M-13 -52 h26 l4 34 24 52 a6 6 0 0 1 -5 8 h-60 a6 6 0 0 1 -5 -8 l24 -52 z" className="l5-fig__flask" />
          <rect x="-16" y="-59" width="32" height="8" rx="3" className="l5-fig__flask-lip" />
          <path d="M-22 4 l-9 22 a5 5 0 0 0 4 6 h58 a5 5 0 0 0 4 -6 l-9 -22 z" className="l5-fig__liquid" />
        </g>
        <path d="M252 118 q10 -14 24 -6 q14 8 8 20 h-34 q-8 -6 2 -14 z" className="l5-fig__pile-dark" />
        <path d="M238 78 l-34 -18 M292 108 l34 -8" className="l5-fig__leader" />
        <text x="236" y="62" textAnchor="middle" direction="ltr" className="l5-fig__count">HCl</text>
        <text x="332" y="98" textAnchor="middle" direction="ltr" className="l5-fig__count">CaO</text>
        <g transform="translate(196 118)"><Balance reading="125.100" /></g>
        <text x="196" y="42" textAnchor="middle" className="l5-fig__panel-title">قبل إضافة الأكسيد إلى الحمض</text>

        {/* Right: after — products flask */}
        <g transform="translate(560 96)">
          <path d="M-13 -52 h26 l4 34 24 52 a6 6 0 0 1 -5 8 h-60 a6 6 0 0 1 -5 -8 l24 -52 z" className="l5-fig__flask" />
          <rect x="-16" y="-59" width="32" height="8" rx="3" className="l5-fig__flask-lip" />
          <path d="M-22 4 l-9 22 a5 5 0 0 0 4 6 h58 a5 5 0 0 0 4 -6 l-9 -22 z" className="l5-fig__liquid" />
          <circle cx="-8" cy="18" r="3.5" className="l5-fig__bubble" />
          <circle cx="7" cy="24" r="2.8" className="l5-fig__bubble" />
          <circle cx="1" cy="10" r="2.4" className="l5-fig__bubble" />
        </g>
        <path d="M600 84 l48 -16" className="l5-fig__leader" />
        <text x="704" y="70" textAnchor="middle" direction="ltr" className="l5-fig__count">CaCl2 + H2O</text>
        <g transform="translate(584 118)"><Balance reading="125.100" /></g>
        <text x="584" y="42" textAnchor="middle" className="l5-fig__panel-title">بعد انتهاء التفاعل</text>

        <text x="390" y="282" textAnchor="middle" className="l5-fig__note">القراءتان منقولتان كما طبعتا (125.100)؛ لا تظهر وحدة قياس في الكتاب.</text>
      </svg>
      <figcaption className="l5-source-figure__caption">
        إعادة رسم تخطيطية من المنصة لشكل الميزانين ص31 — ليست صورة الكتاب الأصلية، ولا تدّعي أن نموذج المنصة قاس القيمتين.
      </figcaption>
    </figure>
  )
}
