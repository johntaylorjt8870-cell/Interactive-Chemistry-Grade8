import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { chemistryLesson6, chemistryLesson6StudentNotebook as notebook } from '@/data/curriculum/chemistryLesson6'
import katex from 'katex'
import { countFormulaAtoms } from '@/simulations/lesson5Models'
import { gcdList } from '@/simulations/lesson6Models'
import { LESSON6_LEDGER, LESSON6_OBJECTIVES } from '@/data/curriculum/lesson6SourceLedger'

const section = (id: string) => notebook.sections.find((item) => item.id === id)!
const printed = chemistryLesson6.steps.flatMap((step) => step.blocks).filter((block) => block.kind === 'textbook-verbatim')

const unnumber = (text: string) => text.replace(/^[٠-٩]+ ـ /u, '')
const rows = notebook.sourcesAppendix!.rows
const rowFor = (text: string) => rows.find(row => text.startsWith(`${row.item} ـ `))!
const step = (id: string) => chemistryLesson6.steps.find(s => s.id === id)!
// Same condition above the forward arrow; the notebook uses a fixed glyph for print.
const notebookArrow = (tex: string) => tex.replaceAll(String.raw`\xrightarrow{\Delta}`, String.raw`\overset{\Delta}{\longrightarrow}`)
const texOf = (id: string) => (section(id).notes ?? []).flatMap(n => n.tex ? [n.tex] : [])

