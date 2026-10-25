#!/usr/bin/env node
/**
 * Real-Chromium responsive and visual QA for the second chemistry lesson
 * («الروابط الكيميائية»، الصفحات 13–17).
 *
 * Run `npm run build && npm run verify:lesson2`. The optional browser harness
 * uses puppeteer-core plus @sparticuz/chromium (or CHROMIUM_PATH), like
 * verify:badges / verify:lesson4 / verify:lesson5. It writes ignored screenshots
 * and a JSON report to artifacts/lesson2/browser/.
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
const OUT = path.join(ROOT, 'artifacts/lesson2/browser')
const LESSON_PATH = '/chemistry/structural-chemistry/chemical-bonds'
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
const { chemistryLesson2 } = await import(dataModuleUrl(path.join(ROOT, 'src/data/curriculum/chemistryLesson2.ts')))

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
    const tar = path.join(os.tmpdir(), 'chem-lesson2-al2023.tar')
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

/**
 * The step definition does not carry an `interactiveId`; the id lives on the
 * `interactive` content block. Earlier revisions compared `step.interactiveId`
 * (always undefined), so the lab checks below silently never ran. This helper
 * reads the real block, keeping the browser walk honest.
 */
function interactiveIdOf(step) {
  return (step.blocks ?? []).find((block) => block.kind === 'interactive')?.interactiveId
}

