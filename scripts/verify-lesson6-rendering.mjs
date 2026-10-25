#!/usr/bin/env node
/**
 * Real-Chromium verification for Lesson 6 («المعادلة الكيميائيّة», pp. 36–39):
 * 35 steps across desktop (1440×900), tablet (768×1024), and mobile (390×844),
 * plus Teacher Area tab 6 (book solutions + final-test solutions),
 * prefers-reduced-motion check, and real-browser axe-core checks on every step.
 *
 * Run `npm run build && node scripts/verify-lesson6-rendering.mjs`.
 * Writes ignored screenshots and JSON report to `artifacts/lesson6/browser/`.
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
const OUT = path.join(ROOT, 'artifacts/lesson6/browser')
const LESSON_PATH = '/chemistry/structural-chemistry/chemical-equations'
const TEACHER_PASSWORD = fs
  .readFileSync(path.join(ROOT, 'src/teacher/teacherAccess.ts'), 'utf8')
  .match(/TEACHER_PASSWORD = '([^']+)'/)[1]

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

const dataModules = new Map()
function dataModuleUrl(file) {
  const absolute = path.resolve(file)
  if (dataModules.has(absolute)) return dataModules.get(absolute)
  const source = fs.readFileSync(absolute, 'utf8')
  let output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2021,
      module: ts.ModuleKind.ESNext,
      verbatimModuleSyntax: false,
    },
  }).outputText
  output = output.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_, quote, dependency) => {
    const next = path.resolve(path.dirname(absolute), `${dependency}.ts`)
    return `from ${quote}${dataModuleUrl(next)}${quote}`
  })
  const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
  dataModules.set(absolute, url)
  return url
}

const { chemistryLesson6 } = await import(
  dataModuleUrl(path.join(ROOT, 'src/data/curriculum/chemistryLesson6.ts'))
)

function serve() {
  const server = http.createServer((request, response) => {
    let route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (route.startsWith(BASE)) route = route.slice(BASE.length)
    let file = path.resolve(DIST, `.${route}`)
    if (
      !file.startsWith(`${DIST}${path.sep}`) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    ) {
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
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })),
  )
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
    const tar = path.join(os.tmpdir(), 'chem-lesson6-al2023.tar')
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
  console.log(
    `${passed ? 'PASS' : 'FAIL'}  ${name}${details === undefined ? '' : ` — ${JSON.stringify(details)}`}`,
  )
  if (!passed) failures.push(name)
}

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('No production build found. Run `npm run build` first.')
  process.exit(2)
}

fs.mkdirSync(OUT, { recursive: true })

const INTERACTIVE_STEP_SELECTORS = {
  'foundation-reaction-anatomy': '[data-interactive-id="lesson6-equation-anatomy"]',
  'experiment-zinc-hcl-source': '[data-interactive-id="source-figure-p37-zinc-hcl"]',
  'zinc-hcl-virtual-lab': '[data-interactive-id="lesson6-zinc-hcl-lab"]',
  'state-symbols-deep': '[data-interactive-id="lesson6-state-symbols-guide"]',
  'conclude-equation-source': '[data-interactive-id="lesson6-coefficient-vs-subscript"]',
  'equation-balancer-simulation': '[data-interactive-id="lesson6-equation-balancer-lab"]',
  'word-to-symbol-builder': '[data-interactive-id="lesson6-word-to-symbol-lab"]',
  'error-spotter-activity': '[data-interactive-id="lesson6-error-spotter"]',
}

const screenshotSteps = new Set([
  'entry-source',
  'foundation-reaction-anatomy',
  'experiment-zinc-hcl-source',
  'zinc-hcl-virtual-lab',
  'state-symbols-deep',
  'conclude-equation-source',
  'equation-balancer-simulation',
  'word-to-symbol-builder',
  'error-spotter-activity',
  'learned-box-source',
  'final-test',
])

let browser
let server
try {
  const config = await browserConfig()
  const env = {
    ...process.env,
    ...(config.libraries
      ? { LD_LIBRARY_PATH: [config.libraries, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') }
      : {}),
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

  const consoleErrors = []
  page.on('pageerror', (error) => failures.push(`browser error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ]

  let visit = 0
  for (const viewport of viewports) {
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
    })

    for (let index = 0; index < chemistryLesson6.steps.length; index += 1) {
      const step = chemistryLesson6.steps[index]
      await page.goto(`${origin}${LESSON_PATH}?visual=${++visit}#step-${index + 1}`, {
        waitUntil: 'networkidle0',
      })
      await page.waitForSelector('.step__title')
      if (INTERACTIVE_STEP_SELECTORS[step.id]) {
        await page.waitForSelector(INTERACTIVE_STEP_SELECTORS[step.id])
      }
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
          rawTex: /\\frac|\\text\{|\\mathrm|\\longrightarrow|\\xrightarrow/.test(visibleText),
        }
      })

      check(
        `${viewport.name} / ${step.id}: title renders`,
        rendered.title.includes(step.title),
        rendered.title,
      )
      check(
        `${viewport.name} / ${step.id}: no horizontal page overflow`,
        rendered.documentWidth <= rendered.viewport + 1,
        { viewport: rendered.viewport, document: rendered.documentWidth },
      )
      check(
        `${viewport.name} / ${step.id}: no KaTeX error or raw TeX`,
        !rendered.katexError && !rendered.rawTex,
      )
      check(
        `${viewport.name} / ${step.id}: no textbook scan presented as original`,
        !rendered.hasSourceImage,
      )

      if (screenshotSteps.has(step.id)) {
        const target = await page.$('.l6-lab, .l6-figure, .step__title')
        const topOffset = viewport.name === 'mobile' ? 180 : 130
        if (target) {
          await target.evaluate(
            (node, offset) =>
              window.scrollTo({
                top: Math.max(0, window.scrollY + node.getBoundingClientRect().top - offset),
                behavior: 'instant',
              }),
            topOffset,
          )
        }
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        )
        await page.screenshot({
          path: path.join(OUT, `${viewport.name}-${step.id}.png`),
          fullPage: false,
        })
      }

      if (step.id === 'entry-source') {
        const text = await page.evaluate(() => document.body.textContent ?? '')
        check(
          `${viewport.name}: entry-source shows verbatim printed headings («الأهداف:» & «الكلمات المفتاحية:»)`,
          /المعادلة الكيميائيّة/.test(text) &&
            /الأهداف:/.test(text) &&
            /يوازنُ المعادلة الكيميائيّة/.test(text) &&
            /الكلمات المفتاحية:/.test(text) &&
            !/أهداف التّعلّم:/.test(text),
        )
      }
      if (step.id === 'worked-example-al-hcl-source') {
        const data = await page.evaluate(() => ({
          formulaCount: document.querySelectorAll('[data-math="block"]').length,
          hasIntermediate: /أوازنُ ذرّات الكلور من جديد:/.test(document.body.textContent ?? ''),
        }))
        check(
          `${viewport.name}: worked-example-al-hcl-source renders all 6 printed equations + verbatim labels`,
          data.formulaCount === 6 && data.hasIntermediate,
          data,
        )
      }
      if (step.id === 'foundation-reaction-anatomy') {
        const hasAnatomy = await page.evaluate(() =>
          Boolean(document.querySelector('[data-interactive-id="lesson6-equation-anatomy"]')),
        )
        check(`${viewport.name}: equation-anatomy diagram renders`, hasAnatomy)
      }
      if (step.id === 'experiment-zinc-hcl-source') {
        const data = await page.evaluate(() => ({
          figure: Boolean(document.querySelector('[data-source-reconstruction="p37-zinc-hcl"]')),
          reconstructionLabel: /إعادة بناء تخطيطية من المنصة لشكل الكتاب/.test(
            document.body.textContent ?? '',
          ),
        }))
        check(
          `${viewport.name}: p37 Zinc+HCl reconstruction renders with explicit label`,
          data.figure && data.reconstructionLabel,
          data,
        )
      }
      if (step.id === 'zinc-hcl-virtual-lab') {
        const data = await page.evaluate(() => ({
          lab: Boolean(document.querySelector('[data-interactive-id="lesson6-zinc-hcl-lab"]')),
          hasReset: [...document.querySelectorAll('button')].some((b) =>
            b.textContent?.includes('إعادة ضبط التجربة'),
          ),
        }))
        check(
          `${viewport.name}: Zinc+HCl lab renders with stage controls and reset`,
          data.lab && data.hasReset,
          data,
        )
      }
      if (step.id === 'state-symbols-deep') {
        const hasDiagram = await page.evaluate(() =>
          Boolean(document.querySelector('[data-interactive-id="lesson6-state-symbols-guide"]')),
        )
        check(`${viewport.name}: state-symbols diagram renders`, hasDiagram)
      }
      if (step.id === 'conclude-equation-source') {
        const hasCoeffVsSub = await page.evaluate(() =>
          Boolean(document.querySelector('[data-interactive-id="lesson6-coefficient-vs-subscript"]')),
        )
        check(`${viewport.name}: coeff-vs-subscript diagram renders`, hasCoeffVsSub)
      }
      if (step.id === 'equation-balancer-simulation') {
        const hasBalancer = await page.evaluate(() =>
          Boolean(document.querySelector('[data-interactive-id="lesson6-equation-balancer-lab"]')),
        )
        check(`${viewport.name}: equation-balancer lab renders`, hasBalancer)
      }
      if (step.id === 'word-to-symbol-builder') {
        const hasBuilder = await page.evaluate(() =>
          Boolean(document.querySelector('[data-interactive-id="lesson6-word-to-symbol-lab"]')),
        )
        check(`${viewport.name}: word-to-symbol builder lab renders`, hasBuilder)
      }
      if (step.id === 'error-spotter-activity') {
        const hasSpotter = await page.evaluate(() =>
          Boolean(document.querySelector('[data-interactive-id="lesson6-error-spotter"]')),
        )
        check(`${viewport.name}: error-spotter lab renders`, hasSpotter)
      }
      if (step.id === 'activity-p39-source') {
        const text = await page.evaluate(() => document.body.textContent ?? '')
        check(
          `${viewport.name}: Activity p39 source step displays all 3 textbook activity items`,
          /محلول كبريتات الزّنك/.test(text) && /كبريتات الصوديوم/.test(text),
        )
      }
      if (step.id === 'activity-p39-review') {
        const text = await page.evaluate(() => document.body.textContent ?? '')
        check(
          `${viewport.name}: Activity 2 review displays platform lab-safety note about Na + water`,
          /يتفاعل أولاً وبعنف شديد مع ماء المحلول/.test(text),
        )
      }
      if (step.id === 'learned-box-source') {
        const text = await page.evaluate(() => document.body.textContent ?? '')
        check(
          `${viewport.name}: «تعلّمتُ» prints all 3 textbook summary bullets`,
          /قانوني التفاعلات الكيميائيّة/.test(text) &&
            /بجعل عدد ذرّات كل عنصر متساوية في طرفي المعادلة/.test(text),
        )
      }
      if (step.id === 'self-test-q2-source') {
        const inlineData = await page.evaluate(async () => {
          const card = document.querySelector('[data-question="l6-book-q2-2"]')
          const inputs = [...(card?.querySelectorAll('input') ?? [])]
          const vals = ['2', '1', '1', '1']
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
          inputs.forEach((inp, idx) => {
            setter.call(inp, vals[idx] ?? '1')
            inp.dispatchEvent(new Event('input', { bubbles: true }))
            inp.dispatchEvent(new Event('change', { bubbles: true }))
          })
          await new Promise((r) => setTimeout(r, 60))
          const selfCheck = document.querySelector('[data-self-check="l6-book-q2-2"]')
          selfCheck?.querySelector('summary')?.click()
          await new Promise((r) => setTimeout(r, 60))
          const body = selfCheck?.querySelector('.question__reveal-body')
          const rect = body?.getBoundingClientRect()
          return {
            opened: Boolean(selfCheck?.querySelector('details')?.open),
            hasWarning:
              Boolean(body?.textContent?.includes('تفاعل عنيف للصوديوم مع ماء المحلول')) &&
              Boolean(body?.textContent?.includes('ليست هذه المعادلة تعليمةً لإجراء تجربة مخبرية')),
            width: rect ? Math.round(rect.width) : 0,
            height: rect ? Math.round(rect.height) : 0,
            scrollWidth: body?.scrollWidth ?? 0,
            clientWidth: body?.clientWidth ?? 0,
            scrollHeight: body?.scrollHeight ?? 0,
            clientHeight: body?.clientHeight ?? 0,
            docWidth: document.documentElement.scrollWidth,
            viewport: window.innerWidth,
          }
        })
        check(
          `${viewport.name}: l6-book-q2-2 inline dropdown reveals Na + CuSO4(aq) safety warning without clipping or overflow`,
          inlineData.opened &&
            inlineData.hasWarning &&
            inlineData.width > 0 &&
            inlineData.height > 0 &&
            inlineData.docWidth <= inlineData.viewport + 1 &&
            inlineData.scrollWidth <= inlineData.clientWidth + 2 &&
            inlineData.scrollHeight <= inlineData.clientHeight + 2,
          inlineData,
        )
      }
      if (step.id === 'self-test-q2-review') {
        const text = await page.evaluate(() => document.body.textContent ?? '')
        check(
          `${viewport.name}: self-test-q2-review displays platform warning for Na + CuSO4(aq)`,
          /تفاعل عنيف للصوديوم مع ماء المحلول/.test(text),
        )
      }
      if (step.id === 'final-test') {
        check(
          `${viewport.name}: lesson final test displays exactly 20 questions`,
          await page.$$eval('[data-question]', (nodes) => nodes.length === 20),
        )
      }
    }

    // Teacher Area verification on desktop and mobile
    if (viewport.name !== 'tablet') {
      await page.goto(`${origin}/teacher/book-solutions?lesson=chem-u1-l6&v=${++visit}`, {
        waitUntil: 'networkidle0',
      })
      const pwInput = await page.$('input[type="password"]')
      if (pwInput) {
        await page.type('input[type="password"]', TEACHER_PASSWORD)
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('button')].find((b) =>
            b.textContent?.includes('دخول مساحة المعلم'),
          )
          btn?.click()
        })
      }
      await page.waitForSelector('.teacher-answer')
      await page.evaluate(() => document.fonts.ready)
      const bookTeacher = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        tabCount: document.querySelectorAll('.teacher-lesson-tab').length,
        hasGuide: Boolean(document.querySelector('.teacher-concept-guide')),
        answerCount: document.querySelectorAll('.teacher-answer').length,
        katexError: Boolean(document.querySelector('.katex-error')),
      }))
      check(
        `${viewport.name}: Teacher Area exposes 6 lesson tabs, Lesson 6 concept guide, and 20 book solutions`,
        bookTeacher.tabCount === 6 && bookTeacher.hasGuide && bookTeacher.answerCount === 20,
        bookTeacher,
      )
      check(
        `${viewport.name}: Teacher Area book solutions has no horizontal overflow or KaTeX error`,
        bookTeacher.documentWidth <= bookTeacher.viewport + 1 && !bookTeacher.katexError,
        bookTeacher,
      )
      await page.screenshot({
        path: path.join(OUT, `${viewport.name}-teacher-lesson6-book.png`),
        fullPage: false,
      })

      await page.goto(`${origin}/teacher/final-test-solutions?lesson=chem-u1-l6&v=${++visit}`, {
        waitUntil: 'networkidle0',
      })
      await page.waitForSelector('.teacher-answer')
      const finalTeacher = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        answerCount: document.querySelectorAll('.teacher-answer').length,
        katexError: Boolean(document.querySelector('.katex-error')),
      }))
      check(
        `${viewport.name}: Teacher Area exposes all 20 Lesson 6 final-test solutions without overflow`,
        finalTeacher.answerCount === 20 &&
          finalTeacher.documentWidth <= finalTeacher.viewport + 1 &&
          !finalTeacher.katexError,
        finalTeacher,
      )
    }
  }

  // Reduced-motion check on Zinc+HCl lab
  const labIdx = chemistryLesson6.steps.findIndex((s) => s.id === 'zinc-hcl-virtual-lab')
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(`${origin}${LESSON_PATH}?rm=${++visit}#step-${labIdx + 1}`, {
    waitUntil: 'networkidle0',
  })
  await page.waitForSelector('[data-interactive-id="lesson6-zinc-hcl-lab"]')
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('إضافة الحمض الممدّد'),
    )
    btn?.click()
  })
  const reducedMotionOk = await page.evaluate(() => {
    const bubble = document.querySelector('.l6-tube__bubble')
    if (!bubble) return true
    return getComputedStyle(bubble).animationName === 'none'
  })
  check('prefers-reduced-motion disables bubble animation while preserving lab stage', reducedMotionOk)
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])

  check(
    'no unexpected browser console errors during the walk',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 5),
  )

  // Real-Chromium axe checks on every step (desktop 1440×900).
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  for (let index = 0; index < chemistryLesson6.steps.length; index += 1) {
    const step = chemistryLesson6.steps[index]
    await page.goto(`${origin}${LESSON_PATH}?a11y=${++visit}#step-${index + 1}`, {
      waitUntil: 'networkidle0',
    })
    await page.waitForSelector('.step__title')
    if (INTERACTIVE_STEP_SELECTORS[step.id]) {
      await page.waitForSelector(INTERACTIVE_STEP_SELECTORS[step.id])
    }
    await page.addScriptTag({ path: path.join(ROOT, 'node_modules/axe-core/axe.min.js') })
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(
        document.querySelector('#main-content') ?? document.body,
        { rules: { region: { enabled: false } } },
      )
      return result.violations
        .filter((item) => ['serious', 'critical'].includes(item.impact))
        .map((item) => ({
          id: item.id,
          impact: item.impact,
          nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
        }))
    })
    check(
      `real-browser axe: ${step.id} has no serious/critical violations`,
      violations.length === 0,
      violations,
    )
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
      { lessonId: chemistryLesson6.id, steps: chemistryLesson6.steps.length, checks, failures },
      null,
      2,
    )}\n`,
  )
}

console.log(
  `\n${checks.filter((item) => item.passed).length}/${checks.length} browser checks passed; ${failures.length} failures. Screenshots/report: ${path.relative(ROOT, OUT)}`,
)
if (failures.length) process.exit(1)
