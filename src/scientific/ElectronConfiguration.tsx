import { parseElectronConfiguration } from '@/utils/scientificText'

export type ElectronConfigurationSize = 'sm' | 'md' | 'lg'

export type ElectronConfigurationProps = {
  /**
   * The configuration exactly as authored in the textbook: `2`, `2-8`,
   * `2-8-8`, `2-8-18-8`. The string is never reversed or re-spelled — only the
   * glyphs of the value itself are rendered, in their source order.
   */
  value: string
  /** Optional type scale for block contexts. Inline prose inherits its size. */
  size?: ElectronConfigurationSize
  className?: string
  /** Accessible description; defaults to the configuration value itself. */
  label?: string
}

/**
 * A single electron configuration (`2-8-8`), isolated from the surrounding
 * direction.
 *
 * Why this component exists: an electron configuration is one logical value.
 * Rendering it as a chain of independent inline isolates lets an RTL paragraph
 * place those isolates right-to-left, which visually reverses the value even
 * though the source text is correct. Here the whole configuration is one
 * `dir="ltr"` isolate, and its shell counts and separators are laid out in
 * source order inside it.
 *
 * Bidi safety is structural, not cosmetic:
 *
 *  - `direction: ltr` + `unicode-bidi: isolate` on the container (see
 *    scientific-components.css) give the browser one neutral LTR boundary;
 *  - the container is a flex row, so its children are placed by the layout
 *    algorithm in source order, never reordered by the bidi algorithm;
 *  - the value is emitted verbatim, so no invisible control characters and no
 *    reversed strings ever enter the educational content.
 */
export function ElectronConfiguration({
  value,
  size,
  className,
  label,
}: ElectronConfigurationProps) {
  const parsed = parseElectronConfiguration(value)
  // Defensive: a value that is not a shell list is still isolated as one LTR
  // run rather than being split or transformed.
  const tokens = parsed?.tokens ?? [{ kind: 'shell' as const, value }]

  return (
    <span
      className={['electron-configuration', size ? `electron-configuration--${size}` : null, className]
        .filter(Boolean)
        .join(' ')}
      dir="ltr"
      data-sci="isolated"
      data-configuration={value}
      data-shells={parsed ? parsed.shells.join(',') : undefined}
      role="math"
      aria-label={label ?? value}
    >
      {tokens.map((token, index) => (
        <span key={index} className={`electron-configuration__${token.kind}`}>
          {token.value}
        </span>
      ))}
    </span>
  )
}