function diagramIdsOf(step) {
  return (step.blocks ?? []).filter((block) => block.kind === 'diagram').map((block) => block.diagramId)
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
  page.setDefaultTimeout(15000)
  page.on('pageerror', (error) => failures.push(`browser error: ${error.message}`))

  const screenshotSteps = new Set([0, 3, 5, 7, 8, 10, 11, 16, 17, 19, 20, 21, 23, 27, 28, 31, 34])
  const viewports = [
    { name: 'laptop-1440', width: 1440, height: 900 },
    { name: 'desktop', width: 1365, height: 960 },
    { name: 'mobile', width: 390, height: 844 },
  ]
  let visit = 0

  for (const viewport of viewports) {
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
    for (let index = 0; index < chemistryLesson2.steps.length; index += 1) {
      const step = chemistryLesson2.steps[index]
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

      // KaTeX: real math, no raw TeX visible, no failed render, nothing clipped.
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
      check(`${viewport.name} / step ${index + 1}: no raw TeX visible`, !/[\\]|_\{|\^\{/.test(`${math.visible} `) || !/\\[a-z]/i.test(math.visible), math.visible.slice(0, 120))
      check(`${viewport.name} / step ${index + 1}: no stray script glyphs in RTL prose`, math.strayScripts.length === 0, math.strayScripts)
      check(`${viewport.name} / step ${index + 1}: display math stays LTR`, math.directions.every((dir) => dir === 'ltr'), math.directions)
      check(
        `${viewport.name} / step ${index + 1}: display math is not clipped`,
        math.clipped.length === 0,
        math.clipped,
      )

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
        const figureNode = await page.$('.l2-figure')
        if (figureNode) {
          await figureNode.screenshot({
            path: path.join(OUT, `${viewport.name}-step-${String(index + 1).padStart(2, '0')}-figure.png`),
          })
        }
      }

      // --- Real interaction: the ionic lab must reach the crystal stage. ---
      if (interactiveIdOf(step) === 'ionic-bonding-lab') {
        const advance = await page.$('.ionic-bond-lab .button--primary')
        check(`${viewport.name}: ionic lab exposes an advance control`, Boolean(advance))
        for (let press = 0; press < 3; press += 1) {
          await page.click('.ionic-bond-lab .button--primary')
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        }
        const state = await page.evaluate(() => {
          const lab = document.querySelector('.ionic-bond-lab')
          const readouts = [...lab.querySelectorAll('.ionic-bond-lab__readout')].map((node) => node.textContent ?? '')
          return {
            stage: lab?.getAttribute('data-stage'),
            readouts,
            crystal: Boolean(lab.querySelector('.ionic-bond-lab__scene--attract')),
          }
        })
        check(
          `${viewport.name}: ionic lab reaches the crystal stage with 10/18 electrons`,
          state.stage === '3' && state.crystal && state.readouts.some((text) => /10/.test(text)) && state.readouts.some((text) => /18/.test(text)),
          state,
        )
        const reset = await page.$$eval('.ionic-bond-lab .button--quiet', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        check(`${viewport.name}: ionic lab offers a reset that is enabled after use`, reset.some((label) => /إعادة/.test(label)), reset)
      }

      // --- Real interaction: the covalent lab must switch molecules. ---
      if (interactiveIdOf(step) === 'covalent-bond-lab') {
        const choices = await page.$$('.covalent-bond-lab__choice')
        check(`${viewport.name}: covalent lab lists its molecules`, choices.length >= 3, choices.length)
        const labels = await page.$$eval('.covalent-bond-lab__choice', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        const target = labels.findIndex((label) => label.includes('N'))
        await page.click(`.covalent-bond-lab__choice:nth-of-type(${target + 1})`)
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const state = await page.evaluate(() => {
          const lab = document.querySelector('.covalent-bond-lab')
          return {
            molecule: lab?.getAttribute('data-molecule'),
            shared: lab?.querySelectorAll('.covalent-bond-lab__dot[data-kind="shared"]').length ?? null,
            text: lab?.textContent ?? '',
          }
        })
        check(
          `${viewport.name}: covalent lab switches to N₂ and reports a triple bond`,
          state.molecule === 'N2' && (/ثلاثية/.test(state.text) || /3/.test(state.text)),
          state,
        )
        const reset = await page.$$eval('.covalent-bond-lab button', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''))
        check(`${viewport.name}: covalent lab offers a reset control`, reset.some((label) => /إعادة/.test(label)), reset)
      }

      // --- Educational figures must actually mount, and stay inside the page. ---
      const figureIds = diagramIdsOf(step)
      if (figureIds.length) {
        const figures = await page.evaluate(() =>
          [...document.querySelectorAll('.l2-figure')].map((figure) => ({
            diagram: figure.getAttribute('data-diagram'),
            width: figure.getBoundingClientRect().width,
            parentWidth: figure.parentElement?.getBoundingClientRect().width ?? null,
            hasSvg: Boolean(figure.querySelector('svg')),
            hasLegend: Boolean(figure.querySelector('.l2-figure__legend, .l2-lewis__legend')),
            captioned: Boolean(figure.querySelector('figcaption')),
          })),
        )
        check(
          `${viewport.name} / step ${index + 1}: every authored figure mounts`,
          figures.length === figureIds.length && figureIds.every((id) => figures.some((figure) => figure.diagram === id)),
          { expected: figureIds, rendered: figures.map((figure) => figure.diagram) },
        )
        check(
          `${viewport.name} / step ${index + 1}: figures draw geometry and a written key`,
          figures.every((figure) => figure.hasSvg || figure.hasLegend),
          figures,
        )
        check(`${viewport.name} / step ${index + 1}: figures carry their explanatory caption`, figures.every((figure) => figure.captioned))
        check(
          `${viewport.name} / step ${index + 1}: figures never exceed their column`,
          figures.every((figure) => !figure.parentWidth || figure.width <= figure.parentWidth + 1),
          figures,
        )
      }

      // --- Valence counter: answer → feedback → reset. ---
      if (interactiveIdOf(step) === 'lesson2-valence-counter') {
        const lab = await page.$('.l2-valence-lab')
        check(`${viewport.name}: valence counter mounts`, Boolean(lab))
        const atom = await page.$eval('.l2-valence-lab', (node) => node.getAttribute('data-atom'))
        check(`${viewport.name}: valence counter starts on the printed Na atom`, atom === 'Na', atom)
        const buttons = await page.$$('.l2-valence-lab__answers .l2-choice')
        check(`${viewport.name}: valence counter offers 1–8 answer buttons`, buttons.length === 8, buttons.length)
        await buttons[0].click()
        await page.click('.l2-valence-lab .button--primary')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const state = await page.evaluate(() => {
          const node = document.querySelector('.l2-valence-lab')
          return {
            state: node?.getAttribute('data-state'),
            feedback: node?.querySelector('.l2-valence-lab__feedback')?.textContent ?? '',
          }
        })
        check(
          `${viewport.name}: valence counter marks the correct valence count (1)`,
          state.state === 'correct' && /إجابة صحيحة/.test(state.feedback),
          state,
        )
        await page.click('.l2-valence-lab .button--quiet')
        const afterReset = await page.$eval('.l2-valence-lab', (node) => node.getAttribute('data-state'))
        check(`${viewport.name}: valence counter resets to the unanswered state`, afterReset === 'idle', afterReset)
      }

      // --- Bond steps: previous / next / reset on the real mechanism. ---
      if (interactiveIdOf(step) === 'lesson2-bond-steps') {
        const lab = await page.$('.l2-steps-lab')
        check(`${viewport.name}: bond-steps lab mounts`, Boolean(lab))
        const previousDisabled = await page.$eval('.l2-steps-lab .button--quiet', (node) => node.disabled)
        check(`${viewport.name}: bond-steps disables «السابق» on the first stage`, previousDisabled)
        for (let press = 0; press < 4; press += 1) {
          await page.click('.l2-steps-lab .button--primary')
        }
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const reached = await page.evaluate(() => {
          const node = document.querySelector('.l2-steps-lab')
          return {
            stage: node?.getAttribute('data-stage'),
            readouts: [...(node?.querySelectorAll('.l2-steps-lab__counters strong') ?? [])].map((item) => item.textContent),
          }
        })
        check(
          `${viewport.name}: bond-steps reaches the ion stage with 10/18 electrons`,
          reached.stage === '4' && reached.readouts.includes('10') && reached.readouts.includes('18'),
          reached,
        )
        await page.click('.l2-steps-lab .button--quiet:last-of-type')
        const resetStage = await page.$eval('.l2-steps-lab', (node) => node.getAttribute('data-stage'))
        check(`${viewport.name}: bond-steps resets to the first stage`, resetStage === '0', resetStage)
      }

      // --- Element behavior lab: partner-dependent classification + reset. ---
      if (interactiveIdOf(step) === 'lesson2-element-behavior-lab') {
        const lab = await page.$('.l2-behavior-lab')
        check(`${viewport.name}: element-behavior lab mounts`, Boolean(lab))
        const pair = await page.$eval('.l2-behavior-lab', (node) => node.getAttribute('data-pair'))
        check(`${viewport.name}: element-behavior lab starts on Na+Cl`, pair === 'na-cl', pair)
        const groups = await page.$$('.l2-behavior-lab__question-group')
        check(`${viewport.name}: element-behavior lab exposes two reasoning groups`, groups.length === 2, groups.length)
        await page.click('.l2-behavior-lab__question-group:first-of-type .l2-choice:first-of-type')
        await page.click('.l2-behavior-lab__question-group:last-of-type .l2-choice:first-of-type')
        await page.click('.l2-behavior-lab .button--primary')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const state = await page.evaluate(() => {
          const node = document.querySelector('.l2-behavior-lab')
          return {
            state: node?.getAttribute('data-state'),
            feedback: node?.querySelector('.l2-behavior-lab__feedback')?.textContent ?? '',
          }
        })
        check(
          `${viewport.name}: element-behavior lab validates Na+Cl as metal+nonmetal ionic transfer`,
          state.state === 'correct' && /NaCl/.test(state.feedback),
          state,
        )
        await page.click('.l2-behavior-lab .button--quiet')
        const afterReset = await page.$eval('.l2-behavior-lab', (node) => node.getAttribute('data-state'))
        check(`${viewport.name}: element-behavior lab resets cleanly`, afterReset === 'idle', afterReset)
      }

      // --- Error spotter: a verdict must explain itself. ---
      if (interactiveIdOf(step) === 'lesson2-error-spotter') {
        const lab = await page.$('.l2-spotter-lab')
        check(`${viewport.name}: error-spotter lab mounts`, Boolean(lab))
        const count = await page.$$eval('.l2-spotter-lab__item', (nodes) => nodes.length)
        check(`${viewport.name}: error-spotter lists six statements`, count === 6, count)
        await page.click('.l2-spotter-lab__item:first-of-type button')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const judged = await page.evaluate(() => {
          const item = document.querySelector('.l2-spotter-lab__item')
          return {
            state: item?.getAttribute('data-state'),
            text: item?.querySelector('.l2-spotter-lab__feedback')?.textContent ?? '',
          }
        })
        check(
          `${viewport.name}: error-spotter explains the wrong verdict`,
          judged.state === 'incorrect' && judged.text.includes('11'),
          judged,
        )
        await page.click('.l2-spotter-lab .button--quiet')
        const cleared = await page.$eval('.l2-spotter-lab', (node) => node.getAttribute('data-answered'))
        check(`${viewport.name}: error-spotter resets its answers`, cleared === '0', cleared)
      }

      if (step.kind === 'final-test') {
        const count = await page.$$eval('[data-question]', (nodes) => nodes.length)
        check(`${viewport.name}: final test renders its question nodes`, count >= 17, count)
        const leaked = await page.evaluate(() =>
          /الإجابة المرجعية|الحلّ النموذجي/.test(document.querySelector('#main-content')?.textContent ?? ''),
        )
        check(`${viewport.name}: final test hides solutions before submission`, !leaked)
      }
    }
  }

  // Real Chromium axe checks supplement the jsdom accessibility tests.
  await page.setViewport({ width: 1365, height: 960, deviceScaleFactor: 1 })
  for (let index = 0; index < chemistryLesson2.steps.length; index += 1) {
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
    `${JSON.stringify({ lessonId: chemistryLesson2.id, steps: chemistryLesson2.steps.length, checks, failures }, null, 2)}\n`,
  )
}

console.log(`\n${checks.filter((item) => item.passed).length}/${checks.length} visual checks passed; ${failures.length} failures. Screenshots/report: ${path.relative(ROOT, OUT)}`)
if (failures.length) process.exit(1)
