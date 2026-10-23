#!/usr/bin/env node
/**
 * Real-Chromium responsive and visual QA for the third chemistry lesson
 * («صيغةُ المركّباتِ الكيميائيَّةِ»، الصفحات 18–23).
 *
 * Run `npm run build && npm run verify:lesson3`. The optional browser harness
 * uses puppeteer-core plus @sparticuz/chromium (or CHROMIUM_PATH), like
 * verify:badges / verify:lesson1 / verify:lesson2. It writes ignored screenshots
 * and a JSON report to artifacts/lesson3/browser/.
 *
 * What it checks, on desktop and on a phone viewport, for every step:
 *   - the step title actually renders;
 *   - the page never overflows horizontally (long equations included);
 *   - KaTeX renders real math and no raw TeX / error marker is visible;
 *   - every display formula fits inside its container;
 *   - no Unicode subscript/charge glyph leaks outside structured notation;
 *   - both interactions complete their real state transitions;
 *   - the final test exposes its question count;
 * and, in the real browser, axe reports no serious/critical violations.
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
const OUT = path.join(ROOT, 'artifacts/lesson3/browser')
const LESSON_PATH = '/chemistry/structural-chemistry/chemical-formulas'
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

// Load the authored lesson data so the browser walk follows the real step list.
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
const { chemistryLesson3 } = await import(dataModuleUrl(path.join(ROOT, 'src/data/curriculum/chemistryLesson3.ts')))

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
    const tar = path.join(os.tmpdir(), 'chem-lesson3-al2023.tar')
    fs.writeFileSync(tar, zlib.brotliDecompressSync(fs.readFileSync(archive)))
    execFileSync('tar', ['-xf', tar, '-C', librariesRoot])
    fs.rmSync(tar, { force: true })
  }
  return { puppeteer, executablePath, libraries: fs.existsSync(libraries) ? libraries : undefined }
}

/**
 * Titles such as «الرّابطة المشتركة: H₂ وO₂ وN₂» are rendered through the
 * structured notation renderer, whose `<sub>` elements change the flattened
 * textContent (`H2` instead of `H₂`). Compare on a normalized form so the check
 * verifies *which* step is displayed without demanding raw subscript glyphs.
 */
