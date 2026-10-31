import { countFormulaAtoms } from './lesson5Models'

/** Atomic masses printed in lesson 7 (p42 table and worked-example data). */
export const LESSON7_ATOMIC_MASSES: Record<string, number> = {
  H: 1, He: 4, C: 12, N: 14, O: 16, Na: 23, Mg: 24, S: 32, Cl: 35.5, Ca: 40, Fe: 56,
}
export const AVOGADRO_BOOK = 6.022e23
export const MOLAR_VOLUME_BOOK = 22.4
/** Explicitly approved platform assumption, not a textbook datum. */
export const OXYGEN_AIR_VOLUME_FRACTION = 0.21

export type MolarSubstance = { id: string; formula: string; name: string }
export const MOLAR_SUBSTANCES: MolarSubstance[] = [
  { id: 'water', formula: 'H2O', name: 'الماء' },
  { id: 'ammonia', formula: 'NH3', name: 'النشادر' },
  { id: 'methane', formula: 'CH4', name: 'الميثان' },
  { id: 'magnesium-chloride', formula: 'MgCl2', name: 'كلوريد المغنزيوم' },
  { id: 'sodium-chloride', formula: 'NaCl', name: 'كلوريد الصوديوم' },
  { id: 'sulfuric-acid', formula: 'H2SO4', name: 'حمض الكبريت' },
  { id: 'calcium-hydroxide', formula: 'Ca(OH)2', name: 'هيدروكسيد الكالسيوم' },
]

export type AtomContribution = { element: string; count: number; atomicMass: number; contribution: number }
export function atomContributions(formula: string): AtomContribution[] {
  return Object.entries(countFormulaAtoms(formula)).map(([element, count]) => {
    const atomicMass = LESSON7_ATOMIC_MASSES[element]
    if (atomicMass === undefined) throw new Error(`No lesson-7 atomic mass for ${element}`)
    return { element, count, atomicMass, contribution: count * atomicMass }
  })
}
export function molarMass(formula: string): number {
  return tidy(atomContributions(formula).reduce((sum, atom) => sum + atom.contribution, 0))
}
export type MolarSample = { moles: number; mass: number; molarMass: number; particles: number; contributions: AtomContribution[] }
export function calculateMolarSample(formula: string, amount: number, mode: 'mass' | 'moles'): MolarSample | null {
  if (!Number.isFinite(amount) || amount < 0 || amount > 10000) return null
  const M = molarMass(formula)
  const moles = mode === 'mass' ? amount / M : amount
  return { moles: tidy(moles), mass: tidy(moles * M), molarMass: M, particles: moles * AVOGADRO_BOOK, contributions: atomContributions(formula) }
}

export const MOLAR_GASES = [
  { id: 'he', formula: 'He', name: 'الهليوم', color: 'gold' },
  { id: 'o2', formula: 'O2', name: 'الأكسجين', color: 'green' },
  { id: 'n2', formula: 'N2', name: 'النتروجين', color: 'red' },
] as const
export type MolarGasId = (typeof MOLAR_GASES)[number]['id']
export type GasSample = { gasId: MolarGasId; formula: string; moles: number; volume: number; mass: number; molarMass: number }
/** Model at the book's standard conditions only; no pretend measurement outside them. */
export function calculateGasSample(gasId: MolarGasId, moles: number): GasSample | null {
  if (!Number.isFinite(moles) || moles < 0 || moles > 10) return null
  const gas = MOLAR_GASES.find((entry) => entry.id === gasId)
  if (!gas) return null
  const M = molarMass(gas.formula)
  return { gasId, formula: gas.formula, moles: tidy(moles), volume: tidy(moles * MOLAR_VOLUME_BOOK), mass: tidy(moles * M), molarMass: M }
}
export function airVolumeForOxygen(oxygenVolume: number): number | null {
  if (!Number.isFinite(oxygenVolume) || oxygenVolume < 0) return null
  return oxygenVolume / OXYGEN_AIR_VOLUME_FRACTION
}
export function tidy(value: number): number { return Number(value.toPrecision(12)) }
export function formatModelNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6, useGrouping: false }).format(value)
}
export function particleExponent(value: number): { mantissa: string; exponent: number } {
  if (value === 0) return { mantissa: '0', exponent: 0 }
  const exponent = Math.floor(Math.log10(value))
  return { mantissa: formatModelNumber(value / 10 ** exponent), exponent }
}
