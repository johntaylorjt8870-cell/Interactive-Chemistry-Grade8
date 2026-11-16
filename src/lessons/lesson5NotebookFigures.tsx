import Lesson5BalanceDiagram from '@/simulations/Lesson5BalanceDiagram'
import Lesson5ScaleDiagram from '@/simulations/Lesson5ScaleDiagram'
import Lesson5TrialsDiagram from '@/simulations/Lesson5TrialsDiagram'
import type { NotebookFigure } from '@/data/curriculum/schema'

export function Lesson5NotebookFigure({ figure }: { figure: Extract<NotebookFigure, { kind: 'lesson5-figure' }> }) {
  const key = figure.figureKey
  if (key === 'balance') {
    return (
      <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id}>
        <Lesson5BalanceDiagram reducedMotion interactiveId="source-figure-p30-balance" hidePageRef />
        <figcaption>
          {figure.caption}
          <span className="student-notebook__figure-note"> إعادة بناء تعليمية من المنصة، ليست صورة الكتاب.</span>
        </figcaption>
      </figure>
    )
  }
  if (key === 'scale') {
    return (
      <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id}>
        <Lesson5ScaleDiagram reducedMotion interactiveId="source-figure-p31-scale" hidePageRef />
        <figcaption>
          {figure.caption}
          <span className="student-notebook__figure-note"> إعادة بناء تعليمية من المنصة، ليست صورة الكتاب.</span>
        </figcaption>
      </figure>
    )
  }
  return (
    <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id}>
      <Lesson5TrialsDiagram reducedMotion interactiveId="source-figure-p32-trials" hidePageRef />
      <figcaption>
        {figure.caption}
        <span className="student-notebook__figure-note"> إعادة بناء تعليمية من المنصة، ليست صورة الكتاب.</span>
      </figcaption>
    </figure>
  )
}
