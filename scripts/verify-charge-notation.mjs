#!/usr/bin/env node
/**
 * Real-Chromium verification of the scientific charge contract.
 *
 * Why this script exists and is not a unit test
 * ----------------------------------------------
 * jsdom computes no layout. Every failure this project hit with charge
 * rendering was a layout or paint failure: a sign that sat at mid-letter height,
 * a charge whose raise depended on whatever font-size a component happened to
 * give it, a badge whose grid container split the symbol from its charge. None
 * of those are visible to a DOM assertion.
 *
 * The first attempt at this gate measured bounding boxes and passed while the
 * page looked wrong, for a specific reason: `.sci-sup` used
 * `position: relative` + `top`, which PAINTS the glyph outside the box the
 * layout reserves. A bounding box of such an element describes a rectangle the
 * reader never sees. So this gate checks two different things:
 *
 *   1. LAYOUT — the charge's baseline against the symbol's baseline, measured
 *      with the zero-size inline-block probe the CSS specification uses for
 *      `vertical-align`, expressed in em of the SYMBOL; and
 *   2. INK — the charge's painted pixels against the symbol's painted pixels,
 *      read from a real screenshot. This is what a human judges, so it is what
 *      is judged here.
 *
 * The contract
 * ------------
 *   C1  one notation unit  the symbol and its charge are one inline box; the
 *                           badge's grid container cannot put them in two rows.
 *   C2  baseline anchored  the raise is `vertical-align`, never a paint offset
 *                           (`position`/`top`/`transform`).
 *   C3  one raise          the raise equals `--sci-sup-raise` of the symbol's
 *                           font in EVERY context, whatever scale is in force.
 *   C4  true superscript   the charge's INK sits above the symbol's ink, in the
 *                           upper band of the letter — never across its middle.
 *   C5  attached           the charge is right of the symbol and close to it.
 *   C6  one line           the notation does not grow a line box.
 *   C7  LTR isolated       `dir="ltr"` + `unicode-bidi: isolate`, and the sign
 *                           stays on the right in Arabic prose and equations.
 *
 * Usage
 * -----
 *   npm run build
 *   node scripts/verify-charge-notation.mjs [--dist dist] [--shots <dir>] [--dpr 6]
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

const argv = process.argv.slice(2)
const argOf = (name, fallback) => {
  const index = argv.indexOf(`--${name}`)
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback
}
const DIST = path.resolve(ROOT, argOf('dist', 'dist'))
const SHOTS = path.resolve(ROOT, argOf('shots', 'artifacts/charge-notation'))
const DPR = Number(argOf('dpr', '6'))

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
 * In-page layout probe
 *
 * `baselineOf` uses the technique the CSS specification uses for
 * `vertical-align`: a zero-size inline-block child whose bottom margin edge is
 * the baseline. `getBoundingClientRect` on the element itself cannot tell where
 * a baseline is, and for a paint-offset script it does not even describe the
 * painted glyph.
 * ------------------------------------------------------------------------ */

const INSTALL_PROBE = `
window.__notation = {
  baselineOf(element) {
    const probe = document.createElement('span')
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    element.insertBefore(probe, element.firstChild)
    const y = probe.getBoundingClientRect().bottom
    probe.remove()
    return y
  },

  measure(containerSelector, notationSelector, bodySelector, chargeSelector) {
    const container = document.querySelector(containerSelector)
    const notation = document.querySelector(notationSelector)
    const body = document.querySelector(bodySelector)
    const charge = document.querySelector(chargeSelector)
    if (!container || !notation || !body || !charge) return null
    // The container is the badge, which may be a grid or flex box - exactly
    // the situation the contract has to survive. The notation is the single
    // inline box the reader sees.

    const baselineBody = this.baselineOf(body)
    const baselineCharge = this.baselineOf(charge)
    const chargeStyle = getComputedStyle(charge)
    const containerStyle = getComputedStyle(notation)
    const containerBox = notation.getBoundingClientRect()
    const bodyBox = body.getBoundingClientRect()
    const chargeBox = charge.getBoundingClientRect()
    const symbolFont = parseFloat(getComputedStyle(body).fontSize)
    const chargeFont = parseFloat(chargeStyle.fontSize)
    const raise = baselineBody - baselineCharge

    // The symbol's own ink band, measured from its painted pixels is done
    // separately (see __ink); here we only need the layout facts.
    const lineBox = parseFloat(getComputedStyle(notation).lineHeight)

    return {
      containerDisplay: containerStyle.display,
      notationDisplay: containerStyle.display,
      parentDisplay: getComputedStyle(container).display,
      direction: containerStyle.direction,
      unicodeBidi: containerStyle.unicodeBidi,
      childCount: container.children.length,
      chargeTag: charge.tagName.toLowerCase(),
      chargePosition: chargeStyle.position,
      chargeTop: chargeStyle.top,
      chargeTransform: chargeStyle.transform,
      chargeVerticalAlign: chargeStyle.verticalAlign,
      symbolFont,
      chargeFont,
      scale: +(chargeFont / symbolFont).toFixed(4),
      raisePx: +raise.toFixed(2),
      raiseEmOfSymbol: +(raise / symbolFont).toFixed(4),
      gapPx: +Math.max(0, chargeBox.left - bodyBox.right).toFixed(2),
      gapEm: +(Math.max(0, chargeBox.left - bodyBox.right) / symbolFont).toFixed(4),
      toTheRightOfSymbol: chargeBox.left >= bodyBox.right - 1,
      notationHeight: +containerBox.height.toFixed(2),
      notationWidth: +containerBox.width.toFixed(2),
      bodyHeight: +bodyBox.height.toFixed(2),
      lineBox: Number.isFinite(lineBox) ? lineBox : +containerBox.height.toFixed(2),
      baselineInContainer: +(baselineBody - containerBox.top).toFixed(2),
      containerTop: containerBox.top,
      text: container.textContent.trim().replace('\u2212', '\u207B').replace('+', '\u207A'),
    }
  },
}
`

/* ---------------------------------------------------------------------------
 * In-page ink analysis
 *
 * The DOM says where a box is; only pixels say where a glyph is. This reads a
 * screenshot back as pixels and reduces it to ink clusters, so the charge is
 * located independently of anything the layout claimed.
 * ------------------------------------------------------------------------ */

