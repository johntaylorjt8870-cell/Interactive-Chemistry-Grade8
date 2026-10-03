// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readProjectFile } from './utils/projectFiles'
import { getLesson } from '@/data/curriculum/registry'
import { listInteractives } from '@/simulations/registry'

/**
 * Documentation truthfulness: the README and the registry doc-comments must
 * describe the repository as it actually is. These tests guard against the
 * stale "foundation phase / empty registry / no content" claims returning,
 * and against the README documenting interactives or lessons that do not
 * actually exist in the registries.
 */

const readme = readProjectFile('README.md')
const simulationRegistrySource = readProjectFile('src/simulations/registry.ts')
const curriculumRegistrySource = readProjectFile('src/data/curriculum/registry.ts')

describe('README truthfulness', () => {
  it('no longer claims the project has no lessons or content', () => {
    expect(readme).not.toContain('لم يُضف أي محتوى دراسي بعد')
    expect(readme).not.toContain('مرحلة الأساس (Foundation)')
    expect(readme).not.toMatch(/المحتوى الدراسي \| \*\*لم يُضف بعد\*\*/)
  })

  it('no longer describes the simulations registry as intentionally empty', () => {
    expect(readme).not.toContain('فارغ عمداً')
  })

  it('documents only lessons that actually exist in the curriculum registry', () => {
    // The three lesson route slugs named in the README must resolve.
    expect(getLesson('chemistry', 'structural-chemistry', 'atom-and-element')).toBeDefined()
    expect(getLesson('chemistry', 'structural-chemistry', 'chemical-bonds')).toBeDefined()
    expect(getLesson('physics', 'motion-and-forces', 'concurrent-forces')).toBeDefined()
  })

  it('documents exactly the interactive ids that are actually registered', () => {
    const sectionStart = readme.indexOf('### العناصر التفاعلية المسجّلة')
    expect(sectionStart).toBeGreaterThan(-1)
    const section = readme.slice(sectionStart)
    const tableEnd = section.indexOf('>')
    const table = section.slice(0, tableEnd)
    const documentedIds = [...table.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((match) => match[1])
    const registeredIds = listInteractives().map((definition) => definition.id)

    expect(documentedIds.length).toBeGreaterThan(0)
    expect([...documentedIds].sort()).toEqual([...registeredIds].sort())
  })

  it('does not claim a deployment mechanism other than GitHub Actions → GitHub Pages', () => {
    expect(readme).not.toMatch(/vercel|netlify|gh-pages branch/i)
    expect(readme).toContain('GitHub Actions')
  })

  it('does not claim the textbook page scans are stored in the repository', () => {
    // Fix 10 established the scans are absent; the README must keep saying so.
    // Normalize markdown blockquote markers and line wrapping first.
    const flattened = readme.replace(/^>\s?/gm, '').replace(/\s+/g, ' ')
    expect(flattened).toContain('غير موجودة كملفات في هذا المستودع')
  })
})

describe('registry doc-comments truthfulness', () => {
  it('simulation registry comment no longer says the registry is empty', () => {
    expect(simulationRegistrySource).not.toContain('intentionally empty')
    expect(listInteractives().length).toBeGreaterThan(0)
  })

  it('curriculum registry comment no longer says units are empty', () => {
    expect(curriculumRegistrySource).not.toContain('intentionally empty')
  })
})
