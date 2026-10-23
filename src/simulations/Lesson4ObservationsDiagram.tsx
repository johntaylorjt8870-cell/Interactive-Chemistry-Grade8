import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

/**
 * Schematic SVG reconstruction of the three-panel observation figure on page 24.
 *
 * Preserves the exact printed right-to-left order of the three scenes and the
 * printed red caption on the right-hand panel:
 * «إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)».
 * Original textbook photographs are not stored in the repository; no numerical
 * measurements are invented.
 */
export default function Lesson4ObservationsDiagram({ reducedMotion }: InteractiveProps) {
  return (
    <figure
      className={reducedMotion ? 'l4-source-figure l4-source-figure--still' : 'l4-source-figure'}
      data-source-reconstruction="p24-observations"
    >
      <svg
        viewBox="0 0 780 280"
        role="img"
        aria-label="إعادة بناء تخطيطية من المنصة لمشاهد الصفحة 24 من اليمين إلى اليسار: فوران بيكربونات الصوديوم بقطرات الليمون، تعكّر رائق الكلس بغاز ثنائي أكسيد الكربون، وتغيّر لون القماش بقطرات ماء جافيل"
        className="l4-source-figure__svg"
      >
        {/* Left panel (Scene 3 in RTL): Javel water drops on coloured cloth */}
        <g transform="translate(14, 14)">
          <rect x="0" y="0" width="240" height="248" rx="12" className="l4-fig__card" />
          <text x="120" y="25" textAnchor="middle" className="l4-fig__panel-title">
            ماء جافيل على قماش ملوّن
          </text>
          {/* Dark coloured cloth */}
          <path
            d="M28 132 Q74 122 122 132 T214 130 L218 206 Q164 214 118 205 T24 208 Z"
            fill="#1f2d5a"
            stroke="#131c3b"
            strokeWidth="2"
          />
          {/* Bleached pinkish patches */}
          <ellipse cx="92" cy="166" rx="22" ry="13" fill="#f3a8bc" opacity="0.92" />
          <ellipse cx="136" cy="178" rx="18" ry="11" fill="#f7c4d2" opacity="0.92" />
          <circle cx="114" cy="150" r="8" fill="#f5b5c6" opacity="0.9" />
          {/* Tilted Javel bottle */}
          <g transform="translate(152, 48) rotate(32)">
            <rect x="0" y="14" width="38" height="66" rx="8" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
            <rect x="11" y="0" width="16" height="16" rx="3" fill="#2563eb" />
            <rect x="5" y="34" width="28" height="22" rx="3" fill="#dbeafe" />
          </g>
          {/* Falling drops */}
          <circle cx="118" cy="108" r="4.5" fill="#38bdf8" />
          <circle cx="104" cy="126" r="4" fill="#38bdf8" />
          <text x="120" y="234" textAnchor="middle" className="l4-fig__panel-sub">
            تغيّر / زوال لون موضع القطرات
          </text>
        </g>

        {/* Center panel (Scene 2 in RTL): Passing CO2 gas into limewater */}
        <g transform="translate(270, 14)">
          <rect x="0" y="0" width="240" height="248" rx="12" className="l4-fig__card" />
          <text x="120" y="25" textAnchor="middle" className="l4-fig__panel-title">
            إمرار الغاز في رائق الكلس
          </text>
          {/* Left bottle with limewater turning milky */}
          <rect x="28" y="96" width="66" height="106" rx="10" fill="#f8fafc" stroke="#475569" strokeWidth="2.2" />
          <rect x="48" y="76" width="26" height="22" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          <rect x="31" y="132" width="60" height="67" rx="8" fill="#e2e8f0" />
          {/* White turbidity cloud */}
          <ellipse cx="61" cy="166" rx="22" ry="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="54" cy="150" r="4" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
          <circle cx="68" cy="144" r="3.5" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
          {/* Delivery tube & inverted funnel */}
          <path
            d="M174 108 L174 58 L61 58 L61 154"
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right source vessel heated gently */}
          <polygon points="154,108 194,108 206,154 142,154" fill="#dbeafe" stroke="#475569" strokeWidth="2" />
          <rect x="164" y="178" width="20" height="24" rx="3" fill="#64748b" />
          <path d="M174 178 C166 168 169 158 174 152 C179 158 182 168 174 178 Z" fill="#f59e0b" />
          <text x="120" y="234" textAnchor="middle" className="l4-fig__panel-sub">
            تعكّر رائق الكلس (راسب أبيض)
          </text>
        </g>

        {/* Right panel (Scene 1 in RTL): Lemon drops onto sodium bicarbonate + red printed caption */}
        <g transform="translate(526, 14)">
          <rect x="0" y="0" width="240" height="248" rx="12" className="l4-fig__card" />
          <text x="120" y="22" textAnchor="middle" className="l4-fig__red-caption">
            إضافة قطرات ليمون إلى
          </text>
          <text x="120" y="40" textAnchor="middle" className="l4-fig__red-caption">
            بيكربونات الصوديوم (الكربونة)
          </text>
          {/* Cup with overflowing white foam */}
          <path d="M78 106 L90 202 L156 202 L168 106 Z" fill="#fef9c3" stroke="#475569" strokeWidth="2.4" />
          {/* Overflowing white foam */}
          <circle cx="96" cy="102" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="122" cy="94" r="20" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="148" cy="102" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M82 110 Q74 136 82 154" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
          {/* Gas bubbles */}
          <circle cx="112" cy="148" r="5" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="134" cy="162" r="4.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="124" cy="132" r="5.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.5" />
          {/* Lemon wedge squeezing drops */}
          <path d="M168 56 A22 22 0 0 1 206 78 Z" fill="#facc15" stroke="#a16207" strokeWidth="2" />
          <circle cx="164" cy="74" r="3.5" fill="#eab308" />
          {/* Lemon slice beside cup */}
          <circle cx="52" cy="188" r="18" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="52" cy="188" r="12" fill="#fef9c3" />
          <text x="120" y="234" textAnchor="middle" className="l4-fig__panel-sub">
            فوران وانطلاق فقاعات غازية
          </text>
        </g>
      </svg>
      <figcaption className="l4-source-figure__caption">
        <strong>إعادة بناء تخطيطية لمشاهد الصفحة 24 (من اليمين إلى اليسار كما طُبعت).</strong> يظهر على اللوحة اليمنى
        التعليق المطبوع باللون الأحمر «إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)»، وفي الوسط تعكّر رائق
        الكلس، وعلى اليسار تغيّر لون القماش بماء جافيل. الصور الفوتوغرافية الأصلية غير محفوظة في المستودع.
      </figcaption>
    </figure>
  )
}