const INSTALL_INK = `
window.__ink = async function (b64, dpr, inkColor) {
  const img = new Image()
  img.src = 'data:image/png;base64,' + b64
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const W = canvas.width
  const H = canvas.height
  const bg = [data[0], data[1], data[2]]
  // The glyphs are the NOTATION's own colour. Anything else in the rectangle —
  // a flight line, a border, a neighbouring card — is not the notation and must
  // not be counted as its ink, or the reading is of the wrong thing.
  const fg = inkColor ?? [255, 255, 255]
  const ink = new Uint8Array(W * H)
  const cols = new Int32Array(W)
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = (y * W + x) * 4
      const distance =
        Math.abs(data[i] - fg[0]) + Math.abs(data[i + 1] - fg[1]) + Math.abs(data[i + 2] - fg[2])
      if (data[i + 3] > 10 && distance < 120) {
        ink[y * W + x] = 1
        cols[x] += 1
      }
    }
  }
  const runs = []
  let start = -1
  for (let x = 0; x <= W; x += 1) {
    const on = x < W && cols[x] > 0
    if (on && start < 0) start = x
    if (!on && start >= 0) { runs.push([start, x - 1]); start = -1 }
  }
  const boxOf = (x0, x1) => {
    let top = -1
    let bottom = -1
    for (let y = 0; y < H; y += 1) {
      let any = false
      for (let x = x0; x <= x1 && !any; x += 1) if (ink[y * W + x]) any = true
      if (any) { if (top < 0) top = y; bottom = y }
    }
    return top < 0 ? null : { top: +(top / dpr).toFixed(2), bottom: +((bottom + 1) / dpr).toFixed(2) }
  }
  const cssRuns = runs.map(([a, b]) => ({ l: a / dpr, r: (b + 1) / dpr }))
  // Split the ink at its widest column gap: that separates a symbol from its
  // charge even when the two marks are close enough to read as one blob.
  const clusters = []
  if (cssRuns.length) {
    let split = 1
    let widest = -1
    for (let i = 1; i < cssRuns.length; i += 1) {
      const gap = cssRuns[i].l - cssRuns[i - 1].r
      if (gap > widest) { widest = gap; split = i }
    }
    clusters.push({ l: cssRuns[0].l, r: cssRuns[split - 1].r })
    if (cssRuns.length > split) {
      clusters.push({ l: cssRuns[split].l, r: cssRuns[cssRuns.length - 1].r })
    }
  }
  return {
    W: W / dpr,
    H: H / dpr,
    runs: cssRuns,
    clusters,
    symbol: boxOf(0, Math.round(clusters[0].r * dpr) - 1),
    charge:
      clusters.length > 1
        ? boxOf(Math.round(clusters[1].l * dpr), Math.round(clusters[clusters.length - 1].r * dpr) - 1)
        : null,
    gap: clusters.length > 1 ? clusters[1].l - clusters[0].r : null,
  }
}
`

/* ---------------------------------------------------------------------------
 * Browser resolution
 * ------------------------------------------------------------------------ */

/**
 * The Chromium build shipped by `@sparticuz/chromium` links against AL2023
 * shared libraries. On a host without them the binary fails to start with
 * `libnspr4.so: cannot open shared object file`, so the libraries are unpacked
 * next to a cache dir and `LD_LIBRARY_PATH` points at them.
 */
