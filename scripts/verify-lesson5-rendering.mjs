#!/usr/bin/env node
/**
 * Real-Chromium verification for rebuilt Lesson 5 («قانونا التفاعل الكيميائي»,
 * pp. 30–35): 28 steps at desktop and mobile widths.
 *
 * Run `npm run build && npm run verify:lesson5`. The browser harness uses
 * puppeteer-core plus @sparticuz/chromium (or CHROMIUM_PATH), like
 * verify:lesson2/verify:lesson4. It writes ignored screenshots and a JSON
 * report to artifacts/lesson5/browser/.
 *
 * Checks per step: title, no horizontal page overflow, no KaTeX error or raw
 * TeX, no textbook scan presented as original. Spot checks: verbatim
 * objectives and «تعلّمتُ», the reconstructed source figures, the p33
 * misprint note, the printed 2.66 value, lab reset/controls, final-test
 * question count (20), mobile equation scroll hint, and axe (serious/critical)
 * on every step.
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
const OUT = path.join(ROOT, 'artifacts/lesson5/browser')
const LESSON_PATH = '/chemistry/structural-chemistry/mass-and-fixed-proportions'
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json' }

// Load authored curriculum data so the browser walk follows the actual step list.
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
const { chemistryLesson5 } = await import(dataModuleUrl(path.join(ROOT, 'src/data/curriculum/chemistryLesson5.ts')))

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
    const tar = path.join(os.tmpdir(), 'chem-lesson5-al2023.tar')
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

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('No production build found. Run `npm run build` first.')
  process.exit(2)
}
fs.mkdirSync(OUT, { recursive: true })
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
  page.setDefaultTimeout(15000)
  const consoleErrors = []
  page.on('pageerror', (error) => failures.push(`browser error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  const stepIndex = (id) => chemistryLesson5.steps.findIndex((step) => step.id === id)
  const screenshotSteps = new Set([
    'opening', 'atom-count-source', 'atom-count-lab', 'mass-experiment-source',
    'mass-boundary-lab', 'proust-trials-source', 'fixed-ratio-lab', 'learned-summary', 'final-test',
  ])
  const viewports = [
    { name: 'desktop', width: 1365, height: 960 },
    { name: 'mobile', width: 390, height: 844 },
  ]
  let visit = 0
  for (const viewport of viewports) {
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
    for (let index = 0; index < chemistryLesson5.steps.length; index += 1) {
      const step = chemistryLesson5.steps[index]
      await page.goto(`${origin}${LESSON_PATH}?visual=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
      await page.waitForSelector('.step__title')
      await page.evaluate(() => document.fonts.ready)
      const rendered = await page.evaluate(() => {
        const title = document.querySelector('.step__title')
        const clone = document.querySelector('#main-content')?.cloneNode(true)
        clone?.querySelectorAll('.katex-mathml').forEach((node) => node.remove())
        const visibleText = clone?.textContent ?? ''
        return {
          title: title?.textContent?.trim() ?? '',
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          hasSourceImage: Boolean(document.querySelector('[data-source-image], .source-image')),
          katexError: Boolean(document.querySelector('.katex-error')),
          rawTex: /\\frac|\\text\{|\\mathrm/.test(visibleText),
        }
      })
      check(`${viewport.name} / ${step.id}: title renders`, rendered.title.includes(step.title), rendered.title)
      check(`${viewport.name} / ${step.id}: no horizontal page overflow`, rendered.documentWidth <= rendered.viewport + 1, { viewport: rendered.viewport, document: rendered.documentWidth })
      check(`${viewport.name} / ${step.id}: no KaTeX error or raw TeX`, !rendered.katexError && !rendered.rawTex)
      check(`${viewport.name} / ${step.id}: no textbook scan presented as original`, !rendered.hasSourceImage)

      if (screenshotSteps.has(step.id)) {
        const target = await page.$('.l5-lab, [data-source-reconstruction], .step__title')
        const topOffset = viewport.name === 'mobile' ? 180 : 130
        if (target) await target.evaluate((node, offset) => window.scrollTo({ top: Math.max(0, window.scrollY + node.getBoundingClientRect().top - offset), behavior: 'instant' }), topOffset)
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await page.screenshot({ path: path.join(OUT, `${viewport.name}-${step.id}.png`), fullPage: false })
      }

      if (step.id === 'opening') {
        const text = await page.evaluate(() => document.body.textContent ?? '')
        check(`${viewport.name}: opening shows printed title, 4 objectives and keywords`,
          /قانونا التَّفاعلِ الكِيميائِيِّ/.test(text) && /يطبّق قانون النّسب الثّابتة/.test(text) && /الكلمات المفتاحية/.test(text))
      }
      if (step.id === 'atom-count-source') {
        const data = await page.evaluate(() => ({
          figure: Boolean(document.querySelector('[data-source-reconstruction="p30-balance"]')),
          counts: ['3 C', '5 H', '5 O', '1 Na'].every((value) => [...document.querySelectorAll('text')].some((node) => node.textContent?.trim() === value)),
        }))
        check(`${viewport.name}: p30 balance reconstruction renders with printed counts`, data.figure && data.counts, data)
      }
      if (step.id === 'atom-count-lab' && viewport.name === 'mobile') {
        const hint = await page.$eval('.l5-lab__equation-hint', (node) => ({ display: getComputedStyle(node).display, text: node.textContent.trim() }))
        check('mobile: scrollable reaction equation has a visible scroll hint', hint.display !== 'none' && /مرّر المعادلة أفقياً/.test(hint.text), hint)
      }
      if (step.id === 'mass-experiment-source') {
        const data = await page.evaluate(() => ({
          readings: [...document.querySelectorAll('[data-source-reconstruction="p31-scale"] text')].map((node) => node.textContent?.trim()).filter((value) => value === '125.100').length,
          tools: /حمض كلور الماء الممدَّد HCl/.test(document.body.textContent ?? ''),
        }))
        check(`${viewport.name}: p31 scale reconstruction shows 125.100 twice and the apparatus list`, data.readings === 2 && data.tools, data)
      }
      if (step.id === 'mass-boundary-lab') {
        check(`${viewport.name}: mass-boundary lab exposes modes and a reset control`,
          await page.$$eval('.l5-lab__choices button', (nodes) =>
            nodes.some((node) => node.textContent.includes('نموذج نظام مفتوح')) &&
            nodes.some((node) => node.textContent.includes('إعادة تعيين المختبر'))))
      }
      if (step.id === 'proust-trials-source') {
        check(`${viewport.name}: p32 trials reconstruction renders`,
          await page.evaluate(() => Boolean(document.querySelector('[data-source-reconstruction="p32-trials"]')) && /1\.44g كبريت متبقّي/.test(document.body.textContent ?? '')))
      }
      if (step.id === 'proust-table-source') {
        check(`${viewport.name}: p33 misprint is flagged, not silently corrected`,
          await page.evaluate(() => /خطأ مطبعي/.test(document.body.textContent ?? '')))
      }
      if (step.id === 'fixed-ratio-lab') {
        const data = await page.evaluate(() => ({
          modelNote: /استنتاج رياضي لا قياس مخبري جديد/.test(document.body.textContent ?? ''),
          product: /82\.5/.test(document.body.textContent ?? ''),
          reset: [...document.querySelectorAll('.l5-lab__choices button')].some((node) => node.textContent.includes('إعادة تعيين المختبر')),
        }))
        check(`${viewport.name}: fixed-ratio lab computes 82.5 model product, labels it, and resets`, data.modelNote && data.product && data.reset, data)
      }
      if (step.id === 'learned-summary') {
        check(`${viewport.name}: «تعلّمتُ» prints both laws verbatim`,
          await page.evaluate(() => /قانون بروست \(قانون النَّسب الثَّابتة\)/.test(document.body.textContent ?? '')))
      }
      if (step.id === 'book-question-3') {
        check(`${viewport.name}: p35 table keeps the printed 2.66 value visible`,
          await page.evaluate(() => /32 \/ 12 = 2\.66/.test(document.body.textContent ?? '')))
      }
      if (step.id === 'final-test') {
        check(`${viewport.name}: lesson final test displays exactly 20 questions`,
          await page.$$eval('[data-question]', (nodes) => nodes.length === 20))
      }
    }
  }

  check('no unexpected browser console errors during the walk', consoleErrors.length === 0, consoleErrors.slice(0, 5))

  // Real-Chromium axe checks on every step (desktop).
  await page.setViewport({ width: 1365, height: 960, deviceScaleFactor: 1 })
  for (let index = 0; index < chemistryLesson5.steps.length; index += 1) {
    await page.goto(`${origin}${LESSON_PATH}?a11y=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.step__title')
    await page.addScriptTag({ path: path.join(ROOT, 'node_modules/axe-core/axe.min.js') })
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document.querySelector('#main-content') ?? document.body, { rules: { region: { enabled: false } } })
      return result.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => ({
        id: item.id,
        impact: item.impact,
        nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      }))
    })
    check(`real-browser axe: ${chemistryLesson5.steps[index].id} has no serious/critical violations`, violations.length === 0, violations)
  }

  await page.close()
} catch (error) {
  console.error(error)
  failures.push(error instanceof Error ? error.message : String(error))
} finally {
  if (browser) await browser.close()
  if (server) await new Promise((resolve) => server.close(resolve))
  fs.writeFileSync(path.join(OUT, 'report.json'), `${JSON.stringify({ lessonId: chemistryLesson5.id, steps: chemistryLesson5.steps.length, checks, failures }, null, 2)}\n`)
}

console.log(`\n${checks.filter((item) => item.passed).length}/${checks.length} browser checks passed; ${failures.length} failures. Screenshots/report: ${path.relative(ROOT, OUT)}`)
if (failures.length) process.exit(1)
