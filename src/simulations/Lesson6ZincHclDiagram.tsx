import { ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

/**
 * Reconstructed schematic SVG of the printed experiment figure on page 37
 * («أجرب وأستنتج»: تفاعل مسحوق الزّنك مع محلول حمض كلور الماء الممدّد).
 *
 * Preserves all three printed callout labels from page 37:
 *   - right pointer: «زنك»
 *   - left pointer:  «حمض كلور» (as printed in the figure margin)
 *   - middle-right:  «H₂» pointing to the rising gas column
 *   - top of tube:   lit match held near the rim producing an ignition flame.
 */
export default function Lesson6ZincHclDiagram({ interactiveId, reducedMotion }: InteractiveProps) {
  return (
    <figure
      className={`l6-figure l6-source-figure ${reducedMotion ? 'l6-figure--still' : ''}`}
      data-diagram={interactiveId}
      data-interactive-id={interactiveId}
      data-source-reconstruction="p37-zinc-hcl"
    >
      <header className="l6-figure__header">
        <p className="l6-figure__eyebrow">إعادة بناء تخطيطية من المنصة لشكل الكتاب (ص37) · ليست مسحاً ضوئياً</p>
        <h4 className="l6-figure__title">تجربة تفاعل الزّنك مع محلول حمض كلور الماء الممدّد والكشف عن الغاز</h4>
      </header>

      <svg
        viewBox="0 0 620 340"
        role="img"
        aria-label="إعادة بناء تخطيطية لشكل تجربة ص37: أنبوب اختبار يحوي حبيبات زنك في القاع ومحلول حمض كلور الماء فوقها، تتصاعد منه فقاعات غاز الهيدروجين H2، وعند فوهة الأنبوب عود ثقاب مشتعل يُحدث لهب اشتعال الغاز"
        className="l6-source-figure__svg"
      >
        <defs>
          <linearGradient id="l6-acid-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="l6-bench-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5e34" />
            <stop offset="100%" stopColor="#5c3d21" />
          </linearGradient>
        </defs>

        {/* Background panel */}
        <rect x="16" y="12" width="588" height="316" rx="18" className="l6-svg-panel" />

        {/* Wooden bench */}
        <rect x="64" y="250" width="492" height="62" rx="10" fill="url(#l6-bench-fill)" />
        <line x1="64" y1="266" x2="556" y2="266" stroke="#a47548" strokeWidth="1.5" strokeOpacity="0.55" />

        {/* Test tube liquid (dilute HCl) */}
        <path
          d="M286 156 H334 V268 A24 24 0 0 1 286 268 Z"
          fill="url(#l6-acid-fill)"
        />
        <ellipse cx="310" cy="156" rx="24" ry="5" fill="#93c5fd" fillOpacity="0.65" />

        {/* Zinc granules / powder at bottom */}
        <g fill="#64748b" stroke="#334155" strokeWidth="1.4">
          <polygon points="292,272 304,264 314,273 302,282" />
          <polygon points="308,274 322,265 329,275 316,284" />
          <polygon points="297,258 309,252 318,260 306,266" />
          <circle cx="296" cy="281" r="4" />
          <circle cx="321" cy="281" r="4" />
        </g>

        {/* Rising H2 gas bubbles */}
        <g fill="#ffffff" fillOpacity="0.9" stroke="#2563eb" strokeWidth="1.4">
          <circle cx="303" cy="242" r="4" />
          <circle cx="318" cy="228" r="4.5" />
          <circle cx="305" cy="210" r="5" />
          <circle cx="317" cy="192" r="4" />
          <circle cx="308" cy="173" r="5" />
          <circle cx="314" cy="142" r="4.5" />
          <circle cx="304" cy="122" r="4" />
        </g>

        {/* Glass test tube outline */}
        <path
          d="M280 84 H340 M284 84 V268 A26 26 0 0 0 336 268 V84"
          fill="none"
          stroke="#475569"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Flame at mouth of tube + matchstick */}
        <path
          d="M310 42 C294 58 292 78 310 86 C328 78 326 58 310 42 Z"
          fill="#f97316"
          opacity="0.92"
        />
        <path
          d="M310 54 C301 64 301 76 310 82 C319 76 319 64 310 54 Z"
          fill="#fde047"
        />
        {/* Wooden matchstick / splint held from upper right */}
        <line x1="316" y1="68" x2="438" y2="26" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="315" cy="68" r="4.5" fill="#dc2626" />

        {/* Callout 1: H2 gas in upper tube */}
        <line x1="336" y1="128" x2="386" y2="128" className="l6-svg-pointer" />
        <text x="394" y="133" direction="ltr" textAnchor="start" className="l6-svg-latin">
          H<tspan dy="5" fontSize="12">2</tspan>
        </text>

        {/* Callout 2 (right): زنك */}
        <line x1="322" y1="274" x2="404" y2="274" className="l6-svg-pointer" />
        <rect x="408" y="256" width="76" height="32" rx="8" className="l6-svg-tag" />
        <text x="446" y="277" textAnchor="middle" className="l6-svg-arabic">
          زنك
        </text>

        {/* Callout 3 (left): حمض كلور (exact printed label in figure p37) */}
        <line x1="296" y1="214" x2="214" y2="274" className="l6-svg-pointer" />
        <rect x="104" y="256" width="108" height="32" rx="8" className="l6-svg-tag" />
        <text x="158" y="277" textAnchor="middle" className="l6-svg-arabic">
          حمض كلور
        </text>
      </svg>

      <figcaption className="l6-figure__caption">
        <ScientificNotationText>
          إعادة بناء تخطيطية لبيانات شكل ص37 بوسومه المطبوعة («زنك»، «حمض كلور»، وغاز H₂ المتصاعد المشتعل عند الفوهة).
        </ScientificNotationText>
      </figcaption>
    </figure>
  )
}
