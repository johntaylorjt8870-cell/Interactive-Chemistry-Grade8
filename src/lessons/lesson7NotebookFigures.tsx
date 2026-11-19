import { ScientificNotationText } from '@/scientific'
import type { NotebookFigure } from '@/data/curriculum/schema'
import countingObjects from '@/assets/textbook/lesson7/p40-counting-objects.png'
import balanceOriginal from '@/assets/textbook/lesson7/p41-balance-original.png'
import gasesOriginal from '@/assets/textbook/lesson7/p44-gases-original.png'
import jabirOriginal from '@/assets/textbook/lesson7/p46-jabir-original.png'

type Lesson7FigureSpec = Extract<NotebookFigure, { kind: 'lesson7-figure' }>

const ORIGINAL_CROPS: Record<
  Exclude<Lesson7FigureSpec['figureKey'], 'stoichiometry-map'>,
  { src: string; alt: string; compact?: boolean }
> = {
  'counting-objects': {
    src: countingObjects,
    alt: 'أربع صور توضيحية مرتّبة من اليمين إلى اليسار مع تسمياتها: أقلام في حامل، وكيس أرز وملعقة، وكوب ماء، ومسامير معدنية.',
  },
  'balance-original': {
    src: balanceOriginal,
    alt: 'ميزان ذو كفتين: في الكفة اليسرى دورق يحوي جسيمات، وفي الكفة اليمنى عيار كتلي، مع التسمية السوداء الواضحة الكتلة الموليّة (6.022 × 10²³) وتسمية بيضاء متداخلة باهتة غير معتمدة.',
    compact: true,
  },
  'gases-original': {
    src: gasesOriginal,
    alt: 'ثلاث أسطوانات غاز مزوّدة بمقياس حرارة عند 273 K وتحت ضغط P = 1 atm لمول واحد بحجم 22.4 L لكل غاز: الهليوم أصفر يساراً (4.0 g)، والأكسجين أخضر وسطاً (32.0 g)، والنتروجين أحمر يميناً (28.0 g).',
  },
  'jabir-original': {
    src: jabirOriginal,
    alt: 'رسم جابر بن حيان بن عبدالله الأزدي الكوفي بعمامة بيضاء وثوب أصفر جالساً أمام كتب مفتوحة.',
    compact: true,
  },
}

