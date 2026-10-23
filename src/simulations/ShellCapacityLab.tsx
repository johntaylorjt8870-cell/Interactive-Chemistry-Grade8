import { useMemo, useState } from 'react'
import { MathFormula } from '@/scientific'
import type { InteractiveProps } from './registry'
import './lesson1-labs.css'

/* ============================================================================
   Shell capacity lab (pages 5–6)
   ----------------------------------------------------------------------------
   The lab implements the printed rule y = 2(n)² exactly, for the seven
   principal levels the book names (K…Q). It then asks the student to complete
   the printed K–O table and checks each value against the computed one.

   The textbook's extra rule — the last shell holds no more than eight
   electrons — is shown separately, because it constrains *occupancy* in the
   lesson's simplified distribution, not the capacity of a non-final shell.
   ========================================================================= */

const LEVELS = [
  { letter: 'K', n: 1 },
  { letter: 'L', n: 2 },
  { letter: 'M', n: 3 },
  { letter: 'N', n: 4 },
  { letter: 'O', n: 5 },
  { letter: 'P', n: 6 },
  { letter: 'Q', n: 7 },
] as const

const capacityOf = (n: number) => 2 * n * n
const TEXTBOOK_TABLE = ['M', 'N', 'O'] as const
// The expected values are not typed in by hand: they are the same law the lab
// computes with, so the check can never drift away from the model.
const EXPECTED: Record<(typeof TEXTBOOK_TABLE)[number], number> = {
  M: capacityOf(3),
  N: capacityOf(4),
  O: capacityOf(5),
}

export default function ShellCapacityLab(_props: InteractiveProps) {
  const [levelIndex, setLevelIndex] = useState(2)
  const [answers, setAnswers] = useState<Record<string, string>>({ M: '', N: '', O: '' })
  const [checked, setChecked] = useState(false)

  const level = LEVELS[levelIndex]!
  const capacity = capacityOf(level.n)
  const table = useMemo(() => LEVELS.map((item) => ({ ...item, capacity: capacityOf(item.n) })), [])

  const results = useMemo(
    () =>
      TEXTBOOK_TABLE.map((letter) => {
        const raw = (answers[letter] ?? '').trim()
        const numeric = Number(raw)
        return {
          letter,
          raw,
          expected: EXPECTED[letter],
          correct: raw !== '' && Number.isFinite(numeric) && numeric === EXPECTED[letter],
        }
      }),
    [answers],
  )
  const allCorrect = results.every((result) => result.correct)

  return (
    <section className="lab capacity-lab" aria-labelledby="capacity-lab-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · نموذج القانون</p>
          <h3 id="capacity-lab-title">سعة السوية الرئيسية: y = 2(n)²</h3>
        </div>
        <div className="capacity-lab__reading" aria-live="polite">
          <span>
            السوية {level.letter} · n = {level.n}
          </span>
          <strong>y = {capacity}</strong>
        </div>
      </header>

      <div className="capacity-lab__controls">
        <label className="lab__range" htmlFor="capacity-level">
          رقم السوية n
          <output>{level.n}</output>
          <input
            id="capacity-level"
            type="range"
            min={1}
            max={7}
            step={1}
            value={level.n}
            onChange={(event) => setLevelIndex(Number(event.target.value) - 1)}
          />
        </label>
        <MathFormula
          tex={`y = 2(${level.n})^2 = 2 \\times ${level.n * level.n} = ${capacity}`}
          display="block"
          label={`التعويض في السوية ${level.letter}: y يساوي ${capacity}`}
        />
      </div>

      <table className="capacity-table">
        <caption>السويات الرئيسية السبع وسعتها العظمى (محسوبة من القانون)</caption>
        <thead>
          <tr>
            <th scope="col">السوية</th>
            <th scope="col">n</th>
            <th scope="col">التعويض</th>
            <th scope="col">y</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row, index) => (
            <tr key={row.letter} data-current={index === levelIndex ? 'true' : undefined}>
              <th scope="row">{row.letter}</th>
              <td dir="ltr">{row.n}</td>
              <td dir="ltr">
                2 × {row.n}²
              </td>
              <td dir="ltr">{row.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="capacity-note">
        <p>
          <strong>قاعدة مطبوعة إضافية:</strong> لا تحوي السوية الأخيرة في هذه التوزيعات أكثر من ثمانية إلكترونات،
          حتى لو كانت سعتها النظرية أكبر. لذلك يُكتب الكالسيوم 2-8-8-2 لا 2-8-10.
        </p>
      </div>

      <div className="capacity-check">
        <p className="prediction-panel__title">أكمل جدول صفحة 6: ما العدد الأعظمي للإلكترونات في M وN وO؟</p>
        <div className="capacity-check__grid">
          {TEXTBOOK_TABLE.map((letter) => {
            const result = results.find((entry) => entry.letter === letter)!
            return (
              <label key={letter} className="capacity-check__field" data-state={checked ? (result.correct ? 'correct' : 'wrong') : undefined}>
                <span>
                  {letter} · n = {LEVELS.find((item) => item.letter === letter)!.n}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={answers[letter]}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, [letter]: event.target.value }))
                    setChecked(false)
                  }}
                  aria-label={`العدد الأعظمي للإلكترونات في السوية ${letter}`}
                />
                {checked ? (
                  <span className="capacity-check__feedback" role="status">
                    {result.correct ? 'صحيح' : `راجع: ${result.expected}`}
                  </span>
                ) : null}
              </label>
            )
          })}
        </div>
        <div className="lab__actions">
          <button
            type="button"
            className="button button--primary button--small"
            onClick={() => setChecked(true)}
            disabled={results.some((result) => result.raw === '')}
          >
            تحقّق من إجاباتي
          </button>
          <button
            type="button"
            className="button button--quiet button--small"
            onClick={() => {
              setAnswers({ M: '', N: '', O: '' })
              setChecked(false)
            }}
          >
            مسح الإجابات
          </button>
        </div>
        {checked ? (
          <p className="prediction-panel__result" data-state={allCorrect ? 'correct' : 'wrong'} role="status">
            {allCorrect
              ? 'ممتاز: M = 18 وN = 32 وO = 50. لاحظ السرعة: كلما زاد n زادت السعة بمقدار يتناسب مع مربع n.'
              : 'ليست كل القيم صحيحة بعد. احسب المربع أولاً ثم اضربه في 2: M = 2 × 9، N = 2 × 16، O = 2 × 25.'}
          </p>
        ) : null}
      </div>

      <p className="lab__conclusion">
        <strong>الخلاصة:</strong> السعة العظمى تتبع y = 2(n)². والقيم المطبوعة في جدول الكتاب: K = 2، L = 8،
        M = 18، N = 32، O = 50. وهذه سعة نظرية، لا عدد الإلكترونات الفعلي في كل ذرة.
      </p>

      {/* A model limitation is content, not motion: it is shown to every
          student, including those who ask for reduced motion. */}
      <p className="lab__note">
        النموذج يطبّق القانون المطبوع حتى n = 7. أما التوزيع الفعلي للذرات في هذا الدرس فيتوقف عند قاعدة «السوية
        الأخيرة لا تزيد على ثمانية»، والأمثلة المطبوعة لا تتجاوز العدد الذري 20.
      </p>
    </section>
  )
}
