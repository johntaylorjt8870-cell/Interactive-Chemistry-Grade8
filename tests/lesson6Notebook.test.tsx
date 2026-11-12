import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createServer, type Server } from 'node:http'
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import nodePath from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { brotliDecompressSync } from 'node:zlib'
import { execFileSync } from 'node:child_process'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { chemistryLesson6, chemistryLesson6StudentNotebook as notebook } from '@/data/curriculum/chemistryLesson6'
import { getLesson } from '@/data/curriculum/registry'
import { progressStore } from '@/data/progress'
import { StudentNotebookRevision, StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderApp, renderWithTheme } from './utils/renderApp'
import { strayScriptGlyphs } from './utils/strayGlyphs'

const path = '/chemistry/structural-chemistry/chemical-equations'
const expectedReviewQuestions = [
  'كيف تقرأ علامة الجمع بين المواد قبل سهم التفاعل، وكيف تقرؤها بين المواد بعده؟',
  'في تجربة الزنك، أيّ العبارتين ملاحظة مباشرة وأيّهما استنتاج: تصاعدت فقاعات أم تكوّن غاز الهدروجين؟ وضّح الفرق.',
  'عند التعبير عن تجربة بمعادلة كيميائية، لماذا لا نكتب أنبوب الاختبار ضمن المواد المتفاعلة أو الناتجة؟',
]
const stepIds = ['discovery-opening', 'entry-source', 'foundation-reaction-anatomy', 'foundation-formulas-and-diatomics', 'foundation-numbers-in-chemistry', 'experiment-zinc-hcl-source', 'experiment-observation-vs-interpretation', 'zinc-hcl-virtual-lab', 'observe-and-state-table-source', 'state-symbols-deep', 'zinc-balancing-source', 'conclude-equation-source', 'qualitative-vs-quantitative-deep', 'worked-example-al-hcl-source', 'worked-example-al-hcl-explained', 'balancing-methodology', 'worked-example-displacement-radicals', 'worked-example-combustion-decomposition', 'equation-balancer-simulation', 'activity-p39-source', 'activity-p39-review', 'word-to-symbol-builder', 'learned-box-source', 'common-errors', 'error-spotter-activity', 'comparison-representations', 'self-test-q1-source', 'self-test-q1-review', 'self-test-q2-source', 'self-test-q2-review', 'practice-foundational', 'practice-application', 'practice-reasoning', 'comprehensive-summary', 'final-test']

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  progressStore.resetAll()
})

describe('Lesson 6 notebook — wiring and display', () => {
  it('attaches to the existing lesson without altering the 35 step IDs', () => {
    expect(getLesson('chemistry', 'structural-chemistry', 'chemical-equations')?.studentNotebook).toBe(notebook)
    expect(chemistryLesson6.steps.map((step) => step.id)).toEqual(stepIds)
    expect(notebook.source.pages.map((page) => page.page)).toEqual(['36', '37', '38', '39'])
    expect(notebook.sections.map((s) => s.id)).toEqual(['objectives-and-keywords', 'chemical-equation', 'symbol-meanings', 'balancing', 'learned-summary'])
  })

  it('renders a separate review card, visible provenance and accessible text', async () => {
    const { container } = renderWithTheme(<div dir="rtl"><StudentNotebookView notebook={notebook} /><StudentNotebookRevision notebook={notebook} /></div>)
    const article = screen.getByRole('article')
    expect(article.querySelectorAll('[data-notebook-section]')).toHaveLength(5)
    expect(article).toHaveTextContent('توضيح من المنصة — ليس نصاً من الكتاب')
    expect(article.querySelector('.student-notebook-revision')).toBeNull()
    const card = container.querySelector('.student-notebook-revision')!
    expect(within(card as HTMLElement).getAllByRole('listitem').map((item) => item.textContent)).toEqual(expectedReviewQuestions)
    expect(card).toHaveTextContent('أسئلة مراجعة — ليست مادة تُنسخ في الدفتر')
    expect(strayScriptGlyphs(container)).toEqual([])
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id)).toEqual([])
  })

  it('opens as the last tab, preserves the step, progress and answer, and returns', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/#step-3')
    renderApp(path)
    await screen.findByRole('heading', { level: 1, name: /المعادلة الكيميائيّة/ })
    const nav = within(screen.getByRole('complementary', { name: 'مخطط الدرس' })).getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons.filter((button) => !button.hasAttribute('data-tab'))).toHaveLength(35)
    expect(buttons.at(-1)).toHaveAttribute('data-tab', 'notebook')
    const step = document.querySelector('.step')!
    const answer = screen.getAllByRole('radio')[0]!
    await user.click(answer)
    expect(answer).toBeChecked()
    const progress = screen.getByRole('progressbar', { name: 'التقدّم في الدرس' })
    const before = progress.getAttribute('aria-valuenow')
    const seen = [...progressStore.getLesson('chem-u1-l6')!.seenStepIds]
    await user.click(buttons.at(-1)!)
    expect(window.location.hash).toBe('#student-notebook')
    expect(step).toHaveAttribute('hidden')
    expect(answer).toBeChecked()
    expect(progress).toHaveAttribute('aria-valuenow', before)
    expect(progressStore.getLesson('chem-u1-l6')!.seenStepIds).toEqual(seen)
    expect(screen.getByRole('article', { name: /المعادلة الكيميائيّة — مادة الدفتر المدرسي/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))
    expect(step).not.toHaveAttribute('hidden')
    expect(answer).toBeChecked()
    expect(progress).toHaveAttribute('aria-valuenow', before)
    expect(progressStore.getLesson('chem-u1-l6')!.seenStepIds).toEqual(seen)
  })
})

