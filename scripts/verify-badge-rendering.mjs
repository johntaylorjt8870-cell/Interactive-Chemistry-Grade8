#!/usr/bin/env node
/**
 * Real-Chromium verification of the interactive scientific notation.
 *
 * Why this script exists and is not a unit test: jsdom computes no layout, so
 * the defect this guards — a charge rendered as a second grid row instead of a
 * raised superscript — is invisible to the test suite. The assertions here are
 * geometric measurements taken from an actual rendering engine:
 *
 *   - `e⁻` inside the four interactive badges (BohrEnergyTransition,
 *     IonicBondingLab, IonFormationLab, IonEquationLab) is ONE inline unit:
 *     `e` and `−` are not separate grid items and there is no second row;
 *   - `−` is raised above the body baseline by the shared token
 *     `--sci-sup-raise` (0.52em of the charge font size), not by the default
 *     `vertical-align: super` and not by grid row alignment;
 *   - `−` sits to the right of `e`, and the badge stays centred;
 *   - `H⁺`, `Na⁺`, `Cl⁻`, `OH⁻`, `NH₄⁺`, `Ca²⁺`, `O²⁻`, `Al³⁺`, `SO₄²⁻`,
 *     `NO₃⁻` and `PO₄³⁻` are still rendered correctly.
 *
 * Usage:
 *   npm run build
 *   node scripts/verify-badge-rendering.mjs [--dist dist] [--shots <dir>]
 *
 * The browser comes from `puppeteer-core` plus either
 *   - `@sparticuz/chromium` (bundles the Chromium build), or
 *   - `CHROMIUM_PATH` pointing at an existing Chromium/Chrome executable.
 * Those packages are deliberately NOT dependencies of this project: they are
 * ~70 MB of binary that only this script needs. Install them on demand:
 *   npm install --no-save puppeteer-core @sparticuz/chromium
 *
 * Exit codes: 0 all assertions pass, 1 an assertion failed, 2 the harness could
 * not run (no browser, no build).
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

/* ---------------------------------------------------------------------------
 * Arguments
 * ------------------------------------------------------------------------ */

const argv = process.argv.slice(2)
const argOf = (name, fallback) => {
  const index = argv.indexOf(`--${name}`)
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback
}
const DIST = path.resolve(ROOT, argOf('dist', 'dist'))
const SHOTS = path.resolve(ROOT, argOf('shots', 'artifacts/badge-rendering'))

/* ---------------------------------------------------------------------------
 * Static server for the built app (SPA deep-link fallback, as GitHub Pages)
 * ------------------------------------------------------------------------ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
}

function serve(directory) {
  const server = http.createServer((request, response) => {
    // The build's own asset URLs already carry the GitHub Pages base path;
    // the files themselves live at the root of the dist directory.
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (pathname.startsWith(BASE)) pathname = pathname.slice(BASE.length)
    let file = path.join(directory, pathname)
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(directory, 'index.html')
    }
    response.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream')
    fs.createReadStream(file).pipe(response)
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })
}

/* ---------------------------------------------------------------------------
 * Measurement: the distance between the body baseline and the charge baseline.
 *
 * Probing with a zero-size inline-block child whose bottom margin edge is the
 * baseline is the same technique the CSS specification uses for
 * `vertical-align`; it works inside flex and inline-block contexts, where
 * getBoundingClientRect alone cannot tell where the baseline is.
 * ------------------------------------------------------------------------ */

function probeNotation({ container, body, charge }) {
  const node = {
    container: document.querySelector(container),
    body: document.querySelector(body),
    charge: document.querySelector(charge),
  }
  if (!node.container || !node.body || !node.charge) return null

  const baselineOf = (element) => {
    const probe = document.createElement('span')
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    element.appendChild(probe)
    const y = probe.getBoundingClientRect().bottom
    probe.remove()
    return y
  }
  const box = (element) => {
    const rect = element.getBoundingClientRect()
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
  }

  const bodyBox = box(node.body)
  const chargeBox = box(node.charge)
  const containerBox = box(node.container)
  const raisePx = baselineOf(node.body) - baselineOf(node.charge)
  const chargeFontSize = parseFloat(getComputedStyle(node.charge).fontSize)
  const children = [...node.container.children]

  return {
    text: node.container.textContent.trim(),
    raisePx: +raisePx.toFixed(2),
    raiseEm: +(raisePx / chargeFontSize).toFixed(3),
    sameRow: chargeBox.top < bodyBox.bottom - 0.5 && chargeBox.bottom > bodyBox.top + 0.5,
    toTheRight: chargeBox.left >= bodyBox.right - 1.5,
    centeredX: +Math.abs(((Math.min(bodyBox.left, chargeBox.left) + Math.max(bodyBox.right, chargeBox.right)) / 2) - (containerBox.left + containerBox.right) / 2).toFixed(2),
    centeredY: +Math.abs(((Math.min(bodyBox.top, chargeBox.top) + Math.max(bodyBox.bottom, chargeBox.bottom)) / 2) - (containerBox.top + containerBox.bottom) / 2).toFixed(2),
    childElements: children.length,
    childClasses: children.map((element) => element.className),
    bareSupCount: [...node.container.querySelectorAll('sup')].filter((element) => !element.classList.contains('sci-sup')).length,
  }
}

