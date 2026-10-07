/* ============================================================================
   TestProgress — how much of the attempt is done
   ----------------------------------------------------------------------------
   Reports answered questions only. There is no score, no percentage and no
   correctness signal here, because none of those exist before submit.
   ========================================================================= */

import { RtlRun } from '@/components/BidiText'

export type TestProgressProps = {
  answered: number
  total: number
  ratio: number
  label?: string
}

export function TestProgress({ answered, total, ratio, label = 'تقدّم الاختبار' }: TestProgressProps) {
  const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100)

  return (
    <div className="ta-progress">
      <div className="ta-progress__meta">
        <span className="ta-progress__label">{label}</span>
        <RtlRun className="ta-progress__count">
          أجبت عن {answered} من {total}
        </RtlRun>
      </div>
      <div
        className="ta-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        aria-valuetext={`أجبت عن ${answered} من ${total}`}
        aria-label={label}
      >
        <span className="ta-progress__fill" style={{ inlineSize: `${percent}%` }} />
      </div>
    </div>
  )
}
