import { Component, lazy, Suspense, type ReactNode } from 'react'
import { Lesson2NotebookFigure } from './lesson2NotebookFigures'
const Lesson2NotebookTool = lazy(() => import('./lesson2NotebookWidgets'))
class NotebookToolBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p role="status">تعذّر تحميل الأداة؛ الحل والرسوم الكاملة متاحان أعلاه.</p> : this.props.children }
}
import {
  BohrAtom,
  ChemicalFormula,
  ElectronConfiguration,
  IonNotation,
  LewisMolecule,
  LewisStructure,
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
  NotebookFigure,
  NotebookNote,
  NotebookSection,
  NotebookTable,
  StudentNotebook,
} from '@/data/curriculum/schema'
import LevelsDiagram from '@/simulations/LevelsDiagram'
import {
  HydrogenNucleiFigure,
  RutherfordStaticFigure,
  ThomsonNotebookFigure,
} from '@/lessons/notebookStaticFigures'

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
          <NotebookSectionView
            key={section.id}
            section={section}
            index={index}
            hidePageTagsInBody={Boolean(notebook.hidePageTagsInBody)}
          />
        ))}
      </div>

      {notebook.sourcesAppendix ? <NotebookSourcesAppendix appendix={notebook.sourcesAppendix} /> : null}

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

function NotebookSectionView({
  section,
  index,
  hidePageTagsInBody,
}: {
  section: NotebookSection
  index: number
  hidePageTagsInBody: boolean
}) {
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
                {definition.source && !(hidePageTagsInBody && /^ص\d/.test(definition.source)) ? (
                  <span className="student-notebook__source">
                    <Sci variant="textual">{definition.source}</Sci>
                  </span>
                ) : null}
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
            <li
              key={noteIndex}
              data-note-role={note.role ?? 'textbook'}
              className={note.role === 'platform' ? 'student-notebook__note--platform' : undefined}
            >
              {note.role === 'platform' ? (
                <p className="student-notebook__platform-label">توضيح تعليمي — ليس نص الكتاب</p>
              ) : null}
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
      {section.tables?.map((table) => (
        <NotebookTableView key={table.caption} table={table} />
      ))}

      {section.figures?.length ? (
        <div className="student-notebook__figures">
          {section.figures.map((figure) => (
            <NotebookFigureView key={figure.id} figure={figure} />
          ))}
        </div>
      ) : null}

      {section.notebookTool ? <aside className="l2-notebook-tool" aria-label="تدريب تكميلي — لا يُنسخ في الدفتر">
        <NotebookToolBoundary><Suspense fallback={<p>تحميل التدريب التكميلي…</p>}><Lesson2NotebookTool tool={section.notebookTool} /></Suspense></NotebookToolBoundary>
      </aside> : null}

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
function reconstructionNote(show: boolean) {
  if (!show) return null
  return <p className="student-notebook__figure-note">إعادة بناء تعليمية من المنصة، ليست صورة الكتاب.</p>
}

function NotebookFigureView({ figure }: { figure: NotebookFigure }) {
  if (figure.kind === 'lesson2-static') return <Lesson2NotebookFigure figure={figure} />
  if (figure.kind === 'bohr') {
    const count = figure.shells.reduce((sum, value) => sum + value, 0)
    return (
      <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id} data-shells={figure.shells.join('-')}>
        <BohrAtom symbol={figure.symbol} shells={figure.shells} size={220} label={figure.symbol} />
        {figure.legend ? <p className="student-notebook__figure-legend">{figure.legend}</p> : null}
        <figcaption>
          <ScientificNotationText as="span">{figure.caption}</ScientificNotationText>
          {reconstructionNote(figure.reconstruction)}
          {count > 0 ? (
            <span className="student-notebook__figure-count" data-electron-total={count}>
              {' '}
              عدد الإلكترونات: {figure.shells.join('-')} (المجموع {count})
            </span>
          ) : null}
        </figcaption>
      </figure>
    )
  }

  if (figure.kind === 'thomson') {
    return (
      <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id}>
        <ThomsonNotebookFigure />
        <figcaption>
          <ScientificNotationText as="span">{figure.caption}</ScientificNotationText>
          {reconstructionNote(true)}
        </figcaption>
      </figure>
    )
  }

  if (figure.kind === 'rutherford-static') {
    return (
      <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id}>
        <RutherfordStaticFigure />
        <figcaption>
          <ScientificNotationText as="span">{figure.caption}</ScientificNotationText>
          {reconstructionNote(true)}
        </figcaption>
      </figure>
    )
  }

  if (figure.kind === 'levels') {
    return (
      <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id}>
        <LevelsDiagram interactiveId="source-figure-p5-levels" reducedMotion />
        <figcaption>
          <ScientificNotationText as="span">{figure.caption}</ScientificNotationText>
          {reconstructionNote(true)}
        </figcaption>
      </figure>
    )
  }

  if (figure.kind === 'hydrogen-nuclei') {
    return (
      <figure className="student-notebook__figure student-notebook__figure--wide" data-notebook-figure={figure.id}>
        <HydrogenNucleiFigure />
        <figcaption>
          <ScientificNotationText as="span">{figure.caption}</ScientificNotationText>
          {reconstructionNote(true)}
        </figcaption>
      </figure>
    )
  }

  if (figure.kind === 'interactive') {
    return null
  }

  return (
    <figure className="student-notebook__figure student-notebook__figure--lewis" data-notebook-figure={figure.id}>
      <LewisStructure
        symbol={figure.symbol}
        dots={figure.dots?.map((position) => ({ position }))}
        pairs={figure.pairs}
        size="lg"
        caption={<ScientificNotationText as="span">{figure.caption}</ScientificNotationText>}
      />
      {reconstructionNote(figure.reconstruction)}
    </figure>
  )
}

function NotebookSourcesAppendix({
  appendix,
}: {
  appendix: NonNullable<StudentNotebook['sourcesAppendix']>
}) {
  return (
    <section className="student-notebook__sources" aria-labelledby="student-notebook-sources-title">
      <h4 className="student-notebook__section-title" id="student-notebook-sources-title">
        <ScientificNotationText as="span">{appendix.caption}</ScientificNotationText>
      </h4>
      <div className="student-notebook__table-wrap" tabIndex={0}>
        <table className="student-notebook__table">
          <thead>
            <tr>
              <th scope="col">البند</th>
              <th scope="col">النوع</th>
              <th scope="col">التصنيف</th>
              <th scope="col">المصدر</th>
              <th scope="col">الصفحة</th>
            </tr>
          </thead>
          <tbody>
            {appendix.rows.map((row) => (
              <tr key={row.item}>
                <th scope="row">{row.item}</th>
                <td>{row.kind}</td>
                <td>{row.classification}</td>
                <td>{row.source}</td>
                <td>{row.page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

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
