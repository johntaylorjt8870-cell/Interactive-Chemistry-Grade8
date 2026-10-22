#!/usr/bin/env node
/**
 * Real-Chromium verification for the first chemistry lesson (الذرّة والعنصر).
 *
 * Run `npm run build && npm run verify:lesson1`. The browser harness uses
 * puppeteer-core plus @sparticuz/chromium (or CHROMIUM_PATH), like
 * verify:badges, verify:lesson4 and verify:lesson5. It writes ignored
 * screenshots and a JSON report to artifacts/lesson1/browser/.
 *
 * What is asserted here (in a real browser, not jsdom):
 *   * every authored step renders its own title on desktop and mobile;
 *   * no step causes horizontal page overflow at 390 px;
 *   * no interactive host is empty/unregistered;
 *   * a horizontally scrollable display formula is keyboard-focusable;
 *   * the textbook scan is never presented as an available original;
 *   * the labs keep their prediction → action → observation order;
 *   * the lesson final test renders all 15 authored questions;
 *   * axe reports no serious/critical violations.
 *
 * `color-contrast` is disabled because the violations it reports come from
 * shared platform chrome (`lesson-rail`, `textbook-source__ref`,
 * `platform-addition-badge__en`, …) that every lesson inherits; those tokens
 * are outside Lesson 1's scope. The lesson's own text pairs are checked by the
 * design-system tests instead. This limitation is reported, not hidden.
 */
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = '/Interactive-Chemistry-Grade8'
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, 'artifacts/lesson1/browser')
const LESSON_PATH = '/chemistry/structural-chemistry/atom-and-element'
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
}

// Load authored curriculum data so the walk follows the real step list.
const dataModules = new Map()
function dataModuleUrl(file) {
  const absolute = path.resolve(file)
  if (dataModules.has(absolute)) return dataModules.get(absolute)
  const source = fs.readFileSync(absolute, 'utf8')
  let output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: false },
  }).outputText
  output = output.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_, quote, dependency) => {
    const next = path.resolve(path.dirname(absolute), `${dependency}.ts`)
    return `from ${quote}${dataModuleUrl(next)}${quote}`
  })
  const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
  dataModules.set(absolute, url)
  return url
}
const { chemistryLesson1 } = await import(
  dataModuleUrl(path.join(ROOT, 'src/data/curriculum/chemistryLesson1.ts'))
)

