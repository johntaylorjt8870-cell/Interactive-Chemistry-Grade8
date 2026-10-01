import type { ReactNode } from 'react'
import {
  ChemicalEquation,
  ChemicalFormula,
  IonNotation,
  LewisStructure,
  MathFormula,
  NuclearNotation,
  PlatformAddition,
  Sci,
  ScientificDiagram,
  ScientificNotationText,
  ScientificTable,
  ScientificText,
  ScientificValue,
  TextbookSource,
} from '@/scientific'
import { InteractiveHost } from '@/components/InteractiveHost'
import { parseCompactNuclearNotation } from '@/scientific/NuclearNotation'
import type { ContentBlock } from '@/data/curriculum/schema'

export type ContentBlocksProps = {
  blocks: ContentBlock[]
  /** Renders a question by id (assessment layer). */
  renderQuestion?: (questionId: string) => ReactNode
  /** Renders a registered diagram by id. */
  renderDiagram?: (diagramId: string, description: string) => ReactNode
}

/**
 * Turns serialisable lesson content into UI.
 *
 * Lesson files stay pure data: no JSX is stored in content, so textbook
 * material can be reviewed (and diffed against the source pages) without
 * reading rendering code.
 */
export function ContentBlocks({ blocks, renderQuestion, renderDiagram }: ContentBlocksProps) {
  return (
    <div className="content-blocks">
      {blocks.map((block, index) => (
        <Block key={index} block={block} renderQuestion={renderQuestion} renderDiagram={renderDiagram} />
      ))}
    </div>
  )
}