/** Static, printable quantitative conversion map for Lesson 7 chemical calculations. */
function Lesson7StoichiometryMapSvg() {
  return (
    <svg
      viewBox="0 0 820 356"
      role="img"
      aria-label="مخطط تخطيطي ثابت لعلاقات الحساب الكيميائي: التحويل بين الكتلة m بالغرام وكمية المادة n بالمول عبر الكتلة المولية M، وبين كمية المادة وعدد الجسيمات N عبر عدد أفوغادرو 6.022 × 10²³، وبين كمية المادة وحجم الغاز V باللتر عبر 22.4 L في الشرطين النظاميين 0°C (273 K) و1 atm، والانتقال بين مادتين عبر المعادلة الموزونة."
      className="l7-notebook-map__svg"
    >
      <defs>
        <marker
          id="l7-nb-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Outer frame */}
      <rect x="8" y="8" width="804" height="340" rx="14" className="l7-nb-panel" />

      {/* Top node: Particle count N */}
      <rect x="255" y="22" width="310" height="66" rx="10" className="l7-nb-box" />
      <text x="410" y="47" textAnchor="middle" className="l7-nb-title">
        عدد الجسيمات (N)
      </text>
      <text x="410" y="70" textAnchor="middle" className="l7-nb-sub">
        ذرّة – جزيء – أيون – إلكترون
      </text>

      {/* Vertical arrows between n and N */}
      <line x1="392" y1="146" x2="392" y2="92" className="l7-nb-arrow" markerEnd="url(#l7-nb-arrow)" />
      <line x1="428" y1="92" x2="428" y2="146" className="l7-nb-arrow" markerEnd="url(#l7-nb-arrow)" />
      <text x="380" y="123" textAnchor="end" direction="ltr" unicodeBidi="isolate" className="l7-nb-formula">
        × (6.022 × 10²³)
      </text>
      <text x="440" y="123" textAnchor="start" direction="ltr" unicodeBidi="isolate" className="l7-nb-formula">
        ÷ (6.022 × 10²³)
      </text>

      {/* Center hub: Amount of substance n */}
      <rect x="305" y="150" width="210" height="82" rx="12" className="l7-nb-hub" />
      <text x="410" y="180" textAnchor="middle" className="l7-nb-hub-title">
        كميّة المادّة
      </text>
      <text x="410" y="204" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-hub-math">
        n (mol)
      </text>
      <text x="410" y="222" textAnchor="middle" className="l7-nb-sub">
        محور التحويل الحسابي
      </text>

      {/* Right node: Mass m */}
      <rect x="612" y="150" width="182" height="82" rx="10" className="l7-nb-box" />
      <text x="703" y="178" textAnchor="middle" className="l7-nb-title">
        كتلة المادّة
      </text>
      <text x="703" y="201" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-math">
        m (g)
      </text>
      <text x="703" y="221" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-sub-ltr">
        M (g.mol⁻¹)
      </text>

      {/* Horizontal arrows between m (right) and n (center) */}
      <line x1="608" y1="176" x2="520" y2="176" className="l7-nb-arrow" markerEnd="url(#l7-nb-arrow)" />
      <text x="564" y="167" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-formula">
        n = m / M
      </text>
      <line x1="520" y1="206" x2="608" y2="206" className="l7-nb-arrow" markerEnd="url(#l7-nb-arrow)" />
      <text x="564" y="226" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-formula">
        m = n × M
      </text>

      {/* Left node: Gas volume V at STP */}
      <rect x="26" y="142" width="186" height="98" rx="10" className="l7-nb-box" />
      <text x="119" y="168" textAnchor="middle" className="l7-nb-title">
        حجم الغاز (للغازات فقط)
      </text>
      <text x="119" y="191" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-math">
        V (L)
      </text>
      <text x="119" y="211" textAnchor="middle" className="l7-nb-sub">
        في الشّرطين النّظاميين:
      </text>
      <text x="119" y="229" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-sub-ltr">
        t = 0°C (273 K) , P = 1 atm
      </text>

      {/* Horizontal arrows between n (center) and V (left) */}
      <line x1="300" y1="176" x2="217" y2="176" className="l7-nb-arrow" markerEnd="url(#l7-nb-arrow)" />
      <text x="258" y="167" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-formula">
        V = n × 22.4
      </text>
      <line x1="217" y1="206" x2="300" y2="206" className="l7-nb-arrow" markerEnd="url(#l7-nb-arrow)" />
      <text x="258" y="226" textAnchor="middle" direction="ltr" unicodeBidi="isolate" className="l7-nb-formula">
        n = V / 22.4
      </text>

      {/* Connector down to balanced equation bridge */}
      <line x1="410" y1="234" x2="410" y2="262" className="l7-nb-arrow" markerEnd="url(#l7-nb-arrow)" />

      {/* Bottom bridge: Stoichiometry under balanced equation */}
      <rect x="44" y="266" width="732" height="68" rx="10" className="l7-nb-bridge" />
      <text x="410" y="291" textAnchor="middle" className="l7-nb-title">
        مسائل المعادلة الكيميائيّة الموزونة (تطبيق قانون بروست أو نسبة المولات)
      </text>
      <text x="410" y="317" textAnchor="middle" className="l7-nb-sub">
        السّطر الأوّل تحت الصيغ: المقادير الموليّة مضروبة بالمعاملات (g أو mol أو 22.4 L) — السّطر الثاني: المعطى والمجهول بالوحدة نفسها ثم التناسب
      </text>
    </svg>
  )
}

export function Lesson7NotebookFigure({ figure }: { figure: Lesson7FigureSpec }) {
  if (figure.figureKey === 'stoichiometry-map') {
    return (
      <figure
        className="student-notebook__figure student-notebook__figure--wide l7-notebook-figure l7-notebook-figure--map"
        data-notebook-figure={figure.id}
        data-l7-figure={figure.figureKey}
      >
        <Lesson7StoichiometryMapSvg />
        <figcaption>
          <ScientificNotationText as="span">{figure.caption}</ScientificNotationText>
        </figcaption>
      </figure>
    )
  }

  const asset = ORIGINAL_CROPS[figure.figureKey]
  return (
    <figure
      className={`student-notebook__figure l7-notebook-figure${asset.compact ? ' l7-notebook-figure--compact' : ' student-notebook__figure--wide'}`}
      data-notebook-figure={figure.id}
      data-l7-figure={figure.figureKey}
    >
      <img className="l7-notebook-figure__img" src={asset.src} alt={asset.alt} />
      <figcaption>
        <ScientificNotationText as="span">{figure.caption}</ScientificNotationText>
      </figcaption>
    </figure>
  )
}
