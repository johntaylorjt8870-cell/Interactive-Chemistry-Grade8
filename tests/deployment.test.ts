// @vitest-environment node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import { readProjectFile } from './utils/projectFiles'
import { EXPECTED_BASE_PATH, verifyDist } from '../scripts/verify-dist.mjs'

/**
 * Deployment verification: the workflow, the Pages base path, and (when a build
 * exists) the emitted production bundle.
 */

const workflowSource = readProjectFile('.github/workflows/deploy-pages.yml')
const workflow = parse(workflowSource) as {
  on: Record<string, unknown>
  permissions: Record<string, string>
  concurrency: Record<string, unknown>
  jobs: Record<string, { steps?: Array<{ uses?: string; run?: string; with?: Record<string, unknown> }> }>
}

const steps = workflow.jobs.build?.steps ?? []
const allSteps = [...steps, ...(workflow.jobs.deploy?.steps ?? [])]
const uses = allSteps.map((step) => step.uses).filter(Boolean) as string[]
const runs = steps.map((step) => step.run).filter(Boolean) as string[]

/** YAML with comment lines removed, for assertions about configuration only. */
const workflowConfig = workflowSource
  .split('\n')
  .filter((line) => !/^\s*#/.test(line))
  .join('\n')

describe('GitHub Pages workflow', () => {
  it('parses as valid YAML with a build and a deploy job', () => {
    expect(workflow.jobs.build).toBeDefined()
    expect(workflow.jobs.deploy).toBeDefined()
  })

  it('requests the permissions the Pages deployment mechanism requires', () => {
    expect(workflow.permissions.pages).toBe('write')
    expect(workflow.permissions['id-token']).toBe('write')
    expect(workflow.permissions.contents).toBe('read')
  })

  it('uses the official Pages artifact deployment actions', () => {
    expect(uses).toContain('actions/configure-pages@v5')
    expect(uses).toContain('actions/upload-pages-artifact@v3')
    expect(uses).toContain('actions/deploy-pages@v4')
  })

  it('never falls back to branch-based deployment', () => {
    expect(workflowConfig).not.toMatch(/gh-pages/)
    expect(workflowConfig).not.toMatch(/peaceiris\/actions-gh-pages/)
    expect(workflowConfig).not.toMatch(/JamesIves\/github-pages-deploy-action/)
    for (const step of allSteps) {
      expect(step.with ?? {}).not.toHaveProperty('branch')
    }
  })

  it('uploads the built dist directory', () => {
    const upload = steps.find((step) => step.uses === 'actions/upload-pages-artifact@v3')
    expect(upload?.with?.path).toBe('dist')
  })

  it('installs, typechecks, tests, builds and verifies before deploying', () => {
    expect(runs.some((command) => command.includes('npm ci'))).toBe(true)
    expect(runs.some((command) => command.includes('npm run typecheck'))).toBe(true)
    expect(runs.some((command) => command.includes('npm test'))).toBe(true)
    expect(runs.some((command) => command.includes('npm run build'))).toBe(true)
    expect(runs.some((command) => command.includes('npm run verify:dist'))).toBe(true)

    // The production-build assertions must run against an existing dist/.
    const buildIndex = runs.findIndex((command) => command.includes('npm run build'))
    const testIndex = runs.findIndex((command) => command.includes('npm test'))
    expect(buildIndex).toBeGreaterThanOrEqual(0)
    expect(testIndex).toBeGreaterThan(buildIndex)
  })

  it('deploys from the main branch on push or manually', () => {
    const triggers = workflow.on
    expect(Object.keys(triggers)).toEqual(expect.arrayContaining(['push', 'workflow_dispatch']))
    expect(JSON.stringify(triggers)).toContain('main')
  })

  it('serialises deployments through a concurrency group', () => {
    expect(workflow.concurrency.group).toBe('pages')
  })

  it('pins a Node version compatible with the toolchain', () => {
    const setup = steps.find((step) => step.uses === 'actions/setup-node@v4')
    expect(String(setup?.with?.['node-version'])).toMatch(/^2[024]$/)
    expect(setup?.with?.cache).toBe('npm')
  })
})

describe('Pages base path configuration', () => {
  it('matches the repository name in vite.config.ts', () => {
    const viteConfig = readProjectFile('vite.config.ts')

    expect(EXPECTED_BASE_PATH).toBe('/Interactive-Chemistry-Grade8/')
    expect(viteConfig).toContain(`export const PAGES_BASE_PATH = '${EXPECTED_BASE_PATH}'`)
    expect(viteConfig).toMatch(/command === 'build'/)
  })

  it('keeps the app free of hash routing', () => {
    const router = readProjectFile('src/app/router.tsx')
    expect(router).toContain('BrowserRouter')
    expect(router).not.toContain('HashRouter')
  })

  it('normalises the router basename from the Vite base path', () => {
    const app = readProjectFile('src/app/App.tsx')
    expect(app).toContain('import.meta.env.BASE_URL')
    expect(app).toContain('routerBasename')
  })
})

describe('production build output', () => {
  const distExists = existsSync(resolve(process.cwd(), 'dist', 'index.html'))

  it.skipIf(!distExists)('resolves every asset under the Pages base path and ships a deep-link fallback', () => {
    const { issues, notes } = verifyDist(process.cwd())

    expect(notes.length).toBeGreaterThan(0)
    expect(issues).toEqual([])
  })

  it.skipIf(!distExists)('emits the fonts, KaTeX styles and 404 fallback', () => {
    const { issues } = verifyDist(process.cwd())
    expect(issues).toEqual([])
  })

  it('reports missing builds rather than silently passing', () => {
    const { issues } = verifyDist(resolve(process.cwd(), 'does-not-exist'))
    expect(issues.map((issue) => issue.code)).toContain('dist/missing')
  })
})
