import { ScientificNotationText } from '@/scientific'
import { ZincHclSchematic } from './Lesson6ZincHclSchematic'
import type { InteractiveProps } from './registry'

/**
 * Reconstructed schematic SVG of the printed experiment figure on page 37
 * («أجرب وأستنتج»: تفاعل مسحوق الزّنك مع محلول حمض كلور الماء الممدّد).
 *
 * Preserves all three printed callout labels from page 37:
 *   - right pointer: «زنك»
 *   - left pointer:  «حمض كلور» (as printed in the figure margin)
 *   - middle-right:  «H₂» pointing to the rising gas column
 *   - top of tube:   lit match held near the rim producing an ignition flame.
 */
export default function Lesson6ZincHclDiagram({ interactiveId, reducedMotion }: InteractiveProps) {
  return (
    <figure
      className={`l6-figure l6-source-figure ${reducedMotion ? 'l6-figure--still' : ''}`}
      data-diagram={interactiveId}
      data-interactive-id={interactiveId}
      data-source-reconstruction="p37-zinc-hcl"
    >
      <header className="l6-figure__header">
        <p className="l6-figure__eyebrow">إعادة بناء تخطيطية من المنصة لشكل الكتاب (ص37) · ليست مسحاً ضوئياً</p>
        <h4 className="l6-figure__title">تجربة تفاعل الزّنك مع محلول حمض كلور الماء الممدّد والكشف عن الغاز</h4>
      </header>

      <ZincHclSchematic />

      <figcaption className="l6-figure__caption">
        <ScientificNotationText>
          إعادة بناء تخطيطية لبيانات شكل ص37 بوسومه المطبوعة («زنك»، «حمض كلور»، وغاز H₂ المتصاعد المشتعل عند الفوهة).
        </ScientificNotationText>
      </figcaption>
    </figure>
  )
}
