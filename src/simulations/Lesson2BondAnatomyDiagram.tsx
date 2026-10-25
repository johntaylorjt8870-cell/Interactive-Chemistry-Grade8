import type { InteractiveProps } from './registry'

/* ============================================================================
   شكل مقارن: ما الفرق بين انتقال الإلكترون ومشاركته؟
   ----------------------------------------------------------------------------
   يخدم المفهوم الذي يخلط فيه الطلاب أكثر من غيره. يُعرض السطح الإلكتروني وحده
   (النواة + السوية الأخيرة) مع تصريح بذلك في التسمية تحت الرسم، حتى لا يُفهم
   أن السويات الداخلية غير موجودة. العلامات المرقّمة تربط الرسم بشرحه، ولا
   يعتمد الفهم على اللون: النقطة المشتركة محاطة بإطار متقطّع، والسهم مرقّم.
   ========================================================================= */

const SHELL = 40
const NUCLEUS = 14

function electronPositions(centerX: number, centerY: number, angles: number[], radius = SHELL) {
  return angles.map((angle) => {
    const radians = (angle * Math.PI) / 180
    return {
      angle,
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    }
  })
}

/** Cl: سبعة إلكترونات، والموضع المواجه للصوديوم (180°) فارغ ليستقبل الإلكترون. */
const CL_ANGLES = [0, 45, 90, 135, 225, 270, 315]