describe('Lesson 6 notebook — source and content', () => {
  it('preserves the four textbook objectives and both keywords from page 36', () => {
    const points = section('objectives-and-keywords').points!.map(unnumber)
    const entry = printed.filter((block) => block.source.page === '36').map((block) => block.text).join('\n')
    const objectives = LESSON6_OBJECTIVES.filter((objective) => objective.origin === 'textbook')
    expect(objectives).toHaveLength(4)
    for (const objective of objectives) {
      expect(points).toContain(objective.printed)
      expect(entry).toContain(objective.printed)
    }
    const keywords = 'الكلمات المفتاحية: المعادلة الكيميائيّة الموزونة – دلالات الرّموز.'
    expect(points).toContain(keywords)
    expect(entry).toContain(keywords)
    expect(JSON.stringify(notebook.sections)).not.toContain(LESSON6_OBJECTIVES.find((objective) => objective.origin === 'platform')!.printed)
  })

  it('preserves the complete definition and balancing principle as locally quoted on page 38', () => {
    const definition = section('chemical-equation').definitions![0]
    const principle = unnumber(section('balancing').points![0])
    const source = printed.find((block) => block.source.page === '38' && block.source.item === 'أستنتج')!
    expect(definition.source).toBe('')
    expect(rowFor(definition.term)).toMatchObject({ page: '38', source: expect.stringContaining('p38-conclude-box') })
    expect(definition.text).toBe('المعادلة الكيميائيّة هي تعبيرٌ وصفيٌّ وكمّيٌّ عن التغيّر الكيميائيّ.')
    expect(principle).toBe('نوازن المعادلة الكيميائيّة بجعل عدد ذرّات كل عنصر متساوياً في طرفي المعادلة.')
    expect(source.text).toContain(definition.text)
    expect(source.text).toContain(principle)
  })

  it('retains all three complete learned-box sentences, including the balancing conclusion', () => {
    const summary = section('learned-summary').points!.map(unnumber)
    const learned = printed.find(block => block.source.page === '39' && block.source.item === 'تعلّمتُ')!
    expect(summary).toEqual(learned.text.split('\n• ').slice(1))
    expect(summary).toHaveLength(3)
    for (const point of summary) expect(learned.text).toContain(point)
    expect(summary[2]).toContain('موازنة المعادلة')
    for (const point of section('learned-summary').points!) expect(rowFor(point).source).toContain('p39-learned-box')
  })

  it('matches the five printed symbol/meaning pairs and documents rather than tagging the explanations', () => {
    const table = step('observe-and-state-table-source').blocks.find(b => b.kind === 'table')!
    expect(table.rows.map(row => row.cells.symbol)).toEqual(['s', 'ℓ', 'aq', 'g', 'Δ'])
    const actual = section('symbol-meanings').table!
    for (const symbol of ['s', 'ℓ', 'aq', 'g', 'Δ']) expect(actual.rows.map(r => r.cells.symbol)).toContain(symbol)
    expect(actual.rows).toEqual(table.rows)
    expect(section('symbol-meanings').points!.join(' ')).toMatch(/مذابة في الماء.*غاز.*فوق السهم/)
    for (const point of notebook.sections.flatMap(s => s.points ?? [])) {
      expect(rowFor(point).classification).toBeTruthy()
      expect(point).not.toMatch(/من المنصة|إحالة|راجع خطوة/)
    }
    expect(notebook.source.verified).toBe(false)
    expect(notebook.source.readability?.notes).toContain('لم تُعاين صور الصفحات الأصلية مباشرة')
  })

  it('requires written examples, tables and solutions, not raw RTL equations, external enrichment or test-runner data', () => {
    expect(notebook.enrichmentNote).toBeUndefined()
    expect(notebook.sections.every(s => !s.enrichment && !s.lewisMolecules && !s.notebookTool)).toBe(true)
    expect(notebook.sections.filter(s => s.table)).toHaveLength(8)
    expect(section('balancing').procedure!.steps).toHaveLength(4)
    expect(section('zinc-experiment').ordered).toHaveLength(3)
    const text = JSON.stringify(notebook.sections)
    expect(text).not.toMatch(/→|⟶|questionId|solutionBlocks|الإجابة الصحيحة/)
    expect(text).toContain('أختبر نفسي')
    for (const formula of ['ZnCl₂', 'HCl', 'AlCl₃', 'Na₂SO₄', 'CO']) expect(text).toContain(formula)
  })

  it('keeps the three approved unanswered reflection prompts in order, distinct from assessment wording', () => {
    const review = notebook.checklist!.items
    expect(review).toEqual([
      'كيف تقرأ علامة الجمع بين المواد قبل سهم التفاعل، وكيف تقرؤها بين المواد بعده؟',
      'في تجربة الزنك، أيّ العبارتين ملاحظة مباشرة وأيّهما استنتاج: تصاعدت فقاعات أم تكوّن غاز الهدروجين؟ وضّح الفرق.',
      'عند التعبير عن تجربة بمعادلة كيميائية، لماذا لا نكتب أنبوب الاختبار ضمن المواد المتفاعلة أو الناتجة؟',
    ])
    expect(new Set(review).size).toBe(3)
    const prompts: string[] = []
    const walk = (value: unknown) => {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value)) { value.forEach(walk); return }
      const obj = value as Record<string, unknown>
      if (typeof obj.prompt === 'string') prompts.push(obj.prompt)
      if (typeof obj.statement === 'string') prompts.push(obj.statement)
      Object.values(obj).forEach(walk)
    }
    walk(chemistryLesson6.tests)
    for (const question of review) expect(prompts).not.toContain(question)
    expect(JSON.stringify(notebook.checklist)).not.toMatch(/الإجابة|الحل|جواب/)
  })

  it('leaves the entire original step declaration unchanged, not only its count or IDs', () => {
    const file = readFileSync('src/data/curriculum/chemistryLesson6.ts', 'utf8')
    const steps = file.slice(file.indexOf('const steps: LessonStep[] = ['), file.indexOf('\nexport const chemistryLesson6: LessonDefinition'))
    expect(createHash('sha256').update(steps).digest('hex')).toBe('5d4e92dc71b25a45513a146490aa53da4a7ccdcbc3cd24e7dbd5e7389dbad391')
  })
})

