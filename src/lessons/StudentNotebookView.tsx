import type { ReactNode } from 'react'
import {
  ChemicalFormula,
  ElectronConfiguration,
  IonNotation,
  MathFormula,
  NuclearNotation,
  Sci,
  ScientificNotationText,
  parseCompactFormulaNotation,
} from '@/scientific'
import { parseCompactNuclearNotation } from '@/scientific/NuclearNotation'
import { parseCompactIonNotation } from '@/scientific/ScientificNotationText'
import { isElectronConfiguration } from '@/utils/scientificText'
import type {
  NotebookNote,
  NotebookSection,
  NotebookTable,
  StudentNotebook,
} from '@/data/curriculum/schema'

/**
 * «دفتر الطالب» — the material a student is expected to write in the school
 * notebook, and nothing else.
 *
 * The notebook is authored data, not a generated summary: every sentence,
 * definition, table and rule was selected from the lesson that publishes it
 * (see `chemistryLesson1Notebook.ts`). This component only presents it.
 *
 * Presentation rules that matter for writing it down by hand:
 *
 * - the page reads as one continuous notebook page — headings, complete
 *   definitions, lists, one data table — not as a grid of cards;
 * - every scientific run (`Na⁺`, `²³₁₁Na`, `2-8-8`, `y = 2(n)²`) goes through
 *   the platform's existing notation components, so nothing is reordered by
 *   the browser's bidi algorithm inside Arabic prose;
 * - content is plain selectable text: the student can copy it or rewrite it,
 *   and no information is hidden behind an interaction.
 */
export function StudentNotebookView({ notebook }: { notebook: StudentNotebook }) {
  return (
    <article className="student-notebook" aria-labelledby="student-notebook-title">
      <header className="student-notebook__header">
        <h3 className="student-notebook__title" id="student-notebook-title">
          {notebook.title}
        </h3>
        <p className="student-notebook__intro">
          <ScientificNotationText as="span">{notebook.introduction}</ScientificNotationText>
        </p>
      </header>

      <div className="student-notebook__sections">
        {notebook.sections.map((section, index) => (
          <NotebookSectionView key={section.id} section={section} index={index} />
        ))}
      </div>

    </article>
  )
}

/**
 * Revision, kept apart from the notes.
 *
 * The notebook article is what a student copies; this card is what they test
 * themselves with. It sits below the notebook, under an explicit label, so the
 * two are never confused — the review asked for exactly that separation.
 */
export function StudentNotebookRevision({ notebook }: { notebook: StudentNotebook }) {
  if (!notebook.checklist) return null

  return (
    <section className="student-notebook-revision" aria-labelledby="student-notebook-revision-title">
      <p className="student-notebook-revision__label">أسئلة مراجعة — ليست مادة تُنسخ في الدفتر</p>
      <h3 className="student-notebook-revision__title" id="student-notebook-revision-title">
        <ScientificNotationText as="span">{notebook.checklist.title}</ScientificNotationText>
      </h3>
      <ul className="student-notebook-revision__list">
        {notebook.checklist.items.map((item, index) => (
          <li key={index}>
            <ScientificNotationText as="span">{item}</ScientificNotationText>
          </li>
        ))}
      </ul>
    </section>
  )
}

