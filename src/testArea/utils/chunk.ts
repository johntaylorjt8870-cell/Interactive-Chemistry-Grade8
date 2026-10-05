/* ============================================================================
   Solution chunking
   ----------------------------------------------------------------------------
   A 20-question test is read in parts of five; a 60-question test in parts of
   ten. The chunk size comes from the blueprint (`solutionChunkSize`), so the
   parts are a property of the test's design rather than a UI habit.

   Pure arithmetic, no React, no storage: the solutions browser asks for the
   parts, it never computes them inline.
   ========================================================================= */

export type Chunk = {
  /** Zero-based part index. */
  index: number
  /** Zero-based indices of the questions in this part. */
  questionIndices: number[]
  /** One-based question numbers, e.g. `[1, 2, 3, 4, 5]`. */
  questionNumbers: number[]
  first: number
  last: number
  label: string
}

/** How many parts a test of `total` questions splits into. */
export function chunkCount(total: number, size: number): number {
  if (total <= 0) return 0
  const safeSize = Math.max(1, Math.floor(size))
  return Math.ceil(total / safeSize)
}

/** Zero-based index of the part holding question `questionIndex` (0-based). */
export function chunkIndexOf(questionIndex: number, size: number): number {
  const safeSize = Math.max(1, Math.floor(size))
  return Math.floor(Math.max(0, questionIndex) / safeSize)
}

const ORDINALS = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
  'الحادي عشر',
  'الثاني عشر',
  'الثالث عشر',
  'الرابع عشر',
  'الخامس عشر',
  'السادس عشر',
  'السابع عشر',
  'الثامن عشر',
  'التاسع عشر',
  'العشرون',
]

/** Arabic ordinal for a one-based part number, e.g. 4 → `الرابع`. */
export function ordinalLabel(oneBased: number): string {
  return ORDINALS[oneBased - 1] ?? `${oneBased}`
}

/** All parts of a test, in order. */
export function chunksOf(total: number, size: number): Chunk[] {
  const chunks: Chunk[] = []
  const count = chunkCount(total, size)
  for (let index = 0; index < count; index += 1) {
    const first = index * size + 1
    const last = Math.min(total, (index + 1) * size)
    const numbers: number[] = []
    for (let number = first; number <= last; number += 1) numbers.push(number)
    chunks.push({
      index,
      questionIndices: numbers.map((number) => number - 1),
      questionNumbers: numbers,
      first,
      last,
      label: `الجزء ${ordinalLabel(index + 1)} (${first}–${last})`,
    })
  }
  return chunks
}

/** The part holding question `questionIndex`, or `undefined` when out of range. */
export function chunkAt(questionIndex: number, total: number, size: number): Chunk | undefined {
  return chunksOf(total, size)[chunkIndexOf(questionIndex, size)]
}
