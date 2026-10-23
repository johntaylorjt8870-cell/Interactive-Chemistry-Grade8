import type { ReactNode } from 'react'
import {
  ChemicalEquation,
  ChemicalFormula,
  ElectronConfiguration,
  IonicTransferDiagram,
  IonNotation,
  LewisMolecule,
  LewisStructure,
  MathFormula,
  NuclearNotation,
  PlatformAddition,
  Sci,
  ScientificDiagram,
  ScientificNotationText,
  parseCompactFormulaNotation,
  ScientificTable,
  ScientificValue,
  TextbookSource,
  WordEquation,
} from '@/scientific'
import { InteractiveHost } from '@/components/InteractiveHost'
import { isInteractiveRegistered } from '@/simulations/registry'
import { parseCompactNuclearNotation } from '@/scientific/NuclearNotation'
import { isElectronConfiguration } from '@/utils/scientificText'
import type { ContentBlock } from '@/data/curriculum/schema'

export type ContentBlocksProps = {
  blocks: ContentBlock[]
  /** Renders a question by id (assessment layer). */
  renderQuestion?: (questionId: string, options?: { reveal?: boolean }) => ReactNode
  /** Renders a registered diagram by id. */
  renderDiagram?: (diagramId: string, description: string) => ReactNode
}

/**
 * Turns serialisable lesson content into UI.
 *
 * Lesson files stay pure data: no JSX is stored in content, so textbook
 * material can be reviewed (and diffed against the source pages) without
 * reading rendering code.
 * 
 * Groups consecutive textbook-verbatim blocks with the same source into a
 * single TextbookSource wrapper to avoid repetitive "من الكتاب المدرسي" badges.
 */
export function ContentBlocks({ blocks, renderQuestion, renderDiagram }: ContentBlocksProps) {
  const groupedBlocks = groupTextbookBlocks(blocks)
  
  return (
    <div className="content-blocks">
      {groupedBlocks.map((group, index) => {
        if (group.kind === 'textbook-group') {
          const firstBlock = group.blocks[0]
          const page = firstBlock?.source.page
          // Collect all unique item references from the group
          const items = group.blocks
            .map((b) => b.source.item)
            .filter((item): item is string => !!item)
          const item = items.length > 0 ? items.join('، ') : undefined
          return (
            <TextbookSource key={index} page={page} item={item}>
              {group.blocks.map((block, blockIndex) => (
                <p key={blockIndex} className="textbook-source__text">
                  <ScientificNotationText as="span" scienceVariant="textual">
                    {block.text}
                  </ScientificNotationText>
                </p>
              ))}
            </TextbookSource>
          )
        }
        return <Block key={index} block={group} renderQuestion={renderQuestion} renderDiagram={renderDiagram} />
      })}
    </div>
  )
}

type GroupedBlock = 
  | ContentBlock 
  | { kind: 'textbook-group'; blocks: Array<Extract<ContentBlock, { kind: 'textbook-verbatim' }>> }

/**
 * Groups consecutive textbook-verbatim blocks that share the same source page
 * into a single TextbookSource wrapper. When the page reference changes, a
 * new group starts — so blocks from different pages are never merged under
 * a single attribution footer.
 */
function groupTextbookBlocks(blocks: ContentBlock[]): GroupedBlock[] {
  const result: GroupedBlock[] = []
  let currentGroup: Array<Extract<ContentBlock, { kind: 'textbook-verbatim' }>> | null = null
  let currentPage: string | null = null

  function flushGroup() {
    if (currentGroup && currentGroup.length > 0) {
      result.push({ kind: 'textbook-group', blocks: currentGroup })
    }
    currentGroup = null
    currentPage = null
  }

  for (const block of blocks) {
    if (block.kind === 'textbook-verbatim') {
      const page = block.source.page
      if (currentGroup && page !== currentPage) {
        flushGroup()
      }
      if (!currentGroup) {
        currentGroup = []
        currentPage = page
      }
      currentGroup.push(block)
    } else {
      flushGroup()
      result.push(block)
    }
  }

  flushGroup()
  return result
}

