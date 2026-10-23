import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

/**
 * Schematic SVG reconstruction of the burning magnesium ribbon photograph on page 25.
 *
 * Shows metallic tongs gripping a magnesium ribbon burning with intense white
 * light and forming white brittle magnesium oxide at its tip over a sand dish,
 * with no invented numerical measurements.
 */
export default function Lesson4MagnesiumDiagram({ reducedMotion }: InteractiveProps) {
  return (
    <figure
      className={reducedMotion ? 'l4-source-figure l4-source-figure--still' : 'l4-source-figure'}
      data-source-reconstruction="p25-magnesium"
    >
      <svg
        viewBox="0 0 560 250"
        role="img"
        aria-label="إعادة بناء تخطيطية لشكل الصفحة 25: ملقط معدني يمسك شريط مغنزيوم يشتعل بضوء أبيض ساطع مع دخان أبيض وتكوّن أكسيد المغنزيوم الأبيض"
        className="l4-source-figure__svg"
      >
        <rect x="10" y="10" width="540" height="230" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />

        {/* Ceramic dish with sand underneath for safety */}
        <path d="M188 206 L208 226 L362 226 L382 206 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        <ellipse cx="285" cy="206" rx="84" ry="8" fill="#fde68a" />
        <text x="285" y="192" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="600">
          جفنة خزفية تحوي قليلاً من الرمل
        </text>

        {/* Metallic tongs from right */}
        <path
          d="M498 58 L338 96 M498 82 L338 106"
          stroke="#94a3b8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="418" cy="79" r="6" fill="#cbd5e1" />
        <text x="454" y="46" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="600">
          ملقط معدني
        </text>

        {/* Unburned grey magnesium ribbon */}
        <path d="M340 101 Q306 102 280 112" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />

        {/* Intense dazzling white light halo */}
        <circle cx="268" cy="118" r="46" fill="#ffffff" opacity="0.22" />
        <circle cx="268" cy="118" r="28" fill="#fef9c3" opacity="0.55" />
        <circle cx="268" cy="118" r="15" fill="#ffffff" />
        <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round">
          <line x1="268" y1="62" x2="268" y2="78" />
          <line x1="268" y1="158" x2="268" y2="172" />
          <line x1="212" y1="118" x2="228" y2="118" />
          <line x1="230" y1="80" x2="242" y2="92" />
          <line x1="230" y1="156" x2="242" y2="144" />
          <line x1="304" y1="80" x2="294" y2="92" />
        </g>

        {/* White brittle oxide ribbon hanging down & white smoke wisps */}
        <path
          d="M262 126 Q252 152 258 174"
          fill="none"
          stroke="#f8fafc"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M248 76 C238 60 250 46 240 30 M226 88 C216 70 228 54 218 38"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        <text x="130" y="64" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
          ضوء أبيض ساطع + دخان أبيض
        </text>
        <text x="132" y="158" textAnchor="middle" fill="#cbd5e1" fontSize="12.5" fontWeight="600">
          مسحوق أبيض هش (أكسيد المغنزيوم)
        </text>
      </svg>
      <figcaption className="l4-source-figure__caption">
        <strong>إعادة بناء تخطيطية لشكل احتراق شريط المغنزيوم (ص25).</strong> يبيّن الرسم الملقط وشريط المغنزيوم
        المشتعل بضوء أبيض ساطع والدخان الأبيض وتكوّن مادة بيضاء هشة فوق جفنة الرمل، دون قيم كتلة أو حرارة غير واردة في
        الكتاب.
      </figcaption>
    </figure>
  )
}
