/**
 * Scientific rendering foundation.
 *
 * Every component in this folder owns exactly one notation responsibility:
 *
 *  - <ScientificText />     mixed Arabic prose with automatic LTR isolation
 *  - <ScientificNotationText /> promotes compact nuclides in mixed prose to structured DOM
 *  - <Sci />                explicit isolation of a scientific run
 *  - <MathFormula />        KaTeX mathematics (fractions, roots, powers)
 *  - <ChemicalFormula />    subscripts and groups (H₂O, Ca(OH)₂)
 *  - <ChemicalEquation />   balanced reaction chains (A + B → C)
 *  - <ElectronConfiguration /> one LTR isolate for a distribution (2-8-8)
 *  - <IonNotation />        ions with conventional charge order (Ca²⁺, SO₄²⁻)
 *  - <ChargeValue />        standalone charges, sign first (−2, +2)
 *  - <NuclearNotation />    mass number / atomic number / symbol
 *  - <LewisStructure />     electron-dot structures, dot by dot
 *  - <ScientificValue />    value + unit (5 kg, 25 °C, 9.8 m/s²)
 *  - <ScientificTable />    readable scientific tables
 *  - <ScientificDiagram />  labelled SVG figure frames
 *  - <PlatformAddition />   marks platform-authored material
 *  - <TextbookSource />     marks verbatim textbook material
 */

export { Sci, ScientificText, SciSub, SciSup } from './ScientificText'
export type { SciProps, ScientificTextProps, SciVariant, ScriptProps } from './ScientificText'
export { ElectronConfiguration } from './ElectronConfiguration'
export type { ElectronConfigurationProps, ElectronConfigurationSize } from './ElectronConfiguration'

export { ScientificNotationText, parseCompactFormulaNotation, parseCompactIonNotation } from './ScientificNotationText'
export type { ScientificNotationTextProps } from './ScientificNotationText'

export { MathFormula, EquationRow } from './MathFormula'
export type { MathFormulaProps, EquationRowProps } from './MathFormula'

export { ChemicalFormula, ChemicalEquation } from './ChemicalFormula'
export type { ChemicalFormulaProps, ChemicalEquationProps, ChemicalFormulaSize } from './ChemicalFormula'

export { IonNotation, ChargeValue, SubscriptedIon } from './IonNotation'
export type { IonNotationProps, ChargeValueProps, SubscriptedIonProps, IonNotationStyle } from './IonNotation'

export { NuclearNotation, NuclideSummary } from './NuclearNotation'
export type { NuclearNotationProps, NuclideSummaryProps } from './NuclearNotation'

export { LewisStructure } from './LewisStructure'
export type { LewisStructureProps, LewisDot, LewisPosition, LewisSize } from './LewisStructure'

export { LewisMolecule, BondModel, LEWIS_MOLECULE_BOND_NAMES } from './LewisMolecule'
export type { LewisMoleculeProps, LewisMoleculeAtom, LewisMoleculeSide } from './LewisMolecule'

export { BohrAtom } from './BohrAtom'
export type { BohrAtomProps } from './BohrAtom'

export { IonicTransferDiagram, NaClCluster } from './IonicTransferDiagram'
export type { IonicTransferDiagramProps } from './IonicTransferDiagram'

export { ScientificValue, ScientificRange } from './ScientificValue'
export type { ScientificValueProps, ScientificRangeProps, ScientificValueSize } from './ScientificValue'

export { ScientificTable } from './ScientificTable'
export type { ScientificTableProps, ScientificColumn, ScientificRow, TableAlign } from './ScientificTable'

export { ScientificDiagram, DiagramDefs, DiagramVector, DiagramLegend } from './ScientificDiagram'
export type { ScientificDiagramProps, DiagramVectorProps, DiagramLegendItem } from './ScientificDiagram'

export { PlatformAddition, TextbookSource, PLATFORM_ADDITION_MARKER } from './PlatformAddition'
export type { PlatformAdditionProps, TextbookSourceProps } from './PlatformAddition'