function Block({
  block,
  renderQuestion,
  renderDiagram,
}: {
  block: ContentBlock
  renderQuestion?: (questionId: string, options?: { reveal?: boolean }) => ReactNode
  renderDiagram?: (diagramId: string, description: string) => ReactNode
}) {
  switch (block.kind) {
    case 'paragraph': {
      const content = block.attribution === 'platform' ? <PlatformAdditionBlock text={block.text} /> : <Prose text={block.text} />
      return content
    }

    case 'list':
      return block.ordered ? (
        <ol className="prose-list prose-list--ordered">
          {block.items.map((item, index) => (
            <li key={index}>
              <ScientificNotationText as="span">{item}</ScientificNotationText>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="prose-list">
          {block.items.map((item, index) => (
            <li key={index}>
              <ScientificNotationText as="span">{item}</ScientificNotationText>
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
            <ScientificNotationText as="span">{block.text}</ScientificNotationText>
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

    case 'word-equation':
      return (
        <div className="content-word-equation">
          <WordEquation {...block} />
          {block.caption ? <ScientificNotationText as="p" className="content-inline-notation__caption">{block.caption}</ScientificNotationText> : null}
        </div>
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
          caption={renderFigureCaption(block.caption)}
        />
      )

    case 'lewis-molecule':
      return (
        <LewisMolecule
          left={{ symbol: block.leftSymbol, lonePairSides: block.leftLonePairSides }}
          right={{ symbol: block.rightSymbol, lonePairSides: block.rightLonePairSides }}
          sharedPairs={block.sharedPairs}
          showModel={block.showModel}
          caption={renderFigureCaption(block.caption)}
        />
      )

    case 'transfer-diagram':
      return <IonicTransferDiagram caption={renderFigureCaption(block.caption)} />

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
      // Source photographs with no retained scan must keep a precise, visible
      // reference instead of an empty SVG or an invented replacement image.
      if (block.sourceRef && !isInteractiveRegistered(block.diagramId)) {
        return (
          <figure className="diagram diagram--reference" data-source-figure={block.diagramId}>
            <header className="diagram__header">
              <h4 className="diagram__title">{block.title ?? 'مرجع شكل الكتاب'}</h4>
              <span className="diagram__source">{block.sourceRef}</span>
            </header>
            <figcaption className="diagram__caption">
              <ScientificNotationText as="p">{block.description}</ScientificNotationText>
              {block.caption ? <ScientificNotationText as="p">{block.caption}</ScientificNotationText> : null}
              <p>مرجع وصفي إلى شكل الكتاب؛ ليس صورة الكتاب الأصلية ولا إعادة رسم لها. الرسوم التفاعلية الإضافية موسومة بإضافة من المنصة.</p>
            </figcaption>
          </figure>
        )
      }
      return renderDiagram ? (
        renderDiagram(block.diagramId, block.description)
      ) : (
        <ScientificDiagram title={block.title} description={block.description} sourceRef={block.sourceRef} caption={renderFigureCaption(block.caption)} />
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
          {block.title ? <p className="alert__title"><ScientificNotationText>{block.title}</ScientificNotationText></p> : null}
          <p className="alert__body">
            <ScientificNotationText as="span">{block.text}</ScientificNotationText>
          </p>
        </div>
      )

    case 'procedure':
      return (
        <div className="procedure">
          {block.title ? <h4 className="procedure__title"><ScientificNotationText>{block.title}</ScientificNotationText></h4> : null}
          <ol className="procedure__steps">
            {block.items.map((item, index) => (
              <li key={index}>
                <ScientificNotationText as="span">{item}</ScientificNotationText>
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
                <ScientificNotationText as="span">{term.meaning}</ScientificNotationText>
              </dd>
            </div>
          ))}
        </dl>
      )

    case 'question':
      return renderQuestion ? (
        <div className="step-question" data-question-id={block.questionId}>
          {renderQuestion(block.questionId, { reveal: block.reveal })}
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

/**
 * Figure and lab captions are Arabic prose that may embed compact notation
 * (`Na⁺`, `Cl₂`, `²³₁₁Na`); they get the same structured promotion as every
 * other prose surface.
 */
function renderFigureCaption(caption: ReactNode): ReactNode {
  return typeof caption === 'string' ? (
    <ScientificNotationText as="span">{caption}</ScientificNotationText>
  ) : (
    caption
  )
}

function renderScientificTableCell(value: string): ReactNode {
  // A distribution column such as `2-8-8` is one value: never split it into
  // runs the RTL table cell could reorder.
  if (isElectronConfiguration(value)) {
    return <ElectronConfiguration value={value} size="sm" />
  }

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

  // A compact formula such as `Cl₂` becomes a structured ChemicalFormula so
  // the subscript is real DOM, never a Unicode glyph floating in an RTL cell.
  const formula = parseCompactFormulaNotation(value)
  if (formula) {
    return <ChemicalFormula formula={formula} size="sm" />
  }

  if (/^[A-Za-z0-9₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹+−\-×÷=().,\s]+$/u.test(value) && /[A-Za-z0-9]/.test(value)) {
    return <Sci variant="textual">{value}</Sci>
  }

  return <ScientificNotationText scienceVariant="textual">{value}</ScientificNotationText>
}

function Prose({ text }: { text: string }) {
  return (
    <p className="prose">
      <ScientificNotationText as="span">{text}</ScientificNotationText>
    </p>
  )
}

function PlatformAdditionBlock({ text }: { text: string }) {
  return (
    <PlatformAddition variant="block">
      <p className="prose">
        <ScientificNotationText as="span">{text}</ScientificNotationText>
      </p>
    </PlatformAddition>
  )
}