/* ---------------------------------------------------------------------------
 * Browser resolution
 * ------------------------------------------------------------------------ */

/**
 * The Chromium build shipped by `@sparticuz/chromium` links against AL2023
 * shared libraries that the normal Lambda layer supplies. On a host without
 * them the binary fails to start with `libnspr4.so: cannot open shared object
 * file`, so the libraries are unpacked next to a cache dir and the browser is
 * launched with `LD_LIBRARY_PATH` pointing at them.
 */
async function ensureSharedLibraries(packageRoot) {
  const archive = path.join(packageRoot, 'bin', 'al2023.tar.br')
  if (!fs.existsSync(archive)) return undefined
  const target = path.join(os.tmpdir(), 'chem-badge-chromium-libs')
  const marker = path.join(target, 'lib', 'libnspr4.so')
  if (!fs.existsSync(marker)) {
    fs.mkdirSync(target, { recursive: true })
    const tar = path.join(os.tmpdir(), 'chem-badge-al2023.tar')
    fs.writeFileSync(tar, zlib.brotliDecompressSync(fs.readFileSync(archive)))
    execFileSync('tar', ['-xf', tar, '-C', target])
    fs.rmSync(tar, { force: true })
  }
  return fs.existsSync(marker) ? path.join(target, 'lib') : undefined
}

async function resolveBrowser() {
  const puppeteer = (await import('puppeteer-core')).default

  if (process.env.CHROMIUM_PATH) {
    return { puppeteer, executablePath: process.env.CHROMIUM_PATH }
  }

  const sparticuz = (await import('@sparticuz/chromium')).default
  const executablePath = await sparticuz.executablePath()
  const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.resolve('@sparticuz/chromium'))))
  const libraries = await ensureSharedLibraries(packageRoot)
  return { puppeteer, executablePath, libraries }
}

/* ---------------------------------------------------------------------------
 * The four badges: the lesson they live in and how to reveal them.
 * ------------------------------------------------------------------------ */

const BADGES = [
  { name: 'BohrEnergyTransition', lesson: 'atom-and-element', lab: '.bohr-lab', container: '.bohr-electron' },
  { name: 'IonicBondingLab', lesson: 'chemical-bonds', lab: '.ionic-bond-lab', container: '.ionic-bond-lab__particle' },
  { name: 'IonFormationLab', lesson: 'atom-and-element', lab: '.ion-lab', container: '.ion-transfer-particle' },
  { name: 'IonEquationLab', lesson: 'chemical-formulas', lab: '.ion-equation-lab', container: '.ion-equation-lab__particle' },
]