describe('Lesson 6 notebook — audit against independent local witnesses', () => {
  it('accounts for all 34 ledger entries and all 20 book questions at their actual pages', () => {
    expect(LESSON6_LEDGER).toHaveLength(34)
    const questions = chemistryLesson6.tests!.find(test => test.id === 'chem-u1-l6-book')!.questions
    expect(questions).toHaveLength(20)
    for (const entry of LESSON6_LEDGER) {
      const refs = rows.filter(r => r.source.includes(`(${entry.id})`))
      expect(refs.length, entry.id).toBeGreaterThan(0)
      for (const r of refs) expect(r.page.split('، ')).toContain(entry.page)
    }
    for (const q of questions) {
      const r = rows.filter(r => r.source.startsWith('حلول أسئلة الدرس السادس: ') && r.source.split(/: |، /u).includes(q.id))
      expect(r.length, q.id).toBeGreaterThan(0)
      for (const ref of r) expect(ref).toMatchObject({ classification: 'حل تعليمي لسؤال الكتاب', page: q.source!.page })
    }
    for (const r of rows.filter(r => ['شرح من المنصة', 'حل تطبيق من خطوات المنصة'].includes(r.classification))) {
      expect(r.page).toBe('—')
      expect(step(r.source.replace('خطوة الدرس السادس: ', '')), r.source).toBeDefined()
    }
    expect(rows.filter(r => r.classification.includes('إعادة بناء'))).toMatchObject([{ source: expect.stringContaining('p37-figure-zinc-hcl'), page: '37' }])
  })

  it('teaches the opening, apparatus, two distinct observations, interpretation and safety without referring the learner elsewhere', () => {
    const rust = section('iron-and-air').points!.join(' ')
    for (const phrase of ['للرّطوبة', 'أكسجين الهواء', 'أكسيد حديد مميّه', 'الصدأ في جهة الناتج']) expect(rust).toContain(phrase)
    const exp = section('zinc-experiment')
    for (const tool of ['مسحوق الزنك', 'حمض كلور الماء الممدّد', 'أنابيب اختبار مع حاملها', 'ملقط خشبي', 'أعواد ثقاب', 'قطّارة']) expect(exp.lead).toContain(tool)
    expect(exp.ordered!.map(unnumber)).toEqual([expect.stringContaining('بالملقط'), expect.stringContaining('بالقطّارة'), expect.stringContaining('عود الثقاب المشتعل')])
    expect(exp.points![0]).toMatch(/بإشراف المعلم.*بعيداً عن الوجوه/)
    const obs = section('zinc-observations')
    expect(obs.points![0]).toMatch(/فقاعات.*يتناقص.*ملاحظة مباشرة/)
    expect(obs.points![1]).toMatch(/يشتعل الغاز.*H₂/)
    expect(obs.points![3]).toContain('ينتج غاز قابل للاشتعال ومحلول كلوريد الزّنك')
    expect(obs.points![4]).toContain('بقي كلوريد الزنك ذائباً')
    const pop = obs.points!.filter(t => t.includes('فرقعة'))
    expect(pop).toHaveLength(1)
    expect(rowFor(pop[0])).toMatchObject({ classification: 'شرح من المنصة', page: '—' })
    expect(obs.notes!.map(n => n.text).join(' ')).toMatch(/للزنك الصلب s.*للحمض المذاب aq.*المحلول aq.*المنطلق g/)
  })

  it('shows before/after Zn, Cl and H inventories, the coefficient decision, the quantitative ratio and both laws', () => {
    expect(section('zinc-before').table!.rows.map(({cells: c}) => [c.atom, c.reactants, c.products, c.verdict.split('؛')[0]])).toEqual([
      ['Zn', '1', '1', 'متساوٍ'], ['Cl', '1', '2', 'غير متساوٍ'], ['H', '1', '2', 'غير متساوٍ'],
    ])
    const zinc = step('zinc-balancing-source').blocks
    expect(section('zinc-balanced').table!.rows).toEqual(zinc.find(b => b.kind === 'table')!.rows)
    expect(texOf('zinc-balanced')).toEqual(zinc.filter(b => b.kind === 'formula').map(b => b.tex))
    expect(section('zinc-balanced').points![0]).toMatch(/المعامل 2 أمام الحمض.*لا دليلاً/)
    const law = section('balancing').points!.join(' ')
    for (const phrase of ['1 : 2 : 1 : 1', 'ليست نسبة كتل', 'لافوازييه: مجموع كتل', 'يساوي مجموع كتل', 'بروست:', 'بنسب كتلية ثابتة']) expect(law).toContain(phrase)
    const method = section('balancing').procedure!.steps
    for (const [i, keyword] of ['نثبّت الصيغ', 'بمجموعة بقيت كما هي', 'المضاعف المشترك الأصغر', 'قاسمها المشترك الأكبر'].entries()) expect(method[i]).toContain(keyword)
    expect(section('formula-writing').table!.rows.map(r => r.cells.valence)).toEqual(['1', '2', '3', '1', '2'])
    expect(section('atom-counting').definitions!.map(d => unnumber(d.term))).toEqual(['الدليل السفلي', 'المعامل الأمامي'])
    expect(section('checking-errors').table!.rows.map(r => r.id)).toEqual(['subscript', 'gas', 'state', 'sum', 'simplify'])
  })

  it('retains the word equations in order and all SIX symbolic lines of the worked example, including temporary imbalances', () => {
    for (const [id, witness] of [['zinc-observations', 'observe-and-state-table-source'], ['aluminum-worked', 'worked-example-al-hcl-source']]) {
      const blocks = step(witness).blocks
      const word = blocks.find(b => b.kind === 'word-equation')!
      expect(section(id).notes![0].wordEquation).toEqual({ reactants: word.reactants, products: word.products })
      expect(texOf(id)).toEqual(blocks.filter(b => b.kind === 'formula').map(b => b.tex))
    }
    const al = section('aluminum-worked')
    expect(al.notes).toHaveLength(7)
    expect(al.notes![3].text).toContain('أصغر مضاعف مشترك')
    expect(al.notes![4].text).toMatch(/ست ذرّات كلور.*2 أمام كلوريد/)
    expect(al.table!.rows.map(r => [r.cells.atom, r.cells.reactants, r.cells.products])).toEqual([
      ['Al', '2 × 1 = 2', '2 × 1 = 2'], ['H', '6 × 1 = 6', '3 × 2 = 6'], ['Cl', '6 × 1 = 6', '2 × 3 = 6'],
    ])
    for (const [id, witness, check] of [['intact-sulfate', 'worked-example-displacement-radicals', '3 × 4 = 12'], ['propane-worked', 'worked-example-combustion-decomposition', '10 ÷ 2 = 5']]) {
      expect(texOf(id)).toEqual(step(witness).blocks.filter(b => b.kind === 'formula').map(b => b.tex))
      expect(section(id).notes!.some(n => n.text.includes(check))).toBe(true)
    }
  })

  it('matches the givens, final equations (states and heat included) and working for all ten closing problems in book order', () => {
    const bookQuestions = chemistryLesson6.tests!.find(t => t.id === 'chem-u1-l6-book')!.questions
    for (const [id, prefix] of [['activities', 'l6-p39-act-'], ['self-test-q1', 'l6-book-q1-'], ['self-test-q2', 'l6-book-q2-']]) {
      const notes = section(id).notes!
      const problems = bookQuestions.filter(q => q.id.startsWith(prefix))
      const starts = notes.flatMap((n, i) => rowFor(n.text).kind.startsWith('مسألة:') ? [i] : [])
      expect(starts).toHaveLength(problems.length)
      problems.forEach((q, i) => {
        const group = notes.slice(starts[i], starts[i + 1])
        const given = q.material?.[0]
        if (given?.kind === 'formula') expect(group[0].tex).toBe(notebookArrow(given.tex))
        if (given?.kind === 'word-equation') expect(group[0].wordEquation).toEqual({ reactants: given.reactants, products: given.products })
        const worked = group.filter(n => rowFor(n.text).source.includes(q.id))
        const result = worked.at(-1)!
        expect(result.tex).toBe(notebookArrow(q.solutionBlocks!.find(b => b.kind === 'formula')!.tex))
        expect(result.role).toBe('appendix')
        expect(worked.filter(n => !n.tex).length, q.id).toBeGreaterThanOrEqual(1)
        if (['l6-p39-act-2', 'l6-book-q1-3', 'l6-book-q2-2'].includes(q.id)) {
          const warning = section(id).points!.find(t => rowFor(t).kind === 'حدود التمرين والسلامة')!
          const substance = { 'l6-p39-act-2': 'كبريتات الزنك', 'l6-book-q1-3': 'حمض الخل', 'l6-book-q2-2': 'كبريتات النحاس' }[q.id]
          expect(warning).toContain(substance)
          expect(warning).toMatch(/نظرية|نظري/)
          expect(warning).toMatch(/بعنف مع ماء المحلول.*حرارة.*هدروجين/)
          expect(rowFor(warning)).toMatchObject({ classification: 'شرح من المنصة', page: '—' })
        }
      })
    }
  })

  it('uses locally solved transfer problems and distinguishes the four taught reaction patterns', () => {
    const transfer = section('transfer-practice')
    const practice = chemistryLesson6.tests!.find(t => t.id === 'chem-u1-l6-practice')!.questions
    expect(transfer.table!.rows.map(r => r.id)).toEqual(['union', 'displacement', 'decomposition', 'combustion'])
    expect(transfer.notes).toHaveLength(4)
    for (const [i, id] of ['l6-pr-f5', 'l6-pr-a2', 'l6-pr-a3', 'l6-pr-a5'].entries()) {
      const source = practice.find(q => q.id === id)!
      const record = transfer.notes![i]
      expect(rowFor(record.text)).toMatchObject({ source: expect.stringContaining(id), page: '—', classification: 'تطبيق محلول من المنصة' })
      if (source.id === 'l6-pr-f5') {
        expect(record.tex).toBe(String.raw`2\mathrm{H}_{2(g)} + \mathrm{O}_{2(g)} \longrightarrow 2\mathrm{H}_2\mathrm{O}_{(l)}`)
        expect(record.text).toContain('أربع ذرّات هدروجين وذرّتا أكسجين')
      } else expect(record.tex).toBe(notebookArrow(source.solutionBlocks!.find(b => b.kind === 'formula')!.tex))
    }
  })

  it('recounts every atom from the rendered final equations and proves that each coefficient ratio is reduced', () => {
    const finals = [
      ...texOf('zinc-balanced'), texOf('aluminum-worked').at(-1)!, ...texOf('intact-sulfate'), texOf('propane-worked').at(-1)!,
      ...['activities', 'self-test-q1', 'self-test-q2'].flatMap(id => section(id).notes!.filter(n => rowFor(n.text).kind.startsWith('نتيجة وتحقّق:')).map(n => n.tex!)),
      ...texOf('transfer-practice'),
    ]
    expect(finals).toHaveLength(18)
    for (const tex of finals) {
      const xml = new DOMParser().parseFromString(katex.renderToString(tex, { output: 'mathml', strict: 'error' }), 'text/html')
      const equation = xml.querySelector('semantics')!.firstElementChild!.textContent!
      const sides = equation.split(/⟶Δ?/u)
      expect(sides, equation).toHaveLength(2)
      const coefficients: number[] = []
      const counts = sides.map(side => {
        const atoms: Record<string, number> = {}
        for (const term of side.split('+')) {
          const match = term.match(/^(\d+)?([A-Z][A-Za-z0-9()]*?)\((s|g|aq|l)\)$/)
          expect(match, term).not.toBeNull()
          const coefficient = Number(match![1] ?? '1')
          expect(coefficient).toBeGreaterThan(0)
          coefficients.push(coefficient)
          for (const [el, count] of Object.entries(countFormulaAtoms(match![2]))) atoms[el] = (atoms[el] ?? 0) + coefficient * count
        }
        return atoms
      })
      expect(counts[0], equation).toEqual(counts[1])
      expect(gcdList(coefficients), equation).toBe(1)
    }
  })

  it('compiles every symbolic line strictly in KaTeX and forbids embedded source chips, bidi controls or raw chemistry in prose', () => {
    const notes = notebook.sections.flatMap(s => s.notes ?? [])
    const equations = notes.filter(n => n.tex)
    expect(equations).toHaveLength(33)
    expect(notes.filter(n => n.wordEquation)).toHaveLength(5)
    for (const n of equations) {
      expect(n.notation).toBe('math')
      expect(n.tex).not.toMatch(/[\u0600-\u06ff]/u)
      expect(() => katex.renderToString(n.tex!, { throwOnError: true, strict: 'error' })).not.toThrow()
    }
    const prose = JSON.stringify([notebook.title, notebook.introduction, notebook.sections, notebook.checklist], (k, v) => k === 'tex' ? undefined : v)
    expect(prose).not.toMatch(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]|ص\s*[0-9٠-٩]|الصفح[ةات]+\s*[0-9٠-٩]|\[(كتاب|حل نشاط|منصة)\]|\\(?:mathrm|longrightarrow)|→|⟶/u)
  })
})
