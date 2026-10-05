import type { TestDefinition } from './types'

/* ============================================================================
   Test Area registry
   ----------------------------------------------------------------------------
   The same shape as the interactive registry: metadata ships eagerly (so the
   Test Area home renders without loading a single question), while the
   questions and the solutions are separate lazy modules.

   A test is only registered once its bank and its solutions exist in
   `banks/` and `solutions/`. An empty registry is an honest empty registry —
   no placeholder test is ever registered to fill a card.
   ========================================================================= */

const registry = new Map<string, TestDefinition>()

/** Registers a test. Throws on duplicate ids, loudly. */
export function defineTest(definition: TestDefinition): TestDefinition {
  if (registry.has(definition.meta.id)) {
    throw new Error(`Test "${definition.meta.id}" is already registered.`)
  }
  registry.set(definition.meta.id, definition)
  return definition
}

export function getTestDefinition(id: string): TestDefinition | undefined {
  return registry.get(id)
}

export function hasTest(id: string): boolean {
  return registry.has(id)
}

export function listTestDefinitions(): TestDefinition[] {
  return [...registry.values()]
}

export function listTestsByScope(
  scope: TestDefinition['meta']['scope'],
): TestDefinition[] {
  return listTestDefinitions().filter((definition) => definition.meta.scope === scope)
}

export function listLessonTests(): TestDefinition[] {
  return listTestsByScope('lesson')
}

export function listUnitTests(): TestDefinition[] {
  return listTestsByScope('unit')
}

export function listComprehensiveTests(): TestDefinition[] {
  return listTestsByScope('comprehensive')
}

/** Test-only helper: clears the registry between cases. */
export function __resetTestRegistry(): void {
  registry.clear()
}