/* Browser packages stay optional for normal builds. When disabled, the three
 * checks are explicitly skipped and the console warning gives the command. */
const browserEnabled = process.env.LESSON6_NOTEBOOK_BROWSER === '1'
if (!browserEnabled) {
  console.warn('فحص Chromium لدفتر الدرس السادس متجاوز (3 اختبارات). بعد البناء وتثبيت أدوات المتصفح الاختيارية، شغّل: LESSON6_NOTEBOOK_BROWSER=1 npm test -- tests/lesson6Notebook.test.tsx')
}

type BrowserPage = {
  setViewport(viewport: { width: number; height: number; deviceScaleFactor: number }): Promise<void>
  goto(url: string, options: { waitUntil: 'networkidle0' }): Promise<unknown>
  waitForSelector(selector: string): Promise<unknown>
  click(selector: string): Promise<void>
  evaluate<T>(fn: () => T | Promise<T>): Promise<Awaited<T>>
  addScriptTag(options: { path: string }): Promise<unknown>
  waitForFunction(fn: () => boolean): Promise<unknown>
  close(): Promise<void>
}

type BrowserHandle = { newPage(): Promise<unknown>; close(): Promise<void> }
type BrowserLauncher = {
  launch(options: { executablePath: string; headless: true; args: string[]; env: NodeJS.ProcessEnv }): Promise<unknown>
}
type ChromiumProvider = { executablePath(): Promise<string> }

/** Validate the dynamically loaded interfaces before calling any methods. */
function assertMethods<T>(value: unknown, label: string, methods: readonly string[]): asserts value is T {
  if ((typeof value !== 'object' || value === null) && typeof value !== 'function') {
    throw new Error(`${label}: expected an object`)
  }
  const object = Object(value) as Record<string, unknown>
  for (const method of methods) {
    if (typeof object[method] !== 'function') throw new Error(`${label}: missing method ${method}`)
  }
}

function moduleDefault(module: unknown, label: string): unknown {
  if (typeof module !== 'object' || module === null || !('default' in module)) {
    throw new Error(`${label}: missing default export`)
  }
  return module.default
}

