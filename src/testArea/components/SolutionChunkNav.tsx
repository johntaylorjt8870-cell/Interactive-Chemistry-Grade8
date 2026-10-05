import { Link } from 'react-router-dom'

import { routes } from '@/app/navigation'
import { chunksOf } from '@/testArea/utils/chunk'

/* ============================================================================
   SolutionChunkNav — moving through a long solutions set
   ----------------------------------------------------------------------------
   Twenty solutions on one page is a wall; sixty is a book. The parts come from
   the blueprint (`solutionChunkSize`), and the navigation shows three things at
   once: which part you are in, how to move to the previous and the next one,
   and how to get back to the list.
   ========================================================================= */

export type SolutionChunkNavProps = {
  testId: string
  total: number
  chunkSize: number
  /** Zero-based part index currently shown. */
  index: number
  onIndexChange: (index: number) => void
}

export function SolutionChunkNav({
  testId,
  total,
  chunkSize,
  index,
  onIndexChange,
}: SolutionChunkNavProps) {
  const chunks = chunksOf(total, chunkSize)
  const chunk = chunks[index]
  if (!chunk) return null

  const hasPrevious = index > 0
  const hasNext = index < chunks.length - 1

  return (
    <nav className="ta-chunk-nav" aria-label="أجزاء الحلول">
      <div className="ta-chunk-nav__status">
        <span className="ta-chip ta-chip--scope">{chunk.label}</span>
        <span className="ta-chunk-nav__count">
          الأسئلة {chunk.first}–{chunk.last} من {total}
        </span>
      </div>

      <div className="ta-chunk-nav__buttons">
        <button
          type="button"
          className="ta-button ta-button--ghost"
          onClick={() => onIndexChange(index - 1)}
          disabled={!hasPrevious}
        >
          الجزء السابق
        </button>
        <ol className="ta-chunk-nav__parts">
          {chunks.map((part) => (
            <li key={part.index}>
              <button
                type="button"
                className={`ta-chunk-nav__part${part.index === index ? ' is-current' : ''}`}
                aria-current={part.index === index ? 'true' : undefined}
                onClick={() => onIndexChange(part.index)}
                aria-label={`${part.label}`}
              >
                <span aria-hidden="true">
                  {part.first}–{part.last}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="ta-button ta-button--ghost"
          onClick={() => onIndexChange(index + 1)}
          disabled={!hasNext}
        >
          الجزء التالي
        </button>
      </div>

      <Link className="ta-button ta-button--quiet" to={routes.testArea}>
        العودة إلى منطقة الاختبارات
      </Link>
      <Link className="ta-visually-hidden" to={routes.testAreaTest(testId)}>
        العودة إلى الاختبار
      </Link>
    </nav>
  )
}
