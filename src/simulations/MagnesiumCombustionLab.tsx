import { useId, useState } from 'react'
import { ChemicalFormula, ScientificDiagram, WordEquation } from '@/scientific'
import { MagnesiumDrawing } from './Lesson4Visuals'
import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

export default function MagnesiumCombustionLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [protectedSetup, setProtectedSetup] = useState(false)
  const [phase, setPhase] = useState<'ready' | 'burning' | 'product'>('ready')
  const description =
    phase === 'ready'
      ? 'شريط مغنزيوم ممسوك بملقط؛ أسفله جفنة خزفية تحوي قليلاً من الرمل.'
      : phase === 'burning'
        ? 'يحترق الشريط بضوء أبيض ساطع ودخان أبيض مرافق؛ لا تحدق في الضوء في التجربة المخبرية.'
        : 'تكون أكسيد المغنزيوم الأبيض الهش، وهو مادة جديدة بدل الشريط الفلزي.'

  return (
    <section
      className={`lab reaction-lab magnesium-lab ${reducedMotion ? 'reaction-lab--still' : ''}`}
      data-phase={phase}
      aria-labelledby={`${id}-title`}
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تسلسل نوعي لتجربة ص25</p>
          <h3 id={`${id}-title`}>من الشريط الفلزي إلى الأكسيد الأبيض</h3>
        </div>
        <span className="badge badge--ghost">لا قياسات مفترضة</span>
      </header>
      <ol className="reaction-lab__timeline" aria-label="مراحل التغير">
        {(['ready', 'burning', 'product'] as const).map((entry, index) => (
          <li key={entry} aria-current={phase === entry ? 'step' : undefined}>
            {['قبل: مواد متفاعلة', 'أثناء: ضوء وتفاعل', 'بعد: مادة ناتجة'][index]}
          </li>
        ))}
      </ol>
      <ScientificDiagram
        title={phase === 'ready' ? 'قبل الاحتراق' : phase === 'burning' ? 'أثناء الاحتراق' : 'بعد الاحتراق'}
        description={description}
        viewBox="0 0 560 320"
        interactive
        caption="رسم إضافي نوعي وليس صورة الكتاب؛ تقدم الأزرار مراحل الفهم ولا تمثل زمناً مقاساً للاحتراق."
      >
        <MagnesiumDrawing phase={phase} />
      </ScientificDiagram>
      <label className="reaction-lab__safety">
        <input
          type="checkbox"
          checked={protectedSetup}
          disabled={phase !== 'ready'}
          onChange={(event) => setProtectedSetup(event.target.checked)}
        />
        <span>أراجع شروط المخبر: نظارة واقية وملقط وجفنة فيها رمل وإشراف المعلم، دون تحديق في الضوء.</span>
      </label>
      <div className="lab__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={!protectedSetup || phase !== 'ready'}
          onClick={() => setPhase('burning')}
        >
          قرب الشريط افتراضياً
        </button>
        <button
          type="button"
          className="button button--secondary"
          disabled={phase !== 'burning'}
          onClick={() => setPhase('product')}
        >
          راقب الناتج بعد الاحتراق
        </button>
        <button
          type="button"
          className="button button--quiet"
          disabled={phase === 'ready' && !protectedSetup}
          onClick={() => {
            setPhase('ready')
            setProtectedSetup(false)
          }}
        >
          إعادة المحاكاة
        </button>
      </div>
      <p className="lab__conclusion" role="status">
        {description}
      </p>
      {phase === 'product' ? (
        <div className="reaction-lab__result">
          <span className="reaction-lab__result-label">الناتج: أكسيد المغنزيوم</span>
          <ChemicalFormula formula="MgO" size="lg" />
          <WordEquation
            reactants={['المغنزيوم', 'الأكسجين']}
            products={['أكسيد المغنزيوم']}
            condition="تسخين"
            reactantRoles={['(مادة متفاعلة)', '(مادة متفاعلة)']}
            productRoles={['(مادة ناتجة)']}
          />
          <p>
            المغنزيوم والأكسجين متفاعلان، والتسخين شرط فوق السهم، وأكسيد المغنزيوم ناتج أبيض هش لا يرجع إلى الشريط الفلزي
            بمجرد التبريد أو إعادة الشكل.
          </p>
        </div>
      ) : null}
    </section>
  )
}