describe.skipIf(!browserEnabled)('Lesson 6 notebook — production Chromium', () => {
    let server: Server
    let origin: string
    let browser: BrowserHandle | undefined
    const base = '/Interactive-Chemistry-Grade8'
    const dist = nodePath.resolve('dist')

    beforeAll(async () => {
      server = createServer((request, response) => {
        let route = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
        if (route.startsWith(base)) route = route.slice(base.length)
        let file = nodePath.resolve(dist, `.${route}`)
        if (!file.startsWith(`${dist}${nodePath.sep}`) || !existsSync(file) || statSync(file).isDirectory()) {
          file = nodePath.join(dist, 'index.html')
        }
        const mime: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png' }
        response.setHeader('content-type', mime[nodePath.extname(file)] ?? 'application/octet-stream')
        createReadStream(file).pipe(response)
      })
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
      const address = server.address()
      if (!address || typeof address === 'string') throw new Error('No browser test server port')
      origin = `http://127.0.0.1:${address.port}`
      const puppeteerPackage = 'puppeteer-core'
      const chromiumPackage = '@sparticuz/chromium'
      let launcherModule: unknown
      try {
        launcherModule = await import(/* @vite-ignore */ puppeteerPackage)
      } catch (error) {
        throw new Error(`فحص Chromium مطلوب: ثبّت puppeteer-core وأدوات المتصفح الاختيارية قبل تشغيله. ${error instanceof Error ? error.message : String(error)}`)
      }
      const launcher = moduleDefault(launcherModule, puppeteerPackage)
      assertMethods<BrowserLauncher>(launcher, puppeteerPackage, ['launch'])
      let executablePath = process.env.CHROMIUM_PATH
      let libraries: string | undefined
      if (!executablePath) {
        let chromiumModule: unknown
        try {
          chromiumModule = await import(/* @vite-ignore */ chromiumPackage)
        } catch (error) {
          throw new Error(`فحص Chromium مطلوب: ثبّت @sparticuz/chromium أو حدّد CHROMIUM_PATH. ${error instanceof Error ? error.message : String(error)}`)
        }
        const chromium = moduleDefault(chromiumModule, chromiumPackage)
        assertMethods<ChromiumProvider>(chromium, chromiumPackage, ['executablePath'])
        executablePath = await chromium.executablePath()
        if (typeof executablePath !== 'string' || !executablePath) throw new Error('Chromium executablePath لم يُرجع مساراً صالحاً')
        // Same AL2023 archive and library path as scripts/verify-lesson6-rendering.mjs.
        const require = createRequire(nodePath.join(process.cwd(), 'package.json'))
        const packageFile = require.resolve(chromiumPackage)
        const packageRoot = nodePath.dirname(nodePath.dirname(packageFile))
        const archive = nodePath.join(packageRoot, 'bin/al2023.tar.br')
        const librariesRoot = nodePath.join(tmpdir(), 'chem-badge-chromium-libs')
        const candidate = nodePath.join(librariesRoot, 'lib')
        if (!existsSync(nodePath.join(candidate, 'libnspr4.so')) && existsSync(archive)) {
          mkdirSync(librariesRoot, { recursive: true })
          const tar = nodePath.join(librariesRoot, 'al2023.tar')
          try {
            writeFileSync(tar, brotliDecompressSync(readFileSync(archive)))
            execFileSync('tar', ['-xf', tar, '-C', librariesRoot])
          } finally {
            rmSync(tar, { force: true })
          }
        }
        if (existsSync(candidate)) libraries = candidate
      }
      const env = { ...process.env, ...(libraries ? { LD_LIBRARY_PATH: [libraries, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } : {}) }
      const launched: unknown = await launcher.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], env })
      assertMethods<BrowserHandle>(launched, 'Chromium browser', ['newPage', 'close'])
      browser = launched
    }, 60000)

    afterAll(async () => {
      if (browser) await browser.close()
      if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    })

    for (const width of [1365, 390, 320]) {
      it(`opens and checks the real notebook and return journey at ${width}px`, async () => {
        if (!browser) throw new Error('Chromium لم يبدأ')
        const page: unknown = await browser.newPage()
        assertMethods<BrowserPage>(page, 'Chromium page', ['setViewport', 'goto', 'waitForSelector', 'click', 'evaluate', 'addScriptTag', 'waitForFunction', 'close'])
        try {
          await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
          await page.goto(`${origin}${base}${path}#step-3`, { waitUntil: 'networkidle0' })
          await page.waitForSelector('.step input[type=radio]')
          await page.click('.step input[type=radio]')
          const before = await page.evaluate(() => ({
            progress: document.querySelector('[role=progressbar]')!.getAttribute('aria-valuenow'),
            stored: localStorage.getItem('ipc:progress'),
            checked: (document.querySelector('.step input[type=radio]') as HTMLInputElement).checked,
            step: (document.querySelector('.step__title') as HTMLElement).innerText,
          }))
          if (width < 768) {
            await page.click('.lesson-shell__outline-trigger')
            await page.waitForSelector('[role=dialog] [data-tab=notebook]')
            await page.click('[role=dialog] [data-tab=notebook]')
          } else {
            await page.click('.lesson-shell__rail [data-tab=notebook]')
          }
          await page.waitForSelector('.student-notebook')
          await page.evaluate(() => document.fonts.ready)
          await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' })
          const actual = await page.evaluate(async () => {
            const article = document.querySelector('.student-notebook')!
            const card = document.querySelector('.student-notebook-revision')!
            const step = document.querySelector('.step') as HTMLElement
            const overflow = [...article.querySelectorAll('*'), ...card.querySelectorAll('*')].filter((element) => {
              const rect = element.getBoundingClientRect()
              return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1)
            }).length
            const axeApi = (window as unknown as { axe: { run: (element: Element, options: object) => Promise<{ violations: Array<{ impact: string | null; id: string }> }> } }).axe
            const axeResult = await axeApi.run(document.querySelector('#main-content') ?? document.body, { rules: { region: { enabled: false } } })
            return {
              docWidth: document.documentElement.scrollWidth,
              overflow,
              articleDirection: getComputedStyle(article).direction,
              cardDirection: getComputedStyle(card).direction,
              sections: article.querySelectorAll('[data-notebook-section]').length,
              reviewItems: [...card.querySelectorAll('li')].map((item) => item.textContent),
              reviewVisible: [...card.querySelectorAll('li')].every((item) => {
                const rect = item.getBoundingClientRect()
                const style = getComputedStyle(item)
                return rect.width > 0 && rect.height > 0 && style.visibility === 'visible' && style.display !== 'none'
              }),
              reviewSeparate: !article.contains(card),
              hidden: step.hidden,
              checked: (step.querySelector('input[type=radio]') as HTMLInputElement).checked,
              progress: document.querySelector('[role=progressbar]')!.getAttribute('aria-valuenow'),
              stored: localStorage.getItem('ipc:progress'),
              hash: location.hash,
              violations: axeResult.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id),
            }
          })
          expect(actual.docWidth).toBeLessThanOrEqual(width)
          expect(actual.overflow).toBe(0)
          expect([actual.articleDirection, actual.cardDirection]).toEqual(['rtl', 'rtl'])
          expect([actual.sections, actual.reviewSeparate, actual.reviewVisible]).toEqual([5, true, true])
          expect(actual.reviewItems).toEqual(expectedReviewQuestions)
          expect([before.checked, actual.checked, actual.hidden, actual.hash]).toEqual([true, true, true, '#student-notebook'])
          expect(actual.progress).toBe(before.progress)
          expect(actual.stored).toBe(before.stored)
          expect(actual.violations).toEqual([])
          await page.evaluate(() => {
            const button = [...document.querySelectorAll<HTMLButtonElement>('.lesson-nav button')].find((item) => item.innerText.includes('العودة إلى الدرس'))!
            button.click()
          })
          await page.waitForFunction(() => !(document.querySelector('.step') as HTMLElement).hidden)
          const after = await page.evaluate(() => ({
            checked: (document.querySelector('.step input[type=radio]') as HTMLInputElement).checked,
            progress: document.querySelector('[role=progressbar]')!.getAttribute('aria-valuenow'),
            step: (document.querySelector('.step__title') as HTMLElement).innerText,
            stored: localStorage.getItem('ipc:progress'),
          }))
          expect(after.checked).toBe(true)
          expect(after.progress).toBe(before.progress)
          expect(after.step).toBe(before.step)
          expect(JSON.parse(after.stored!).lessons['chem-u1-l6'].seenStepIds).toEqual(JSON.parse(before.stored!).lessons['chem-u1-l6'].seenStepIds)
        } finally {
          await page.close()
        }
      }, 60000)
    }
})