function NotebookSectionView({ section, index }: { section: NotebookSection; index: number }) {
  const headingId = `student-notebook-section-${section.id}`
  const number = index + 1

  return (
    <section className="student-notebook__section" aria-labelledby={headingId} data-notebook-section={section.id}>
      <h4 className="student-notebook__section-title" id={headingId}>
        <span className="student-notebook__section-index" aria-hidden="true">
          {number}
        </span>
        <ScientificNotationText as="span">{section.title}</ScientificNotationText>
      </h4>
      {section.lead ? (
        <p className="student-notebook__lead">
          <ScientificNotationText as="span">{section.lead}</ScientificNotationText>
        </p>
      ) : null}

      {section.definitions?.length ? (
        <dl className="student-notebook__definitions">
          {section.definitions.map((definition) => (
            <div className="student-notebook__definition" key={definition.term}>
              <dt className="student-notebook__term">
                <ScientificNotationText as="span">{definition.term}</ScientificNotationText>
                <span className="student-notebook__source">
                  <Sci variant="textual">{definition.source}</Sci>
                </span>
              </dt>
              <dd className="student-notebook__meaning">
                <ScientificNotationText as="span">{definition.text}</ScientificNotationText>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.points?.length ? (
        <ul className="student-notebook__list">
          {section.points.map((point, pointIndex) => (
            <li key={pointIndex}>
              <ScientificNotationText as="span">{point}</ScientificNotationText>
            </li>
          ))}
        </ul>
      ) : null}

      {section.ordered?.length ? (
        <ol className="student-notebook__list student-notebook__list--ordered">
          {section.ordered.map((item, itemIndex) => (
            <li key={itemIndex}>
              <ScientificNotationText as="span">{item}</ScientificNotationText>
            </li>
          ))}
        </ol>
      ) : null}

      {section.notes?.length ? (
        <ul className="student-notebook__notes">
          {section.notes.map((note, noteIndex) => (
            <li key={noteIndex}>
              <NotebookNoteView note={note} />
            </li>
          ))}
        </ul>
      ) : null}

      {section.table ? <NotebookTableView table={section.table} /> : null}

      {section.procedure ? (
        <div className="student-notebook__procedure">
          <h5 className="student-notebook__procedure-title">
            <ScientificNotationText as="span">{section.procedure.title}</ScientificNotationText>
          </h5>
          <ol className="student-notebook__list student-notebook__list--ordered">
            {section.procedure.steps.map((step, stepIndex) => (
              <li key={stepIndex}>
                <ScientificNotationText as="span">{step}</ScientificNotationText>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}

/** A sentence whose core is notation rather than prose. */
function NotebookNoteView({ note }: { note: NotebookNote }) {
  if (!note.notation) {
    return <ScientificNotationText as="span">{note.text}</ScientificNotationText>
  }

  if (note.notation === 'math' && note.tex) {
    return (
      <span className="student-notebook__notation-note">
        <MathFormula tex={note.tex} display="block" className="student-notebook__formula" />
        <ScientificNotationText as="span">{note.text}</ScientificNotationText>
      </span>
    )
  }

  return <NotebookNotation value={note.text} kind={note.notation} />
}

function NotebookNotation({
  value,
  kind,
}: {
  value: string
  kind: NonNullable<NotebookNote['notation']>
}): ReactNode {
  if (kind === 'configuration' && isElectronConfiguration(value)) {
    return <ElectronConfiguration value={value} size="md" />
  }

  if (kind === 'nuclide') {
    const nuclear = parseCompactNuclearNotation(value)
    if (nuclear) {
      return (
        <NuclearNotation
          symbol={nuclear.symbol}
          massNumber={nuclear.massNumber}
          atomicNumber={nuclear.atomicNumber}
          size="md"
        />
      )
    }
  }

  if (kind === 'ion') {
    const ion = parseCompactIonNotation(value)
    if (ion) return <IonNotation formula={ion.formula} charge={ion.charge} size="md" />
  }

  if (kind === 'formula') {
    const formula = parseCompactFormulaNotation(value)
    if (formula) return <ChemicalFormula formula={formula} size="md" />
  }

  return <Sci variant="textual">{value}</Sci>
}

/**
 * The data table a student copies in full. Cells reuse the same cell-level
 * notation promotion as the lesson tables (electron configurations, nuclides,
 * formulae), so a value such as `2-8-8-2` can never be split or reordered.
 */
function NotebookTableView({ table }: { table: NotebookTable }) {
  return (
    <div className="student-notebook__table-wrap" tabIndex={0}>
      <table className="student-notebook__table">
        <caption className="student-notebook__table-caption">
          <ScientificNotationText as="span">{table.caption}</ScientificNotationText>
        </caption>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column.key} scope="col">
                <ScientificNotationText as="span">{column.header}</ScientificNotationText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.id}>
              {table.columns.map((column) =>
                column.rowHeader ? (
                  <th key={column.key} scope="row">
                    <ScientificNotationText as="span">{row.cells[column.key] ?? ''}</ScientificNotationText>
                  </th>
                ) : (
                  <td key={column.key}>{renderNotebookCell(row.cells[column.key] ?? '')}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {table.footnote ? (
        <p className="student-notebook__table-footnote">
          <ScientificNotationText as="span">{table.footnote}</ScientificNotationText>
        </p>
      ) : null}
    </div>
  )
}

function renderNotebookCell(value: string): ReactNode {
  if (!value) return null

  if (isElectronConfiguration(value)) return <ElectronConfiguration value={value} size="sm" />

  const nuclear = parseCompactNuclearNotation(value)
  if (nuclear) {
    return (
      <NuclearNotation
        symbol={nuclear.symbol}
        massNumber={nuclear.massNumber}
        atomicNumber={nuclear.atomicNumber}
        size="sm"
      />
    )
  }

  const ion = parseCompactIonNotation(value)
  if (ion) return <IonNotation formula={ion.formula} charge={ion.charge} size="sm" />

  const formula = parseCompactFormulaNotation(value)
  if (formula) return <ChemicalFormula formula={formula} size="sm" />

  if (/^[A-Za-z0-9₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹+−\-×÷=().,\s]+$/u.test(value) && /[A-Za-z0-9]/.test(value)) {
    return <Sci variant="textual">{value}</Sci>
  }

  return <ScientificNotationText scienceVariant="textual">{value}</ScientificNotationText>
}