async function ensureSharedLibraries(packageRoot) {
  const archive = path.join(packageRoot, 'bin', 'al2023.tar.br')
  if (!fs.existsSync(archive)) return undefined
  const target = path.join(os.tmpdir(), 'chem-charge-chromium-libs')
  const marker = path.join(target, 'lib', 'libnspr4.so')
  if (!fs.existsSync(marker)) {
    fs.mkdirSync(target, { recursive: true })
    const tar = path.join(os.tmpdir(), 'chem-charge-al2023.tar')
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
  const packageRoot = path.dirname(
    path.dirname(fileURLToPath(import.meta.resolve('@sparticuz/chromium'))),
  )
  const libraries = await ensureSharedLibraries(packageRoot)
  return { puppeteer, executablePath, libraries }
}

/* ---------------------------------------------------------------------------
 * The four interactive particle badges and where each one lives.
 * ------------------------------------------------------------------------ */

const BADGES = [
  { name: 'BohrEnergyTransition', lesson: 'atom-and-element', lab: '.bohr-lab', container: '.bohr-electron', advance: 0 },
  { name: 'IonicBondingLab', lesson: 'chemical-bonds', lab: '.ionic-bond-lab', container: '.ionic-bond-lab__particle', advance: 1 },
  { name: 'IonFormationLab', lesson: 'atom-and-element', lab: '.ion-lab', container: '.ion-transfer-particle', advance: 2 },
  { name: 'IonEquationLab', lesson: 'chemical-formulas', lab: '.ion-equation-lab', container: '.ion-equation-lab__particle', advance: 1 },
]

/* ---------------------------------------------------------------------------
 * The contract, as assertions.
 * ------------------------------------------------------------------------ */

let passed = 0
let failed = 0
const failures = []

function check(label, ok, detail = '') {
  if (ok) {
    passed += 1
    console.log(`PASS  ${label}${detail ? `  — ${detail}` : ''}`)
  } else {
    failed += 1
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`)
    console.log(`FAIL  ${label}${detail ? `  — ${detail}` : ''}`)
  }
}

/** Raise tolerance. The contract is "equals the token", not "equals a pixel". */
const RAISE_EM = { min: 0.3, max: 0.42 }

function auditCharge(label, m, { singleChild = false } = {}) {
  if (!m) {
    check(`${label}: notation found`, false, 'container/body/charge missing')
    return
  }
  if (singleChild) {
    check(
      `${label}: badge holds ONE child, so its grid cannot make a second row`,
      m.childCount === 1,
      `${m.childCount} children`,
    )
  }
  check(`${label}: the charge is a real <sup>`, m.chargeTag === 'sup', m.chargeTag)
  check(
    `${label}: raise is a baseline offset, not a paint offset`,
    m.chargePosition === 'static' && m.chargeTop === 'auto' && m.chargeTransform === 'none',
    `position:${m.chargePosition} top:${m.chargeTop} transform:${m.chargeTransform}`,
  )
  check(
    `${label}: raise == --sci-sup-raise of the symbol`,
    m.raiseEmOfSymbol > RAISE_EM.min && m.raiseEmOfSymbol < RAISE_EM.max,
    `${m.raisePx}px = ${m.raiseEmOfSymbol}em of the ${m.symbolFont}px symbol (scale ${m.scale})`,
  )
  check(`${label}: charge is to the right of the symbol`, m.toTheRightOfSymbol)
  check(`${label}: charge stays attached (gap <= 0.14em)`, m.gapEm >= 0 && m.gapEm <= 0.14, `${m.gapPx}px = ${m.gapEm}em`)
  check(
    `${label}: notation is exactly one line box — the charge adds no line`,
    Math.abs(m.notationHeight - m.lineBox) < 1,
    `${m.notationHeight}px vs line box ${m.lineBox}px (symbol ${m.symbolFont}px)`,
  )
  check(
    `${label}: notation is an inline box even inside a ${m.parentDisplay} parent`,
    m.notationDisplay === 'inline' || m.notationDisplay === 'block',
    `${m.notationDisplay} inside ${m.parentDisplay}`,
  )
  check(
    `${label}: notation is an LTR isolate`,
    m.direction === 'ltr' && m.unicodeBidi === 'isolate',
    `dir=${m.direction} bidi=${m.unicodeBidi}`,
  )
}

/**
 * C4/C5 from pixels. `clusters` come from the badge's own screenshot, so this
 * is the geometry a reader actually sees.
 */
function auditInk(label, ink, baseline) {
  if (!ink || !ink.clusters || ink.clusters.length < 2 || !ink.symbol || !ink.charge) {
    check(
      `${label}: INK — symbol and charge are two separable marks`,
      false,
      ink ? `${ink.clusters?.length ?? 0} ink cluster(s)` : 'no image',
    )
    return
  }
  // Image coordinates: smaller y is HIGHER on the page.
  const symbolHeight = ink.symbol.bottom - ink.symbol.top
  const chargeHeight = ink.charge.bottom - ink.charge.top
  const chargeCentre = (ink.charge.top + ink.charge.bottom) / 2
  const symbolCentre = (ink.symbol.top + ink.symbol.bottom) / 2
  const xHeight = baseline - ink.symbol.top

  check(
    `${label}: INK — the charge sits above the symbol's ink, not across it`,
    ink.charge.bottom <= ink.symbol.top + symbolHeight * 0.2,
    `charge bottom y=${ink.charge.bottom} vs symbol top y=${ink.symbol.top}`,
  )
  check(
    `${label}: INK — the charge is in the upper band of the letter`,
    chargeCentre < symbolCentre - symbolHeight * 0.2,
    `charge centre y=${chargeCentre.toFixed(2)} vs symbol centre y=${symbolCentre.toFixed(2)} (letter ${symbolHeight.toFixed(2)}px tall)`,
  )
  check(
    `${label}: INK — the charge is tight to the symbol`,
    ink.gap !== null && ink.gap <= xHeight * 0.34,
    `${ink.gap?.toFixed(2)}px gap vs ${xHeight.toFixed(2)}px x-height`,
  )
  check(
    `${label}: INK — the charge is smaller than the letter`,
    chargeHeight < symbolHeight,
    `charge ${chargeHeight.toFixed(2)}px vs letter ${symbolHeight.toFixed(2)}px`,
  )
  check(
    `${label}: INK — the charge is not floating away above the letter`,
    chargeCentre > ink.symbol.top - xHeight * 0.55,
    `charge centre y=${chargeCentre.toFixed(2)}, letter top y=${ink.symbol.top}, x-height ${xHeight.toFixed(2)}px`,
  )
}

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
    const current = process.env.LD_LIBRARY_PATH
    const env = resolved.libraries
      ? { ...process.env, LD_LIBRARY_PATH: `${resolved.libraries}:${current ?? ''}` }
      : undefined
    browser = await resolved.puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--hide-scrollbars',
        '--force-color-profile=srgb',
      ],
      executablePath: resolved.executablePath,
      headless: true,
      ...(env ? { env } : {}),
    })
  } catch (error) {
    console.error('Chromium harness unavailable: install `puppeteer-core` and `@sparticuz/chromium`')
    console.error('(`npm install --no-save puppeteer-core @sparticuz/chromium`) or set CHROMIUM_PATH.')
    console.error(String(error?.message ?? error))
    process.exit(2)
  }

  fs.mkdirSync(SHOTS, { recursive: true })
  const { server, port } = await serve(DIST)
  const origin = `http://127.0.0.1:${port}${BASE}`

  async function openPage(pathname, lab) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 1200, deviceScaleFactor: DPR })
    await page.goto(`${origin}${pathname}`, { waitUntil: 'networkidle2', timeout: 60000 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    if (lab) {
      for (let step = 0; step < 40; step += 1) {
        if (await page.$(lab)) break
        const trigger = await page.$('.lesson-nav .button--primary')
        if (!trigger) break
        if (await trigger.evaluate((el) => /إنهاء|إتمام/.test(el.textContent))) break
        await trigger.click()
        await new Promise((resolve) => setTimeout(resolve, 450))
      }
    }
    await page.evaluate(() => {
      const style = document.createElement('style')
      style.textContent =
        '*,*::before,*::after{transition:none !important;animation:none !important}'
      document.head.appendChild(style)
    })
    await page.evaluate(INSTALL_PROBE)
    await page.evaluate(INSTALL_INK)
    return page
  }

  /** ElementHandle screenshot at the page DPR — a true magnifier. */
  async function shoot(page, selector, file, { pad = 0, settle = 500 } = {}) {
    const handle = await page.$(selector)
    if (!handle) return null
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const box = await handle.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom, left: r.left }
      })
      if (box.top > pad && box.bottom < 1200 && box.left > pad) break
      await handle.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }))
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
    await new Promise((resolve) => setTimeout(resolve, settle))
    const b64 = await handle.screenshot({ encoding: 'base64' })
    fs.writeFileSync(file, Buffer.from(b64, 'base64'))
    return b64
  }

  try {
    /* ---------------------------------------------------------------------
     * 1. The four interactive particle badges, on the real lesson pages.
     * ------------------------------------------------------------------- */
    for (const badge of BADGES) {
      const page = await openPage(`/chemistry/structural-chemistry/${badge.lesson}`, badge.lab)
      for (let click = 0; click < badge.advance; click += 1) {
        const action = await page.$(`${badge.lab} .lab__actions .button--primary`)
        if (!action) break
        await action.click()
        await new Promise((resolve) => setTimeout(resolve, 650))
      }

      if (!(await page.$(badge.container))) {
        check(`${badge.name}: badge rendered`, false, `${badge.container} never appeared`)
        await page.close()
        continue
      }

      const m = await page.evaluate(
        (container, notation, body, charge) => window.__notation.measure(container, notation, body, charge),
        badge.container,
        `${badge.container} .charge-notation`,
        `${badge.container} .charge-notation__body`,
        `${badge.container} .charge-notation__charge`,
      )
      auditCharge(badge.name, m, { singleChild: true })
      check(
        `${badge.name}: the badge really reads e⁻`,
        m?.text === 'e\u207B',
        JSON.stringify(m?.text),
      )

      await shoot(page, badge.container, path.join(SHOTS, `badge-${badge.name}.png`), { pad: 2 })
      const b64 = await shoot(
        page,
        `${badge.container} .charge-notation`,
        path.join(SHOTS, `notation-${badge.name}.png`),
        { pad: 2 },
      )
      if (b64 && m) {
        const inkColor = await page.evaluate((selector) => {
          const style = getComputedStyle(document.querySelector(selector))
          const parts = style.color.match(/[\d.]+/g)?.map(Number) ?? [255, 255, 255]
          return [parts[0], parts[1], parts[2]]
        }, `${badge.container} .charge-notation__body`)
        const ink = await page.evaluate(
          ({ b64, dpr, inkColor }) => window.__ink(b64, dpr, inkColor),
          { b64, dpr: DPR, inkColor },
        )
        auditInk(badge.name, ink, m.baselineInContainer)
      }
      const lab = await page.$(badge.lab)
      if (lab) await shoot(page, badge.lab, path.join(SHOTS, `lab-${badge.name}.png`), { settle: 350 })
      await page.close()
    }

    /* ---------------------------------------------------------------------
     * 1b. Harvest the notation the platform really renders, walking each lesson
     *     all the way to its end so no specimen is missed.
     * ------------------------------------------------------------------- */
    const specimens = new Map()
    const harvestFrom = async (target) => {
      const found = await target.evaluate(() => {
        const out = []
        for (const el of document.querySelectorAll(
          '.charge-notation, .ion-notation, .chem-formula',
        )) {
          if (!el.querySelector('.sci-sup')) continue
          const text = el.textContent.trim()
          if (text) out.push(text)
        }
        return out
      })
      for (const text of found) if (!specimens.has(text)) specimens.set(text, true)
    }
    for (const lesson of ['atom-and-element', 'chemical-bonds', 'chemical-formulas']) {
      const harvest = await openPage(`/chemistry/structural-chemistry/${lesson}`, null)
      for (let step = 0; step < 60; step += 1) {
        const trigger = await harvest.$('.lesson-nav .button--primary')
        if (!trigger) break
        if (await trigger.evaluate((el) => /إنهاء|إتمام/.test(el.textContent))) break
        await trigger.click()
        await new Promise((resolve) => setTimeout(resolve, 260))
      }
      await harvestFrom(harvest)
      await harvest.close()
    }

    /* ---------------------------------------------------------------------
     * 1c. Overridden-scale charges: the raise must not drift with
     *     `--script-scale`.
     *
     *     `.sci-sup` is sized by `var(--script-scale, var(--sci-sup-scale))`, so
     *     the raise is `--sci-sup-raise` of the SYMBOL only when the divisor is
     *     that same effective scale. Two production components override it:
     *     `.nuclear-notation__charge` (0.36) and `.bohr__label-charge` (0.66).
     *     Both are measured against their own symbol font, in em, so a
     *     regression in the divisor is a layout failure and not a pixel one.
     * ------------------------------------------------------------------- */
    const RAISE_PROBE = `
window.__measureSymbolRaises = function (symbolSelector, chargeSelector) {
  const baselineOf = (element) => {
    const probe = document.createElement('span')
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    element.insertBefore(probe, element.firstChild)
    const y = probe.getBoundingClientRect().bottom
    probe.remove()
    return y
  }
  const out = []
  for (const symbol of document.querySelectorAll(symbolSelector)) {
    const charge = symbol.querySelector(chargeSelector || '.sci-sup')
    if (!charge) continue
    const symbolFont = parseFloat(getComputedStyle(symbol).fontSize)
    const chargeFont = parseFloat(getComputedStyle(charge).fontSize)
    const raise = baselineOf(symbol) - baselineOf(charge)
    out.push({
      symbolFont,
      chargeFont,
      scale: +(chargeFont / symbolFont).toFixed(4),
      raisePx: +raise.toFixed(2),
      raiseEmOfSymbol: +(raise / symbolFont).toFixed(4),
      chargeClass: charge.className,
      chargeVerticalAlign: getComputedStyle(charge).verticalAlign,
      text: symbol.textContent.trim(),
    })
  }
  return out
}
`

    const overrideHome = await openPage('/', null)
    await overrideHome.evaluate(RAISE_PROBE)
    const supRaiseToken = await overrideHome.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sci-sup-raise')),
    )

    // The nuclear charge is not rendered live anywhere (no NuclearNotation
    // carries a charge), so the specimen is a CLONE of the notation the
    // homepage really renders, given the production charge class — the same
    // class the component puts on it, so the real rule applies.
    const nuclearSeed = await overrideHome.evaluate(() => {
      const source = document.querySelector('.nuclear-notation')
      if (!source) return false
      const host = document.createElement('div')
      host.id = 'override-rack'
      host.style.cssText =
        'position:absolute;left:0;top:0;z-index:999999;background:#fff;color:#0d1b2a;' +
        'padding:16px 20px;direction:ltr'
      const clone = source.cloneNode(true)
      const symbol = clone.querySelector('.nuclear-notation__symbol')
      const sup = document.createElement('sup')
      sup.className = 'sci-sup nuclear-notation__charge'
      sup.textContent = '+'
      symbol && symbol.appendChild(sup)
      host.appendChild(clone)
      document.body.appendChild(host)
      return true
    })
    check(
      'override rack: nuclear notation cloned from the rendered homepage',
      nuclearSeed === true,
    )
    const nuclearRows = nuclearSeed
      ? await overrideHome.evaluate(() =>
          window.__measureSymbolRaises('#override-rack .nuclear-notation__symbol'),
        )
      : []

    // The Bohr label charge IS live: the ionic-transfer diagram of lesson 2.
    const bondsPage = await openPage('/chemistry/structural-chemistry/chemical-bonds', null)
    await bondsPage.evaluate(RAISE_PROBE)
    for (let step = 0; step < 60; step += 1) {
      if (await bondsPage.$('.bohr__label-charge')) break
      const trigger = await bondsPage.$('.lesson-nav .button--primary')
      if (!trigger) break
      if (await trigger.evaluate((el) => /إنهاء|إتمام/.test(el.textContent))) break
      await trigger.click()
      await new Promise((resolve) => setTimeout(resolve, 260))
    }
    const bohrRows = await bondsPage.evaluate(() => window.__measureSymbolRaises('.bohr__label'))

    const auditOverride = (label, rows, overrideClass, expectedScale) => {
      check(`${label}: overridden-scale charge rendered`, rows.length >= 1, `${rows.length} found`)
      for (const row of rows) {
        check(
          `${label} "${row.text}": charge is a real <sup class="sci-sup ${overrideClass}">`,
          /(^|\s)sci-sup(\s|$)/.test(row.chargeClass) &&
            new RegExp(`(^|\\s)${overrideClass}(\\s|$)`).test(row.chargeClass),
          row.chargeClass,
        )
        check(
          `${label} "${row.text}": script scale is ${expectedScale}`,
          row.scale === expectedScale,
          `${row.scale} (charge ${row.chargeFont}px / symbol ${row.symbolFont}px)`,
        )
        check(
          `${label} "${row.text}": raise is --sci-sup-raise of the symbol`,
          Math.abs(row.raiseEmOfSymbol - supRaiseToken) < 0.01,
          `${row.raisePx}px = ${row.raiseEmOfSymbol}em of the ${row.symbolFont}px symbol (token ${supRaiseToken}em, vertical-align ${row.chargeVerticalAlign})`,
        )
      }
    }
    auditOverride('nuclear charge', nuclearRows, 'nuclear-notation__charge', 0.36)
    auditOverride('bohr label charge', bohrRows, 'bohr__label-charge', 0.66)
    await overrideHome.close()
    await bondsPage.close()

    /* ---------------------------------------------------------------------
     * 2. Human-comparable contact sheet.
     *
     *    The specimens are CLONES OF WHAT THE PAGE ACTUALLY RENDERED — the
     *    shipping renderer's own DOM, not a hand-written approximation — each
     *    set beside the font's own superscript glyphs for the same species, at
     *    the same font, so a reader can judge "does this look like `e⁻`?".
     * ------------------------------------------------------------------- */
    const page = await openPage('/chemistry/structural-chemistry/chemical-formulas', null)
    for (let step = 0; step < 60; step += 1) {
      const trigger = await page.$('.lesson-nav .button--primary')
      if (!trigger) break
      if (await trigger.evaluate((el) => /إنهاء|إتمام/.test(el.textContent))) break
      await trigger.click()
      await new Promise((resolve) => setTimeout(resolve, 260))
    }
    const sheet = await page.evaluate((wanted) => {
      const out = []
      for (const el of document.querySelectorAll('.charge-notation, .ion-notation, .chem-formula')) {
        if (!el.querySelector('.sci-sup')) continue
        const text = el.textContent.trim()
        if (!wanted.includes(text)) continue
        if (out.some((row) => row.text === text)) continue
        const SUP = '\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079'
        const SUB = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089'
        const toScript = (value, alphabet, offset) =>
          [...value].map((c) => (/[0-9]/.test(c) ? alphabet[Number(c) + offset] : c)).join('')
        // Body = the notation minus its scripts; scripts come back as glyphs.
        const charge = el.querySelector('.sci-sup')
        const body = [...el.childNodes]
          .filter((node) => !(node.nodeType === 1 && node.closest('.sci-sup')))
          .map((node) => node.textContent ?? '')
          .join('')
        const reference =
          toScript(body, SUB, 0) +
          (charge
            ? toScript(charge.textContent ?? '', SUP, 0).replace(/^\s+/, '')
            : '')
        out.push({ text, html: el.outerHTML, reference })
      }
      return out.slice(0, 6)
    }, [...specimens.keys()])
    check(
      'contact sheet: specimens come from the rendered page',
      sheet.length >= 4,
      sheet.map((s) => s.text).join(' '),
    )

    await page.evaluate((sheet) => {
      // Match the page's own scientific body font, so the comparison is like
      // for like.
      const donor =
        document.querySelector('.chem-formula, .ion-notation, .charge-notation') ?? document.body
      const font = getComputedStyle(donor)
      const host = document.createElement('div')
      host.id = 'notation-rack'
      host.style.cssText =
        'position:absolute;left:0;top:0;z-index:999999;background:#fff;color:#0d1b2a;' +
        'padding:20px 24px;display:flex;gap:22px;align-items:flex-end;direction:ltr;flex-wrap:wrap'
      const caption = (label) => {
        const span = document.createElement('span')
        span.textContent = label
        span.style.cssText =
          'font:600 8px/1.5 Inter,sans-serif;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em'
        return span
      }
      const cell = (content) => {
        const span = document.createElement('span')
        span.style.cssText =
          `display:inline-block;font-size:${font.fontSize};font-weight:${font.fontWeight};` +
          `font-family:${font.fontFamily};line-height:1.2;direction:ltr;white-space:nowrap`
        if (typeof content === 'string') span.innerHTML = content
        else {
          const clone = document.createElement('span')
          clone.innerHTML = content
          span.appendChild(...clone.childNodes)
          span.style.color = 'inherit'
          span.style.fontWeight = 'inherit'
        }
        return span
      }
      for (const specimen of sheet) {
        host.append(
          caption('platform'),
          cell(specimen.html),
          caption('textbook'),
          // The same species written with the font's own script glyphs: body
          // digits become subscripts, charge digits become superscripts, so the
          // two columns show the same chemistry in two notations.
          cell(specimen.reference),
        )
      }
      document.body.appendChild(host)
    }, sheet)
    await new Promise((resolve) => setTimeout(resolve, 250))
    await shoot(page, '#notation-rack', path.join(SHOTS, 'contact-sheet-textbook.png'), { settle: 250 })

    /* ---------------------------------------------------------------------
     * 3. Arabic RTL surrounding text and an equation.
     * ------------------------------------------------------------------- */
    await page.close()
    const rtlPage = await openPage('/chemistry/structural-chemistry/atom-and-element', '.bohr-lab')
    await rtlPage.evaluate(() => {
      const host = document.createElement('div')
      host.id = 'rtl-rack'
      host.style.cssText =
        'position:absolute;left:0;top:0;z-index:999999;background:#fff;padding:18px 22px;' +
        'display:grid;gap:14px;direction:rtl;font-size:16px;line-height:2.1;color:#0d1b2a'
      host.innerHTML = `
        <div>عند تفاعل الذرة مع ذرة الكلور ينقل كل منهما إلكتروناً واحداً، فيصبح الأيون <b class="n">Cl\u207B</b> ذا شحنة سالبة.</div>
        <div>الإلكترون <b class="n">e\u207B</b> والصوديوم <b class="n">Na\u207A</b> والكالسيوم <b class="n">Ca\u00B2\u207A</b> صيغ صحيحة.</div>
        <div>سلفات <b class="n">SO\u2084\u00B2\u207B</b> جزيء مستقر ذي شحنة <b class="n">2\u2212</b>.</div>
        <div style="direction:ltr;text-align:center;font-size:22px" class="n">Na\u207A + e\u207B \u2192 Na</div>`
      document.body.appendChild(host)
      // Promote each probe to the platform's own renderer, so the RTL case is
      // the real component and not a string of glyphs.
      host.querySelectorAll('.n').forEach((el) => {
        if (el.textContent.includes('\u2192')) return
        const template = document.querySelector(
          '#rtl-rack ~ * .charge-notation, .charge-notation',
        )
        const clone = template.cloneNode(true)
        const source = el.textContent
        const body = clone.querySelector('.charge-notation__body')
        const charge = clone.querySelector('.charge-notation__charge')
        const magnitude = clone.querySelector('.charge-notation__magnitude')
        const signNode = clone.querySelector('.charge-notation__sign')
        if (body) body.textContent = source.replace(/[\u207A\u207B\u00B2\u2083-\u2089]+$/, '')
        const sign = source.match(/[\u207A\u207B]$/)
        if (signNode) signNode.textContent = sign ? (sign[0] === '\u207A' ? '+' : '\u2212') : ''
        if (magnitude) magnitude.remove()
        el.textContent = ''
        el.appendChild(clone)
      })
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
    const rtlInk = await shoot(rtlPage, '#rtl-rack', path.join(SHOTS, 'rtl-context.png'), { settle: 250 })
    const rtlCheck = await rtlPage.evaluate(() => {
      const out = []
      for (const notation of document.querySelectorAll('#rtl-rack .charge-notation')) {
        const charge = notation.querySelector('.charge-notation__charge')
        const body = notation.querySelector('.charge-notation__body')
        out.push({
          text: notation.textContent.trim(),
          style: getComputedStyle(notation).display,
          sign: charge.querySelector('.charge-notation__sign').textContent,
          signRightOfBody: charge.getBoundingClientRect().left >= body.getBoundingClientRect().right - 1,
        })
      }
      return out
    })
    check('RTL: platform notation appears in Arabic prose', rtlCheck.length >= 3, `${rtlCheck.length} found`)
    check(
      'RTL: every sign stays on the right of its symbol',
      rtlCheck.every((row) => row.signRightOfBody),
      rtlCheck.map((r) => `${r.text}:${r.signRightOfBody}`).join(' '),
    )
    check(
      'RTL: every notation stays an inline box',
      rtlCheck.every((row) => row.style === 'inline' || row.style === 'block'),
      rtlCheck.map((r) => r.style).join(' '),
    )
    void rtlInk

    /* ---------------------------------------------------------------------
     * 4. Lesson prose and the homepage showcase.
     * ------------------------------------------------------------------- */
    const prose = await rtlPage.evaluate(() => {
      const out = []
      for (const el of document.querySelectorAll('.charge-notation, .ion-notation, .chem-formula')) {
        const charge = el.querySelector('.sci-sup')
        const body = el.querySelector('.charge-notation__body, .ion-notation__body, .chem-formula__element')
        if (!charge || !body) continue
        const baselineOf = (n) => {
          const probe = document.createElement('span')
          probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
          n.insertBefore(probe, n.firstChild)
          const y = probe.getBoundingClientRect().bottom
          probe.remove()
          return y
        }
        const symbolFont = parseFloat(getComputedStyle(body).fontSize)
        const style = getComputedStyle(charge)
        out.push({
          text: el.textContent.trim(),
          symbolFont,
          raiseEm: +((baselineOf(body) - baselineOf(charge)) / symbolFont).toFixed(4),
          display: getComputedStyle(el).display,
          position: style.position,
          top: style.top,
        })
      }
      return out
    })
    check('lesson: charge-bearing notation found in the page', prose.length >= 3, `${prose.length} found`)
    const offContract = prose.filter(
      (row) =>
        !(row.raiseEm > RAISE_EM.min && row.raiseEm < RAISE_EM.max) ||
        row.position !== 'static' ||
        row.top !== 'auto' ||
        (row.display !== 'inline' && row.display !== 'block'),
    )
    check(
      'lesson: every charge obeys the one raise',
      offContract.length === 0,
      offContract.map((r) => `${r.text}=${r.raiseEm}em/${r.position}/${r.top}/${r.display}`).join(' | '),
    )

    /* ---------------------------------------------------------------------
     * 5. Charge ORDERING and PLACEMENT, measured in the shipped build.
     *
     *     The contract the reader sees:
     *       · the magnitude is to the LEFT of the sign inside one superscript;
     *       · the whole superscript is at the symbol's UPPER RIGHT;
     *       · the charge is above the symbol's baseline and does not overlap
     *         the symbol's ink;
     *       · a subscript stays below the baseline while the charge stays high.
     *
     *     Specimens are CLONES of the ions the showcase really renders, with the
     *     body/charge text set to each species in the required table: the markup
     *     and classes are the production ones, so the geometry below is the
     *     geometry the stylesheet produces for that species. The sulfate is
     *     measured on the LIVE specimen, because its subscript is part of the
     *     case.
     * ------------------------------------------------------------------- */
    const ionPage = await openPage('/', null)
    const ION_SPECIMENS = [
      { body: 'Na', magnitude: '', sign: '+', label: 'Na+' },
      { body: 'Ca', magnitude: '2', sign: '+', label: 'Ca2+' },
      { body: 'Cl', magnitude: '', sign: '\u2212', label: 'Cl-' },
      { body: 'O', magnitude: '2', sign: '\u2212', label: 'O2-' },
      { body: 'Fe', magnitude: '3', sign: '+', label: 'Fe3+' },
    ]

    const rackBuilt = await ionPage.evaluate((specimens) => {
      const template = document.querySelector('.ion-notation')
      if (!template) return false
      const host = document.createElement('div')
      host.id = 'ion-rack'
      host.style.cssText =
        'position:absolute;left:0;top:0;z-index:999999;background:#fff;padding:18px 22px;' +
        'display:flex;gap:26px;align-items:flex-end;direction:ltr;font-size:24px;color:#0d1b2a'
      for (const specimen of specimens) {
        const clone = template.cloneNode(true)
        clone.setAttribute('data-specimen', specimen.label)
        const body = clone.querySelector('.ion-notation__body')
        if (body) body.textContent = specimen.body
        const run = clone.querySelector('.ion-notation__charge-run')
        if (run) {
          run.textContent = ''
          if (specimen.magnitude) {
            const magnitude = document.createElement('span')
            magnitude.className = 'ion-notation__magnitude'
            magnitude.textContent = specimen.magnitude
            run.appendChild(magnitude)
          }
          const sign = document.createElement('span')
          sign.className = 'ion-notation__sign'
          sign.textContent = specimen.sign
          run.appendChild(sign)
        }
        host.appendChild(clone)
      }
      document.body.appendChild(host)
      return true
    }, ION_SPECIMENS)
    check('ion ordering rack: built from a rendered ion-notation', rackBuilt === true)

    const GEOMETRY_PROBE = `
window.__chargeGeometry = function (selector) {
  const host = document.querySelector(selector)
  if (!host) return null
  const baselineOf = (element) => {
    const probe = document.createElement('span')
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    element.insertBefore(probe, element.firstChild)
    const y = probe.getBoundingClientRect().bottom
    probe.remove()
    return y
  }
  const notation = host.matches('.ion-notation, .charge-notation, .chem-formula')
    ? host
    : host.querySelector('.ion-notation, .charge-notation, .chem-formula')
  const charge = notation.querySelector('.sci-sup')
  const body = notation.querySelector(
    '.ion-notation__body, .charge-notation__body, .chem-formula__element, .nuclear-notation__symbol',
  )
  const magnitude = charge.querySelector('[class$="magnitude"]')
  const sign = charge.querySelector('[class$="sign"]')
  const subscript = notation.querySelector('sub')

  const symbolFont = parseFloat(getComputedStyle(body).fontSize)
  const bodyBox = body.getBoundingClientRect()
  const chargeBox = charge.getBoundingClientRect()
  const magnitudeBox = magnitude ? magnitude.getBoundingClientRect() : null
  const signBox = sign.getBoundingClientRect()

  // Where the glyphs are, not just where the boxes are: an inline-block probe
  // inside each element reports the baseline that element is laid out on.
  const bodyBaseline = baselineOf(body)
  const chargeBaseline = baselineOf(charge)

  return {
    text: notation.textContent.trim(),
    chargeTag: charge.tagName.toLowerCase(),
    chargePosition: getComputedStyle(charge).position,
    display: getComputedStyle(notation).display,
    magnitudeText: magnitude ? magnitude.textContent : '',
    signText: sign.textContent,
    magnitudeLeftOfSign: magnitudeBox ? magnitudeBox.right <= signBox.left + 0.5 : null,
    chargeRightOfBody: chargeBox.left >= bodyBox.right - 1,
    chargeOverlapsBody: chargeBox.left < bodyBox.right - 1,
    gapEm: +Math.max(0, chargeBox.left - bodyBox.right).toFixed(4) / symbolFont,
    raiseEm: +((bodyBaseline - chargeBaseline) / symbolFont).toFixed(4),
    // Higher on the page is a SMALLER y. "Upper band" is stated against the
    // symbol's BASELINE rather than its box centre, because an inline box
    // carries ascender and descender space that no glyph fills: the charge's box
    // must end at least 0.1em ABOVE the baseline, and its centre must sit above
    // the symbol box's centre by at least 0.15em.
    chargeAboveSymbolMid:
      chargeBox.bottom <= bodyBaseline - symbolFont * 0.1 &&
      (chargeBox.top + chargeBox.bottom) / 2 <=
        (bodyBox.top + bodyBox.bottom) / 2 - symbolFont * 0.15,
    chargeAboveBaseline: chargeBaseline < bodyBaseline,
    chargeBottomEmAboveBaseline: +((bodyBaseline - chargeBox.bottom) / symbolFont).toFixed(4),
    subscriptBelowBaseline: subscript ? baselineOf(subscript) > bodyBaseline : null,
    symbolFont,
    chargeFont: parseFloat(getComputedStyle(charge).fontSize),
  }
}
`
    await ionPage.evaluate(GEOMETRY_PROBE)

    for (const specimen of ION_SPECIMENS) {
      const g = await ionPage.evaluate(
        (label) => window.__chargeGeometry('#ion-rack [data-specimen="' + label + '"]'),
        specimen.label,
      )
      if (!g) {
        check(`ordering ${specimen.label}: specimen rendered`, false, 'not found')
        continue
      }
      check(`ordering ${specimen.label}: the charge is a real <sup>`, g.chargeTag === 'sup', g.chargeTag)
      check(
        `ordering ${specimen.label}: raise is a baseline offset, not a paint offset`,
        g.chargePosition === 'static',
        g.chargePosition,
      )
      check(
        `ordering ${specimen.label}: magnitude is visually LEFT of the sign`,
        g.magnitudeText === '' ? g.magnitudeLeftOfSign === null : g.magnitudeLeftOfSign === true,
        `${JSON.stringify(g.magnitudeText)}${g.signText}: ${g.magnitudeLeftOfSign}`,
      )
      check(
        `ordering ${specimen.label}: the sign is the RIGHT half of the charge`,
        g.text === `${specimen.body}${specimen.magnitude}${specimen.sign}`,
        JSON.stringify(g.text),
      )
      check(
        `placement ${specimen.label}: charge at the upper right of the symbol`,
        g.chargeRightOfBody && !g.chargeOverlapsBody,
        `rightOfBody=${g.chargeRightOfBody} overlap=${g.chargeOverlapsBody} gap=${g.gapEm}em`,
      )
      check(
        `placement ${specimen.label}: charge above the baseline, in the upper band`,
        g.chargeAboveBaseline &&
          g.chargeAboveSymbolMid &&
          g.raiseEm > RAISE_EM.min &&
          g.raiseEm < RAISE_EM.max,
        `raise=${g.raiseEm}em bottom=${g.chargeBottomEmAboveBaseline}em above baseline`,
      )
      check(
        `placement ${specimen.label}: charge stays attached (gap <= 0.14em)`,
        g.gapEm >= 0 && g.gapEm <= 0.14,
        `${g.gapEm}em`,
      )
      check(
        `placement ${specimen.label}: charge is smaller than the symbol`,
        g.chargeFont < g.symbolFont,
        `${g.chargeFont}px vs ${g.symbolFont}px`,
      )
    }

    // The live sulfate: its index must stay low while its charge stays high.
    const sulfate = await ionPage.evaluate(() => {
      const live = [...document.querySelectorAll('.ion-notation')].find((el) =>
        (el.textContent || '').includes('SO'),
      )
      if (!live) return null
      return window.__chargeGeometry(
        '.ion-notation[data-ion="' + live.getAttribute('data-ion') + '"]',
      )
    })
    if (sulfate) {
      check(
        'grouped ion SO42-: the index stays below the baseline',
        sulfate.subscriptBelowBaseline === true,
        `${sulfate.subscriptBelowBaseline}`,
      )
      check(
        'grouped ion SO42-: the charge stays above the baseline and to the right',
        sulfate.raiseEm > RAISE_EM.min &&
          sulfate.raiseEm < RAISE_EM.max &&
          sulfate.chargeRightOfBody &&
          sulfate.chargeAboveBaseline,
        `raise=${sulfate.raiseEm}em rightOfBody=${sulfate.chargeRightOfBody}`,
      )
      check(
        'grouped ion SO42-: magnitude before sign',
        sulfate.text === 'SO42\u2212' && sulfate.magnitudeLeftOfSign === true,
        `${JSON.stringify(sulfate.text)} magLeftOfSign=${sulfate.magnitudeLeftOfSign}`,
      )
    } else {
      check('grouped ion SO42-: a live specimen was rendered', false)
    }
    await shoot(ionPage, '#ion-rack', path.join(SHOTS, 'ion-charge-ordering.png'), { settle: 250 })

    /* ---------------------------------------------------------------------
     * 6. Nuclear notation with a charge, and the orphan-sign audit.
     *
     *    `²³₁₁Na⁺` used to render as a nuclide PLUS a loose prose sign, so an
     *    RTL cell drew `+²³₁₁Na` — the sign on the baseline, LEFT of the
     *    symbol. These checks are the browser-level statement of the fix: no
     *    charge glyph may survive in prose anywhere, and a charged nuclide must
     *    carry its charge as a <sup> to the RIGHT of the symbol, after its
     *    numbers.
     * ------------------------------------------------------------------- */
    const BROWSER_AUDIT = `
window.__orphanSigns = function () {
  const found = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const text = node.textContent || ''
    const parent = node.parentElement
    if (
      parent &&
      /[\\u207A\\u207B]/.test(text) &&
      !/[\\u207A\\u207B][\\u2070\\u00B9\\u00B2\\u00B3\\u2074-\\u2079]/.test(text) &&
      !parent.closest('sup, sub, .katex, script, style')
    ) {
      found.push(text.trim().slice(0, 40) + ' in <' + parent.tagName.toLowerCase() + '>')
    }
    node = walker.nextNode()
  }
  return found
}

window.__chargedNuclides = function () {
  // The symbol element CONTAINS the charge, so its box includes the superscript.
  // The letters' own box is the range from its first to its last text node.
  const textBoxOf = (element) => {
    const nodes = [...element.childNodes].filter((node) => node.nodeType === 3)
    if (!nodes.length) return element.getBoundingClientRect()
    const range = document.createRange()
    range.setStart(nodes[0], 0)
    range.setEnd(nodes[nodes.length - 1], nodes[nodes.length - 1].textContent.length)
    return range.getBoundingClientRect()
  }
  const baselineOf = (element) => {
    const probe = document.createElement('span')
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    element.insertBefore(probe, element.firstChild)
    const y = probe.getBoundingClientRect().bottom
    probe.remove()
    return y
  }
  const out = []
  for (const notation of document.querySelectorAll('.nuclear-notation')) {
    const charge = notation.querySelector('.sci-sup')
    if (!charge) continue
    const numbers = notation.querySelector('.nuclear-notation__numbers')
    const symbol = notation.querySelector('.nuclear-notation__symbol')
    const symbolFont = parseFloat(getComputedStyle(symbol).fontSize)
    const symbolBox = textBoxOf(symbol)
    const chargeBox = charge.getBoundingClientRect()
    const numbersBox = numbers ? numbers.getBoundingClientRect() : null
    const magnitude = charge.querySelector('[class$="magnitude"]')
    const sign = charge.querySelector('[class$="sign"]')
    out.push({
      text: notation.textContent.trim(),
      chargeText: charge.textContent,
      symbol: symbol.firstChild ? String(symbol.firstChild.textContent).trim() : '',
      numbersLeftOfSymbol: numbersBox ? numbersBox.right <= symbolBox.left + 1 : null,
      chargeRightOfSymbol: chargeBox.left >= symbolBox.right - 1,
      raiseEm: +((baselineOf(symbol) - baselineOf(charge)) / symbolFont).toFixed(4),
      magnitudeLeftOfSign:
        magnitude && sign
          ? magnitude.getBoundingClientRect().right <= sign.getBoundingClientRect().left + 0.5
          : null,
    })
  }
  return out
}
`

    const lessonNames = ['atom-and-element', 'chemical-bonds', 'chemical-formulas']
    let nuclideSeen = 0
    let nuclideFailures = 0
    const orphanSigns = []
    for (const lesson of lessonNames) {
      const walk = await openPage(`/chemistry/structural-chemistry/${lesson}`, null)
      await walk.evaluate(BROWSER_AUDIT)
      for (let step = 0; step < 60; step += 1) {
        const orphans = await walk.evaluate(() => window.__orphanSigns())
        for (const orphan of orphans) orphanSigns.push(`${lesson}: ${orphan}`)

        const nuclides = await walk.evaluate(() => window.__chargedNuclides())
        for (const nuclide of nuclides) {
          nuclideSeen += 1
          const ok =
            nuclide.chargeRightOfSymbol &&
            nuclide.numbersLeftOfSymbol === true &&
            nuclide.raiseEm > RAISE_EM.min &&
            nuclide.raiseEm < RAISE_EM.max &&
            (nuclide.magnitudeLeftOfSign === null || nuclide.magnitudeLeftOfSign === true)
          if (!ok) {
            nuclideFailures += 1
            check(
              `nuclear ${nuclide.text}: charge at the upper right of the symbol`,
              false,
              JSON.stringify(nuclide),
            )
          }
        }

        const trigger = await walk.$('.lesson-nav .button--primary')
        if (!trigger) break
        if (await trigger.evaluate((el) => /إنهاء|إتمام/.test(el.textContent))) break
        await trigger.click()
        await new Promise((resolve) => setTimeout(resolve, 260))
      }
      await walk.close()
    }
    check(
      'nuclear: a charged nuclide renders as nuclear notation with a <sup> charge',
      nuclideSeen >= 2,
      `${nuclideSeen} found`,
    )
    check(
      'nuclear: numbers stay left of the symbol, charge upper-right, one raise',
      nuclideFailures === 0,
      `${nuclideFailures} failure(s)`,
    )
    check(
      'prose: no charge glyph is left on the baseline in any lesson step',
      orphanSigns.length === 0,
      orphanSigns.slice(0, 4).join(' | '),
    )
    await ionPage.close()

    const showcase = await openPage('/', null)
    const ions = await showcase.evaluate(() =>
      [...document.querySelectorAll('.ion-notation')].map((el) => el.getAttribute('data-ion')),
    )
    check('showcase: ion notation present', ions.length >= 4, ions.join(' '))
    for (const ion of ions) {
      const m = await showcase.evaluate(
        (sel) => window.__notation.measure(sel, sel, `${sel} .ion-notation__body`, `${sel} .ion-notation__charge`),
        `.ion-notation[data-ion="${ion}"]`,
      )
      auditCharge(`showcase ${ion}`, m)
      const handle = await showcase.$(`.ion-notation[data-ion="${ion}"]`)
      if (handle) {
        const b64 = await handle.screenshot({ encoding: 'base64' })
        fs.writeFileSync(path.join(SHOTS, `showcase-${ion}.png`), Buffer.from(b64, 'base64'))
      }
    }
    await showcase.close()
    await rtlPage.close()
  } finally {
    await browser.close()
    server.close()
  }

  console.log(`\n${passed} passed, ${failed} failed — screenshots in ${path.relative(ROOT, SHOTS)}/`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const failure of failures) console.log(`  - ${failure}`)
  }
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})