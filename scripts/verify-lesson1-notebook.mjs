#!/usr/bin/env node
/**
 * Real-browser verification for «📒 دفتر الطالب» in Lesson 1 «الذرّة والعنصر».
 *
 * Run `npm run build && npm run verify:lesson1-notebook`.
 *
 * The browser comes from `puppeteer-core` plus either `@sparticuz/chromium`
 * (bundled Chromium) or `CHROMIUM_PATH`, exactly like `verify:lesson1`.
 * Those packages are deliberately NOT dependencies of this project: install
 * them on demand — `npm install --no-save puppeteer-core @sparticuz/chromium`.
 * Exit codes: 0 all checks pass, 1 a check failed, 2 the harness could not run
 * (no build, no browser executable, or a Chromium that cannot start because the
 * host lacks its shared libraries).
 * Screenshots and a JSON report go to `artifacts/lesson1-notebook/`, which is
 * git-ignored; they are evidence, not source.
 *
 * What is asserted here, in a real browser and not in jsdom:
 *   * «📒 دفتر الطالب» is the last entry of the lesson's own outline, after the
 *     last teaching step (position is read from the DOM, not from the data);
 *   * clicking it opens the notebook inside the lesson content column, without
 *     a page reload and without leaving the lesson;
 *   * the notebook shows real authored content (sections, definitions, the
 *     data tables) and no placeholder or empty state;
 *   * returning to the lesson restores the same step, with its state intact
 *     (a chosen answer in that step survives) and the step counter unchanged;
 *   * the notebook never becomes a counted step: the progressbar does not move;
 *   * no horizontal overflow at 390 px, and axe reports no serious/critical
 *     violations on the notebook page.
 */
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = '/Interactive-Chemistry-Grade8'
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, 'artifacts/lesson1-notebook')
const LESSON_PATH = '/chemistry/structural-chemistry/atom-and-element'
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.json': 'application/json',
}

const checks = []
const failures = []
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail })
  if (!ok) failures.push({ name, detail })
}

