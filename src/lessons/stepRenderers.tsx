import type { ComponentType, ReactNode } from 'react'
import { ContentBlocks } from './ContentBlocks'
import { STEP_KIND_META, type StepKindMeta } from './stepKinds'
import { STEP_KINDS, type LessonStep, type StepKind } from '@/data/curriculum/schema'
import { PlatformAddition, TextbookSource } from '@/scientific'

export type StepRendererProps = {
  step: LessonStep
  meta: StepKindMeta
  renderQuestion?: (questionId: string) => ReactNode
  renderDiagram?: (diagramId: string, description: string) => ReactNode
  /** Rendered for `final-test` steps once a test definition exists. */
  renderTest?: (testId: string) => ReactNode
}

/* ---------------------------------------------------------------------------
   Frame
   ------------------------------------------------------------------------ */

function StepFrame({ step, meta, children }: StepRendererProps & { children: ReactNode }) {
  return (
    <article className="step" data-step={step.id} data-step-kind={step.kind} data-tone={meta.tone}>
      <header className="step__header">
        <span className="step__kind" data-tone={meta.tone}>
          <meta.icon size={17} />
          <span>{meta.label}</span>
        </span>
        <h2 className="step__title" id={`step-title-${step.id}`}>
          {step.title}
        </h2>
        {step.summary ? <p className="step__summary">{step.summary}</p> : null}
      </header>
      <div className="step__body">{children}</div>
    </article>
  )
}

/** Blocks plus the attribution banner that marks where material came from. */
function StandardStep(props: StepRendererProps) {
  const { step, renderQuestion, renderDiagram } = props
  return (
    <StepFrame {...props}>
      {step.attribution === 'platform' ? (
        <PlatformAddition variant="badge" className="step__attribution" />
      ) : null}
      <ContentBlocks blocks={step.blocks} renderQuestion={renderQuestion} renderDiagram={renderDiagram} />
    </StepFrame>
  )
}

/* ---------------------------------------------------------------------------
   Specialised renderers
   ------------------------------------------------------------------------ */

/**
 * A source step reproduces the textbook page content verbatim. Nothing in this
 * renderer may reformat, summarise or reorder the quoted material.
 */
function SourceStep(props: StepRendererProps) {
  const { step, renderQuestion, renderDiagram } = props
  return (
    <StepFrame {...props}>
      <TextbookSource
        page={step.source?.pages.map((page) => page.page).join('، ')}
        item={step.source?.pages.map((page) => page.item).filter(Boolean).join('، ') || undefined}
      >
        <ContentBlocks blocks={step.blocks} renderQuestion={renderQuestion} renderDiagram={renderDiagram} />
      </TextbookSource>
    </StepFrame>
  )
}

function NoteStep(props: StepRendererProps) {
  const { step, renderQuestion, renderDiagram } = props
  return (
    <StepFrame {...props}>
      <div className="alert alert--info">
        <p className="alert__title">{step.title}</p>
        <div className="alert__body">
          <ContentBlocks blocks={step.blocks} renderQuestion={renderQuestion} renderDiagram={renderDiagram} />
        </div>
      </div>
    </StepFrame>
  )
}

function CommonErrorStep(props: StepRendererProps) {
  const { step, renderQuestion, renderDiagram } = props
  return (
    <StepFrame {...props}>
      <div className="alert alert--warning">
        <p className="alert__title">خطأ شائع</p>
        <div className="alert__body">
          <ContentBlocks blocks={step.blocks} renderQuestion={renderQuestion} renderDiagram={renderDiagram} />
        </div>
      </div>
    </StepFrame>
  )
}

function SummaryStep(props: StepRendererProps) {
  const { step, renderQuestion, renderDiagram } = props
  return (
    <StepFrame {...props}>
      <div className="summary-panel">
        <ContentBlocks blocks={step.blocks} renderQuestion={renderQuestion} renderDiagram={renderDiagram} />
      </div>
    </StepFrame>
  )
}

function FinalTestStep(props: StepRendererProps) {
  const { step, renderTest } = props
  return (
    <StepFrame {...props}>
      {renderTest && step.testId ? (
        renderTest(step.testId)
      ) : (
        <div className="empty-state empty-state--inline">
          <p className="empty-state__title">لم يُضَف الاختبار النهائي بعد</p>
          <p className="empty-state__body">
            يُعدّ الاختبار النهائي الشامل بعد اعتماد محتوى الدرس من الكتاب المدرسي.
          </p>
        </div>
      )}
    </StepFrame>
  )
}

/* ---------------------------------------------------------------------------
   Registry — the extension point for new step kinds
   ------------------------------------------------------------------------ */

export const STEP_RENDERERS: Record<StepKind, ComponentType<StepRendererProps>> = {
  source: SourceStep,
  explanation: StandardStep,
  example: StandardStep,
  experiment: StandardStep,
  simulation: StandardStep,
  activity: StandardStep,
  question: StandardStep,
  apply: StandardStep,
  note: NoteStep,
  'common-error': CommonErrorStep,
  summary: SummaryStep,
  'final-test': FinalTestStep,
}

/** Fails loudly during development if a kind is added without a renderer. */
export function assertStepRenderersComplete(): void {
  const missing = STEP_KINDS.filter((kind) => !(kind in STEP_RENDERERS))
  if (missing.length > 0) {
    throw new Error(`Missing step renderers for: ${missing.join(', ')}`)
  }
}

export function getStepRenderer(kind: StepKind): ComponentType<StepRendererProps> {
  return STEP_RENDERERS[kind] ?? StandardStep
}

export { STEP_KIND_META }
