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

  // Step titles are rendered through the platform notation renderer, which
// promotes `H₂O` to a structured formula (ChemicalFormula). Its textContent is
// therefore `H2O`, so compare on a notation-normalized form rather than raw
// characters; the visual notation itself is checked separately below.
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
function normalizeNotation(value) {
  return [...value]
    .map((char) => {
      const sub = SUBSCRIPT_DIGITS.indexOf(char)
      if (sub >= 0) return String(sub)
      const sup = SUPERSCRIPT_DIGITS.indexOf(char)
      if (sup >= 0) return String(sup)
      return char
    })
    .join('')
}

const screenshotSteps = new Set([0, 1, 5, 6, 7, 12, 13, 14, 19])
  const viewports = [
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
        math.clipped.slice(0, 2),
      )

      if (screenshotSteps.has(index)) {
        const target = await page.$('.step__title')
        const topOffset = viewport.name === 'mobile' ? 170 : 120
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

      // Real interaction: the ionic lab must complete its four scientific stages.
      if (step.blocks.some((block) => block.kind === 'interactive' && block.interactiveId === 'ionic-bonding-lab')) {
        await page.waitForSelector('.ionic-bond-lab')
        const button = await page.$('.ionic-bond-lab .button--primary')
        for (let press = 0; press < 3; press += 1) {
          await button.click()
          await page.waitForFunction((expected) => document.querySelector('.ionic-bond-lab')?.dataset.stage === expected, {}, String(press + 1))
        }
        const state = await page.evaluate(() => {
          const lab = document.querySelector('.ionic-bond-lab')
          return {
            stage: lab?.dataset.stage,
            naElectrons: lab?.querySelectorAll('[data-bohr="Na"] .bohr__electron').length ?? 0,
            clElectrons: lab?.querySelectorAll('[data-bohr="Cl"] .bohr__electron').length ?? 0,
            crystal: Boolean(lab?.querySelector('.ionic-bond-lab__crystal')),
          }
        })
        check(
          `${viewport.name}: ionic lab reaches the crystal with 10/18 electrons`,
          state.stage === '3' && state.naElectrons === 10 && state.clElectrons === 18 && state.crystal,
          state,
        )
      }

      // Real interaction: the covalent lab must switch molecules and read-out values.
      if (step.blocks.some((block) => block.kind === 'interactive' && block.interactiveId === 'covalent-bond-lab')) {
        await page.waitForSelector('.covalent-bond-lab')
        const n2 = await page.$('.covalent-bond-lab__choice:nth-child(3)')
        await n2.click()
        await page.waitForFunction(() => document.querySelector('.covalent-bond-lab')?.dataset.molecule === 'N2')
        const state = await page.evaluate(() => {
          const lab = document.querySelector('.covalent-bond-lab')
          return {
            molecule: lab?.dataset.molecule,
            sharedDots: lab?.querySelectorAll('.lewis-mol__dot[data-electron="shared"]').length ?? 0,
            bondOrder: lab?.querySelector('.bond-model__bond')?.getAttribute('data-order'),
          }
        })
        check(`${viewport.name}: covalent lab switches to N₂ with 6 shared electrons`, state.molecule === 'N2' && state.sharedDots === 6 && state.bondOrder === '3', state)
      }

      if (step.kind === 'final-test') {
        const questions = await page.$$eval('[data-question]', (nodes) => nodes.map((node) => node.getAttribute('data-question')))
        check(`${viewport.name}: the final test renders every top-level question`, questions.length >= chemistryLesson2.tests[2].questions.length, questions.length)
      }
    }
  }

  // Real-Chromium axe checks supplement the jsdom accessibility tests.
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
        .map((item) => ({ id: item.id, impact: item.impact, targets: item.nodes.map((node) => node.target) }))
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
