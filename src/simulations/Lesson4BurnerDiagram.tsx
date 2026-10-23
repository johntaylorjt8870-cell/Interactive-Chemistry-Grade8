import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

/**
 * Schematic SVG reconstruction of the 2x2 Bunsen burner & ceramic plate figure on page 26.
 *
 * Right column = Condition (1): open air hole, narrow blue flame (top) and clean
 * white ceramic plate (bottom).
 * Left column = Condition (2): partially closed air hole, taller yellow-orange
 * flame (top) and ceramic plate with black soot layer (bottom).
 */
export default function Lesson4BurnerDiagram({ reducedMotion }: InteractiveProps) {
  return (
    <figure
      className={reducedMotion ? 'l4-source-figure l4-source-figure--still' : 'l4-source-figure'}
      data-source-reconstruction="p26-burner"
    >
      <svg
        viewBox="0 0 560 390"
        role="img"
        aria-label="إعادة بناء تخطيطية لشكل الصفحة 26: يميناً الحالة 1 بلهب أزرق وصحن خزف نظيف، ويساراً الحالة 2 بلهب أصفر وطبقة سوداء على صحن الخزف"
        className="l4-source-figure__svg"
      >
        {/* ================================================================
            LEFT COLUMN — الحالة (2): ثقب الهواء مغلق جزئياً
           ================================================================ */}
        {/* Top-left: yellow flame only */}
        <g transform="translate(14, 12)">
          <rect x="0" y="0" width="252" height="176" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          {/* Badge 2 */}
          <circle cx="40" cy="36" r="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="40" y="42" textAnchor="middle" fill="#92400e" fontSize="16" fontWeight="800">
            2
          </text>
          <text x="146" y="28" textAnchor="middle" fill="#fde68a" fontSize="12.5" fontWeight="700">
            الحالة (2): ثقب مغلق جزئياً
          </text>
          {/* Taller yellow-orange flame */}
          <path d="M126 42 C100 78 104 114 126 124 C148 114 152 78 126 42 Z" fill="#f59e0b" />
          <path d="M126 62 C111 86 114 112 126 120 C138 112 141 86 126 62 Z" fill="#fde047" />
          {/* Burner barrel + partially closed air hole */}
          <rect x="115" y="122" width="22" height="38" rx="3" fill="#94a3b8" />
          <rect x="122" y="146" width="4" height="7" rx="1.5" fill="#1e293b" />
          <rect x="98" y="158" width="56" height="10" rx="4" fill="#64748b" />
        </g>

        {/* Bottom-left: yellow flame + ceramic plate with black soot */}
        <g transform="translate(14, 200)">
          <rect x="0" y="0" width="252" height="176" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          {/* Badge 2 */}
          <circle cx="40" cy="36" r="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="40" y="42" textAnchor="middle" fill="#92400e" fontSize="16" fontWeight="800">
            2
          </text>
          {/* Hand holding plate from left */}
          <path d="M58 58 L92 60" stroke="#f1c27d" strokeWidth="10" strokeLinecap="round" />
          {/* White ceramic plate tilted slightly showing underside soot */}
          <ellipse cx="132" cy="60" rx="48" ry="15" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          {/* Black soot patch */}
          <ellipse cx="130" cy="63" rx="26" ry="9" fill="#111827" />
          {/* Yellow flame touching underside */}
          <path d="M130 68 C108 92 110 116 130 124 C150 116 152 92 130 68 Z" fill="#f59e0b" />
          <path d="M130 82 C117 98 119 114 130 120 C141 114 143 98 130 82 Z" fill="#fde047" />
          <rect x="119" y="122" width="22" height="34" rx="3" fill="#94a3b8" />
          <rect x="102" y="154" width="56" height="10" rx="4" fill="#64748b" />
          <text x="132" y="25" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">
            طبقة سوداء على صحن الخزف
          </text>
        </g>

        {/* ================================================================
            RIGHT COLUMN — الحالة (1): ثقب الهواء مفتوح
           ================================================================ */}
        {/* Top-right: narrow blue flame only */}
        <g transform="translate(294, 12)">
          <rect x="0" y="0" width="252" height="176" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          {/* Badge 1 */}
          <circle cx="212" cy="36" r="18" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />
          <text x="212" y="42" textAnchor="middle" fill="#1e3a8a" fontSize="16" fontWeight="800">
            1
          </text>
          <text x="108" y="28" textAnchor="middle" fill="#93c5fd" fontSize="12.5" fontWeight="700">
            الحالة (1): ثقب مفتوح
          </text>
          {/* Narrow steady blue flame */}
          <path d="M126 60 C112 86 114 114 126 124 C138 114 140 86 126 60 Z" fill="#2563eb" />
          <path d="M126 80 C118 96 120 114 126 120 C132 114 134 96 126 80 Z" fill="#93c5fd" />
          {/* Burner barrel + wide open air hole */}
          <rect x="115" y="122" width="22" height="38" rx="3" fill="#94a3b8" />
          <circle cx="126" cy="149" r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="98" y="158" width="56" height="10" rx="4" fill="#64748b" />
        </g>

        {/* Bottom-right: narrow blue flame + clean white ceramic plate */}
        <g transform="translate(294, 200)">
          <rect x="0" y="0" width="252" height="176" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          {/* Badge 1 */}
          <circle cx="212" cy="36" r="18" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />
          <text x="212" y="42" textAnchor="middle" fill="#1e3a8a" fontSize="16" fontWeight="800">
            1
          </text>
          {/* Hand holding plate */}
          <path d="M58 58 L92 60" stroke="#f1c27d" strokeWidth="10" strokeLinecap="round" />
          {/* Clean white ceramic plate */}
          <ellipse cx="132" cy="60" rx="48" ry="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          {/* Narrow blue flame underneath */}
          <path d="M130 74 C116 96 118 116 130 124 C142 116 144 96 130 74 Z" fill="#2563eb" />
          <path d="M130 90 C122 104 124 116 130 120 C136 116 138 104 130 90 Z" fill="#93c5fd" />
          <rect x="119" y="122" width="22" height="34" rx="3" fill="#94a3b8" />
          <circle cx="130" cy="146" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="102" y="154" width="56" height="10" rx="4" fill="#64748b" />
          <text x="116" y="25" textAnchor="middle" fill="#bfdbfe" fontSize="12" fontWeight="700">
            يبقى صحن الخزف نظيفاً
          </text>
        </g>
      </svg>
      <figcaption className="l4-source-figure__caption">
        <strong>إعادة بناء تخطيطية لشكل الصفحة 26.</strong> العمود الأيمن يمثّل الحالة <span dir="ltr">(1)</span> (لهب
        أزرق وصحن خزف نظيف عند توافر الهواء)، والعمود الأيسر يمثّل الحالة <span dir="ltr">(2)</span> (لهب أصفر وتشكّل
        طبقة سوداء على صحن الخزف عند الإغلاق الجزئي لثقب الهواء).
      </figcaption>
    </figure>
  )
}
