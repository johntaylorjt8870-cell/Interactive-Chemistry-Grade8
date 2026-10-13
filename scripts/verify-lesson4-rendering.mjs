#!/usr/bin/env node
/**
 * Real Chromium, built application, desktop/mobile Lesson 4 QA.
 * Uses the same optional browser packages as verify:badges; no new dependency.
 * npm run build && npm run verify:lesson4
 * Screenshots + geometric/interaction/a11y evidence: artifacts/lesson4/browser/.
 * The page scans are unavailable; this checks honest references, NOT scan pixels.
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
const OUT = path.join(ROOT, 'artifacts/lesson4/browser')
const DIST = path.join(ROOT, 'dist')
fs.mkdirSync(OUT, { recursive: true })

// Read the real authored data, not a second hardcoded answer key. All imports
// in these data modules are relative data/type imports, never browser code.
const modules = new Map()
function dataModuleUrl(relative) {
  const file = path.resolve(ROOT, relative)
  if (modules.has(file)) return modules.get(file)
  const source = fs.readFileSync(file, 'utf8')
  let output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: false } }).outputText
  output = output.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_, quote, dependency) => {
    const next = path.resolve(path.dirname(file), `${dependency}.ts`)
    return `from ${quote}${dataModuleUrl(next)}${quote}`
  })
  const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
  modules.set(file, url)
  return url
}
const { chemistryLesson4: lesson, finalTest } = await import(dataModuleUrl('src/data/curriculum/chemistryLesson4.ts'))
const { default: bank } = await import(dataModuleUrl('src/data/testArea/banks/chem-u1-l4.ts'))
const password = fs.readFileSync(path.join(ROOT, 'src/teacher/teacherAccess.ts'), 'utf8').match(/TEACHER_PASSWORD = '([^']+)'/)[1]
const solutionBundle = fs.readdirSync(path.join(DIST, 'assets')).find((file) => file.startsWith('chem-u1-l4-') && file.endsWith('.js') && fs.readFileSync(path.join(DIST, 'assets', file), 'utf8').includes('whyCorrect'))

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' }
const server = http.createServer((request, response) => {
  let route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  if (route.startsWith(BASE)) route = route.slice(BASE.length)
  let file = path.join(DIST, route)
  if (!file.startsWith(`${DIST}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html')
  response.setHeader('content-type', mime[path.extname(file)] ?? 'application/octet-stream')
  fs.createReadStream(file).pipe(response)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const ORIGIN = `http://127.0.0.1:${server.address().port}${BASE}`
const lessonPath = '/chemistry/structural-chemistry/chemical-reactions'

async function browserConfig() {
  const puppeteer = (await import('puppeteer-core')).default
  if (process.env.CHROMIUM_PATH) return { puppeteer, executablePath: process.env.CHROMIUM_PATH }
  const chromium = (await import('@sparticuz/chromium')).default
  const executablePath = await chromium.executablePath()
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.resolve('@sparticuz/chromium'))))
  const archive = path.join(root, 'bin/al2023.tar.br')
  const librariesRoot = path.join(os.tmpdir(), 'chem-badge-chromium-libs')
  const libraries = path.join(librariesRoot, 'lib')
  if (!fs.existsSync(path.join(libraries, 'libnspr4.so')) && fs.existsSync(archive)) {
    fs.mkdirSync(librariesRoot, { recursive: true })
    const tar = path.join(os.tmpdir(), 'chem-lesson4-al2023.tar')
    fs.writeFileSync(tar, zlib.brotliDecompressSync(fs.readFileSync(archive)))
    execFileSync('tar', ['-xf', tar, '-C', librariesRoot])
    fs.rmSync(tar)
  }
  return { puppeteer, executablePath, libraries: fs.existsSync(libraries) ? libraries : undefined }
}
const config = await browserConfig()
const browser = await config.puppeteer.launch({ executablePath: config.executablePath, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], env: { ...process.env, ...(config.libraries ? { LD_LIBRARY_PATH: config.libraries } : {}) } })
const checks = []
const errors = []
const geometries = []
let serial = 0
let profile = ''
const check = (name, ok, details = undefined) => { checks.push({ profile, name, passed: Boolean(ok), ...(details === undefined ? {} : { details }) }); if (!ok) console.error(`FAIL ${profile}: ${name}`, details ?? '') }

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}
async function safeClick(page, node) {
  // Smooth scrolling is a platform preference; force this QA pointer target to
  // settle instantly so a moving control or sticky header cannot steal it.
  await node.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }))
  await settle(page)
  await page.waitForFunction((element) => {
    const rect = element.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    return element === hit || element.contains(hit)
  }, { timeout: 5000 }, node)
  await node.click()
  await settle(page)
}
async function clickInput(page, selector, index = 0) {
  const node = (await page.$$(selector))[index]
  const label = (await node.evaluateHandle((element) => element.closest('label') ?? element)).asElement()
  await safeClick(page, label)
}
async function clickText(page, text, selector = 'button') {
  await page.waitForFunction((text, selector) => [...document.querySelectorAll(selector)].some((node) => node.textContent.trim() === text), { timeout: 5000 }, text, selector)
  for (const node of await page.$$(selector)) {
    if ((await node.evaluate((element) => element.textContent.trim())) === text && await node.boundingBox()) { await safeClick(page, node); return }
    await node.dispose()
  }
  throw new Error(`Missing visible ${selector}: ${text}`)
}
async function visit(page, route) {
  await page.goto(`${ORIGIN}${route}${route.includes('?') ? '&' : '?'}qa=${++serial}`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
}
async function step(page, id) {
  const index = lesson.steps.findIndex((item) => item.id === id)
  await page.goto(`${ORIGIN}${lessonPath}?qa=${++serial}#step-${index + 1}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('.step__title')
  await page.evaluate(() => document.fonts.ready)
}
async function shot(page, name, selector) {
  const file = path.join(OUT, `${profile}-${name}.png`)
  if (selector) await page.$eval(selector, (node) => window.scrollTo({ top: window.scrollY + node.getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().height - 20, behavior: 'instant' }))
  await settle(page)
  await page.screenshot({ path: file, fullPage: false })
}
async function layout(page, name) {
  const measurement = await page.evaluate(() => {
    const root = document.documentElement
    const equations = [...document.querySelectorAll('.word-equation')].map((equation) => {
      const terms = [...equation.querySelectorAll(':scope > .word-equation__term')]
      const x = terms.map((term) => term.getBoundingClientRect().left)
      const arrow = equation.querySelector('.word-equation__arrow-glyph').getBoundingClientRect()
      const condition = equation.querySelector('.word-equation__condition')?.getBoundingClientRect()
      const scroll = equation.closest('.word-equation-scroll')
      return {
        text: equation.getAttribute('aria-label'), direction: getComputedStyle(equation).direction,
        isolated: getComputedStyle(equation).unicodeBidi === 'isolate',
        namesRTL: terms.every((term) => getComputedStyle(term.querySelector('.word-equation__name')).direction === 'rtl'),
        termX: x, increasingX: x.every((value, index) => index === 0 || value > x[index - 1]),
        conditionAbove: !condition || condition.bottom <= arrow.top + 1,
        scrollWidth: scroll.scrollWidth, clientWidth: scroll.clientWidth,
      }
    })
    const lab = document.querySelector('.reaction-lab')
    const labBox = lab?.getBoundingClientRect()
    const clippedLabChildren = lab ? [...lab.children].filter((node) => {
      const rect = node.getBoundingClientRect()
      return rect.left < labBox.left + 0.5 || rect.right > labBox.right - 0.5
    }).map((node) => node.className) : []
    const contact = document.querySelector('.site-contact__chip')
    const box = contact?.getBoundingClientRect()
    return { viewport: innerWidth, pageWidth: root.scrollWidth, equations, hasLab: Boolean(lab), clippedLabChildren, contact: { text: contact?.textContent.trim(), href: contact?.href, top: box?.top, right: box?.right, beforeHeader: Boolean(document.querySelector('.site-contact + .site-header')) } }
  })
  geometries.push({ profile, name, ...measurement })
  check(`${name}: no page-level horizontal overflow`, measurement.pageWidth <= measurement.viewport + 1, { viewport: measurement.viewport, pageWidth: measurement.pageWidth })
  check(`${name}: contact label, number, URL and original header placement preserved`, measurement.contact.text === 'المهندس سومر شاهين: 0930215022' && measurement.contact.href === 'https://wa.me/963930215022' && measurement.contact.beforeHeader && measurement.contact.right <= measurement.viewport + 1)
  if (measurement.hasLab) check(`${name}: ordinary lab content is not clipped by the panel`, measurement.clippedLabChildren.length === 0, measurement.clippedLabChildren)
  for (const [index, equation] of measurement.equations.entries()) check(`${name}: word equation ${index + 1} LTR / Arabic RTL / heating above arrow`, equation.direction === 'ltr' && equation.isolated && equation.namesRTL && equation.increasingX && equation.conditionAbove, equation)
}
async function accessibility(page, name, selector = '#main-content') {
  await page.addScriptTag({ path: path.join(ROOT, 'node_modules/axe-core/axe.min.js') })
  const violations = await page.evaluate(async (selector) => {
    const result = await window.axe.run(document.querySelector(selector), { rules: { region: { enabled: false } } })
    return result.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }))
  }, selector)
  check(`${name}: real-browser axe serious/critical (including contrast)`, violations.length === 0, violations)
}
async function reorder(page, root, question, area = false) {
  const labels = area ? '.ta-order__label' : '.ordering__label'
  const items = area ? '.ta-order__item' : '.ordering__item'
  for (let position = 0; position < question.correctOrder.length; position++) {
    const id = question.correctOrder[position]
    const targetLabel = question.items.find((item) => item.id === id).label
    let order = await page.$$eval(`${root} ${labels}`, (nodes) => nodes.map((node) => node.textContent.trim()))
    let current = order.indexOf(targetLabel)
    if (current < 0) throw new Error(`Ordering label not found: ${targetLabel}`)
    while (current > position) {
      const row = (await page.$$(`${root} ${items}`))[current]
      await safeClick(page, await row.$('button[aria-label*="إلى الأعلى"]'))
      current--
    }
  }
}
async function answerFinal(page, question) {
  const root = `[data-question="${question.id}"]`
  switch (question.type) {
    case 'multiple-choice': for (const id of question.correctOptionIds) await clickInput(page, `${root} input[value="${id}"]`); break
    case 'true-false': await clickInput(page, `${root} input[type="radio"]`, question.correctAnswer ? 0 : 1); break
    case 'fill-blank': for (const blank of question.blanks) await page.type(`${root} input[id$="-${blank.id}"]`, blank.acceptedAnswers[0]); break
    case 'numerical': await page.type(`${root} input`, String(question.acceptedAnswers[0])); break
    case 'matching': for (const pair of question.pairs) await (await page.$$(`${root} select`))[question.left.findIndex((left) => left.id === pair.leftId)].select(pair.rightId); break
    case 'ordering': await reorder(page, root, question); break
    default: throw new Error(`Unsupported/non-deterministic final item: ${question.type}`)
  }
}
async function answerBank(page, question) {
  const root = '.ta-runner .ta-question'
  switch (question.type) {
    case 'single-choice': case 'multi-select': case 'error-analysis': for (const id of question.correctOptionIds) await clickInput(page, `${root} input[value="${id}"]`); break
    case 'true-false': await clickInput(page, `${root} input[type="radio"]`, question.correctAnswer ? 0 : 1); break
    case 'exact': await page.type(`${root} input`, question.answer.acceptedAnswers[0]); break
    case 'error-correction': await page.type(`${root} input`, question.correction.spec.acceptedAnswers[0]); break
    case 'matching': for (const pair of question.pairs) await (await page.$$(`${root} select`))[question.left.findIndex((left) => left.id === pair.leftId)].select(pair.rightId); break
    case 'ordering': await reorder(page, root, question, true); break
    default: throw new Error(`Unexpected Lesson 4 bank format: ${question.type}`)
  }
}

try {
  for (const device of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    profile = device.name
    const page = await browser.newPage()
    await page.setViewport({ width: device.width, height: device.height, deviceScaleFactor: 1 })
    page.on('pageerror', (error) => errors.push({ profile: device.name, message: error.message }))
    const requests = new Set()
    page.on('request', (request) => requests.add(request.url()))
    const reached = new Set()
    for (const item of lesson.steps.filter((step) => step.kind !== 'final-test')) {
      await step(page, item.id)
      check(`${item.id}: original step/order reached`, (await page.$eval('.step__title', (node) => node.textContent.trim())) === item.title)
      await layout(page, item.id)
      for (const id of await page.$$eval('.question[data-origin="textbook"]', (nodes) => nodes.map((node) => node.dataset.question))) reached.add(id)
      if (['opening', 'magnesium-word-activity', 'book-question-2', 'book-question-6'].includes(item.id)) await shot(page, item.id, '.lesson-shell__main')
    }
    check('all 33 source activity/self-test units reached', reached.size === 33, [...reached])
    await step(page, 'opening')
    await accessibility(page, 'lesson opening')

    await step(page, 'observation-lab')
    await page.focus('.observation-lab .button--primary')
    await page.keyboard.press('Enter')
    await settle(page)
    check('keyboard Enter can perform the observation step', await page.$eval('.observation-lab', (node) => node.dataset.phase === 'observe'))
    check('lemon produces qualitative bubbles/foam', Boolean(await page.$('.reaction-lab__bubbles')))
    await clickText(page, 'فسر الملاحظة')
    check('observation → interpretation is separate', (await page.$eval('.observation-lab', (node) => node.dataset.phase)) === 'infer')
    await shot(page, 'lemon-observed', '.reaction-lab')
    await clickText(page, 'ماء جافيل والصباغ')
    await clickText(page, 'مشاهدة القطرة الافتراضية')
    check('cloth bleaching changes visual patch', await page.$eval('.reaction-lab__cloth-patch', (node) => node.getAttribute('opacity')) === '1')
    await clickText(page, 'فسر الملاحظة')
    check('bleach/acid safety stays explicit', (await page.$eval('.lab__conclusion', (node) => node.textContent)).includes('لا يمزج ماء جافيل'))
    await clickText(page, 'الغاز ورائق الكلس')
    await clickText(page, 'تمرير الغاز افتراضياً')
    check('limewater shows precipitate and clouding', Boolean(await page.$('.reaction-lab__precipitate')))
    await clickText(page, 'إعادة المشهد')
    check('observation reset removes inferred/observed state', !await page.$('.reaction-lab__precipitate'))
    await accessibility(page, 'observation lab', '.reaction-lab')

    await step(page, 'magnesium-lab')
    check('Mg requires safety acknowledgement', await page.$eval('.magnesium-lab .button--primary', (node) => node.disabled))
    await clickInput(page, '.reaction-lab__safety input')
    await clickText(page, 'قرب الشريط افتراضياً')
    check('Mg burning replaces ready view with bright glow', Boolean(await page.$('.reaction-lab__mg-glow')))
    await shot(page, 'magnesium-burning', '.reaction-lab')
    await clickText(page, 'راقب الناتج بعد الاحتراق')
    check('Mg product is new white oxide, with MgO', Boolean(await page.$('.reaction-lab__powder')) && Boolean(await page.$('[data-formula="MgO"]')))
    await layout(page, 'magnesium product')
    await shot(page, 'magnesium-product', '.reaction-lab')
    await accessibility(page, 'magnesium lab', '.reaction-lab')
    await clickText(page, 'إعادة المحاكاة')
    check('Mg reset clears safety and product', !await page.$('.reaction-lab__powder') && !await page.$eval('.reaction-lab__safety input', (node) => node.checked))

    await step(page, 'word-equation-lab')
    const builder = await page.$$('.word-lab select')
    await builder[0].select('الأكسجين'); await builder[1].select('أكسيد المغنزيوم')
    check('builder does not judge until explicit request', await page.$eval('.word-lab', (node) => node.dataset.checked) === 'false')
    await clickText(page, 'تحقق من المعادلة')
    check('builder verifies Mg materials and roles', (await page.$eval('.lab__conclusion', (node) => node.textContent)).includes('اتسقت البطاقة'))
    await clickText(page, 'الحديد والكبريت')
    await page.waitForFunction(() => document.querySelector('.word-lab').dataset.reaction === 'iron')
    check('builder actually switches to the iron/sulfur context and resets selections', await page.$eval('.word-lab select', (node) => node.value === ''))
    const iron = await page.$$('.word-lab select')
    await iron[0].select('الكبريت'); await iron[1].select('كبريتيد الحديد II')
    await clickText(page, 'تحقق من المعادلة')
    check('builder verifies the iron reaction before its II notation', (await page.$eval('.lab__conclusion', (node) => node.textContent)).includes('اتسقت البطاقة'))
    check('builder keeps printed II isolated LTR', await page.$eval('.word-equation__term:last-child .sci', (node) => node.textContent === 'II' && getComputedStyle(node).direction === 'ltr'))
    await layout(page, 'iron word reaction')
    await shot(page, 'word-builder', '.reaction-lab')
    if (profile === 'mobile') {
      await page.focus('.word-lab .word-equation-scroll')
      const start = await page.$eval('.word-lab .word-equation-scroll', (node) => node.scrollLeft)
      await page.keyboard.press('ArrowRight')
      await page.waitForFunction((start) => document.querySelector('.word-lab .word-equation-scroll').scrollLeft > start, { timeout: 2000 }, start)
      check('narrow word equation can be scrolled by keyboard, not only touch', true)
      await page.$eval('.word-lab .word-equation-scroll', (node) => node.scrollTo({ left: 0, behavior: 'instant' }))
    }
    await accessibility(page, 'word builder', '.reaction-lab')

    await step(page, 'burner-lab')
    await clickText(page, 'ضع صحن الخزف فوق اللهب')
    check('condition 1 is blue / clean plate', await page.$eval('.reaction-lab__soot', (node) => Number(node.getAttribute('opacity')) === 0))
    await shot(page, 'burner-complete', '.reaction-lab')
    await clickText(page, 'الحالة (2): إغلاق الثقب جزئياً')
    await clickText(page, 'ضع صحن الخزف فوق اللهب')
    check('condition 2 changes air hole and deposits soot', Boolean(await page.$('.reaction-lab__air-hole--closed')) && await page.$eval('.reaction-lab__soot', (node) => Number(node.getAttribute('opacity')) > 0))
    check('CO₂ has a true lower subscript, not a Unicode glyph left in prose', await page.$eval('.reaction-lab__result sub', (node) => node.tagName === 'SUB' && node.textContent === '2' && node.getBoundingClientRect().top > node.parentElement.querySelector('.chem-formula__element').getBoundingClientRect().top))
    await clickText(page, 'قارن الحالتين')
    await layout(page, 'burner comparison')
    await shot(page, 'burner-incomplete', '.reaction-lab')
    await accessibility(page, 'combustion lab', '.reaction-lab')
    await clickText(page, 'إعادة تجربة الموقد')
    check('burner reset clears product and plate', !await page.$('.reaction-lab__plate') && !await page.$('.reaction-lab__result'))

    if (device.name === 'mobile') {
      await clickText(page, 'خطوات الدرس')
      check('mobile outline drawer opens', Boolean(await page.$('[role="dialog"]')))
      const buttons = await page.$$('[role="dialog"] button')
      const first = await Promise.all(buttons.map(async (node) => ({ node, text: await node.evaluate((element) => element.textContent) })))
      const opening = first.find((item) => item.text.includes(lesson.steps[0].title))
      if (!opening) throw new Error('Mobile outline lacks opening step')
      await safeClick(page, opening.node)
      check('mobile drawer selection navigates and restores content focus', (await page.$eval('.step__title', (node) => node.textContent.trim())) === lesson.steps[0].title && await page.evaluate(() => document.activeElement?.id) === 'lesson-content')
    }

    await step(page, 'final-test')
    check('lesson final contains exactly 20 real questions', (await page.$$('[data-question]')).length === 20)
    await clickText(page, 'إنهاء الاختبار وعرض النتيجة')
    check('empty final cannot submit or override', Boolean(await page.$('.alert')) && !await page.$('.attempt-summary') && !(await page.$$eval('button', (nodes) => nodes.some((node) => node.textContent.trim() === 'إرسال على أي حال'))))
    await accessibility(page, 'unsubmitted final')
    for (const question of finalTest.questions) await answerFinal(page, question)
    check('all 20 controls record completed responses', await page.$eval('.final-test [role="progressbar"]', (node) => node.getAttribute('aria-valuenow')) === '20')
    check('completed but unsubmitted attempt still hides correctness, score and explanations', !await page.$('[data-correct], [data-outcome], .question__explanation, .attempt-summary__score'))
    await clickText(page, 'إنهاء الاختبار وعرض النتيجة')
    check('submitted lesson final gives 20 deterministic correct outcomes + full reasoning', (await page.$$('[data-outcome="correct"]')).length === 20 && (await page.$$('.question__explanation')).length === 20 && (await page.$eval('.attempt-summary__score', (node) => node.textContent)).includes('20 من 20'))
    check('submitted strict review locks all response controls', await page.$$eval('.final-test input, .final-test select', (nodes) => nodes.every((node) => node.disabled)))
    await shot(page, 'lesson-final-results', '.attempt-summary')
    await clickText(page, 'إعادة المحاولة')
    check('lesson final restart removes score and answers', !await page.$('.attempt-summary') && await page.$eval('.final-test [role="progressbar"]', (node) => node.getAttribute('aria-valuenow')) === '0')

    requests.clear()
    await visit(page, '/test-area/chem-u1-l4')
    await page.waitForSelector('.ta-runner')
    await clickText(page, 'إرسال الإجابات')
    check('independent bank also blocks incomplete override', !await page.$('.ta-result') && !(await page.$$eval('button', (nodes) => nodes.some((node) => node.textContent.trim() === 'أرسل على أي حال'))))
    for (const [index, question] of bank.questions.entries()) {
      await page.waitForSelector(`#ta-q-${question.id}`)
      await answerBank(page, question)
      check(`Test Area ${question.id}: no pre-submit outcome`, !await page.$('.ta-result, .ta-chip--correct, .ta-solution'))
      if (index < bank.questions.length - 1) await clickText(page, 'التالي', '.ta-runner__nav button')
    }
    check('independent solution module not requested during attempt', Boolean(solutionBundle) && ![...requests].some((url) => url.endsWith(`/${solutionBundle}`)))
    await clickText(page, 'إرسال الإجابات')
    check('independent bank reaches deterministic 20/20', (await page.$eval('.ta-result__percent-label', (node) => node.textContent)).includes('20 من 20'))
    await layout(page, 'Test Area result')
    await shot(page, 'test-area-result', '.ta-result__score')
    await clickText(page, 'إعادة الاختبار من جديد')
    check('independent bank restart clears grading', Boolean(await page.$('.ta-runner')) && !await page.$('.ta-result'))
    await visit(page, '/test-area/chem-u1-l4/solutions')
    await page.waitForSelector('.ta-solution')
    const solutionIds = new Set()
    for (let part = 0; part < 4; part++) {
      for (const id of await page.$$eval('.ta-solution', (nodes) => nodes.map((node) => node.id))) solutionIds.add(id)
      await layout(page, `solutions part ${part + 1}`)
      if (part < 3) await clickText(page, 'الجزء التالي', '.ta-chunk-nav:first-of-type button')
    }
    check('all 20 independent full solutions reached across four parts', solutionIds.size === 20)
    await shot(page, 'test-area-solution', '.ta-solution')

    await visit(page, '/teacher/book-solutions?lesson=chem-u1-l4')
    await page.waitForSelector('input[type="password"]')
    await page.type('input[type="password"]', password)
    await clickText(page, 'دخول مساحة المعلم')
    await page.waitForSelector('.teacher-answer')
    check('four separate Teacher lesson tabs; guide + all 33 source solutions', (await page.$$('.teacher-lesson-tab')).length === 4 && Boolean(await page.$('.teacher-concept-guide')) && (await page.$$('.teacher-answer')).length === 33)
    check('Teacher guide page ranges stay as single LTR isolates', await page.$$eval('.teacher-concept-guide .sci[dir="ltr"]', (nodes) => ['24–25', '25–28', '26–29', '28–29'].every((range) => nodes.some((node) => node.textContent === range))))
    check('Teacher tab links to full separate-bank solutions', await page.$eval('a[href$="/test-area/chem-u1-l4/solutions"]', (node) => node.textContent.includes('الحلول المفصلة')))
    await accessibility(page, 'Teacher Lesson 4 source solutions')
    await layout(page, 'Teacher source solutions')
    await shot(page, 'teacher-guide', '.teacher-concept-guide')
    await visit(page, '/teacher/final-test-solutions?lesson=chem-u1-l4')
    check('Teacher has all 20 final solutions with worked reasoning', (await page.$$('.teacher-answer')).length === 20 && (await page.$$('.teacher-answer .procedure')).length === 20)
    await accessibility(page, 'Teacher Lesson 4 final solutions')
    await layout(page, 'Teacher final solutions')
    await shot(page, 'teacher-final-solution', '.teacher-answer')
    for (const old of ['atom-and-element', 'chemical-bonds', 'chemical-formulas']) {
      await visit(page, `/chemistry/structural-chemistry/${old}`)
      check(`existing ${old} lesson/navigation still available`, Boolean(await page.$('.lesson-outline')) && Boolean(await page.$('.step__title')))
      await layout(page, `existing ${old}`)
    }
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await step(page, 'observation-lab')
    await clickText(page, 'إضافة قطرات افتراضياً')
    check('reduced-motion preserves science without animation', Boolean(await page.$('.reaction-lab--still')) && await page.$eval('.reaction-lab__bubble', (node) => getComputedStyle(node).animationName === 'none'))
    if (device.name === 'mobile') {
      await page.setViewport({ width: 320, height: 740, deviceScaleFactor: 1 })
      await step(page, 'magnesium-word-activity')
      await layout(page, '320px source word-equation stress')
      await shot(page, '320px-word-equation')
    }
    await page.close()
  }
  check('no JavaScript runtime errors across desktop/mobile routes/interactions', errors.length === 0, errors)
} catch (error) {
  errors.push({ profile, message: error.stack ?? String(error) })
  check('browser harness completes', false, String(error))
} finally {
  const passed = checks.filter((item) => item.passed).length
  const report = { browser: await browser.version(), pages: '24–29', profiles: ['1280×900', '390×844', '320×740 stress'], passed, failed: checks.length - passed, checks, geometries, errors }
  fs.writeFileSync(path.join(OUT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Lesson 4 Chromium: ${report.passed} passed / ${report.failed} failed; evidence ${path.relative(ROOT, OUT)}`)
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
  process.exitCode = report.failed === 0 ? 0 : 1
}
