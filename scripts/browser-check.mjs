#!/usr/bin/env node
/**
 * Real-browser regression check for Physics Unit 2 · Lesson 1 (concurrent forces).
 *
 * jsdom has no layout engine and no SVG renderer, so a whole class of defects is
 * invisible to the unit tests. The worst one so far: KaTeX draws a vector arrow
 * (w⃗, F₁⃗) as an inline <svg>, and the global `svg { max-width: 100% }` reset
 * clamped it to 0px — the DOM was perfect, the arrow was not painted, and 442
 * tests stayed green. This script opens the lesson in a real Chromium and checks
 * what only a browser can: rendered sizes, text directions, the outline and
 * header sizes, overflow, reduced motion and the role colours in both themes.
 *
 * It is a standalone tool — it is NOT part of `npm test` because it needs a
 * browser. Usage (a dev server or `npm run preview` must be serving the app):
 *
 *   npm i --no-save puppeteer-core @sparticuz/chromium     # or set CHROME_PATH to a Chrome/Chromium
 *   BASE_URL=http://localhost:5173 node scripts/browser-check.mjs [--shots ./shots]
 *
 * On a minimal Linux image without Chrome's system libraries, prefix the command
 * with  AWS_EXECUTION_ENV=AWS_Lambda_nodejs22.x  (the bundled Chromium needs it).
 * The exit code is 1 when any check fails.
 */
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const LESSON = '/physics/motion-and-forces/concurrent-forces'
const shotsFlag = process.argv.indexOf('--shots')
const SHOTS = shotsFlag > -1 ? process.argv[shotsFlag + 1] : null
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const { default: puppeteer } = await import('puppeteer-core')
let executablePath = process.env.CHROME_PATH
let args = []
if (!executablePath) {
  const { default: chromium } = await import('@sparticuz/chromium')
  executablePath = await chromium.executablePath()
  args = chromium.args.filter((arg) => !arg.includes('disable-web-security'))
}
const browser = await puppeteer.launch({
  executablePath,
  args: [...args, '--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  headless: 'shell',
})

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`)
}

async function open(step, { width = 1440, height = 900, theme, reduced = false } = {}) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  if (theme) await page.evaluateOnNewDocument((t) => localStorage.setItem('ipc:theme', t), theme)
  const features = []
  if (theme) features.push({ name: 'prefers-color-scheme', value: theme })
  if (reduced) features.push({ name: 'prefers-reduced-motion', value: 'reduce' })
  if (features.length) await page.emulateMediaFeatures(features)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  await page.goto(`${BASE}${LESSON}#step-${step}`, { waitUntil: 'networkidle0', timeout: 60_000 })
  await page.evaluate(() => document.fonts.ready)
  await new Promise((resolve) => setTimeout(resolve, 500))
  page.errors = errors
  return page
}

const LAB_STEPS = [['concurrent-forces lab', 4], ['parallelogram lab', 8], ['force-components lab', 14]]

/* 1 — every vector arrow is actually painted (the `svg { max-width: 100% }` bug) */
for (const [name, step] of [['book experiment', 3], ['book construction', 6], ['book components', 13], ...LAB_STEPS]) {
  const page = await open(step)
  const { total, hidden } = await page.evaluate(() => {
    const accents = [...document.querySelectorAll('[data-vector="true"] .katex svg')]
    return { total: accents.length, hidden: accents.filter((svg) => svg.getBoundingClientRect().width < 1).length }
  })
  check(`step ${step} (${name}): KaTeX vector arrows are painted`, hidden === 0, `${total} accents, ${hidden} with zero width`)
  check(`step ${step} (${name}): no console errors`, page.errors.length === 0, page.errors[0] ?? '')
  await page.close()
}

