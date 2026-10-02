/**
 * Collects Unicode subscript/superscript script glyphs that survive as bare
 * text nodes OUTSIDE structured scientific DOM (.ion-notation, .chem-formula,
 * .nuclear-notation, real <sup>/<sub>) and outside SVG (where text is
 * coordinate-positioned, not bidi-flowed). Any hit means a formula, ion or
 * nuclide was split across the RTL prose — the corruption the platform's
 * LTR-isolation contract exists to prevent.
 */
export function strayScriptGlyphs(container: HTMLElement): string[] {
  const stray: string[] = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const parent = node.parentElement
    if (parent && !parent.closest('.ion-notation, .chem-formula, .nuclear-notation, .electron-configuration, .sci-vector, sup, sub, svg, [dir="ltr"]')) {
      const chars = [...(node.textContent ?? '')].filter((char) =>
        /[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⃗]/u.test(char),
      )
      if (chars.length > 0) stray.push(chars.join(''))
    }
    node = walker.nextNode()
  }
  return stray
}