let passed = 0
let failed = 0
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`)
  if (ok) passed += 1
  else failed += 1
}

/** A charge is raised by the shared token when it sits at `--sci-sup-raise` (0.52em). */
const TOKEN_RAISE = { min: 0.45, max: 0.6 }

/* ---------------------------------------------------------------------------
 * Main
 * ------------------------------------------------------------------------ */

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error(`No build found at ${DIST}. Run \`npm run build\` first.`)
    process.exit(2)
  }

  let browser
  try {
    const resolved = await resolveBrowser()
    const host = await resolveHost(resolved)
    browser = await resolved.puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: resolved.executablePath,
      headless: true,
      ...(host ? { env: { ...process.env, LD_LIBRARY_PATH: host } } : {}),
    })
  } catch (error) {
    console.error('Chromium harness unavailable: install `puppeteer-core` and `@sparticuz/chromium`')
    console.error('(`npm install --no-save puppeteer-core @sparticuz/chromium`) or set CHROMIUM_PATH.')
    console.error(String(error?.message ?? error))
    process.exit(2)
  }

  async function resolveHost(resolved) {
    if (!resolved.libraries) return undefined
    const current = process.env.LD_LIBRARY_PATH
    return current ? `${resolved.libraries}:${current}` : resolved.libraries
  }

  fs.mkdirSync(SHOTS, { recursive: true })
  const { server, port } = await serve(DIST)
  const origin = `http://127.0.0.1:${port}${BASE}`

  try {
    for (const badge of BADGES) {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 3 })
      await page.goto(`${origin}/chemistry/structural-chemistry/${badge.lesson}`, { waitUntil: 'networkidle2', timeout: 60000 })
      await page.evaluate(async () => { await document.fonts.ready })

      // 1. Walk the lesson steps until the interactive is on screen.
      let reached = false
      for (let step = 0; step < 40 && !reached; step += 1) {
        if (await page.$(badge.lab)) { reached = true; break }
        const trigger = await page.$('.lesson-nav .button--primary')
        if (!trigger) break
        if (await trigger.evaluate((element) => /إنهاء|إتمام/.test(element.textContent))) break
        await trigger.click()
        await new Promise((resolve) => setTimeout(resolve, 700))
      }
      // 2. Two labs only render the flying electron once a transfer started.
      for (let click = 0; click < 4 && reached && !(await page.$(badge.container)); click += 1) {
        const action = await page.$(`${badge.lab} .lab__actions .button--primary`)
        if (!action) break
        await action.click()
        await new Promise((resolve) => setTimeout(resolve, 700))
      }

      if (!reached || !(await page.$(badge.container))) {
        check(`${badge.name}: badge rendered`, false, `${badge.container} never appeared`)
        await page.close()
        continue
      }

      const measurement = await page.evaluate(probeNotation, {
        container: badge.container,
        body: `${badge.container} .charge-notation__body`,
        charge: `${badge.container} .charge-notation__charge`,
      })

      if (!measurement) {
        check(`${badge.name}: measurement`, false, 'notation elements not found')
        await page.close()
        continue
      }

      check(`${badge.name}: one element child — no second grid item`, measurement.childElements === 1, `${measurement.childElements} — ${JSON.stringify(measurement.childClasses)}`)
      check(`${badge.name}: no bare sup element`, measurement.bareSupCount === 0)
      check(`${badge.name}: charge raised by the shared token`, measurement.raiseEm > TOKEN_RAISE.min && measurement.raiseEm < TOKEN_RAISE.max, `${measurement.raisePx}px = ${measurement.raiseEm}em`)
      check(`${badge.name}: no second row (single line box)`, measurement.sameRow)
      check(`${badge.name}: charge to the right of the body`, measurement.toTheRight)
      check(`${badge.name}: badge stays centred`, measurement.centeredX <= 2 && measurement.centeredY <= 2.5, `x=${measurement.centeredX} y=${measurement.centeredY}`)

      const notation = await page.$(`${badge.container} .charge-notation`)
      if (notation) await notation.screenshot({ path: path.join(SHOTS, `badge-${badge.name}.png`) })
      await page.close()
    }

    /* The charge-bearing species on the homepage showcase exercise IonNotation,
       ChemicalFormula and the shared `.sci-sup` contract outside the badges. */
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 3 })
    await page.goto(origin, { waitUntil: 'networkidle2', timeout: 60000 })
    await page.evaluate(async () => { await document.fonts.ready })

    const ions = await page.evaluate(() => [...document.querySelectorAll('.ion-notation')].map((element) => element.getAttribute('data-ion')))
    check('showcase: ion notation present', ions.length >= 4, ions.join(' '))
    for (const ion of ions) {
      const measurement = await page.evaluate(probeNotation, {
        container: `.ion-notation[data-ion="${ion}"]`,
        body: `.ion-notation[data-ion="${ion}"] .ion-notation__body`,
        charge: `.ion-notation[data-ion="${ion}"] .ion-notation__charge`,
      })
      check(`showcase ${ion}: raised by the shared token`, !!measurement && measurement.raiseEm > TOKEN_RAISE.min && measurement.raiseEm < TOKEN_RAISE.max, measurement ? `${measurement.raisePx}px = ${measurement.raiseEm}em` : 'not found')
      check(`showcase ${ion}: single line, charge to the right`, !!measurement && measurement.sameRow && measurement.toTheRight)
    }
    const showcase = await page.$('.showcase-card:has(.ion-notation)')
    if (showcase) await showcase.screenshot({ path: path.join(SHOTS, 'showcase-ions.png') })
    await page.close()
  } finally {
    await browser.close()
    server.close()
  }

  console.log(`\n${passed} passed, ${failed} failed — screenshots in ${path.relative(ROOT, SHOTS)}/`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})
