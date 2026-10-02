import { useMemo, useState } from 'react'
import { DiagramDefs, MathFormula, VectorArrow, VectorSvgLabel, ScientificValue } from '@/scientific'
import type { InteractiveProps } from './registry'
import { PARALLELOGRAM_VIEWBOX, PX_PER_CM, parallelogramLayout } from './diagramLayouts'

/* ============================================================================
   مختبر متوازي الأضلاع — إضافة من المنصة حول الصفحتين 57–59
   ----------------------------------------------------------------------------
   القوّتان ← نسختان مترجمتان ← متوازي الأضلاع ← القطر ← المحصّلة، بترتيب
   بناء تربوي. مقياس الرسم حقيقي: شبكة كل خلية فيها 1 cm، وشريط مقياس
   يوضّح العلاقة «كل 1 cm يمثل X N»، وأطوال الأشعة تُقرأ من الشبكة نفسها.
   الزاوية تحمل حالات مقصودة (0°، 60°، 90°، 180°) ولكل حالة معنى فيزيائي.
   ========================================================================= */

const rad = (deg: number) => (deg * Math.PI) / 180

type AngleCase = { title: string; text: string }

function angleCase(angle: number, f1: number, f2: number): AngleCase {
  if (angle === 0) {
    return {
      title: 'الزاوية 0° — الحاملان متطابقان',
      text: `القوّتان في الجهة نفسها، فتتّحد الشدّتان جمعاً: F = ${f1} + ${f2} = ${f1 + f2} N. هذه أعظم محصّلة ممكنة للشدّتين.`,
    }
  }
  if (angle === 90) {
    return {
      title: 'الزاوية 90° — متوازي الأضلاع مستطيل',
      text: 'التعامد يجعل الشكل مستطيلاً، وقطره وتر مثلث قائم، فتُحسب الشدّة بقانون فيتاغورث: F = √(F₁² + F₂²).',
    }
  }
  if (angle === 180) {
    return {
      title: 'الزاوية 180° — الحاملان متعاكسان',
      text: `القوّتان في جهتين متعاكستين فتطرح الأصغر من الأكبر: F = |${f1} − ${f2}| = ${Math.abs(f1 - f2)} N. هذه أصغر محصّلة ممكنة.`,
    }
  }
  return {
    title: `الزاوية ${angle}° — بين الجمع والطرح`,
    text: `المحصّلة تقلّ كلما اتّسعت الزاوية: عند هذه الزاوية F = ${Math.sqrt(f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(rad(angle))).toFixed(1)} N، وهي بين الحدّين ${Math.abs(f1 - f2)} N و ${f1 + f2} N.`,
  }
}