function serve() {
  const server = http.createServer((request, response) => {
    let route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (route.startsWith(BASE)) route = route.slice(BASE.length)
    let file = path.resolve(DIST, `.${route}`)
    if (!file.startsWith(`${DIST}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, 'index.html')
    }
    response.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream')
    fs.createReadStream(file)
      .on('error', () => {
        response.statusCode = 404
        response.end()
      })
      .pipe(response)
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })))
}

async function browserConfig() {
  const puppeteer = (await import('puppeteer-core')).default
  if (process.env.CHROMIUM_PATH) return { puppeteer, executablePath: process.env.CHROMIUM_PATH }
  const chromium = (await import('@sparticuz/chromium')).default
  const executablePath = await chromium.executablePath()
  const packageFile = fileURLToPath(import.meta.resolve('@sparticuz/chromium'))
  const packageRoot = path.dirname(path.dirname(packageFile))
  const archive = path.join(packageRoot, 'bin/al2023.tar.br')
  const librariesRoot = path.join(os.tmpdir(), 'chem-badge-chromium-libs')
  const libraries = path.join(librariesRoot, 'lib')
  if (!fs.existsSync(path.join(libraries, 'libnspr4.so')) && fs.existsSync(archive)) {
    fs.mkdirSync(librariesRoot, { recursive: true })
    const tar = path.join(os.tmpdir(), 'chem-lesson1-al2023.tar')
    fs.writeFileSync(tar, zlib.brotliDecompressSync(fs.readFileSync(archive)))
    execFileSync('tar', ['-xf', tar, '-C', librariesRoot])
    fs.rmSync(tar, { force: true })
  }
  return { puppeteer, executablePath, libraries: fs.existsSync(libraries) ? libraries : undefined }
}

const checks = []
const failures = []
function check(name, passed, details = undefined) {
  checks.push({ name, passed: Boolean(passed), ...(details === undefined ? {} : { details }) })
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${details === undefined ? '' : ` — ${JSON.stringify(details)}`}`)
  if (!passed) failures.push(name)
}

const STEP_IDS = chemistryLesson1.steps.map((step) => step.id)
const SHOT_STEPS = new Set([
  'rutherford-experiment',
  'bohr',
  'levels-law',
  'sodium',
  'atomic-numbers',
  'ions',
  'lewis',
  'isotopes',
])

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('No production build found. Run `npm run build` first.')
  process.exit(2)
}
fs.mkdirSync(OUT, { recursive: true })

let browser
let server
try {
  const config = await browserConfig()
  const env = {
    ...process.env,
    ...(config.libraries ? { LD_LIBRARY_PATH: [config.libraries, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } : {}),
  }
  browser = await config.puppeteer.launch({
    executablePath: config.executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    env,
  })
  const served = await serve()
  server = served.server
  const origin = `http://127.0.0.1:${served.port}${BASE}`
  const page = await browser.newPage()
  page.setDefaultTimeout(15000)
  page.on('pageerror', (error) => failures.push(`browser error: ${error.message}`))

  let visit = 0
  const viewports = [
    { name: 'desktop', width: 1366, height: 960 },
    { name: 'mobile', width: 390, height: 844 },
  ]

  for (const viewport of viewports) {
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
    for (let index = 0; index < chemistryLesson1.steps.length; index += 1) {
      const step = chemistryLesson1.steps[index]
      await page.goto(`${origin}${LESSON_PATH}?visual=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
      await page.waitForSelector('.step__title')
      await page.waitForFunction(
        (expected) => document.querySelector('[data-step]')?.getAttribute('data-step') === expected,
        { timeout: 15000 },
        step.id,
      )
      await page.evaluate(() => document.fonts.ready)

      const rendered = await page.evaluate(() => {
        const title = document.querySelector('.step__title')
        const root = document.documentElement
        const unregistered = [
          ...document.querySelectorAll(
            '[data-interactive-state="unregistered"], .interactive-host__error, .empty-state',
          ),
        ]
          .map((node) => node.textContent?.trim())
          .filter(Boolean)
        const scrollableMath = [...document.querySelectorAll('.math-formula--block')]
          .filter((node) => node.scrollWidth > node.clientWidth + 1)
          .map((node) => ({ focusable: node.getAttribute('tabindex') === '0', text: node.textContent?.slice(0, 40) }))
        return {
          title: title?.textContent?.trim() ?? '',
          viewport: innerWidth,
          documentWidth: root.scrollWidth,
          unregistered,
          scrollableMath,
          hasSourceImage: Boolean(document.querySelector('[data-source-image], .source-image')),
        }
      })
      check(`${viewport.name} / step ${index + 1} ${step.id}: title renders`, rendered.title.includes(step.title), rendered.title)
      check(
        `${viewport.name} / step ${index + 1} ${step.id}: no horizontal page overflow`,
        rendered.documentWidth <= rendered.viewport + 1,
        { viewport: rendered.viewport, document: rendered.documentWidth },
      )
      check(
        `${viewport.name} / step ${index + 1} ${step.id}: no empty or unregistered interactive`,
        rendered.unregistered.length === 0,
        rendered.unregistered,
      )
      check(
        `${viewport.name} / step ${index + 1} ${step.id}: scrollable formulas are focusable`,
        rendered.scrollableMath.every((item) => item.focusable),
        rendered.scrollableMath,
      )
      check(
        `${viewport.name} / step ${index + 1} ${step.id}: the textbook scan is not presented as the original`,
        !rendered.hasSourceImage,
      )

      if (SHOT_STEPS.has(step.id)) {
        const target = (await page.$('.lab')) ?? (await page.$('.levels-diagram')) ?? (await page.$('.step__title'))
        if (target) {
          const offset = viewport.name === 'mobile' ? 120 : 80
          await target.evaluate(
            (node, top) => window.scrollTo({ top: Math.max(0, window.scrollY + node.getBoundingClientRect().top - top), behavior: 'instant' }),
            offset,
          )
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
          await page.screenshot({
            path: path.join(OUT, `${viewport.name}-lab-${step.id}.png`),
            fullPage: false,
          })
        }
      }

      // Prediction → action → observation, checked in the real UI.
      if (step.id === 'rutherford-experiment' && viewport.name === 'desktop') {
        const gated = await page.evaluate(() => {
          const buttons = [...document.querySelectorAll('button')]
          const launch = buttons.find((node) => (node.textContent ?? '').trim().includes('أطلق الحزمة'))
          launch?.click()
          return {
            hasLaunch: Boolean(launch),
            counter: document.body.textContent?.includes('0 / 120') ?? false,
          }
        })
        check('rutherford: launching is gated behind a prediction', gated.hasLaunch && gated.counter, gated)
      }

      if (step.id === 'atomic-numbers' && viewport.name === 'desktop') {
        const hidden = await page.evaluate(() => {
          const labels = [...document.querySelectorAll('.lab__measurements > div')]
          const type = labels.find((node) => node.textContent?.includes('نوع الجسيم'))
          return {
            text: type?.textContent?.trim() ?? '',
            revealed: type?.querySelector('[data-revealed]')?.getAttribute('data-revealed'),
          }
        })
        check('inventory: the particle type stays hidden until the prediction is checked', hidden.revealed === 'false', hidden)
      }

      if (step.id === 'lewis' && viewport.name === 'desktop') {
        const before = await page.$$eval('.lewis-lab__side output', (nodes) => nodes.map((node) => node.textContent))
        await page.evaluate(() => {
          const buttons = [...document.querySelectorAll('.lewis-lab__side button')]
          const add = buttons.find((node) => (node.getAttribute('aria-label') ?? '').includes('إضافة'))
          add?.click()
        })
        const after = await page.$$eval('.lewis-lab__side output', (nodes) => nodes.map((node) => node.textContent))
        check(
          'lewis: adding a dot changes exactly one side of the built structure',
          before.reduce((sum, value) => sum + Number(value), 0) === 0 &&
            after.reduce((sum, value) => sum + Number(value), 0) === 1,
          { before, after },
        )
      }

      if (step.id === 'final-test' && viewport.name === 'desktop') {
        // A table-interpretation question renders its rows as nested question
        // sections, so count only the top-level questions.
        const result = await page.evaluate(() => {
          const all = [...document.querySelectorAll('[data-question]')]
          const top = all.filter((node) => !node.parentElement?.closest('[data-question]'))
          return { total: all.length, top: top.length, ids: top.map((node) => node.getAttribute('data-question')) }
        })
        check('final test: all 15 authored questions render as top-level questions', result.top === 15, result)
      }
    }
  }

  // Real-browser axe pass on the mobile viewport (the tighter layout).
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
  for (let index = 0; index < chemistryLesson1.steps.length; index += 1) {
    const step = chemistryLesson1.steps[index]
    await page.goto(`${origin}${LESSON_PATH}?a11y=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.step__title')
    await page.waitForFunction(
      (expected) => document.querySelector('[data-step]')?.getAttribute('data-step') === expected,
      { timeout: 15000 },
      step.id,
    )
    await page.addScriptTag({ path: path.join(ROOT, 'node_modules/axe-core/axe.min.js') })
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document.querySelector('#main-content') ?? document.body, {
        rules: { 'color-contrast': { enabled: false } },
      })
      return result.violations
        .filter((item) => ['serious', 'critical'].includes(item.impact))
        .map((item) => ({
          id: item.id,
          impact: item.impact,
          nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
        }))
    })
    check(`mobile axe: step ${index + 1} ${step.id} has no serious/critical violations`, violations.length === 0, violations)
  }

  await page.close()
} catch (error) {
  console.error(error)
  failures.push(error instanceof Error ? error.message : String(error))
} finally {
  if (browser) await browser.close()
  if (server) await new Promise((resolve) => server.close(resolve))
  fs.writeFileSync(
    path.join(OUT, 'report.json'),
    `${JSON.stringify(
      {
        lessonId: chemistryLesson1.id,
        steps: chemistryLesson1.steps.length,
        stepIds: STEP_IDS,
        checks,
        failures,
      },
      null,
      2,
    )}\n`,
  )
}

console.log(
  `\n${checks.filter((item) => item.passed).length}/${checks.length} browser checks passed; ${failures.length} failures. Screenshots/report: ${path.relative(ROOT, OUT)}`,
)
if (failures.length) process.exit(1)