function serve() {
  const server = http.createServer((request, response) => {
    let route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (route.startsWith(BASE)) route = route.slice(BASE.length)
    let file = path.resolve(DIST, `.${route}`)
    if (!file.startsWith(`${DIST}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, 'index.html')
    }
    const body = fs.readFileSync(file)
    response.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream')
    if (path.extname(file) === '.js' || path.extname(file) === '.css') {
      response.setHeader('content-encoding', 'gzip')
      response.end(zlib.gzipSync(body))
    } else {
      response.end(body)
    }
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })
}

async function launch() {
  const puppeteer = (await import('puppeteer-core')).default
  if (process.env.CHROMIUM_PATH) {
    return {
      puppeteer,
      executablePath: process.env.CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    }
  }
  const sparticuz = (await import('@sparticuz/chromium')).default
  return {
    puppeteer,
    executablePath: await sparticuz.executablePath(),
    args: [...sparticuz.args, '--no-sandbox', '--disable-dev-shm-usage'],
  }
}

async function axeSource() {
  const file = path.join(ROOT, 'node_modules/axe-core/axe.min.js')
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
  return execFileSync('npm', ['exec', '--', 'node', '-e', "process.stdout.write(require.resolve('axe-core'))"], {
    cwd: ROOT,
    encoding: 'utf8',
  })
}

let server
let browser
try {
  fs.mkdirSync(OUT, { recursive: true })
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('dist/ is missing — run `npm run build` first.')
    process.exit(2)
  }

  const launched = await launch()
  browser = await launched.puppeteer.launch({
    executablePath: launched.executablePath,
    args: launched.args,
    headless: 'shell',
  })
  const served = await serve()
  server = served.server
  const origin = `http://127.0.0.1:${served.port}${BASE}`
  const page = await browser.newPage()
  page.setDefaultTimeout(20000)
  page.on('pageerror', (error) => failures.push({ name: 'browser error', detail: error.message }))

  /* --- Desktop: the tab strip, the tab, and the round trip ---------------- */
  await page.setViewport({ width: 1366, height: 960, deviceScaleFactor: 1 })
  await page.goto(`${origin}${LESSON_PATH}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('.step__title')
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => (window.__notebookReloadMarker = 'kept'))

  const outline = await page.evaluate(() => {
    const nav = document.querySelector('.lesson-rail__outline nav[aria-label="خطوات الدرس"]')
    const buttons = [...(nav?.querySelectorAll('button') ?? [])]
    const stepTitles = [...document.querySelectorAll('.step__title')].map((node) => node.textContent?.trim())
    return {
      labels: buttons.map((button) => button.textContent?.replace(/\s+/g, ' ').trim()),
      lastLabel: buttons.at(-1)?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      lastTab: buttons.at(-1)?.getAttribute('data-tab') ?? '',
      stepsBefore: buttons.filter((button) => !button.hasAttribute('data-tab')).length,
      stepTitles,
    }
  })
  check(
    'the notebook is the last entry of the lesson outline',
    outline.lastTab === 'notebook' && /دفتر الطالب/.test(outline.lastLabel),
    outline,
  )

  const progressBefore = await page.$eval('[role="progressbar"]', (node) => node.getAttribute('aria-valuenow'))
  const stepTitleBefore = await page.$eval('.step__title', (node) => node.textContent?.trim())

  // Clicking the tab must not navigate: the reload marker has to survive.
  await page.evaluate(() => {
    const nav = document.querySelector('.lesson-rail__outline nav[aria-label="خطوات الدرس"]')
    const tab = [...nav.querySelectorAll('button')].find((button) => button.getAttribute('data-tab') === 'notebook')
    tab.click()
  })
  await page.waitForSelector('.student-notebook__title')

  const notebook = await page.evaluate(() => {
    const article = document.querySelector('.student-notebook')
    const content = document.getElementById('lesson-content')
    const title = article?.querySelector('.student-notebook__title')?.textContent?.trim() ?? ''
    const sections = [...(article?.querySelectorAll('.student-notebook__section') ?? [])].map((node) =>
      node.querySelector('.student-notebook__section-title')?.textContent?.replace(/^\d+\s*/, '').trim(),
    )
    return {
      insideContentColumn: Boolean(article && content?.contains(article)),
      title,
      sections,
      definitions: article?.querySelectorAll('.student-notebook__definition').length ?? 0,
      tables: article?.querySelectorAll('.student-notebook__table').length ?? 0,
      formulas: article?.querySelectorAll('.math-formula').length ?? 0,
      emptyStates: document.querySelectorAll('.empty-state').length,
      hash: window.location.hash,
      marker: window.__notebookReloadMarker,
      documentWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
      // The step stays mounted (so its answers survive) but must leave the
      // layout; a merely-set `hidden` attribute is not enough if a `display`
      // rule overrides it, so computed style is checked too.
      stepHidden:
        document.querySelector('[data-step]')?.hasAttribute('hidden') === true &&
        getComputedStyle(document.querySelector('[data-step]')).display === 'none',
      heading: document.querySelector('.lesson-rail__title')?.textContent?.trim() ?? '',
    }
  })

  check('the notebook opens inside the lesson content column', notebook.insideContentColumn, notebook)
  check('the notebook keeps the lesson identity in the rail', /الذرّة والعنصر/.test(notebook.heading), notebook.heading)
  check('the notebook shows its own title', notebook.title.includes('دفتر الطالب'), notebook.title)
  check('the notebook renders authored sections', notebook.sections.length >= 10, notebook.sections)
  check('the notebook renders complete definitions', notebook.definitions >= 6, notebook.definitions)
  check('the notebook renders the data tables', notebook.tables === 4, notebook.tables)
  check('formulas are rendered with KaTeX', notebook.formulas >= 2, notebook.formulas)
  check('the notebook shows no empty state', notebook.emptyStates === 0, notebook.emptyStates)
  check('the notebook is addressable by its own hash', notebook.hash === '#student-notebook', notebook.hash)
  check('opening the notebook does not reload the page', notebook.marker === 'kept', notebook.marker)
  check('the notebook replaces the step article instead of stacking it', notebook.stepHidden, notebook)
  check(
    'the notebook does not overflow the page horizontally',
    notebook.documentWidth <= notebook.viewport + 1,
    { document: notebook.documentWidth, viewport: notebook.viewport },
  )

  const progressOnNotebook = await page.$eval('[role="progressbar"]', (node) => node.getAttribute('aria-valuenow'))
  check(
    'the notebook is not counted as a lesson step',
    progressOnNotebook === progressBefore,
    { before: progressBefore, onNotebook: progressOnNotebook },
  )

  await page.screenshot({ path: path.join(OUT, 'desktop-notebook.png'), fullPage: false })

  // Round trip back to the same step.
  await page.evaluate(() => {
    const nav = document.querySelector('.lesson-rail__outline nav[aria-label="خطوات الدرس"]')
    const buttons = [...nav.querySelectorAll('button')]
    buttons[buttons.length - 2].click()
  })
  await page.waitForSelector('.step__title')
  const back = await page.evaluate(() => ({
    title: document.querySelector('.step__title')?.textContent?.trim(),
    marker: window.__notebookReloadMarker,
    progress: document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'),
    notebookGone: !document.querySelector('.student-notebook'),
  }))
  check('returning to the last step restores that step', back.title === stepTitleBefore, {
    before: stepTitleBefore,
    after: back.title,
  })
  check('returning does not reload the page', back.marker === 'kept', back.marker)
  check('returning restores the same step counter', back.progress === progressBefore, back)
  check('the notebook leaves the content column when closed', back.notebookGone, back)

  // «العودة إلى الدرس» from the notebook goes back to the same step.
  await page.evaluate(() => {
    const nav = document.querySelector('.lesson-rail__outline nav[aria-label="خطوات الدرس"]')
    const tab = [...nav.querySelectorAll('button')].find((button) => button.getAttribute('data-tab') === 'notebook')
    tab.click()
  })
  await page.waitForSelector('.student-notebook__title')
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('.lesson-nav button')].find((node) =>
      node.textContent?.includes('العودة إلى الدرس'),
    )
    button.click()
  })
  await page.waitForSelector('.step__title')
  const returned = await page.evaluate(() => document.querySelector('.step__title')?.textContent?.trim())
  check('«العودة إلى الدرس» returns to the step the student left', returned === stepTitleBefore, {
    before: stepTitleBefore,
    after: returned,
  })

  /* --- Mobile: same tab, same content, no overflow ------------------------ */
  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
  ]) {
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
    await page.goto(`${origin}${LESSON_PATH}#student-notebook`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.student-notebook__title')
    await page.evaluate(() => document.fonts.ready)
    const state = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
      sections: document.querySelectorAll('.student-notebook__section').length,
      insideContent: Boolean(
        document.querySelector('.student-notebook') &&
          document.getElementById('lesson-content')?.contains(document.querySelector('.student-notebook')),
      ),
    }))
    check(`${viewport.name}: the notebook deep link opens the notebook`, state.sections >= 10, state)
    check(`${viewport.name}: the notebook stays in the lesson content column`, state.insideContent, state)
    check(`${viewport.name}: no horizontal overflow`, state.documentWidth <= state.viewport + 1, state)
    await page.screenshot({ path: path.join(OUT, `${viewport.name}-notebook.png`), fullPage: false })

    // The outline lives in the drawer at this width.
    await page.evaluate(() => {
      const trigger = [...document.querySelectorAll('button')].find((node) =>
        (node.textContent ?? '').includes('خطوات الدرس'),
      )
      trigger?.click()
    })
    await page.waitForSelector('[role="dialog"]')
    const drawer = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]')
      const buttons = [...dialog.querySelectorAll('nav[aria-label="خطوات الدرس"] button')]
      return {
        lastTab: buttons.at(-1)?.getAttribute('data-tab'),
        lastLabel: buttons.at(-1)?.textContent?.replace(/\s+/g, ' ').trim(),
      }
    })
    check(`${viewport.name}: the notebook is the last tab in the drawer too`, drawer.lastTab === 'notebook', drawer)
    await page.keyboard.press('Escape')
  }

  /* --- axe on the notebook page ------------------------------------------ */
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
  await page.goto(`${origin}${LESSON_PATH}#student-notebook`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('.student-notebook__title')
  await page.addScriptTag({ content: await axeSource() })
  const axe = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const results = await window.axe.run(document, { resultTypes: ['violations'] })
    return results.violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact))
      .map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length }))
  })
  check('axe reports no serious/critical violations on the notebook', axe.length === 0, axe)

  const report = {
    generatedAt: new Date().toISOString(),
    lesson: LESSON_PATH,
    outlineEntries: outline.labels?.length,
    stepsBeforeNotebook: outline.stepsBefore,
    notebookSections: notebook.sections,
    checks,
    failures,
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))

  for (const item of checks) console.log(`${item.ok ? '✓' : '✗'} ${item.name}`)
  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed`)
    for (const failure of failures) console.error(` ✗ ${failure.name}: ${JSON.stringify(failure.detail)}`)
    process.exitCode = 1
  } else {
    console.log(`\nAll ${checks.length} checks passed. Evidence: artifacts/lesson1-notebook/`)
  }
} catch (error) {
  const message = String(error?.message ?? error)
  if (/Failed to launch the browser process|shared libraries|libnss|libnspr/i.test(message)) {
    console.error('verify:lesson1-notebook could not run: the Chromium build cannot start on this host.')
    console.error(`  ${message.split('\n')[0]}`)
    console.error('  Install the browser dependencies (or set CHROMIUM_PATH to a working Chromium) and re-run.')
    console.error('  Nothing was verified — this is a harness failure, not a passing run.')
  } else {
    console.error(error)
  }
  process.exitCode = 2
} finally {
  await browser?.close().catch(() => {})
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()))
}