export default function Lesson2BondAnatomyDiagram({ interactiveId }: InteractiveProps) {
  const clElectrons = electronPositions(580, 118, CL_ANGLES)

  return (
    <figure className="l2-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l2-figure__header">
        <p className="l2-figure__eyebrow">شكل توضيحي من إضافة المنصة · يفسّر الفرق بين نوعي الرابطة</p>
        <h4 className="l2-figure__title">الانتقال أم المشاركة؟ أين يصبح الإلكترون بعد الرابطة؟</h4>
        <p className="l2-figure__lead">
          الرابطان تبدآن من الشيء نفسه: سطح غير مكتمل. الفرق كله في مصير الإلكترون: هل يترك
          ذرّته وينتقل، أم يبقى بين الذرّتين؟
        </p>
      </header>

      {/* Two separate figures, not one wide one: each panel keeps a real font
          size on a phone instead of being scaled down to half width. */}
      <div className="l2-anatomy__panels">
        <svg
          viewBox="0 0 340 236"
          role="img"
          aria-label="الانتقال: يترك إلكترون سطح الصوديوم ذرّته وينتقل إلى الموضع الفارغ في سطح الكلور."
          className="l2-anatomy__svg"
        >
          <defs>
            <marker id="l2-arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" className="l2-anatomy__arrow-head" />
            </marker>
          </defs>

          {/* ------------------------- اللوحة ١: الانتقال ------------------------- */}
          <g data-panel="transfer" transform="translate(-340 0)">
            <circle className="l2-anatomy__nucleus" cx={440} cy={118} r={NUCLEUS} />
            <text className="l2-anatomy__symbol" x={440} y={123} textAnchor="middle">
              Na
            </text>
            <circle className="l2-anatomy__shell" cx={440} cy={118} r={SHELL} />
            <circle className="l2-anatomy__dot l2-anatomy__dot--valence" cx={440} cy={78} r={6} data-electron="na-valence" />
            <circle className="l2-anatomy__dot l2-anatomy__dot--halo" cx={440} cy={78} r={12} />

            <circle className="l2-anatomy__nucleus" cx={580} cy={118} r={NUCLEUS} />
            <text className="l2-anatomy__symbol" x={580} y={123} textAnchor="middle">
              Cl
            </text>
            <circle className="l2-anatomy__shell" cx={580} cy={118} r={SHELL} />
            {clElectrons.map((electron) => (
              <circle
                key={electron.angle}
                className="l2-anatomy__dot"
                cx={electron.x}
                cy={electron.y}
                r={5}
                data-electron={`cl-${electron.angle}`}
              />
            ))}
            <circle className="l2-anatomy__slot" cx={540} cy={118} r={7} data-slot="cl-accepts" />

            <path className="l2-anatomy__arrow" d="M 456 70 C 492 50, 518 78, 532 106" markerEnd="url(#l2-arrow-head)" />

            <g className="l2-anatomy__badge" data-badge="1">
              <circle cx={494} cy={52} r={12} />
              <text x={494} y={57} textAnchor="middle">
                1
              </text>
            </g>

            <text className="l2-anatomy__caption" x={510} y={214} textAnchor="middle">
              Na + Cl
            </text>
          </g>

        </svg>

        <svg
          viewBox="0 0 340 236"
          role="img"
          aria-label="المشاركة: يبقى زوج الإلكترونات بين ذرّتي الهيدروجين داخل إطار واحد، فيجذب النواتين معاً."
          className="l2-anatomy__svg"
        >
          {/* ------------------------ اللوحة ٢: المشاركة ------------------------ */}
          <g data-panel="sharing">
            <circle className="l2-anatomy__nucleus" cx={120} cy={118} r={NUCLEUS} />
            <text className="l2-anatomy__symbol" x={120} y={123} textAnchor="middle">
              H
            </text>
            <circle className="l2-anatomy__shell" cx={120} cy={118} r={32} />
            <circle className="l2-anatomy__dot l2-anatomy__dot--valence" cx={152} cy={118} r={6} data-electron="h-left" />

            <circle className="l2-anatomy__nucleus" cx={220} cy={118} r={NUCLEUS} />
            <text className="l2-anatomy__symbol" x={220} y={123} textAnchor="middle">
              H
            </text>
            <circle className="l2-anatomy__shell" cx={220} cy={118} r={32} />
            <circle className="l2-anatomy__dot l2-anatomy__dot--valence" cx={188} cy={118} r={6} data-electron="h-right" />

            <ellipse className="l2-anatomy__shared" cx={170} cy={118} rx={26} ry={17} />

            <g className="l2-anatomy__badge" data-badge="2">
              <circle cx={170} cy={52} r={12} />
              <text x={170} y={57} textAnchor="middle">
                2
              </text>
            </g>

            <text className="l2-anatomy__caption" x={170} y={214} textAnchor="middle">
              H + H
            </text>
          </g>

        </svg>
      </div>

      <div className="l2-anatomy__canvas">
        <p className="l2-anatomy__scope">
          الرسم يبيّن <strong>السطح الإلكتروني فقط</strong> (النواة والسوية الأخيرة)؛ السويات
          الداخلية محذوفة لتوضيح الحركة، وليست غائبة عن الذرّة.
        </p>
      </div>

      <ol className="l2-anatomy__notes">
        <li data-note="1">
          <strong>انتقال ثم تجاذب شبكي:</strong> (أ) يترك إلكترون تكافؤ الصوديوم ذرّته نهائياً إلى السوية
          الأخيرة للكلور فيتكوّن الأيون الموجب والأيون السالب، ثم (ب) تنشأ الرابطة الأيونية بالتجاذب الكهربائي
          الساكن بين الأيونات المتعاكسة الشحنة فتتراصّ في بلورة متعادلة. <em>الدليل في الرسم:</em> الموضع الفارغ
          عند الكلور امتلأ، وسطح الصوديوم خلا فصارت سويته الثانية المكتملة هي السطح الجديد.
        </li>
        <li data-note="2">
          <strong>مشاركة:</strong> لا يترك أي إلكترون ذرّته؛ يقترب السطحان بحيث يصبح الزوج في
          منطقة تجمع النواتين، فيجذب النواتين معاً. <em>الدليل في الرسم:</em> النقطتان داخل
          إطار واحد متقطّع، أي أنهما تُحسبان للذرّتين معاً.
        </li>
      </ol>

      <figcaption className="l2-figure__caption">
        <p>
          <strong>الخلاصة التي يثبتها الرسم:</strong> في الحالتين لا تنتقل النواة ولا يتغيّر عدد
          البروتونات؛ الذي يتغيّر هو موضع الإلكترونات السطحية فقط. لذلك يبقى العنصر هو نفسه
          (الكلور يبقى كلوراً) حتى بعد أن يصبح أيوناً.
        </p>
      </figcaption>
    </figure>
  )
}
