/**
 * Pure force calculations behind the physics labs.
 *
 * Nothing here touches the DOM or React, so every relation the labs display
 * (resultant of two forces, equilibrium of a hanging weight, resolution of a
 * force into perpendicular components) is unit-tested independently of the
 * drawing code.
 *
 * Conventions: angles are in degrees; forces are in newtons; directions use
 * the mathematical orientation (counter-clockwise from the +x axis).
 */

export const toRadians = (degrees: number) => (degrees * Math.PI) / 180
export const toDegrees = (radians: number) => (radians * 180) / Math.PI

/** Round to a fixed number of decimals without returning `-0`. */
export function roundTo(value: number, digits = 1): number {
  const factor = 10 ** digits
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor
  return Object.is(rounded, -0) ? 0 : rounded
}

/** `F = √(F₁² + F₂²)` — the Pythagorean combination of two perpendicular forces. */
export function hypotenuse(a: number, b: number): number {
  return Math.hypot(a, b)
}

export type TwoForceResultant = {
  /** Intensity of the resultant `F`. */
  magnitude: number
  /** Components of the resultant on the axis of F₁ and on the perpendicular axis. */
  x: number
  y: number
  /** Angle between the resultant and F₁ (degrees, 0 when F₁ ∥ F₂). */
  fromF1: number
  /** Angle between the resultant and F₂ (degrees). */
  fromF2: number
}

/**
 * Resultant of two concurrent forces whose carriers make `angleDeg` with each
 * other — the diagonal of the parallelogram built on them.
 * F₁ lies along +x and F₂ makes `angleDeg` with it.
 */
export function resultantOfTwo(f1: number, f2: number, angleDeg: number): TwoForceResultant {
  const a = toRadians(angleDeg)
  const x = f1 + f2 * Math.cos(a)
  const y = f2 * Math.sin(a)
  const magnitude = Math.hypot(x, y)
  const fromF1 = magnitude === 0 ? 0 : toDegrees(Math.atan2(y, x))
  return { magnitude, x, y, fromF1, fromF2: angleDeg - fromF1 }
}

/** Smallest and largest possible resultant of two forces: `|F₁ − F₂| ≤ F ≤ F₁ + F₂`. */
export function resultantBounds(f1: number, f2: number): { min: number; max: number } {
  return { min: Math.abs(f1 - f2), max: f1 + f2 }
}

/**
 * Tensions of two threads (or spring balances) that hold a weight at rest.
 * `a1` and `a2` are the angles each one makes with the vertical, on opposite
 * sides; they must add up to less than 180°.
 *
 *   horizontal: T₁ sin a₁ = T₂ sin a₂
 *   vertical:   T₁ cos a₁ + T₂ cos a₂ = w
 */
export function equilibriumTensions(weight: number, a1Deg: number, a2Deg: number): { t1: number; t2: number } {
  const total = Math.sin(toRadians(a1Deg + a2Deg))
  return {
    t1: (weight * Math.sin(toRadians(a2Deg))) / total,
    t2: (weight * Math.sin(toRadians(a1Deg))) / total,
  }
}

/** Residual of the three concurrent forces (F₁, F₂ and the weight); 0 at equilibrium. */
export function equilibriumResidual(weight: number, a1Deg: number, a2Deg: number, t1: number, t2: number) {
  const horizontal = t1 * Math.sin(toRadians(a1Deg)) - t2 * Math.sin(toRadians(a2Deg))
  const vertical = t1 * Math.cos(toRadians(a1Deg)) + t2 * Math.cos(toRadians(a2Deg)) - weight
  return { horizontal, vertical }
}

/** Components of a force on two perpendicular axes, the first at `angleDeg` below the force. */
export function resolveForce(force: number, angleDeg: number): { along: number; across: number } {
  const a = toRadians(angleDeg)
  return { along: force * Math.cos(a), across: force * Math.sin(a) }
}

/**
 * Components of a weight on a smooth incline of angle `inclineDeg`:
 * parallel to the plane (`F₁`, which pulls the body down the slope) and
 * perpendicular to it (`F₂`, which presses the body onto the plane and is
 * balanced by the reaction `R`).
 */
export function resolveOnIncline(weight: number, inclineDeg: number): { parallel: number; perpendicular: number } {
  const a = toRadians(inclineDeg)
  return { parallel: weight * Math.sin(a), perpendicular: weight * Math.cos(a) }
}

/**
 * Drawing scale, in newtons per centimetre, chosen the way the textbook does:
 * «كل 1 cm يمثل X N». Small forces use 1 N per cm (page 58: 4 N and 3 N), large
 * forces a coarser scale (page 59: 20 N per cm for 60 N and 80 N). `maxNewton`
 * is the largest intensity that must be drawn: F₁, F₂ or their resultant.
 */
export function drawingScale(maxNewton: number): number {
  if (maxNewton > 40) return 20
  if (maxNewton > 20) return 10
  if (maxNewton > 8) return 5
  return 1
}