export default function ParallelogramLab({ reducedMotion }: InteractiveProps) {
  const [f1, setF1] = useState(4)
  const [f2, setF2] = useState(3)
  const [angle, setAngle] = useState(60)
  const [stage, setStage] = useState(reducedMotion ? 2 : 0)

  const layout = useMemo(() => parallelogramLayout({ f1, f2, angle }), [f1, f2, angle])
  const { resultant, direction, perCm, O, P1, P2, M, u1, u2, labels } = layout
  const rightAngle = angle === 90
  const special = angleCase(angle, f1, f2)
  const advance = () => setStage((current) => (reducedMotion ? 2 : Math.min(current + 1, 2)))
  const cm = (newton: number) => (newton / perCm).toFixed(2)

  return (
    <section
      className={`lab parallelogram-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-f1={f1}
      data-f2={f2}
      data-angle={angle}
      data-resultant={resultant.toFixed(1)}
      data-stage={stage}
      aria-labelledby="parallelogram-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر متوازي الأضلاع</p>
          <h3 id="parallelogram-lab-title">قوّتان متلاقيتان: كيف نبني المحصّلة؟</h3>
        </div>
        <div className="lab__actions">
          <button type="button" className="button button--secondary" onClick={advance}>
            {stage === 0 ? 'أكمل متوازي الأضلاع بالنسختين المترجمتين' : stage === 1 ? 'ارسم القطر واحصل على المحصّلة' : 'البناء مكتمل'}
          </button>
          <button type="button" className="button button--quiet" onClick={() => setStage(0)}>
            أعد البناء
          </button>
        </div>
      </header>

      <div className="parallelogram-lab__controls">
        <label className="lab__range">
          <span>
            شدّة القوّة الأولى <ScientificValue value={f1} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={100} step={1} value={f1} onChange={(event) => { setF1(Number(event.target.value)); setStage(2) }} aria-label="شدّة القوّة الأولى نيوتن" />
        </label>
        <label className="lab__range">
          <span>
            شدّة القوّة الثانية <ScientificValue value={f2} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={100} step={1} value={f2} onChange={(event) => { setF2(Number(event.target.value)); setStage(2) }} aria-label="شدّة القوّة الثانية نيوتن" />
        </label>
        <label className="lab__range">
          <span>
            الزاوية بين الحاملين <ScientificValue value={angle} unit="°" size="sm" />
          </span>
          <input type="range" min={0} max={180} step={5} value={angle} onChange={(event) => { setAngle(Number(event.target.value)); setStage(2) }} aria-label="الزاوية بين حاملي القوتين بالدرجات" />
        </label>
      </div>

      <div className="parallelogram-lab__presets" role="group" aria-label="زوايا مقصودة: اختر حالة دراسية">
        {[0, 60, 90, 180].map((value) => (
          <button
            key={value}
            type="button"
            className={`button button--quiet parallelogram-lab__preset${angle === value ? ' is-active' : ''}`}
            aria-pressed={angle === value}
            onClick={() => { setAngle(value); setStage(2) }}
          >
            {value}°
          </button>
        ))}
      </div>

      <div className="parallelogram-lab__figure">
        <svg viewBox={`0 0 ${PARALLELOGRAM_VIEWBOX.width} ${PARALLELOGRAM_VIEWBOX.height}`} role="img" aria-label={`متوازي أضلاع للقوتين ${f1} و${f2} نيوتن بزاوية ${angle} درجة، والمحصلة ${resultant.toFixed(1)} نيوتن`}>
          <DiagramDefs />
          {/* centimetre grid — one cell = 1 cm at the chosen scale; a vertical line always passes through O */}
          <g className="parallelogram-lab__grid" aria-hidden="true">
            {layout.gridX.map((x) => (
              <line key={`v${x}`} x1={x} y1={30} x2={x} y2={330} />
            ))}
            {layout.gridY.map((y) => (
              <line key={`h${y}`} x1={10} y1={y} x2={510} y2={y} />
            ))}
          </g>

          {/* lines of action of the two forces */}
          <line x1={O.x - u1.x * 70} y1={O.y - u1.y * 70} x2={P1.x + u1.x * 46} y2={P1.y + u1.y * 46} className="vec-lab__carrier" />
          <line x1={O.x - u2.x * 70} y1={O.y - u2.y * 70} x2={P2.x + u2.x * 52} y2={P2.y + u2.y * 52} className="vec-lab__carrier" />

          {/* stage 0+: the two forces themselves */}
          <g data-stage-forces="true">
            <VectorArrow x1={O.x} y1={O.y} x2={P1.x} y2={P1.y} role="force1" strokeWidth={3.4} animated={!reducedMotion} label={`القوّة الأولى ${f1} نيوتن`} />
            <VectorArrow x1={O.x} y1={O.y} x2={P2.x} y2={P2.y} role="force2" strokeWidth={3.4} animated={!reducedMotion} label={`القوّة الثانية ${f2} نيوتن`} />
          </g>
          <VectorSvgLabel x={labels.f1.x} y={labels.f1.y} {...labels.f1.spec} tone="force1" anchor="middle" />
          <VectorSvgLabel x={labels.f2.x} y={labels.f2.y} {...labels.f2.spec} tone="force2" anchor="middle" />

          {/* stage 1+: translated copies + the parallelogram */}
          {stage >= 1 ? (
            <g className="vec-lab__construction" data-stage-copies="true">
              <VectorArrow x1={layout.copy1.a.x} y1={layout.copy1.a.y} x2={layout.copy1.b.x} y2={layout.copy1.b.y} role="force1" lineStyle="dashed" strokeWidth={2.4} headSize={9} label="نسخة مترجمة من القوّة الأولى" />
              <VectorArrow x1={layout.copy2.a.x} y1={layout.copy2.a.y} x2={layout.copy2.b.x} y2={layout.copy2.b.y} role="force2" lineStyle="dashed" strokeWidth={2.4} headSize={9} label="نسخة مترجمة من القوّة الثانية" />
              <VectorSvgLabel x={labels.copy1.x} y={labels.copy1.y} {...labels.copy1.spec} tone="force1" anchor="middle" />
              <VectorSvgLabel x={labels.copy2.x} y={labels.copy2.y} {...labels.copy2.spec} tone="force2" anchor="middle" />
            </g>
          ) : null}

          {/* stage 2+: the diagonal IS the resultant */}
          {stage >= 2 ? (
            <g className="vec-lab__resultant-group" data-stage-resultant="true">
              <VectorArrow x1={O.x} y1={O.y} x2={M.x} y2={M.y} role="resultant" strokeWidth={4} animated={!reducedMotion} label={`المحصّلة ${resultant.toFixed(1)} نيوتن`} />
              <VectorSvgLabel x={labels.resultant.x} y={labels.resultant.y} {...labels.resultant.spec} tone="resultant" anchor="middle" />
              <text x={labels.m.x} y={labels.m.y} textAnchor="middle" className="vec-lab__label">M</text>
            </g>
          ) : null}

          {/* angle arc (or the right-angle mark) + its label */}
          <path d={layout.arc} className="vec-lab__angle" />
          <text x={labels.angle.x} y={labels.angle.y} textAnchor="middle" className="vec-lab__label vec-lab__label--angle vec-lab__label--num">{angle}°</text>
          <circle cx={O.x} cy={O.y} r={5} className="vec-lab__point" />
          <text x={labels.o.x} y={labels.o.y} textAnchor="middle" className="vec-lab__label">O</text>
        </svg>
      </div>

      {/* the scale is drawn, not just stated */}
      <div className="parallelogram-lab__scale" data-scale={perCm}>
        <svg viewBox="0 0 220 44" role="img" aria-label={`شريط مقياس الرسم: كل سنتيمتر واحد في الرسم يمثل ${perCm} نيوتن`}>
          <rect x={10} y={12} width={PX_PER_CM} height={12} className="parallelogram-lab__scale-bar" />
          <line x1={10} y1={8} x2={10} y2={28} className="parallelogram-lab__scale-tick" />
          <line x1={10 + PX_PER_CM} y1={8} x2={10 + PX_PER_CM} y2={28} className="parallelogram-lab__scale-tick" />
          <text x={10 + PX_PER_CM / 2} y={40} textAnchor="middle" className="vec-lab__label vec-lab__label--num">1 cm</text>
          <text x={10 + PX_PER_CM + 14} y={23} textAnchor="start" className="vec-lab__label vec-lab__label--hint vec-lab__label--num">= {perCm} N</text>
        </svg>
        <p className="parallelogram-lab__scale-text">
          مقياس الرسم: <strong>كل 1 cm يمثل {perCm} N</strong> — كل خلية في الشبكة سنتيمتر واحد، فطول الشعاع على
          الشبكة هو شدّته مقسومة على {perCm}.
        </p>
      </div>

      <div className="lab__measurements">
        <div>
          <span>طول شعاع القوّة الأولى</span>
          <ScientificValue value={Number(cm(f1))} unit="cm" />
        </div>
        <div>
          <span>طول شعاع القوّة الثانية</span>
          <ScientificValue value={Number(cm(f2))} unit="cm" />
        </div>
        <div>
          <span>طول القطر OM</span>
          <ScientificValue value={Number(cm(resultant))} unit="cm" />
        </div>
        <div>
          <span>شدّة المحصّلة F</span>
          <ScientificValue value={Number(resultant.toFixed(1))} unit="N" size="lg" />
        </div>
        <div>
          <span>جهتها: الزاوية مع حامل F₂</span>
          <ScientificValue value={Number(direction.toFixed(1))} unit="°" />
        </div>
        <div>
          <span>نقطة التأثير</span>
          <strong className="lab__measurement-text">النقطة المشتركة O</strong>
        </div>
      </div>

      <div className="parallelogram-lab__angle-case" data-angle-case={angle}>
        <strong>{special.title}</strong>
        <p>{special.text}</p>
      </div>

      {rightAngle ? (
        <div className="parallelogram-lab__pythagoras" data-pythagoras="true">
          <p className="parallelogram-lab__pythagoras-step">
            <strong>المعطيات:</strong> F₁ = {f1} N ، F₂ = {f2} N ، والزاوية بين الحاملين 90°.
          </p>
          <p className="parallelogram-lab__pythagoras-step">
            <strong>القانون:</strong> في المستطيل القطر وتر مثلث قائم، فينطبق قانون فيتاغورث.
          </p>
          <MathFormula display="block" tex="F = \sqrt{F_1^2 + F_2^2}" label="قانون فيتاغورث" />
          <p className="parallelogram-lab__pythagoras-step">
            <strong>التعويض والحساب:</strong>
          </p>
          <MathFormula
            display="block"
            tex={`F = \\sqrt{(${f1})^2 + (${f2})^2} = ${Number(resultant.toFixed(1))}\\ \\text{N}`}
          />
          <p className="parallelogram-lab__pythagoras-step">
            <strong>النتيجة والوحدة:</strong> F = {resultant.toFixed(1)} N.
          </p>
          <p className="parallelogram-lab__pythagoras-step">
            <strong>التحقق من المعقولية:</strong> النتيجة {resultant.toFixed(1)} N تقع بين الحدّين {Math.abs(f1 - f2)} N
            و {f1 + f2} N، والرسم يعطي القطر نفسه ({cm(resultant)} cm × {perCm} = {resultant.toFixed(1)} N) — الحساب
            والرسم متفقان.
          </p>
        </div>
      ) : null}

      <p className="lab__conclusion" aria-live="polite">
        <strong>الاستنتاج:</strong> المحصّلة قوّة وحيدة تحل محل القوّتين معاً: حاملها قطر متوازي الأضلاع المارّ من نقطة
        تلاقيهما، وجهتها من O إلى الرأس المقابل M، وشدّتها تُمثَّل بطول القطر. جرّب الزوايا الأربع: 0° للجمع، 90°
        لفيتاغورث، 180° للطرح، ولاحظ كيف يتغيّر القطر أمامك.
      </p>
    </section>
  )
}