/* 2 — lab drawings: labels are direction-safe, arrows sit over their symbol, nothing is clipped */
for (const [name, step] of LAB_STEPS) {
  const page = await open(step)
  const report = await page.evaluate(() => {
    const svg = document.querySelector('.plab__canvas > svg')
    const box = svg.getBoundingClientRect()
    const wrongDirection = [...svg.querySelectorAll('text')].filter((text) => {
      const wanted = text.classList.contains('svg-text--ar') ? 'rtl' : 'ltr'
      return getComputedStyle(text).direction !== wanted
    }).length
    const offAxis = [...svg.querySelectorAll('[data-vector-label]')].filter((label) => {
      const symbol = label.querySelector('.vec-svg-label__symbol').getBoundingClientRect()
      const accent = label.querySelector('.vec-svg-label__accent').getBoundingClientRect()
      const em = symbol.height
      // horizontally centred on the symbol, and drawn above its middle (a lowercase letter such as w is
      // shorter than its font box, so its arrow legitimately sits below the top of that box)
      const middle = (symbol.top + symbol.bottom) / 2
      return Math.abs((accent.left + accent.right) / 2 - (symbol.left + symbol.right) / 2) > 0.45 * em || accent.bottom > middle
    }).length
    const clipped = [...svg.querySelectorAll('text')].filter((text) => {
      const b = text.getBoundingClientRect()
      return b.width > 0 && (b.left < box.left - 2 || b.right > box.right + 2 || b.top < box.top - 2 || b.bottom > box.bottom + 2)
    }).length
    return { wrongDirection, offAxis, clipped, labels: svg.querySelectorAll('[data-vector-label]').length }
  })
  check(`${name}: every SVG text has the right direction`, report.wrongDirection === 0, `${report.wrongDirection} wrong`)
  check(`${name}: each arrow accent is centred above its symbol`, report.offAxis === 0, `${report.labels} labels, ${report.offAxis} off`)
  check(`${name}: no label is clipped by the drawing`, report.clipped === 0, `${report.clipped} clipped`)
  if (SHOTS) await (await page.$('.plab')).screenshot({ path: `${SHOTS}/${step}-${name.replace(/\W+/g, '-')}.png` })
  await page.close()
}

/* 3 — outline and header sizes, and no horizontal overflow, at seven viewports */
for (const [width, height] of [[1920, 1080], [1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844]]) {
  const page = await open(1, { width, height })
  const m = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect()
    return {
      aside: rect('.lesson-shell__aside')?.width ?? 0,
      header: rect('.lesson-shell__header')?.height ?? 0,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }
  })
  const desktop = width > 1080
  if (desktop) check(`${width}px: outline is a small sidebar`, m.aside / width <= 0.16, `${Math.round(m.aside)}px = ${((m.aside / width) * 100).toFixed(1)}%`)
  else check(`${width}px: outline collapses into a drawer`, m.aside === 0)
  // on phones the header is not pinned (it scrolls away), so its height only matters once: it was 155px
  check(`${width}px: lesson header is slim`, m.header <= (width <= 640 ? 110 : 56), `${Math.round(m.header)}px`)
  check(`${width}px: no horizontal page overflow`, !m.overflow)
  await page.close()
}

/* 4 — narrow screens: the drawing scrolls, is centred and is reachable by keyboard */
{
  const page = await open(4, { width: 390, height: 844 })
  const s = await page.evaluate(() => {
    const el = document.querySelector('.plab__scroller')
    return { overflow: el.scrollWidth - el.clientWidth, tabindex: el.getAttribute('tabindex'), left: Math.abs(el.scrollLeft) }
  })
  check('390px: the drawing overflows and is a focusable region', s.overflow > 0 && s.tabindex === '0', `overflow ${s.overflow}px`)
  check('390px: the drawing is centred on its content', s.left > 20 && s.left < s.overflow - 20, `scrolled ${s.left}px of ${s.overflow}px`)
  await page.close()
}

/* 5 — reduced motion: nothing runs and every arrow is fully drawn */
for (const [name, step] of LAB_STEPS) {
  const page = await open(step, { reduced: true })
  const r = await page.evaluate(() => {
    const lab = document.querySelector('.plab')
    return {
      running: document.getAnimations().filter((a) => a.playState === 'running' && lab.contains(a.effect?.target)).length,
      undrawn: [...lab.querySelectorAll('.diagram-vector__shaft, .plab-draw')].filter((el) => getComputedStyle(el).strokeDashoffset !== '0px').length,
    }
  })
  check(`${name}: reduced motion leaves a still, fully drawn figure`, r.running === 0 && r.undrawn === 0, `${r.running} running, ${r.undrawn} undrawn`)
  await page.close()
}

/* 6 — role colours differ and stay visible in both themes */
for (const theme of ['light', 'dark']) {
  const page = await open(4, { theme })
  const colours = await page.evaluate(() => {
    const stroke = (role) => getComputedStyle(document.querySelector(`.plab-arrow[data-vector-arrow="${role}"] .diagram-vector__shaft`)).stroke
    const head = (role) => getComputedStyle(document.querySelector(`.plab-arrow[data-vector-arrow="${role}"] .diagram-vector__head`)).fill
    return { f1: stroke('force1'), f2: stroke('force2'), w: stroke('weight'), f1Head: head('force1'), f2Head: head('force2') }
  })
  check(`${theme} theme: F₁, F₂ and w have three different colours`, new Set([colours.f1, colours.f2, colours.w]).size === 3, `${colours.f1} / ${colours.f2} / ${colours.w}`)
  check(`${theme} theme: each arrowhead matches its shaft`, colours.f1 === colours.f1Head && colours.f2 === colours.f2Head)
  await page.close()
}

await browser.close()
const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? ` — ${failed.length} FAILED` : ''}`)
process.exit(failed.length ? 1 : 0)