function normalizeNotation(value) {
  return value.replace(/[₀₁₂₃₄₅₆₇₈₉]/gu, (digit) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)))
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
  page.setDefaultTimeout(20000)
  page.on('pageerror', (error) => failures.push(`browser error: ${error.message}`))

  const hostedInteractives = chemistryLesson3.steps.flatMap((step) =>
    (step.blocks ?? []).filter((block) => block.kind === 'interactive').map((block) => block.interactiveId),
  )
  check(
    'lesson hosts exactly the three authored interactives',
    hostedInteractives.length === 3 &&
      ['valence-model-lab', 'ion-equation-lab', 'formula-builder-lab'].every((id) => hostedInteractives.includes(id)),
    hostedInteractives,
  )
  check(
    'every simulation step hosts an interactive block',
    chemistryLesson3.steps.every(
      (step) => step.kind !== 'simulation' || (step.blocks ?? []).some((block) => block.kind === 'interactive'),
    ),
  )

  // Every simulation step (5, 8, 17) plus representative text and test steps.
  const screenshotSteps = new Set([0, 2, 4, 5, 7, 8, 12, 16, 17, 18, 21])
  const viewports = [
    { name: 'desktop', width: 1365, height: 960 },
    { name: 'mobile', width: 390, height: 844 },
  ]
  let visit = 0

  for (const viewport of viewports) {
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
    for (let index = 0; index < chemistryLesson3.steps.length; index += 1) {
      const step = chemistryLesson3.steps[index]
      const interactiveIds = (step.blocks ?? [])
        .filter((block) => block.kind === 'interactive')
        .map((block) => block.interactiveId)
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
      check(
        `${viewport.name} / step ${index + 1}: title renders`,
        normalizeNotation(rendered.title).includes(normalizeNotation(step.title)),
        rendered.title,
      )
      check(
        `${viewport.name} / step ${index + 1}: no horizontal page overflow`,
        rendered.documentWidth <= rendered.viewport + 1,
        { viewport: rendered.viewport, document: rendered.documentWidth, main: rendered.mainWidth },
      )
      check(`${viewport.name} / step ${index + 1}: no textbook scan presented as original`, !rendered.hasSourceImage)

      const math = await page.evaluate(() => {
        const display = [...document.querySelectorAll('[data-math="block"]')]
        const visible = [...document.querySelectorAll('.katex-html')].map((node) => node.textContent ?? '').join(' ')
        const outside = [...document.querySelectorAll('#main-content *')]
          .filter((node) => node.children.length === 0)
          .map((node) =>
            node.closest('.katex, .ion-notation, .chem-formula, .nuclear-notation, .electron-configuration, svg, [dir="ltr"]')
              ? ''
              : (node.textContent ?? ''),
          )
          .join(' ')
        return {
          katex: document.querySelectorAll('.katex').length,
          invalid: document.querySelectorAll('[data-math-error="true"]').length,
          visible,
          strayScripts: outside.match(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/gu) ?? [],
          clipped: display
            .map((node) => {
              const box = node.getBoundingClientRect()
              const parent = node.parentElement?.getBoundingClientRect()
              return parent ? { nodeWidth: box.width, parentWidth: parent.width } : null
            })
            .filter(Boolean)
            .filter((entry) => entry.nodeWidth > entry.parentWidth + 1),
          directions: display.map((node) => node.getAttribute('dir')),
        }
      })
      check(`${viewport.name} / step ${index + 1}: KaTeX never fails`, math.invalid === 0, math.invalid)
      check(
        `${viewport.name} / step ${index + 1}: no raw TeX visible`,
        !/\\[a-z]/i.test(math.visible),
        math.visible.slice(0, 120),
      )
      check(`${viewport.name} / step ${index + 1}: no stray script glyphs in RTL prose`, math.strayScripts.length === 0, math.strayScripts)
      check(`${viewport.name} / step ${index + 1}: display math stays LTR`, math.directions.every((dir) => dir === 'ltr'), math.directions)
      check(`${viewport.name} / step ${index + 1}: display math is not clipped`, math.clipped.length === 0, math.clipped)

      if (screenshotSteps.has(index)) {
        const targetSelector = step.kind === 'simulation' ? '.lab' : '.step__header'
        const target = await page.$(targetSelector)
        const topOffset = viewport.name === 'mobile' ? 150 : 110
        if (target) {
          await target.evaluate(
            (node, offset) => window.scrollTo({ top: Math.max(0, window.scrollY + node.getBoundingClientRect().top - offset), behavior: 'instant' }),
            topOffset,
          )
        }
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await page.screenshot({
          path: path.join(OUT, `${viewport.name}-step-${String(index + 1).padStart(2, '0')}.png`),
          fullPage: false,
        })
      }

      /* --- Interaction 1: valence model lab (printed H₂O/NH₃/CH₄) --- */
      if (interactiveIds.includes('valence-model-lab')) {
        const choices = await page.$$eval('.valence-lab__choice', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        check(`${viewport.name}: valence lab lists the three printed molecules`, choices.length === 3, choices)
        await page.click('.valence-lab__choice:nth-of-type(2)')
        await page.click('.valence-lab .button--primary')
        await page.click('.valence-lab .button--primary')
        const state = await page.evaluate(() => {
          const lab = document.querySelector('.valence-lab')
          return {
            molecule: lab?.getAttribute('data-molecule'),
            bonds: lab?.getAttribute('data-bonds-formed'),
            text: lab?.textContent ?? '',
          }
        })
        check(
          `${viewport.name}: valence lab forms two N–H bonds and reports valence 3`,
          state.molecule === 'NH3' && state.bonds === '2' && /3/.test(state.text),
          state,
        )
        const ratio = await page.evaluate(() => {
          const node = document.querySelector('.valence-lab .lab__count')
          return node ? { text: node.textContent?.trim(), direction: getComputedStyle(node).direction } : null
        })
        check(
          `${viewport.name}: valence lab ratio reads right-to-left`,
          ratio?.direction === 'rtl' && /2 من 3/.test(ratio.text ?? ''),
          ratio,
        )
        const reset = await page.$$eval('.valence-lab button', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        check(`${viewport.name}: valence lab offers reset`, reset.some((label) => /إعادة/.test(label)), reset)
      }

      /* --- Interaction 2: ion equation lab (five printed ionic equations) --- */
      if (interactiveIds.includes('ion-equation-lab')) {
        const choices = await page.$$eval('.ion-equation-lab__choice', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        check(`${viewport.name}: ion lab lists the five printed equations`, choices.length >= 5, choices)
        const calcium = await page.$$('.ion-equation-lab__choice')
        await calcium[1].click()
        await page.click('.ion-equation-lab .button--primary')
        await page.click('.ion-equation-lab .button--primary')
        const state = await page.evaluate(() => {
          const lab = document.querySelector('.ion-equation-lab')
          return {
            equation: lab?.getAttribute('data-equation'),
            complete: lab?.getAttribute('data-complete'),
            text: lab?.textContent ?? '',
          }
        })
        check(
          `${viewport.name}: ion lab completes Ca²⁺ after transferring two electrons`,
          state.equation === 'Ca' && state.complete === 'true' && /Ca²⁺|Ca2\+/.test(state.text),
          state,
        )
        const ratio = await page.evaluate(() => {
          const node = document.querySelector('.ion-equation-lab .lab__count')
          return node ? { text: node.textContent?.trim(), direction: getComputedStyle(node).direction } : null
        })
        check(
          `${viewport.name}: ion lab ratio reads right-to-left`,
          ratio?.direction === 'rtl' && /2 من 2/.test(ratio.text ?? ''),
          ratio,
        )
        check(
          `${viewport.name}: ion lab states the ion by element name and sign`,
          /أيون الكالسيوم الموجب/.test(state.text),
          state.text.slice(-160),
        )
        const reset = await page.$$eval('.ion-equation-lab button', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        check(`${viewport.name}: ion lab offers reset`, reset.some((label) => /إعادة/.test(label)), reset)
      }

      /* --- Interaction 3: formula builder lab --- */
      if (interactiveIds.includes('formula-builder-lab')) {
        const ions = await page.$$('.formula-builder-lab__ion')
        check(`${viewport.name}: formula builder exposes cation and anion choices`, ions.length >= 4, ions.length)
        await ions[0].click()
        await ions[ions.length - 1].click()
        await page.click('.formula-builder-lab button.button--primary')
        const actions = await page.$$eval('.formula-builder-lab button', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        const placeAll = actions.findIndex((label) => /ضع الكل دفعة واحدة/.test(label))
        if (placeAll >= 0) {
          const buttons = await page.$$('.formula-builder-lab button')
          await buttons[placeAll].click()
        }
        const state = await page.evaluate(() => {
          const lab = document.querySelector('.formula-builder-lab')
          return { balanced: lab?.getAttribute('data-balanced'), text: lab?.textContent ?? '' }
        })
        check(
          `${viewport.name}: formula builder reaches a balanced formula and explains the parentheses`,
          state.balanced === 'true' && /القوس|قوس/.test(state.text),
          { balanced: state.balanced, snippet: state.text.slice(0, 220) },
        )
      }

      if (step.kind === 'final-test') {
        const count = await page.$$eval('[data-question]', (nodes) => nodes.length)
        check(`${viewport.name}: final test renders all 18 questions`, count >= 18, count)
        const leaked = await page.evaluate(() =>
          /الإجابة المرجعية|الحلّ النموذجي/.test(document.querySelector('#main-content')?.textContent ?? ''),
        )
        check(`${viewport.name}: final test hides solutions before submission`, !leaked)
      }
    }
  }

  await page.setViewport({ width: 1365, height: 960, deviceScaleFactor: 1 })
  for (let index = 0; index < chemistryLesson3.steps.length; index += 1) {
    await page.goto(`${origin}${LESSON_PATH}?a11y=${++visit}#step-${index + 1}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.step__title')
    await page.addScriptTag({ path: path.join(ROOT, 'node_modules/axe-core/axe.min.js') })
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document.querySelector('#main-content') ?? document.body, {
        rules: { region: { enabled: false } },
      })
      return result.violations
        .filter((item) => ['serious', 'critical'].includes(item.impact))
        .map((item) => ({
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
  fs.writeFileSync(
    path.join(OUT, 'report.json'),
    `${JSON.stringify({ lessonId: chemistryLesson3.id, steps: chemistryLesson3.steps.length, checks, failures }, null, 2)}\n`,
  )
}

console.log(`\n${checks.filter((item) => item.passed).length}/${checks.length} visual checks passed; ${failures.length} failures. Screenshots/report: ${path.relative(ROOT, OUT)}`)
if (failures.length) process.exit(1)
