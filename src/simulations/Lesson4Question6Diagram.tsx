import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

/**
 * Schematic SVG reconstruction of the two figures accompanying Question 6 on page 29.
 *
 * Right panel labeled (١): domestic gas stove burner ring with blue flame crowns.
 * Left panel labeled (٢): burner with yellow-orange flame and ceramic plate
 * showing a black soot deposit underneath.
 */
export default function Lesson4Question6Diagram({ reducedMotion }: InteractiveProps) {
  return (
    <figure
      className={reducedMotion ? 'l4-source-figure l4-source-figure--still' : 'l4-source-figure'}
      data-source-reconstruction="p29-q6"
    >
      <svg
        viewBox="0 0 560 264"
        role="img"
        aria-label="إعادة بناء تخطيطية لشكلَي السؤال السادس في الصفحة 29: يميناً الشكل (١) موقد غاز منزلي بلهب أزرق، ويساراً الشكل (٢) لهب أصفر وتحت صحن الخزف طبقة سوداء"
        className="l4-source-figure__svg"
      >
        {/* LEFT PANEL — الشكل (٢): لهب أصفر + صحن خزف بطبقة سوداء */}
        <g transform="translate(14, 12)">
          <rect x="0" y="0" width="252" height="202" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          {/* Hand + ceramic plate with black soot patch */}
          <path d="M46 66 L86 68" stroke="#f1c27d" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="132" cy="68" rx="52" ry="16" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="130" cy="72" rx="28" ry="9.5" fill="#111827" />
          {/* Yellow-orange flame */}
          <path d="M130 78 C106 106 108 134 130 144 C152 134 154 106 130 78 Z" fill="#f59e0b" />
          <path d="M130 94 C115 114 118 132 130 140 C142 132 145 114 130 94 Z" fill="#fde047" />
          {/* Burner tube & base */}
          <rect x="119" y="142" width="22" height="38" rx="3" fill="#94a3b8" />
          <rect x="100" y="178" width="60" height="10" rx="4" fill="#64748b" />
          <text x="126" y="232" textAnchor="middle" className="l4-fig__q6-label">
            (٢)
          </text>
        </g>

        {/* RIGHT PANEL — الشكل (١): موقد غاز منزلي بلهب أزرق */}
        <g transform="translate(294, 12)">
          <rect x="0" y="0" width="252" height="202" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          {/* Stove grate bars */}
          <line x1="36" y1="138" x2="216" y2="138" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <line x1="68" y1="98" x2="184" y2="174" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="184" y1="98" x2="68" y2="174" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          {/* Circular burner ring */}
          <ellipse cx="126" cy="136" rx="56" ry="22" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
          {/* Crown of blue flames around ring */}
          {[
            [74, 128],
            [86, 116],
            [104, 108],
            [126, 105],
            [148, 108],
            [166, 116],
            [178, 128],
            [88, 144],
            [108, 150],
            [126, 152],
            [144, 150],
            [164, 144],
          ].map(([fx, fy], idx) => (
            <g key={idx} transform={`translate(${fx}, ${fy})`}>
              <path d="M0 -18 C-7 -6 -5 4 0 8 C5 4 7 -6 0 -18 Z" fill="#2563eb" />
              <path d="M0 -10 C-4 -3 -3 3 0 6 C3 3 4 -3 0 -10 Z" fill="#93c5fd" />
            </g>
          ))}
          <ellipse cx="126" cy="134" rx="34" ry="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          <text x="126" y="42" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="700">
            لهب موقد منزلي أزرق منتظم
          </text>
          <text x="126" y="232" textAnchor="middle" className="l4-fig__q6-label">
            (١)
          </text>
        </g>
      </svg>
      <figcaption className="l4-source-figure__caption">
        <strong>إعادة بناء تخطيطية لشكلَي السؤال السادس (ص29).</strong> يميناً الشكل <strong>(١)</strong> بلهب أزرق لموقد
        غاز منزلي، ويساراً الشكل <strong>(٢)</strong> بلهب أصفر وتشكل طبقة سوداء على صحن الخزف. حُفظ الترقيم الهندي العربي{' '}
        <strong>(١)</strong> و<strong>(٢)</strong> تحت اللوحتين كما طُبع في الكتاب.
      </figcaption>
    </figure>
  )
}
