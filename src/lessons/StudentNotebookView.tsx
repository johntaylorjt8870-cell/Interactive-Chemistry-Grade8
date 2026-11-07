import type { ReactNode } from 'react'
import {
  ChemicalFormula,
  ElectronConfiguration,
  IonNotation,
  LewisMolecule,
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
  NotebookEnrichment,
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
        {notebook.enrichmentNote ? (
          <p className="student-notebook__enrichment-note">
            <ScientificNotationText as="span">{notebook.enrichmentNote}</ScientificNotationText>
          </p>
        ) : null}
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

      {section.source ? (
        <p className="student-notebook__section-source">
          {/* Arabic prose, so it takes the same RTL-safe path as a lead. */}
          <ScientificNotationText as="span">{section.source}</ScientificNotationText>
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

      {section.lewisMolecules?.length ? (
        <div className="student-notebook__lewis-molecules">
          {section.lewisMolecules.map((molecule) => (
            <LewisMolecule
              key={molecule.id}
              left={molecule.left}
              right={molecule.right}
              sharedPairs={molecule.sharedPairs}
              size="md"
              className="student-notebook__lewis"
              caption={<ChemicalFormula formula={molecule.formula} size="sm" />}
            />
          ))}
        </div>
      ) : null}

      {section.table ? <NotebookTableView table={section.table} /> : null}

      {section.enrichment?.length ? <NotebookEnrichmentView items={section.enrichment} /> : null}

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

/**
 * Science added from outside the textbook.
 *
 * The block is deliberately labelled before its first statement: a student must
 * be able to tell, while writing, which sentences are the book's and which ones
 * the platform brought in from a named reference. Each statement therefore ends
 * with its own reference chip, and the full citation sits under it, linked when
 * a stable URL exists. Nothing here is ever mixed into `points`/`definitions`.
 */
const ARABIC = /[\u0600-\u06FF]/

/**
 * A reference line, in the order it must be read.
 *
 * Citations are bibliographic, so their Latin part is one unit: passing a whole
 * Latin sentence through the per-word notation splitter let the RTL paragraph
 * reverse the words ("You Can Prevent …" rendered backwards). A mixed citation
 * is therefore split once — Latin head isolated `dir="ltr"`, Arabic note
 * isolated `dir="rtl"` — and an all-Latin one is a single isolated run. No
 * citation is ever left to the paragraph's own bidirectional resolution.
 */
function NotebookCitation({ value }: { value: string }) {
  const arabicAt = value.search(ARABIC)
  if (arabicAt < 0) {
    return (
      <span className="student-notebook__enrichment-citation-latin" dir="ltr">
        {value}
      </span>
    )
  }

  const head = value.slice(0, arabicAt).trim()
  const tail = value.slice(arabicAt).trim()
  return (
    <>
      {head ? (
        <>
          <span className="student-notebook__enrichment-citation-latin" dir="ltr">
            {head}
          </span>{' '}
        </>
      ) : null}
      <span className="student-notebook__enrichment-citation-arabic" dir="rtl">
        {tail}
      </span>
    </>
  )
}

function NotebookEnrichmentView({ items }: { items: NotebookEnrichment[] }) {
  return (
    <div className="student-notebook__enrichment" data-notebook-enrichment="true">
      <p className="student-notebook__enrichment-label">إثراء علمي من خارج الكتاب</p>
      <ul className="student-notebook__enrichment-list">
        {items.map((item, index) => (
          <li className="student-notebook__enrichment-item" key={index}>
            <p className="student-notebook__enrichment-text">
              <ScientificNotationText as="span">{item.text}</ScientificNotationText>
              <span className="student-notebook__enrichment-chip">
                <Sci variant="textual">{item.reference}</Sci>
              </span>
            </p>
            <p className="student-notebook__enrichment-citation">
              <NotebookCitation value={item.citation} />
            </p>
            {item.url ? (
              <p className="student-notebook__enrichment-source-link">
                <a
                  className="student-notebook__enrichment-link"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Sci variant="textual">{item.url}</Sci>
                </a>
              </p>
            ) : null}
            <p className="student-notebook__enrichment-why">
              <ScientificNotationText as="span">{item.why}</ScientificNotationText>
            </p>
          </li>
        ))}
      </ul>
    </div>
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
