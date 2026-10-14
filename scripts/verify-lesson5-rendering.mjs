#!/usr/bin/env node
/**
 * Real-Chromium responsive and visual QA for the fifth chemistry lesson.
 *
 * Run `npm run build && npm run verify:lesson5`. The optional browser harness
 * uses puppeteer-core plus @sparticuz/chromium (or CHROMIUM_PATH), just like
 * verify:badges and verify:lesson4. It writes ignored screenshots and a JSON
 * report to artifacts/lesson5/browser/; it does not claim to compare against
 * unavailable textbook scan pixels.
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
  page.setDefaultTimeout(10000)
  page.on('pageerror', (error) => failures.push(`browser error: ${error.message}`))

  const selected = new Set([0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11])
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
        const root = document.documentElement
        return {
          title: title?.textContent?.trim() ?? '',
          viewport: innerWidth,
          documentWidth: root.scrollWidth,
          mainWidth: document.querySelector('#main-content')?.scrollWidth ?? null,
          hasSourceImage: Boolean(document.querySelector('[data-source-image], .source-image')),
        }
      })
      check(`${viewport.name} / step ${index + 1}: title renders`, rendered.title.includes(step.title), rendered.title)
      check(`${viewport.name} / step ${index + 1}: no horizontal page overflow`, rendered.documentWidth <= rendered.viewport + 1, { viewport: rendered.viewport, document: rendered.documentWidth, main: rendered.mainWidth })
      check(`${viewport.name} / step ${index + 1}: no textbook scan is presented as original`, !rendered.hasSourceImage)
      if (index === 0 && viewport.name === 'mobile') {
        const hint = await page.$eval('.l5-lab__equation-hint', (node) => ({ display: getComputedStyle(node).display, text: node.textContent.trim() }))
        check('mobile: the horizontally scrollable reaction equation has a visible scroll hint', hint.display !== 'none' && /مرّر المعادلة أفقياً/.test(hint.text), hint)
      }

      if (selected.has(index)) {
        const targetSelector = index === 3 ? '[data-diagram-surface]' : [0, 4, 8].includes(index) ? '.l5-lab' : '.step__title'
        const target = await page.$(targetSelector)
        const topOffset = viewport.name === 'mobile' ? 180 : 130
        if (target) await target.evaluate((node, offset) => window.scrollTo({ top: Math.max(0, window.scrollY + node.getBoundingClientRect().top - offset), behavior: 'instant' }), topOffset)
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await page.screenshot({ path: path.join(OUT, `${viewport.name}-step-${String(index + 1).padStart(2, '0')}.png`), fullPage: false })
      }

      if (index === 3) {
        const data = await page.evaluate(() => ({
          readings: [...document.querySelectorAll('[data-diagram-svg] text')].map((node) => node.textContent?.trim()).filter((text) => text === '125.100').length,
          sourceLabel: document.querySelector('.diagram__source')?.textContent ?? '',
          caption: document.querySelector('.diagram__caption')?.textContent ?? '',
        }))
        check(`${viewport.name}: p32 source data is reproduced twice and labeled as a platform redraw`, data.readings === 2 && /رسم تعليمي من المنصة/.test(data.sourceLabel) && /لا تُنسب القراءة إلى النموذج/.test(data.caption), data)
      }
      if (index === 4) {
        check(`${viewport.name}: closed/open mass-boundary controls render`, await page.$$eval('.l5-lab__choices button', (nodes) => nodes.some((node) => node.textContent.includes('نموذج نظام مغلق')) && nodes.some((node) => node.textContent.includes('نموذج نظام مفتوح'))))
      }
      if (index === 8) {
        check(`${viewport.name}: the fixed-ratio model distinguishes book data from calculation`, await page.evaluate(() => /استنتاج رياضي لا قياس مخبري جديد/.test(document.body.textContent ?? '') && /82\.5/.test(document.body.textContent ?? '')))
        const ratioVisual = await page.evaluate(() => {
          const ratio = document.querySelector('.l5-lab__status .sci')
          const svg = document.querySelector('.l5-lab .diagram__svg')
          const labels = [...(svg?.querySelectorAll('text[direction="rtl"]') ?? [])].map((node) => {
            const box = node.getBBox()
            return { text: node.textContent?.trim(), x: box.x, right: box.x + box.width, renderedHeight: node.getBoundingClientRect().height }
          })
          return { value: ratio?.textContent?.trim(), direction: ratio?.getAttribute('dir'), viewBox: svg?.getAttribute('viewBox'), width: svg?.getBoundingClientRect().width, labels }
        })
        check(`${viewport.name}: source ratio order and bar labels stay legible/in bounds`, ratioVisual.value === '56 : 32' && ratioVisual.direction === 'ltr' && ratioVisual.viewBox === '0 0 400 220' && ratioVisual.labels.length === 2 && ratioVisual.labels[0].text === 'الحديد' && ratioVisual.labels[1].text === 'الكبريت' && ratioVisual.labels.every((box) => box.x >= 0 && box.right <= 400 && box.renderedHeight >= 11) && (viewport.name !== 'desktop' || ratioVisual.width <= 621), ratioVisual)
      }
      if (index === 11) {
        check(`${viewport.name}: lesson final test displays exactly 16 questions`, await page.$$eval('[data-question]', (nodes) => nodes.length === 16))
      }
    }
  }

  // Real Chromium axe checks supplement the jsdom accessibility tests.
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
    check(`real-browser axe: step ${index + 1} has no serious/critical violations`, violations.length === 0, violations)
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

console.log(`\n${checks.filter((item) => item.passed).length}/${checks.length} visual checks passed; ${failures.length} failures. Screenshots/report: ${path.relative(ROOT, OUT)}`)
if (failures.length) process.exit(1)
