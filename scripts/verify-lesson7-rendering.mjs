#!/usr/bin/env node
/**
 * Real-Chromium verification for Lesson 7 («الحساب الكيميائيّ», pp.40–49).
 * Walks all 33 steps at desktop/tablet/mobile, checks the four original figure
 * crops actually load, exercises both platform labs, checks Teacher Area tab 7,
 * reduced motion, and runs axe-core on every step at desktop width.
 *
 * Run: npm run build && npm run verify:lesson7
 * Writes ignored screenshots + JSON to artifacts/lesson7/browser/.
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
const OUT = path.join(ROOT, 'artifacts/lesson7/browser')
const LESSON_PATH = '/chemistry/structural-chemistry/chemical-calculations'
const TEACHER_PASSWORD = fs.readFileSync(path.join(ROOT, 'src/teacher/teacherAccess.ts'), 'utf8').match(/TEACHER_PASSWORD = '([^']+)'/)[1]
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json' }

const dataModules = new Map()
function dataModuleUrl(file) {
  const absolute = path.resolve(file)
  if (dataModules.has(absolute)) return dataModules.get(absolute)
  if (absolute.endsWith('.png')) {
    const url = `data:text/javascript;base64,${Buffer.from(`export default ${JSON.stringify(`data:image/png;base64,${fs.readFileSync(absolute).toString('base64')}`)}`).toString('base64')}`
    dataModules.set(absolute, url)
    return url
  }
  const source = fs.readFileSync(absolute, 'utf8')
  let output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: false } }).outputText
  output = output.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_, quote, dependency) => {
    const base = path.resolve(path.dirname(absolute), dependency)
    const next = fs.existsSync(`${base}.ts`) ? `${base}.ts` : base
    return `from ${quote}${dataModuleUrl(next)}${quote}`
  })
  const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
  dataModules.set(absolute, url)
  return url
}
const { chemistryLesson7 } = await import(dataModuleUrl(path.join(ROOT, 'src/data/curriculum/chemistryLesson7.ts')))

function serve() {
  const server = http.createServer((request, response) => {
    let route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (route.startsWith(BASE)) route = route.slice(BASE.length)
    let file = path.resolve(DIST, `.${route}`)
    if (!file.startsWith(`${DIST}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html')
    response.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream')
    fs.createReadStream(file).on('error', () => { response.statusCode = 404; response.end() }).pipe(response)
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
    const tar = path.join(os.tmpdir(), 'chem-lesson7-al2023.tar')
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
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error('No production build found. Run `npm run build` first.'); process.exit(2) }
fs.mkdirSync(OUT, { recursive: true })
const IMAGE_STEPS = new Set(['p40-entry', 'p41-balance-source', 'p44-gas-observations-source', 'p46-enrichment-source'])
const LAB_STEPS = { 'molar-mass-lab': 'lesson7-molar-mass-lab', 'molar-volume-lab': 'lesson7-molar-volume-lab' }
const SCREENSHOT_STEPS = new Set(['p40-entry', 'p41-balance-source', 'p43-table-source', 'p44-gas-observations-source', 'molar-mass-lab', 'molar-volume-lab', 'p46-iron-solution-source', 'p49-methane-source', 'final-test'])
let browser
let server
try {
  const config = await browserConfig()
  const env = { ...process.env, ...(config.libraries ? { LD_LIBRARY_PATH: [config.libraries, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } : {}) }
  browser = await config.puppeteer.launch({ executablePath: config.executablePath, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], env })
  const served = await serve()
  server = served.server
  const origin = `http://127.0.0.1:${served.port}${BASE}`
  const page = await browser.newPage()
  page.setDefaultTimeout(20000)
  const consoleErrors = []
  page.on('pageerror', (error) => failures.push(`browser error: ${error.message}`))
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  const viewports = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'tablet', width: 768, height: 1024 }, { name: 'mobile', width: 390, height: 844 }]
  const normaliseScripts = (value) => value.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (ch) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(ch)))
  let visit = 0
  for (const viewport of viewports) {
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
    for (let index = 0; index < chemistryLesson7.steps.length; index += 1) {
      const step = chemistryLesson7.steps[index]
      await page.goto(`${origin}${LESSON_PATH}?visual=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
      await page.waitForSelector('.step__title')
      if (LAB_STEPS[step.id]) await page.waitForSelector(`[data-interactive="${LAB_STEPS[step.id]}"] [data-lab]`)
      await page.evaluate(() => document.fonts.ready)
      if (IMAGE_STEPS.has(step.id)) {
        await page.waitForSelector('.source-image img')
        await page.evaluate(() => document.querySelector('.source-image img')?.scrollIntoView({ block: 'center' }))
        await page.waitForFunction(() => { const img = document.querySelector('.source-image img'); return img && img.complete && img.naturalWidth > 0 })
      }
      const rendered = await page.evaluate(() => {
        const clone = document.querySelector('#main-content')?.cloneNode(true)
        clone?.querySelectorAll('.katex-mathml').forEach((node) => node.remove())
        const visibleText = clone?.textContent ?? ''
        const img = document.querySelector('.source-image img')
        return { title: document.querySelector('.step__title')?.textContent?.trim() ?? '', viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, katexError: Boolean(document.querySelector('.katex-error, [data-math-error]')), rawTex: /\\frac|\\text\{|\\mathrm|\\longrightarrow|\\xrightarrow/.test(visibleText), imageLoaded: img ? img.complete && img.naturalWidth > 0 : null, imageWidth: img?.naturalWidth ?? 0 }
      })
      check(`${viewport.name} / ${step.id}: title renders`, normaliseScripts(rendered.title).includes(normaliseScripts(step.title)), rendered.title)
      check(`${viewport.name} / ${step.id}: no horizontal page overflow`, rendered.documentWidth <= rendered.viewport + 1, { viewport: rendered.viewport, document: rendered.documentWidth })
      check(`${viewport.name} / ${step.id}: no KaTeX error or raw TeX`, !rendered.katexError && !rendered.rawTex)
      if (IMAGE_STEPS.has(step.id)) check(`${viewport.name} / ${step.id}: original figure crop loads`, rendered.imageLoaded === true, { width: rendered.imageWidth })
      if (step.id === 'p41-balance-source') check(`${viewport.name}: deferred white label warning is visible`, await page.evaluate(() => /التسمية البيضاء المتداخلة غير معتمدة/.test(document.body.textContent ?? '')))
      if (step.id === 'p49-air-review') check(`${viewport.name}: 21% is explicitly a platform assumption`, await page.evaluate(() => /ليست معطى مطبوعاً في ص49/.test(document.body.textContent ?? '')))
      if (step.id === 'final-test') check(`${viewport.name}: final test renders 20 questions`, (await page.$$('[data-question]')).length === 20)
      if (SCREENSHOT_STEPS.has(step.id)) {
        await page.evaluate(() => document.querySelector('.step__title')?.scrollIntoView({ block: 'start' }))
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await page.screenshot({ path: path.join(OUT, `${viewport.name}-${step.id}.png`), fullPage: false })
      }
    }
    if (viewport.name !== 'tablet') {
      await page.goto(`${origin}/teacher/book-solutions?lesson=chem-u1-l7&v=${++visit}`, { waitUntil: 'networkidle0' })
      const pwInput = await page.$('input[type="password"]')
      if (pwInput) {
        await page.type('input[type="password"]', TEACHER_PASSWORD)
        await page.evaluate(() => [...document.querySelectorAll('button')].find((button) => button.textContent?.includes('دخول مساحة المعلم'))?.click())
      }
      await page.waitForSelector('.teacher-answer')
      const teacher = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, tabs: document.querySelectorAll('.teacher-lesson-tab').length, answers: document.querySelectorAll('.teacher-answer').length, guide: Boolean(document.querySelector('.teacher-concept-guide')), katexError: Boolean(document.querySelector('.katex-error')) }))
      check(`${viewport.name}: Teacher tab 7 has guide and 41 book solutions`, teacher.tabs === 7 && teacher.guide && teacher.answers === 41, teacher)
      check(`${viewport.name}: Teacher book solutions has no overflow or KaTeX error`, teacher.documentWidth <= teacher.viewport + 1 && !teacher.katexError, teacher)
      await page.screenshot({ path: path.join(OUT, `${viewport.name}-teacher-book.png`), fullPage: false })
      await page.goto(`${origin}/teacher/final-test-solutions?lesson=chem-u1-l7&v=${++visit}`, { waitUntil: 'networkidle0' })
      await page.waitForSelector('.teacher-answer')
      const finalTeacher = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, answers: document.querySelectorAll('.teacher-answer').length, katexError: Boolean(document.querySelector('.katex-error')) }))
      check(`${viewport.name}: Teacher final-test solutions render all 20`, finalTeacher.answers === 20 && finalTeacher.documentWidth <= finalTeacher.viewport + 1 && !finalTeacher.katexError, finalTeacher)
    }
  }
  // Exercise both labs with real clicks at desktop and mobile.
  for (const width of [1440, 390]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
    for (const [stepId, interactiveId] of Object.entries(LAB_STEPS)) {
      const index = chemistryLesson7.steps.findIndex((step) => step.id === stepId)
      await page.goto(`${origin}${LESSON_PATH}?lab=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
      await page.waitForSelector(`[data-interactive="${interactiveId}"] [data-lab]`)
      await page.evaluate(() => [...document.querySelectorAll('[data-lab] button')].find((button) => /احسب/.test(button.textContent ?? ''))?.click())
      await page.waitForSelector('[data-lab] .l7-lab__result')
      const lab = await page.evaluate(() => ({ readings: Boolean(document.querySelector('[data-lab] .l7-lab__result')), conclusion: /الاستنتاج/.test(document.querySelector('[data-lab]')?.textContent ?? ''), documentWidth: document.documentElement.scrollWidth, viewport: innerWidth }))
      check(`${width}px / ${stepId}: action produces readings and conclusion`, lab.readings && lab.conclusion && lab.documentWidth <= lab.viewport + 1, lab)
      await page.screenshot({ path: path.join(OUT, `${width}-${stepId}-calculated.png`), fullPage: false })
    }
  }
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const volumeIndex = chemistryLesson7.steps.findIndex((step) => step.id === 'molar-volume-lab')
  await page.goto(`${origin}${LESSON_PATH}?rm=${++visit}#step-${volumeIndex + 1}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-lab="molar-volume"]')
  check('prefers-reduced-motion disables gas transition', await page.evaluate(() => getComputedStyle(document.querySelector('.l7-lab__gas')).transitionDuration === '0s'))
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])
  check('no unexpected browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5))
  // axe-core on every step at desktop.
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  const axeSource = fs.readFileSync(path.join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8')
  for (let index = 0; index < chemistryLesson7.steps.length; index += 1) {
    const step = chemistryLesson7.steps[index]
    await page.goto(`${origin}${LESSON_PATH}?a11y=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.step__title')
    if (LAB_STEPS[step.id]) await page.waitForSelector(`[data-interactive="${LAB_STEPS[step.id]}"] [data-lab]`)
    await page.evaluate(axeSource)
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact)).map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })))
    check(`axe / ${step.id}: no serious or critical violations`, violations.length === 0, violations)
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error))
  console.error(error)
} finally {
  await browser?.close()
  await new Promise((resolve) => server ? server.close(resolve) : resolve())
  const report = { lessonId: 'chem-u1-l7', steps: chemistryLesson7.steps.length, checks: checks.length, passed: checks.filter((entry) => entry.passed).length, failed: failures.length, failures, results: checks }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`\nLesson 7 browser verification: ${report.passed}/${report.checks} checks passed; ${report.failed} failed.`)
  process.exitCode = failures.length ? 1 : 0
}