function Block({
  block,
  renderQuestion,
  renderDiagram,
}: {
  block: ContentBlock
  renderQuestion?: (questionId: string) => ReactNode
  renderDiagram?: (diagramId: string, description: string) => ReactNode
}) {
  switch (block.kind) {
    case 'paragraph': {
      const content = block.attribution === 'platform' ? <PlatformAdditionBlock text={block.text} /> : <Prose text={block.text} />
      return content
    }

    case 'textbook-verbatim':
      return (
        <TextbookSource page={block.source.page} item={block.source.item}>
          <p className="textbook-source__text">
            <ScientificText as="span" scienceVariant="textual">
              {block.text}
            </ScientificText>
          </p>
        </TextbookSource>
      )

    case 'list':
      return block.ordered ? (
        <ol className="prose-list prose-list--ordered">
          {block.items.map((item, index) => (
            <li key={index}>
              <ScientificText as="span">{item}</ScientificText>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="prose-list">
          {block.items.map((item, index) => (
            <li key={index}>
              <ScientificText as="span">{item}</ScientificText>
            </li>
          ))}
        </ul>
      )

    case 'definition':
      return (
        <dl className="definition">
          <dt className="definition__term">
            <span>{block.term}</span>
            {block.symbol ? (
              <span className="definition__symbol" dir="ltr">
                {block.symbol}
              </span>
            ) : null}
            {block.unit ? (
              <span className="definition__unit" dir="ltr">
                {block.unit}
              </span>
            ) : null}
          </dt>
          <dd className="definition__body">
            <ScientificText as="span">{block.text}</ScientificText>
          </dd>
        </dl>
      )

    case 'formula':
      return (
        <MathFormula
          tex={block.tex}
          display={block.display ?? 'block'}
          label={block.caption}
          className="content-formula"
        />
      )

    case 'chemical-formula':
      return (
        <span className="content-inline-notation">
          <ChemicalFormula formula={block.formula} display="block" size="lg" />
          {block.caption ? <ScientificNotationText as="span" className="content-inline-notation__caption">{block.caption}</ScientificNotationText> : null}
        </span>
      )

    case 'chemical-equation':
      return (
        <span className="content-inline-notation">
          <ChemicalEquation
            reactants={block.reactants}
            products={block.products}
            arrow={block.arrow}
            condition={block.condition}
            className="chem-equation--block"
          />
          {block.caption ? <ScientificNotationText as="span" className="content-inline-notation__caption">{block.caption}</ScientificNotationText> : null}
        </span>
      )

    case 'value':
      return (
        <span className="content-value">
          <ScientificValue
            value={block.value}
            unit={block.unit}
            exponent={block.exponent}
            size="lg"
          />
          {block.label ? <span className="content-value__label">{block.label}</span> : null}
        </span>
      )

    case 'ion':
      return (
        <span className="content-inline-notation">
          <IonNotation formula={block.formula} charge={block.charge} size="lg" />
          {block.caption ? <ScientificNotationText as="span" className="content-inline-notation__caption">{block.caption}</ScientificNotationText> : null}
        </span>
      )

    case 'nuclear':
      return (
        <span className="content-inline-notation">
          <NuclearNotation
            symbol={block.symbol}
            massNumber={block.massNumber}
            atomicNumber={block.atomicNumber}
            size="lg"
          />
          {block.caption ? <ScientificNotationText as="span" className="content-inline-notation__caption">{block.caption}</ScientificNotationText> : null}
        </span>
      )

    case 'lewis':
      return (
        <LewisStructure
          symbol={block.symbol}
          pairs={block.pairs}
          dots={block.dots?.map((dot) => ({ position: dot.position, slot: dot.slot }))}
          caption={block.caption}
        />
      )

    case 'table':
      return (
        <ScientificTable
          caption={block.caption}
          columns={block.columns.map((column) => ({ ...column }))}
          rows={block.rows.map((row) => ({
            id: row.id,
            cells: Object.fromEntries(
              Object.entries(row.cells).map(([key, value]) => [key, renderScientificTableCell(value)]),
            ),
            selected: row.selected,
            active: row.active,
          }))}
          footnote={block.footnote}
        />
      )

    case 'diagram':
      return renderDiagram ? (
        renderDiagram(block.diagramId, block.description)
      ) : (
        <ScientificDiagram title={block.title} description={block.description} sourceRef={block.sourceRef} caption={block.caption} />
      )

    case 'source-image':
      return (
        <figure className="source-image">
          <img src={block.src} alt={block.alt} loading="lazy" decoding="async" />
          <figcaption className="source-image__caption">
            {block.caption ? <span>{block.caption}</span> : null}
            <span className="source-image__ref">
              {block.source.page}
              {block.source.item ? ` · ${block.source.item}` : ''}
            </span>
          </figcaption>
        </figure>
      )

    case 'callout':
      return (
        <div className={`alert alert--${block.tone === 'warning' ? 'warning' : block.tone === 'method' ? 'info' : 'neutral'}`}>
          {block.title ? <p className="alert__title">{block.title}</p> : null}
          <p className="alert__body">
            <ScientificText as="span">{block.text}</ScientificText>
          </p>
        </div>
      )

    case 'procedure':
      return (
        <div className="procedure">
          {block.title ? <h4 className="procedure__title">{block.title}</h4> : null}
          <ol className="procedure__steps">
            {block.items.map((item, index) => (
              <li key={index}>
                <ScientificText as="span">{item}</ScientificText>
              </li>
            ))}
          </ol>
        </div>
      )

    case 'key-terms':
      return (
        <dl className="key-terms">
          {block.terms.map((term, index) => (
            <div className="key-terms__item" key={index}>
              <dt className="key-terms__term">{term.term}</dt>
              <dd className="key-terms__meaning">
                <ScientificText as="span">{term.meaning}</ScientificText>
              </dd>
            </div>
          ))}
        </dl>
      )

    case 'question':
      return renderQuestion ? (
        <div className="step-question" data-question-id={block.questionId}>
          {renderQuestion(block.questionId)}
        </div>
      ) : null

    case 'interactive':
      return (
        <div className="step-interactive">
          <InteractiveHost interactiveId={block.interactiveId} caption={block.caption} />
        </div>
      )
  }
}

function renderScientificTableCell(value: string): ReactNode {
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

  if (/^[A-Za-z0-9₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹+−\-×÷=().,\s]+$/u.test(value) && /[A-Za-z0-9]/.test(value)) {
    return <Sci variant="textual">{value}</Sci>
  }

  return <ScientificText scienceVariant="textual">{value}</ScientificText>
}

function Prose({ text }: { text: string }) {
  return (
    <p className="prose">
      <ScientificText as="span">{text}</ScientificText>
    </p>
  )
}

function PlatformAdditionBlock({ text }: { text: string }) {
  return (
    <PlatformAddition variant="block">
      <p className="prose">
        <ScientificText as="span">{text}</ScientificText>
      </p>
    </PlatformAddition>
  )
}
