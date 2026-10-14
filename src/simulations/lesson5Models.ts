import { parseFormula, type FormulaNode } from '@/utils/scientificText'

export const ACETIC_ACID_REACTION = {
  reactants: ['CH3COOH', 'NaHCO3'],
  products: ['CH3COONa', 'H2O', 'CO2'],
} as const

export type AtomCounts = Record<string, number>

function addFormulaNodes(nodes: FormulaNode[], counts: AtomCounts, multiplier = 1): void {
  for (const node of nodes) {
    if (node.type === 'element') {
      counts[node.symbol] = (counts[node.symbol] ?? 0) + multiplier * Number(node.subscript ?? '1')
    } else if (node.type === 'group') {
      addFormulaNodes(node.nodes, counts, multiplier * Number(node.subscript ?? '1'))
    }
  }
}

/** Count atoms from the actual parsed chemical formula; no hand-entered totals. */
export function countFormulaAtoms(formula: string): AtomCounts {
  const counts: AtomCounts = {}
  addFormulaNodes(parseFormula(formula), counts)
  return counts
}

/** Sum formulas on one side of a reaction. Every formula has coefficient 1. */
export function countSpeciesAtoms(formulas: readonly string[]): AtomCounts {
  return formulas.reduce<AtomCounts>((sum, formula) => {
    for (const [element, count] of Object.entries(countFormulaAtoms(formula))) {
      sum[element] = (sum[element] ?? 0) + count
    }
    return sum
  }, {})
}

export const ACETIC_ACID_REACTANT_COUNTS = countSpeciesAtoms(ACETIC_ACID_REACTION.reactants)
export const ACETIC_ACID_PRODUCT_COUNTS = countSpeciesAtoms(ACETIC_ACID_REACTION.products)
export const ACETIC_ACID_ELEMENTS = ['C', 'H', 'O', 'Na'] as const

export type MassRatio = {
  id: 'iron-sulfur' | 'lead-sulfur'
  leftName: string
  rightName: string
  productName: string
  /** Source masses representing one proportional composition set. */
  leftRatioMass: number
  rightRatioMass: number
}

/** Ratios transcribed from the lesson source tables; not new measurements. */
export const MASS_RATIOS: Record<MassRatio['id'], MassRatio> = {
  'iron-sulfur': {
    id: 'iron-sulfur', leftName: 'الحديد', rightName: 'الكبريت', productName: 'كبريتيد الحديد',
    leftRatioMass: 56, rightRatioMass: 32,
  },
  'lead-sulfur': {
    id: 'lead-sulfur', leftName: 'الرصاص', rightName: 'الكبريت', productName: 'كبريتيد الرصاص',
    leftRatioMass: 10, rightRatioMass: 1.56,
  },
}

export type ProportionalReactionResult = {
  leftAvailable: number
  rightAvailable: number
  leftReacted: number
  rightReacted: number
  leftExcess: number
  rightExcess: number
  productMass: number
}

/**
 * Apply a source mass ratio to learner-entered amounts. This is arithmetic,
 * not a lab measurement; the platform labels these values as model outputs.
 */
export function calculateProportionalReaction(
  leftAvailable: number,
  rightAvailable: number,
  ratio: Pick<MassRatio, 'leftRatioMass' | 'rightRatioMass'>,
): ProportionalReactionResult | null {
  if (
    !Number.isFinite(leftAvailable) || !Number.isFinite(rightAvailable) ||
    leftAvailable < 0 || rightAvailable < 0 ||
    ratio.leftRatioMass <= 0 || ratio.rightRatioMass <= 0
  ) return null

  const scale = Math.min(leftAvailable / ratio.leftRatioMass, rightAvailable / ratio.rightRatioMass)
  const leftReacted = tidy(scale * ratio.leftRatioMass)
  const rightReacted = tidy(scale * ratio.rightRatioMass)
  return {
    leftAvailable,
    rightAvailable,
    leftReacted,
    rightReacted,
    leftExcess: tidy(Math.max(0, leftAvailable - leftReacted)),
    rightExcess: tidy(Math.max(0, rightAvailable - rightReacted)),
    productMass: tidy(leftReacted + rightReacted),
  }
}

export type OpenSystemMassResult = {
  insideMass: number
  escapedMass: number
  accountedTotal: number
}

/** Simple bookkeeping for an open boundary; escaped matter remains counted. */
export function calculateOpenSystemMass(
  initialMass: number,
  escapedMass: number,
): OpenSystemMassResult | null {
  if (
    !Number.isFinite(initialMass) || !Number.isFinite(escapedMass) ||
    initialMass < 0 || escapedMass < 0 || escapedMass > initialMass
  ) return null
  const insideMass = tidy(initialMass - escapedMass)
  return { insideMass, escapedMass, accountedTotal: tidy(insideMass + escapedMass) }
}

function tidy(value: number): number {
  return Number(value.toPrecision(12))
}

export function formatModelMass(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(tidy(value))
}
