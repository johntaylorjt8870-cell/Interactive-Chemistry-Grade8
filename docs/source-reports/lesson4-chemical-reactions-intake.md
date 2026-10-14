# Unit 1, Lesson 4 — source intake and implementation inventory

**Lesson:** «التفاعلات الكيميائية» (printed lesson number **4**).
**Source:** the six textbook page images displayed in the Arena task, printed pages **24–29**.
**Intake date:** 2026-10-13.
**Historical implementation-intake status:** the prior report recorded that two close-ups and a caption transcription had cleared the source text for implementation. The first independent final audit could not read the p24 red caption at full-page scale; a user-supplied crop on 2026-10-14 closed that remaining text check (see follow-up below).

The initial intake below was completed before coding. The clarification history is preserved; the implementation audit in sections 8–9 records actual coverage and verification separately. A dated follow-up below supersedes earlier statements that C1 remained unresolved.

This report was written before implementation. Arabic quotations below are an intake transcription of the visible images, not a replacement source. The images and any subsequent source close-ups remain authoritative. Uncertain text is explicitly flagged; it must not be promoted to `source-verified` or silently completed.

### Follow-up: p24 caption verified (2026-10-14)

The supplied close crop reads «إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)» across two lines. I compared it with the existing source quotation; it matches exactly. The text was already correct, so only the stale unverified source locator was removed. The original photo is still not present in the app or workspace; no figure-reproduction claim is made.

## 1. Repository intake

- Repository: `johntaylorjt8870-cell/Interactive-Chemistry-Grade8`.
- Working branch: `arena/43337c87-interactive-chemistry-grade8` (fixed by this Arena session).
- `git fetch origin main` was executed. The fetched `origin/main` and `HEAD` both identify `7d6b0d9c59e7cb51c319f63bedf4e5d4bdf77941`, the merge of PR #17, dated 2026-10-08.
- `git rev-list --left-right --count HEAD...origin/main` returned `0 0`.
- The checkout was clean before this report. No previous task changes are being overwritten.
- `gh pr list --state all --head arena/43337c87-interactive-chemistry-grade8` returned no PRs. No branch has been deleted, switched, or created.
- The request for a differently named new branch cannot be followed in this fixed-branch session. Work and the dedicated, unmerged Lesson 4 PR must use the branch above.

### Architecture inspected before implementation

| Existing layer | Inspected files / behavior | Lesson 4 plan |
| --- | --- | --- |
| Source policy | `docs/SOURCE_FIDELITY.md`, `docs/ADDING_LESSONS.md`, the latest Lesson 3 source report | Preserve every source element, keep a per-element audit, and block unclear content rather than guessing. |
| Curriculum | `src/data/curriculum/schema.ts`, `registry.ts`, `chemistryLesson3.ts` | Add one Lesson 4 data module and register it after Lesson 3. Extend the published unit page range only. |
| Student Area | `src/pages/LessonView.tsx`, `src/lessons/LessonFlow.tsx`, `ContentBlocks.tsx` | Reuse `LessonShell`, the existing outline, step types, deep-link hashes, progress storage, question rendering, and lazy interactive host. |
| Scientific notation | `ChemicalFormula.tsx`, `ChargeNotation.tsx`, `ContentBlocks.tsx`, rendering documentation and `scripts/verify-badge-rendering.mjs` | Reuse structured `<sub>` / `<sup>` and LTR-isolated notation. Verify actual browser geometry and screenshots before using the renderer in new content. No global notation redesign is planned. |
| Interactives | `src/simulations/registry.ts` | Add lesson-specific modules through the existing lazy registry; honor reduced motion and keyboard/mobile access. |
| Lesson assessment | `src/assessment/types.ts`, `FinalTestRunner.tsx` | Exactly 20 deterministic platform-authored lesson-test questions; no correctness or solutions until submission. |
| Test Area | `src/data/testArea/{registry,register,curriculumScope}.ts`, Lesson 3 bank/solutions and audit structure | Follow the existing lesson-scoped bank/solution conventions if adding the corresponding Test Area entry. Do not expand or finalize the existing unit bank. |
| Teacher Area | `src/teacher/{teacherContent,TeacherSection,TeacherHome}.tsx/ts` | Independent Lesson 4 tab; complete solutions for every source activity, exercise subpart, and new test question. Detailed concept explanation must remain explicitly platform-authored. |
| Verification | `package.json`, `vite.config.ts`, existing test tree and browser notation verifier | Run types, full suite, production build, distribution verification, lesson tests, and desktop/mobile Chromium checks after implementation. |

No application code, existing lesson content, renderer styles, contact chip, test bank, or Teacher Area file has been changed during intake. This was the pre-implementation snapshot; executed checks are recorded in section 9.

## 2. Attachment manifest and readability

The six full-page images were visible inline, but their advertised `/home/user/uploads/image-1.png` through `image-6.png` files were not mounted in this checkout. A sharper p24 caption crop was later supplied inline on 2026-10-14 and is legible enough to verify the text. The crop is not accessible as a local file, so it cannot be retained or used for pixel comparison of the original artwork; no original PDF or full-resolution page asset is available locally.

| Advertised attachment | Printed page | Visible extent | Readability / issue |
| --- | --- | --- | --- |
| `image-1.png` | **24**, bottom right | Full lesson-opening page | Main Arabic text, lesson number, goals and questions readable. Three photos visible. The tiny red, two-line caption was confirmed from the follow-up crop supplied 2026-10-14; C1 is closed. |
| `image-2.png` | **25**, bottom left | Full page | Magnesium experiment, definition, indicators and three-part activity readable. Word-equation blanks, `+`, forward arrow, and heating condition visible. No measured values or units. |
| `image-3.png` | **26**, bottom right | Full page | Two word-equation activities, Bunsen-burner experiment, flame/plate figure and combustion conclusions visible. The final comparison prompt (**C2**) was independently checked and confirmed readable. |
| `image-4.png` | **27**, bottom left | Full page | Domestic gas note, `(CO)`, research task and summary visible. Book wording about checking for a leak must be retained, not silently edited to its opposite. |
| `image-5.png` | **28**, bottom right | Full page | Self-test questions 1–3, all four-option MC items, three incomplete word equations, and three equation-writing prompts visible. |
| `image-6.png` | **29**, bottom left | Full page | Self-test questions 4–6 visible; right blue-flame photograph labelled `(1)` and left yellow-flame/plate illustration labelled `(2)`. Large blank lower area contains no additional visible teaching content. |

The sequence has no missing page number: **24, 25, 26, 27, 28, 29**. No heading or exercise is visibly cut off at the page boundary. The supplied sequence appears to cover the complete lesson through the final exercise; that does not establish that any unseen material exists or does not exist elsewhere in the book.

### Clarification history and current follow-up status

- **C1 — page 24, right-hand photograph — closed 2026-10-14:** the user supplied a sharp crop. The red caption reads «إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)», matching the existing lesson quotation exactly. No wording change was needed.
- **C2 — page 26, Bunsen experiment, numbered prompt 4 — closed in the independent audit:** the full-page attachment is legible enough to confirm «أقارن نواتج الاحتراق بين الحالة (1) والحالة (2).»; no close-up or inferred wording was used.
- **C3 — source file availability:** the original PDF/full-resolution pages are still not present locally, so the supplied crop cannot be retained as a repository asset and the original figures cannot be pixel-compared. Descriptive references remain appropriate; no invented photograph is described as the textbook figure. C1 is closed; C2 was independently checked against page 26.

**Prior intake / independent-audit history:** the first independent audit could not re-read the caption from the full-page raster, so it left the earlier transcription provisional. On 2026-10-14, the user supplied a legible close crop; it confirms «إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)» exactly. The p26 comparison prompt C2 was independently verified from the page. Original scan files remain unavailable locally, so figure pixels cannot be compared; descriptive page references are not exact reproductions. See `lesson4-final-source-fidelity-audit.md` for current row statuses.

## 3. Complete page-by-page intake

Quotation punctuation is transcribed to the extent legible; line wrapping is not educational content. Any final source transcription must be checked against the clarified originals. Generated answers, simulations, safety guidance and explanations must **not** be placed inside a textbook quotation.

### Page 24 — lesson opening and observation

#### Heading and lesson metadata

- Printed number: **4**.
- Title: **«التفاعلات الكيميائية»**.
- Box heading: **«الأهداف:»**.
- Six goals, in source order:
  1. «يتعرّف التفاعل الكيميائي.»
  2. «يميّز بين المواد المتفاعلة والناتجة.»
  3. «يتعرّف تفاعل الاحتراق.»
  4. «يميّز أنواع تفاعلات الاحتراق.»
  5. «يقارن نواتج الاحتراق التام وغير التام.»
  6. «يعبّر عن التفاعل الكيميائي بمعادلة كيميائية لفظية.»
- Box heading: **«الكلمات المفتاحية:»**.
- Complete ordered term run: **«تفاعل كيميائي – مواد متفاعلة – مواد ناتجة – معادلة كيميائية لفظية – احتراق تام – احتراق غير تام.»**
- Topic heading: **«التفاعل الكيميائي:»**.
- Observation subheading: **«ألاحظ وأجيب:»**.

#### Figures

A horizontal group of three photographs appears before the questions. Reading in Arabic order:

1. **Right:** a glass with overflowing foam, liquid being added, and lemon visible at the work surface. The red caption, verified against the 2026-10-14 user crop, reads **«إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)»**. The app preserves this wording and the educational observation in a descriptive reference, not by reproducing the photograph.
2. **Centre:** a gas-delivery arrangement with heated material, funnel/tube, and a receiving bottle with cloudy white liquid. It illustrates the carbon-dioxide/limewater observation. No apparatus dimensions, amounts, concentration, timing, or numerical labels are provided.
3. **Left:** light liquid applied to a dark coloured textile, with lighter/pinkish patches. It illustrates the eau-de-Javel/coloured-clothes observation. No chemical concentration or amount is given.

The photos do not provide permission to invent experimental quantities or gases not named in the text.

#### Observation questions — preserve all four

1. «عند إضافة بضع قطرات من حامض الليمون على بيكربونات الصوديوم، ماذا ألاحظ؟»
2. «عند سقوط قطرات ماء جافيل على ثياب ملونة ماذا ألاحظ؟»
3. «عند مرور غاز ثنائي أكسيد الكربون في رائق الكلس، ماذا ألاحظ؟»
4. «أسمي جميع التحولات في التجارب السابقة.»

There is **no printed answer** here. Teacher answers and observation demonstrations will be clearly identified as platform solutions, not quotations. “بضع قطرات” and “قطرات” are qualitative amounts, not numbers to be replaced by a fabricated volume.

### Page 25 — magnesium combustion, chemical reaction and first word equation

#### Experiment headings

- **«تفاعل احتراق المغنزيوم:»**.
- **«أجرّب وأستنتج:»**.
- **«أدوات التجربة:»**.
- Complete apparatus list: **«شريط مغنزيوم، ملقط، موقد، نظارات واقية، جفنة خزفية تحوي قليلاً من الرمل.»**
- **«خطوات التنفيذ:»**.
- Execution text: **«أضع النظارة الواقية، ثم أمسك بملقط شريطاً من المغنزيوم وأقرّبه من الموقد المشتعل بحذر، ماذا ألاحظ؟»**

The accompanying photograph shows the ribbon held by tongs and burning with a very bright light, leaving white material. There is no printed temperature, reaction duration, mass, brightness scale or gas volume.

#### Numbered experiment questions

1. «ماذا يحصل لشريط المغنزيوم؟»
2. «ما لون الدخان المرافق؟»
3. «بعد انتهاء التفاعل، هل يمكنني إعادة شريط المغنزيوم إلى ما كان عليه؟»

#### Conclusion and indicators

- Heading: **«أستنتج:»**.
- Definition: **«التفاعل الكيميائي: تحوّل يطرأ على مواد كيميائية (مواد متفاعلة) وتتكون مواد جديدة (مواد ناتجة).»**
- Indicator statement: **«غالباً ما يرافق التفاعلات الكيميائية: تغيّر في اللون أو تشكّل راسب أو انطلاق غاز أو نشر حرارة .........»**.

The word **«غالباً»** is essential: a platform explanation must not turn the listed observations into a universal proof, nor claim that every reaction shows every indicator. The printed dotted ending is an ellipsis, not an omitted numbered law.

#### Activity — three subparts and a diagram

Heading: **«نشاط:»**; lead-in **«في التجربة السابقة:»**.

1. «أسمّي الغاز الذي يساعد على احتراق شريط المغنزيوم.»
2. «أسمّي المركّب الناتج وأستنتج صيغته.»
3. «أعبّر عن التفاعل الكيميائي الحاصل (احتراق المغنزيوم) بمعادلة لفظية.»

Printed incomplete word-equation diagram, **left-to-right placement**:

- left: **«المغنزيوم»**, with **«(مادة متفاعلة)»** beneath;
- operator: **`+`**;
- second reactant: dotted blank, with **«(مادة متفاعلة)»** beneath;
- forward arrow **`→`**, with **«تسخين»** above;
- product: dotted blank, with **«(مادة ناتجة)»** beneath.

The source is a **word** equation with blanks. It does not print a balanced symbolic magnesium equation. The formula requested in part 2 belongs in the student's answer / teacher solution, not in an invented textbook answer.

### Page 26 — word equations and oxygen-dependent combustion

#### Top activity — two subparts

Heading: **«نشاط:»**.

1. «أكتب معادلة لفظية تعبّر عن تفاعل الحديد مع الكبريت وينتج عنه كبريتيد الحديد II.»
2. «أكتب معادلة لفظية تعبّر عن تكون الماء من تفاعل غازي الهيدروجين والأكسجين.»

**`II`** is a printed Roman numeral identifying iron(II), not an Arabic page/exercise number and not a charge attached to an invented ionic formula.

#### Bunsen-burner experiment

- Heading: **«أجرّب وأستنتج:»**.
- **«أدوات التجربة:»**.
- Apparatus statement: **«موقد بنزن في المخبر له ثقب فوق الصمام يسمح بدخول الهواء – صحن خزف.»**
- **«خطوات التنفيذ:»**.
- First condition: **«أشعل الموقد كما في الحالة (1) وأضع فوق اللهب صحن الخزف، ماذا ألاحظ؟»**.
- Second condition: **«ثم أغلق الثقب جزئياً في الحالة (2)، ماذا ألاحظ؟»**.

Four numbered questions:

1. «أميّز لون اللهب في كل من الحالتين (1) و(2).»
2. «أفسّر سبب تغيّر لون اللهب.»
3. «أفسّر تشكّل طبقة سوداء على صحن الخزف في الحالة (2).»
4. **«أقارن نواتج الاحتراق بين الحالة (1) والحالة (2).»** — confirmed by the supplied close-up.

#### Source figure — both conditions and both plate observations

The figure has two columns and two rows:

- **Right, labelled `1`:** narrow blue flame; beneath, the ceramic plate is held over the blue flame and remains light/clean in the visible illustration.
- **Left, labelled `2`:** larger yellow/orange flame; beneath, the plate held over that flame has a dark deposit.
- The labels are repeated beside the flames in the lower row. They identify conditions, not separate experiments or measured values.

Faithful simulation relationship: selecting the source's air-opening condition changes flame appearance and plate deposit. No calibrated oxygen percentage, temperature, time scale or yield is supplied. The burner flame model must not be confused with the **magnesium** flame colour.

#### Conclusion box

Heading: **«أستنتج:»**.

- **«الاحتراق: هو تفاعل المادة مع الأكسجين عند درجة حرارة مناسبة.»**
- **«تختلف نواتج الاحتراق حسب كمية الهواء (الأكسجين) المتوفرة.»**
- **«الاحتراق نوعان: تام وغير تام.»**
- Numbered condition 1: **«يحدث الاحتراق التام عندما تتوافر كمية كافية من الأكسجين.»**
- Numbered condition 2: **«يحدث الاحتراق غير التام عندما تكون كمية الأكسجين غير كافية.»**

“درجة حرارة مناسبة” is qualitative: no ignition temperature may be guessed. No numerical oxygen threshold is printed.

### Page 27 — gas safety, carbon monoxide, research and learned summary

#### «هل تعلم؟!»

Complete visible note:

**«الغاز المنزلي مكوّن من خليط غازي (البوتان والبروبان) لا رائحة له ولا لون يضاف له مادة عضوية (المركبتان) لها رائحة قوية لاكتشاف أي تسرب للغاز. وعند تركيب أسطوانة الغاز استخدم رغوة الماء والصابون للتأكد من وجود تسرب.»**

The note names **البوتان**, **البروبان**, and **المركبتان**. It does not print their formulas, mixture percentages, cylinder pressure or soap concentration. Preserve the printed final phrase **«للتأكد من وجود تسرب»**; an explanation may clarify the meaning of the leak test but may not change the source wording to «عدم وجود».

#### «إضاءة:»

**«غاز أحادي أكسيد الكربون (CO) عديم اللون سام جداً، يتّحد مع كريات الدم الحمراء فيمنعها من نقل الأكسجين ممّا يسبب الإعياء واضطراب دقات القلب.»**

- Exact Latin formula: **`CO`**.
- No numeral, subscript, superscript, charge or concentration follows it.
- Keep **أحادي** distinct from **ثنائي** in every student question and teacher explanation.

#### «قضية للبحث:»

**«تتعرّض حياة الإنسان للخطر في الغرف محكمة الإغلاق التي تستخدم فيها مدافئ الوقود للتدفئة في أيام الشتاء القارس، ابحث في ذلك.»**

This is a research task, not a quantitative gas experiment. Any safety expansion must be explicitly platform-authored and must not encourage experiments with household fuel, bleach, gas leaks or carbon monoxide.

#### «تعلّمت:» — preserve all content and the general arrow

1. **«التفاعل الكيميائي: تحوّل يطرأ على مواد كيميائية (مواد متفاعلة) وتتكون مواد جديدة (مواد ناتجة).»**
2. **«المعادلة الكيميائية اللفظية.»** followed by a general source diagram:
   - **«مواد متفاعلة»** on the **left**;
   - forward arrow **`→`** pointing **right**;
   - **«مواد ناتجة»** on the **right**.
3. **«يحدث الاحتراق التام عندما تكون كمية الأكسجين كافية.»**
4. **«يحدث الاحتراق غير التام عندما تكون كمية الأكسجين غير كافية.»**

The definition is repeated intentionally. It must appear in both its original page-25 position and this summary; deduplication would omit source content.

### Page 28 — «أختبر نفسي» questions 1–3

#### Heading and question 1

- **«أختبر نفسي:»**.
- **«السؤال الأول:»**.
- Instruction: **«اختر الإجابة الصحيحة لكل ممّا يأتي:»**.

**1. «ينتج عن الاحتراق التام لغاز البوتان (الغاز المنزلي):»**

- `a.` «الماء فقط.»
- `b.` «الكربون.»
- `c.` «ثنائي أكسيد الكربون فقط.»
- `d.` «ثنائي أكسيد الكربون والماء.»

**2. «غاز يساعد على احتراق الوقود المنزلي:»**

- `a.` «الهيدروجين.»
- `b.` «الأكسجين.»
- `c.` «ثنائي أكسيد الكربون.»
- `d.` «النتروجين.»

**3. «عندما يشتعل المغنزيوم في الهواء يتشكّل مسحوق أبيض هو:»**

- `a.` «أكسيد المغنزيوم.»
- `b.` «نترات المغنزيوم.»
- `c.` «هيدروكسيد البوتاسيوم.»
- `d.` «كبريتيد المغنزيوم.»

**4. «غاز عديم اللون وسام جداً:»**

- `a.` «الهيدروجين.»
- `b.` «النتروجين.»
- `c.` «أحادي أكسيد الكربون (CO).»
- `d.` «الأكسجين.»

Each complete stem and all four distractors are required. Teacher explanations should identify and justify the correct answer and explain why the other choices do not answer the stem.

#### Question 2 — complete three printed word equations

- Heading: **«السؤال الثاني:»**.
- Instruction: **«أكمل التفاعلات اللفظية الآتية:»**.
- All three **forward arrows** and blank product positions must remain.
- Visual **left-to-right** source placement:
  1. **الأكسجين `+` المغنزيوم `→` [blank]**.
  2. **الزنك `+` الكبريت `→` [blank]**.
  3. **الكبريت `+` الحديد `→` [blank]**.

These are the positions in the printed diagrams, not a request to reverse scientific arrows to match Arabic paragraph flow. The Arabic species labels themselves need RTL shaping inside a whole LTR-isolated reaction chain. No condition is printed over these three arrows. Do not add an invented heating label to the source equation.

#### Question 3 — write three word equations

- Heading: **«السؤال الثالث:»**.
- Instruction: **«اكتب المعادلة الكيميائية اللفظية لكل من التفاعلات الآتية:»**.

1. «احتراق الكربون بالأكسجين وانطلاق غاز ثنائي أكسيد الكربون.»
2. «تفاعل الهيدروجين مع الأزوت وتكون النشادر.»
3. «تفاعل الزنك مع الأكسجين وتشكّل أكسيد الزنك.»

The source uses **الأزوت** here and **النتروجين** among the earlier MC distractors. Preserve that terminology at each source position; any equivalence explanation belongs to the platform.

### Page 29 — self-test questions 4–6

#### Question 4

- **«السؤال الرابع:»**.
- **«وازن بين الاحتراق التام والاحتراق غير التام لغاز البوتان، من حيث نواتج الاحتراق.»**

Preserve the comparison task and its stated basis (**products**, not fabricated efficiency/temperature measurements).

#### Question 5

- **«السؤال الخامس:»**.
- **«كيف يتم الكشف عن غاز ثنائي أكسيد الكربون تجريبياً.»**

The teacher solution must include the method, observation and resulting conclusion, not just the words «رائق الكلس».

#### Question 6 and its figure

- **«السؤال السادس:»**.
- **«ميّز عملية الاحتراق في الشكلين الآتيين، وعلّل تشكّل الطبقة السوداء كما في الشكل (2):»**.
- **Right, `(1)`:** photograph of domestic burner(s) with blue flames.
- **Left, `(2)`:** illustrated burner with yellow/orange flame; hand holds a plate above it.

Required solution subparts:

1. Classify combustion shown in **figure (1)**.
2. Classify combustion shown in **figure (2)**.
3. Explain the **black layer** in **figure (2)** in terms of insufficient oxygen and carbon/soot deposition.

Do not swap the numbered illustrations in RTL layout. Their page-29 labels are parenthesized; the page-26 labels are within circles. There is no printed reaction formula or measured quantity in this figure.

## 4. Numerical, symbolic and notation register

This register distinguishes **printed source notation** from scientifically appropriate but **platform-authored answers**.

| Source location | Exact item | Required treatment |
| --- | --- | --- |
| p24 | Lesson number `4` | Arabic UI metadata; do not interpret as a stoichiometric coefficient. |
| p24–29 footers | `24`, `25`, `26`, `27`, `28`, `29` | Source references on every associated source block / exercise. |
| p25 | Numbered experiment prompts `1–3`; numbered activity `1–3` | Keep complete sequence and subparts. These are numbering, not physical data. |
| p25 word equation | `+`, one forward `→`, «تسخين», two dotted blanks, three material-role labels | Whole LTR reaction chain with RTL Arabic labels; retain heating condition above arrow. |
| p26 top activity | `1`, `2`; Roman **`II`** | True isolated Latin run for `II`, no automatic charge replacement. |
| p26 experiment | Conditions `(1)`, `(2)`; four numbered prompts `1–4`; repeated figure badges `1`, `2` | Keep condition labels attached to the correct blue/yellow visual. |
| p26 conclusions | Conditions `1`, `2`; «درجة حرارة مناسبة» | No guessed temperature or oxygen percentage. |
| p27 note | Parentheses around `(البوتان والبروبان)` and `(المركبتان)` | Preserve Arabic terms; no invented formulas in the quotation. |
| p27 and p28 Q1(4)(c) | **`(CO)`** | Render `CO` as a single LTR-isolated chemical formula. It contains no subscript. |
| p27 summary | Forward `→` between «مواد متفاعلة» and «مواد ناتجة» | Reactants left, products right, Arabic runs isolated inside the chain. |
| p28 Q1 | Question numbers `1–4`; option labels `a`, `b`, `c`, `d` for each | Preserve option content/order; isolate Latin labels. |
| p28 Q2 | Three `+` operators and three forward `→` arrows; product blanks | Preserve printed reactant order and empty products in source material. |
| p28 Q3 | Subparts `1`, `2`, `3` | Preserve all three word-equation tasks. |
| p29 Q6 | `(1)` and `(2)` in question and under figures | No reversal caused by RTL layout. |

### Explicit absence of quantitative material

- No physical measurements, concentrations, temperatures, masses, volumes, times, mixture ratios or units are printed in these six pages.
- No scientific law or numerical calculation is presented.
- No ionic charge, electron symbol, source superscript, source formula subscript, equilibrium arrow or reversible-reaction sign is visible.
- No printed data table appears. The page-26 multi-panel illustration is a **figure**, not a numeric table.
- The only explicitly printed Latin chemical formula is **`CO`**. The only other scientific Latin token is the Roman **`II`**; MC labels are not chemical symbols.
- Magnesium oxide's formula is **requested**, not supplied: its teacher answer / optional formula aid must be labelled as a platform solution. Likewise balanced symbolic equations, if useful, are supplementary and cannot be described as verbatim source.
- Bubbles, whitening, turbidity, white combustion product, blue/yellow flames and soot may be modelled qualitatively. No animation speed or visual particle count may be labelled as a measured source result.

## 5. Complete source-to-implementation inventory

**Implemented paths:** lesson module `src/data/curriculum/chemistryLesson4.ts`; student slug `chemical-reactions` under the existing `chemistry/structural-chemistry` unit. Step IDs below are actual stable source-audit anchors, not newly invented textbook headings. All **48 rows are implemented and covered by independent source-only assertions** in `lesson4-source-audit.json` and `tests/lesson4.test.tsx`. Teacher anchors identify the matching question/solution family in `chemistryLesson4Questions.ts` (rendered by the existing Teacher Area). Photos/panels are preserved as descriptive references, not as retained scans. Source and teacher coverage are distinguished below.

| Audit ID | Page | Source element(s) | Actual student location | Actual teacher / preservation |
| --- | --- | --- | --- | --- |
| L4-24-01 | 24 | Printed 4 and full lesson title | Lesson metadata / `opening` | Lesson 4 independent tab; p24 reference. |
| L4-24-02 | 24 | «الأهداف» and all six goals | `opening`: complete source list | Explain how goals map to activities, clearly platform-authored. |
| L4-24-03 | 24 | «الكلمات المفتاحية» and all six terms in order | `opening`: exact source term run; optional separate platform glossary | Preserve all terms without substituting definitions for the printed list. |
| L4-24-04 | 24 | «التفاعل الكيميائي» and «ألاحظ وأجيب» | `observe-reactions` source headings | Observation concept explanation. |
| L4-24-05 | 24 | Right photo + embedded red caption | `observe-reactions`: exact caption quote plus descriptive reference; no source photo asset | Caption verified from the user crop; the original photo itself is not reproduced. |
| L4-24-06 | 24 | Central gas/limewater apparatus photo | `observe-reactions`: figure and page reference | Explain gas passed through limewater; no invented apparatus dimensions. |
| L4-24-07 | 24 | Left fabric/Javel photo | `observe-reactions`: figure and page reference | Explain visible decolouration. Never suggest mixing bleach with acid. |
| L4-24-08a | 24 | Lemon acid / bicarbonate observation question | `observe-reactions`: full source prompt with response field | Complete observation-and-inference solution, distinct from quotation. |
| L4-24-08b | 24 | Javel / coloured clothes question | Same step, next source prompt | Complete solution. |
| L4-24-08c | 24 | Carbon dioxide / limewater question | Same step, next source prompt | Complete experimental observation, precipitate inference. |
| L4-24-08d | 24 | Name all preceding transformations | Same step, last source prompt | Explain new materials / chemical transformations; address all three. |
| L4-25-01 | 25 | Magnesium combustion / experiment headings | `magnesium-experiment` | Concept and supervised-lab safety explanation. |
| L4-25-02 | 25 | Entire five-item apparatus list, including sand in ceramic dish | `magnesium-experiment`: source list | Preserve goggles, tongs, dish and sand; not only ribbon/burner. |
| L4-25-03 | 25 | Complete execution instruction and observation prompt | Same step: source procedure | Explain each step and caution. |
| L4-25-04 | 25 | Bright-burning magnesium photograph | Same step: source/reference figure | Qualitative diagram may supplement, not replace a supposed source photo. |
| L4-25-05a–c | 25 | All three numbered experiment questions | Same step, in order | Separate full solutions: change, white product/smoke, no simple reversal. |
| L4-25-06 | 25 | «أستنتج» and complete reaction definition | `reaction-definition` | Detailed reactants/products explanation without changing source wording. |
| L4-25-07 | 25 | «غالباً» indicator statement: colour / precipitate / gas / heat + ellipsis | `reaction-definition`, after definition | Distinguish observation from inference; do not make the list exhaustive. |
| L4-25-08a | 25 | Activity lead-in and gas-for-magnesium question | `magnesium-word-activity` | Identify oxygen, explain air's role. |
| L4-25-08b | 25 | Product naming and formula-inference question | Same step | Derive/name oxide and formula using previously learned valence; full explanation. |
| L4-25-08c | 25 | Write word equation question | Same step | Roles, equation construction and verification. |
| L4-25-09 | 25 | Incomplete Mg + blank → blank diagram, heating and role labels | Same step: isolated word equation with response blanks | Show filled solution separately; preserve source blanks and all three labels. |
| L4-26-01a | 26 | Iron + sulfur → iron(II) sulfide activity, including `II` | `word-equation-activities` | Full reasoning and correct word equation. |
| L4-26-01b | 26 | Hydrogen/oxygen → water activity | Same step | Full reasoning and correct word equation. |
| L4-26-02 | 26 | Bunsen experiment title and complete apparatus/air-hole description | `burner-experiment` | Explain air entering above valve; no fabricated calibration. |
| L4-26-03a–b | 26 | Both execution conditions and plate-observation prompts | Same step: source procedure in order | Full solutions for both observations. |
| L4-26-04 | 26 | Both flame panels, both plate panels and repeated condition labels | Same step: faithful source/reference figure | Explain `(1)` blue/clean and `(2)` yellow/deposit. |
| L4-26-05a–d | 26 | Four numbered questions: colours / cause / black layer / products | Same step, all four source prompts | Full subpart solutions; exact final prompt confirmed by **C2**. |
| L4-26-06 | 26 | Combustion definition, suitable temperature condition | `combustion-conclusions` | Detailed combustion concept; no guessed temperature. |
| L4-26-07 | 26 | Products depend on available air/oxygen statement | Same step, next source line | Explain controlling relationship. |
| L4-26-08 | 26 | Two types of combustion statement | Same step, next source line | Contrast types without universal flame-colour claims. |
| L4-26-09a–b | 26 | Both oxygen-sufficiency conditions | Same step, complete ordered source conditions | Explain sufficient vs insufficient oxygen in source burner conditions. |
| L4-27-01 | 27 | «هل تعلم؟!» whole gas-mixture / odorant / soap note | `household-gas` | Explain odorant versus CO, soap test meaning, platform safety only. |
| L4-27-02 | 27 | «إضاءة» whole CO note, `(CO)`, red-cell effect and both symptoms | `carbon-monoxide` | Distinguish CO from CO₂ and explain the danger faithfully. |
| L4-27-03 | 27 | «قضية للبحث» complete sealed-room/heater task | `research-heaters` | Complete causal research model: limited oxygen, incomplete burning, hazardous accumulation, safety conclusion. |
| L4-27-04 | 27 | «تعلّمت» repeated full reaction definition | `learned-summary` | Do not omit as duplicate of p25. |
| L4-27-05 | 27 | Word-equation label and general reactants → products diagram | Same step | Explain left/right roles using correctly isolated chain. |
| L4-27-06a–b | 27 | Both repeated oxygen-sufficiency summary statements | Same step | Preserve exact repeated statements, not replace by a shorter summary. |
| L4-28-01 | 28 | «أختبر نفسي», «السؤال الأول», complete instruction | `book-question-1` | Same textbook grouping / page locator. |
| L4-28-02a–d | 28 | Four MC stems × four options = all 16 options | Same step: four source questions | Four complete solutions explaining choices. |
| L4-28-03 | 28 | «السؤال الثاني» and full instruction | `book-question-2` | Preserve grouping and source reference. |
| L4-28-04a–c | 28 | All three incomplete word equations, printed order, +, →, blanks | Same step: three source items | Three completed word equations with substance/role reasoning. |
| L4-28-05 | 28 | «السؤال الثالث» and full word-equation instruction | `book-question-3` | Preserve grouping and source reference. |
| L4-28-06a–c | 28 | Carbon combustion / ammonia formation / zinc oxidation prompts | Same step: three source subparts | Three full step-by-step word-equation solutions. |
| L4-29-01 | 29 | «السؤال الرابع» and whole butane-products comparison | `book-question-4` | Complete comparison; no abbreviated “complete/incomplete” key. |
| L4-29-02 | 29 | «السؤال الخامس» and whole CO₂ detection question | `book-question-5` | Method → observation → explanation → conclusion. |
| L4-29-03 | 29 | «السؤال السادس» and whole classify-and-justify prompt | `book-question-6` | Complete figure interpretation with all three required parts. |
| L4-29-04a–b | 29 | Both source images, right `(1)` / left `(2)`, exact labels | Same step: source/reference figure | Do not swap figures or invent an invisible measuring apparatus. |

### Inventory completeness cross-check

- Six source pages and every printed page number accounted for.
- All main headings, subheadings, source boxes and repeated conclusions accounted for.
- All six objectives and all six key terms accounted for.
- Introductory observations, both experiments, both word-equation activities, research task and all self-test subparts accounted for.
- All three p24 photos, p25 magnesium photo, four p26 figure panels and two p29 figures accounted for.
- All source word-equation blanks, material-role labels, `+` operators, forward arrows and the single heating condition accounted for.
- `CO`, Roman `II`, all figure labels and MC option labels accounted for.
- No textbook tables, measured values, numeric laws or calculations were found. None should be invented.
- **All 48 implementation-coverage assertions pass.** They show that lesson data matches its repo-authored JSON inventory, not that the inventory is faithful to image pixels. The first independent audit rechecked C2 and left C1 provisional; the 2026-10-14 crop follow-up now closes C1. The final audit records current source-to-implementation statuses.

## 6. Supplementary learning design (not textbook content)

The following additions are implemented with explicit platform labels, between source groups without changing the book's topic order.

1. **Observe → identify the change:** a qualitative three-scenario lab aligned to the p24 prompts. Student actions reveal bubbles, decolouration or limewater turbidity. Explain new-substance inference without inventing rates, amounts or quantified outputs. Bleach and acids must never be combined in a suggested experiment.
2. **Magnesium sequence:** safety setup → ribbon exposed to burner → bright combustion → white oxide. Progress is controlled by the student, with a reset. “Before” and “after” material roles are shown. Do not imply goggles make staring at intense light safe, do not create a home-experiment invitation, and do not confuse white magnesium light with a yellow carbon-fuel flame.
3. **Word-equation construction:** choose reactants/product and material roles using the source reactions. All chains are LTR-isolated; each Arabic substance label is an RTL run. Symbolic formulas, if shown to connect to Lesson 3, are labelled as platform aid / teacher solution rather than source equations.
4. **Bunsen air-hole comparison:** two qualitative states exactly matching p26 `(1)` and `(2)`. Change air admission; observe blue versus yellow/orange flame and plate cleanliness versus carbon deposit. No numeric oxygen slider or unsupported temperature display. Reduced motion keeps static states and conclusions available.
5. **Research guidance:** distinguish fuel-gas odorant from invisible CO danger, explain oxygen depletion and incomplete combustion in a closed room, and present safe non-experimental research prompts.
6. **Knowledge checks:** separate platform practice where useful. Source exercises retain their wording and order; platform explanations and solutions do not masquerade as textbook text.

Calm premium styling should use the existing design tokens, platform panels, typography, scientific figures and controls, with scoped Lesson 4 styles only as necessary.

## 7. Assessment and teacher implementation contract

### Twenty-question lesson test

- Exactly **20** platform-authored questions in the lesson-level test.
- Deterministic definitions/evaluation: choice, multi-choice, true/false, fill/exact answers, matching and/or ordering where supported. Avoid automatically “grading” unbounded essays.
- Coverage must include: reaction meaning and material roles; indicators and observation/inference; p24 scenarios; magnesium conditions, observation, product and word equation; source word reactions; combustion definition; oxygen availability and products; source flame/plate interpretation; domestic gas/odorant distinction; CO toxicity; sealed-room research; CO₂ detection.
- New scenarios/decisions should assess understanding, not copy the textbook stems verbatim or merely swap a word in them.
- No correctness, answer key, mark, score or solution before complete-test submission. Verify this behavior in component and real-browser tests.
- Each question has a corresponding full teacher solution and source-page concept reference. No unsupported quantitative question may be introduced.
- If the separate Test Area requires its own bank (as existing lessons do), use the existing bank/solution audit, originality checks and deferred grading. Keep it explicitly separate from the textbook exercises and identify its 20-question scope; do not silently create a unit assessment.

### Teacher Area

Use the existing independent-tab convention. Required content:

- Detailed, labelled platform concept explanation for chemical transformations, reactants/products, indicators, combustion and oxygen, observations and products, word-equation conventions, CO/CO₂ distinction and safety research.
- Every p24 observation and conclusion question, every magnesium question and activity, both p26 word-equation activities, both burner observations and all four numbered questions, and the p27 research task receive complete reasoned solutions.
- All p28–29 self-test items and every subpart receive full solutions with the printed page/item reference. Word-equation solutions identify starting materials, ending material(s), arrow meaning and any source condition before presenting the completed equation.
- MC explanations must explain the chosen answer and relevant distractor distinctions.
- Figure question 6 must solve both classifications and the black-layer cause, not collapse them into a single answer.
- All **20 lesson-test** solutions must explain the reasoning, not provide letter-only keys. Any distinct Test Area bank also requires its own complete solution coverage.

### Unit test boundary

The latest main already contains an older **interim** Unit 1 bank scoped to Lessons 1–2 (60 questions). It is not created by this task. This work must **not** create a Unit 1 final test, append Lesson 4 to that bank, claim the unit is complete, or rebuild the bank as a final assessment. Existing interim behavior and navigation should remain unchanged.

## 8. Verification gates and audit closure

### Before implementation

- [x] Fetch and inspect latest main; confirm clean checkout and exact equality.
- [x] Inspect existing source policy and latest successfully implemented lesson.
- [x] Inspect all six displayed images and map every source element.
- [x] Document unreadable content and missing file availability rather than guess.
- [x] Follow-up source evidence: the 2026-10-14 user crop resolves C1 and matches the existing p24 caption; C2 was independently verified from the attached p26 page.
- [x] Document C3: files unavailable; precise descriptive textbook references, with separately labelled platform schematics, will preserve figures.
- [x] Inspect actual shared scientific rendering before use: baseline `npm run build` passed; `npm test` passed (713 tests / 30 files); `npm run verify:badges` passed (33 checks / 0 failures). Actual showcase and electron-badge screenshots were viewed; charges are raised to the right, and the sulfate subscript is correctly lowered. No shared charge defect was found.

### After implementation — executed gates

- [x] Replace “planned” locations with actual file/step/question anchors for every inventory row.
- [x] Check every source quotation, option, formula, Roman numeral, arrow and condition against the supplied pages.
- [x] `npm run typecheck`.
- [x] `npm test` (complete suite, not just new tests).
- [x] `npm run build`.
- [x] `npm run verify:dist`.
- [x] Applicable scientific badge browser verification (`npm run verify:badges`).
- [x] Lesson-specific content, full-solution, deterministic-evaluation, no-feedback-before-submit, interaction, RTL and source-coverage tests.
- [x] Real-browser desktop and mobile screenshot inspection: source blocks, all simulations and states, word equations, source figure labels, Teacher Area, lesson test and Test Area.
- [x] Check horizontal overflow, clipping, overlap, contrast, formula sub/sup geometry, charge-right positioning and correct reactant/product ordering; include reduced motion and keyboard use.
- [x] Regression spot checks for Lessons 1–3, navigation, progress, Teacher Area and Test Area.
- [x] Verify WhatsApp contact text, phone, URL and placement are unchanged.
- [x] Final diff audit: no previous-lesson content or unrelated styles changed; no new unit final test.
- [ ] Delivery gate: open the one dedicated Lesson 4 PR from the fixed branch as the final operation. Its URL will be returned in the Arena completion message; do not merge or start Lesson 5.

**Prior implementation source gate (historical):** the original intake report declared C1 and C2 resolved. The first independent audit could re-verify C2 but not C1 at full-page scale; the user-provided crop on 2026-10-14 now verifies C1. Descriptive figure references still do not claim exact artwork reproduction.



## 9. Implementation closure and executed results (2026-10-13)

### Source coverage and authority

- All **six pages 24–29** are present in original topic/page order, through all six «أختبر نفسي» groups. There are **27 student steps**, **20 in-context source question units + 13 self-test units = 33**, all reached once in the source flow.
- The **48-row coverage inventory** above is paired with `lesson4-source-audit.json`. Its automated assertions prove that the implementation matches the repository-authored inventory; by themselves they do **not** prove that either transcription matches the textbook images. The independent image comparison and per-row statuses are in `lesson4-final-source-fidelity-audit.md`.
- Six goals, six ordered key terms, apparatus/procedures/qualitative amounts, repeated definitions/summaries, four MC stems and all **16 options**, all other questions/subparts, `CO`, `II`, source numbering and reaction signs are represented. Two source-wording errors were found and corrected: «كما في الحالة (1)» on p26 and «لها رائحة قوية» on p27.
- The p24 caption **«إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)»** was confirmed word-for-word against the 2026-10-14 user crop and already matched the lesson quote. C2 **«أقارن نواتج الاحتراق بين الحالة (1) والحالة (2).»** is independently legible and verified.
- Four visibly descriptive reference groups cover the three p24 photographs, p25 magnesium photo, four p26 panels, and two p29 figures. Right **1 = blue/clean**; left **2 = yellow/black** is explicit. **C3 remains a source-file limitation**: no scan/crop was retained, and no invented illustration is passed off as an original. These references preserve meaning and locators, not pixel fidelity.
- Source blanks remain empty in the textbook material. Mg heating stays above its arrow; both reactant roles and the product role remain below. The p28 equations retain their original LTR reactant order (oxygen/magnesium; zinc/sulfur; sulfur/iron). Filled equations/formulas are separately platform-labelled solutions.
- No quantitative law, measurements, balanced symbolic source equation, numeric oxygen ratio, duration or temperature was invented. The two numerical final items count **named substances** in a platform question; they are not invented physical measurements.

### Actual student sequence

Step labels are platform navigation; each source step retains its original headings/content with page references. Interposed practice/explanation steps are explicitly platform-authored.

| Step | Stable anchor | Type | Source pages |
| --- | --- | --- | --- |
| 1 | `opening` | `source` | 24 |
| 2 | `observe-reactions` | `source` | 24 |
| 3 | `observation-lab` | `simulation` | Platform |
| 4 | `magnesium-experiment` | `source` | 25 |
| 5 | `magnesium-lab` | `simulation` | Platform |
| 6 | `reaction-definition` | `source` | 25 |
| 7 | `reactants-explained` | `explanation` | Platform |
| 8 | `magnesium-word-activity` | `source` | 25 |
| 9 | `word-equation-activities` | `source` | 26 |
| 10 | `word-equation-lab` | `activity` | Platform |
| 11 | `burner-experiment` | `source` | 26 |
| 12 | `combustion-conclusions` | `source` | 26 |
| 13 | `burner-lab` | `simulation` | Platform |
| 14 | `products-explained` | `explanation` | Platform |
| 15 | `household-gas` | `source` | 27 |
| 16 | `carbon-monoxide` | `source` | 27 |
| 17 | `research-heaters` | `source` | 27 |
| 18 | `research-guidance` | `explanation` | Platform |
| 19 | `learned-summary` | `source` | 27 |
| 20 | `book-question-1` | `question` | 28 |
| 21 | `book-question-2` | `question` | 28 |
| 22 | `book-question-3` | `question` | 28 |
| 23 | `book-question-4` | `question` | 29 |
| 24 | `book-question-5` | `question` | 29 |
| 25 | `book-question-6` | `question` | 29 |
| 26 | `connected-summary` | `summary` | Platform |
| 27 | `final-test` | `final-test` | Platform |

### Student, teacher and assessment coverage

- Student navigation, visited progress, outline/drawer, hashes, existing assessment components and the lazy interactive host are reused. The four qualitative labs expose **action → observation → inference**, safe setup, before/burning/product, air-condition/plate comparison, and word-equation construction. Scenario changes/reset clear their state; reduced motion retains all conclusions.
- The separate fourth Teacher tab has **33 full source solutions**, the detailed six-section conceptual guide and experiment/research procedures, and **20 full lesson-test solutions**. Each source and final item has an explicit at-least-three-step procedure plus its explanation, source-page concept reference, and (where appropriate) word-equation material/rubric. The six-part self-test is not reduced to six abbreviated keys: its 13 units and all figure-6 elements are solved.
- The independent Test Area has **20 additional questions** in eight formats, five concepts, difficulties **6 basic / 7 medium / 4 advanced / 3 thinking**, and **20 full pedagogical solutions** in four five-question chunks. Both bank and solution loaders are lazy. The Teacher tab links directly to this bank and its solutions instead of introducing a duplicate teacher/assessment architecture. Thus **all 73 source/assessment units have full solutions**: 53 on the Teacher lesson routes and 20 through the linked existing Test Area solution route.
- The lesson-level final is exactly **20 deterministic original single-point questions**: 8 MC (2 multi-select), 3 true/false, 3 fill, 2 matching, 2 ordering, 2 named-substance counts. None copies a source question verbatim. Correct keys, completed wrong answers and full-solution agreement are tested.
- Strict completion is **opt-in only for Lesson 4** in both runners. Every blank/match/order field must be present; completion never tests correctness. Incomplete submission has no bypass. No outcome/key/score/explanation appears during the attempt, including after all controls are filled but before submit. The submitted final locks its inputs until reset; grading awards one point only for a wholly correct question. Old runner defaults remain unchanged.

### Twenty lesson-test questions and full solutions

The complete authored definitions and reasoning are in `chemistryLesson4Test.ts`; the existing Teacher final/solution pages render the same data. Source references are concept locators, not claims that the new prompts were printed.

| ID | Format | Concept page | Original prompt |
| --- | --- | --- | --- |
| `l4-final-01` | `multiple-choice` | 25 | قال طالب إن نقل مسحوق من وعاء إلى آخر يكفي لنسميه تفاعلاً كيميائياً. أي معلومة تنقص حكمه؟ |
| `l4-final-02` | `multiple-choice` | 25 | في بطاقة «قبل / بعد» احتراق الشريط، أين نضع أكسيد المغنزيوم الذي لم يكن موجوداً في البداية؟ |
| `l4-final-03` | `true-false` | 25 | غياب فقاعات الغاز عن تغير ما يسمح لنا وحده بالجزم أنه ليس تفاعلاً كيميائياً. |
| `l4-final-04` | `matching` | 24 | اربط بطاقة الملاحظة بالمادة التي نراقب تغيرها في كل مشهد، دون خلط التجارب: |
| `l4-final-05` | `multiple-choice` | 25 | اختر المادتين اللتين يتغير وجودهما كمواد متفاعلة عند احتراق شريط المغنزيوم، لا الأدوات أو الشروط: |
| `l4-final-06` | `fill-blank` | 25 | استعمل التكافؤين المتساويين للمغنزيوم والأكسجين للتحقق من كتابة صيغة الأكسيد بأبسط نسبة. |
| `l4-final-07` | `ordering` | 25 | نظم بطاقات مشاهدة احتراق الشريط في مخبر المعلم بحيث تسبق الوقايةُ تقريبَ الشريط من اللهب: |
| `l4-final-08` | `numerical` | 25 | كم مادة متفاعلة مختلفة تظهر في البطاقة التالية؟ احسب المواد، ولا تحسب التسخين مادة. |
| `l4-final-09` | `multiple-choice` | 26 | صنف طالب الكبريت مع النواتج في بطاقة تكوين كبريتيد الحديد II. أي تصحيح يعيد البطاقة إلى معناها؟ |
| `l4-final-10` | `fill-blank` | 28 | بطاقة التفاعل تبدأ بهيدروجين وأزوت وتصف مركباً جديداً، لا مزيجاً من الغازين. أكمل اسم هذا المركب. |
| `l4-final-11` | `true-false` | 26 | عندما نضيق فتحة الهواء في موقد الدرس، نقلل وصول الأكسجين حتى لو لم نغير صمام الوقود. |
| `l4-final-12` | `multiple-choice` | 26 | بعد تضييق دخول الهواء ترسبت مادة سوداء على الصحن. ما تفسيرها المرتبط بالمتغير الذي غيرناه؟ |
| `l4-final-13` | `matching` | 26 | اربط وصف المشاهدة بتفسيرها، مع إبقاء تجربة الشريط منفصلة عن تجربة الوقود: |
| `l4-final-14` | `multiple-choice` | 28 | بدأ الطالب قائمة نواتج احتراق البوتان التام بالماء. أي اسم يلزم لإكمال القائمة دون إدراج ناتج احتراق غير تام؟ |
| `l4-final-15` | `true-false` | 27 | يمكن استبدال رائق الكلس برغوة الماء والصابون في اختبار التعكر للكشف عن ثنائي أكسيد الكربون. |
| `l4-final-16` | `multiple-choice` | 27 | اختر رابطتين صحيحتين في تفسير خطر المدفأة في غرفة محكمة الإغلاق: |
| `l4-final-17` | `fill-blank` | 27 | على بطاقة تحذير سمي أريد رمز الغاز الأحادي، لا رمز الغاز الثنائي الذي يعكر رائق الكلس. اكتب الصيغة اللاتينية. |
| `l4-final-18` | `multiple-choice` | 27 | لم يشعر شخص برائحة الوقود قرب المدفأة فاعتبر الغرفة آمنة من CO. ما خلل هذا الاستدلال؟ |
| `l4-final-19` | `numerical` | 28 | إذا سجلنا أسماء المواد الناتجة عن الاحتراق التام للبوتان، فكم اسماً مختلفاً نسجل؟ لا تعد الأكسجين لأنه متفاعل. |
| `l4-final-20` | `ordering` | 29 | رتب بطاقات الاستدلال للكشف المدرسي عن الغاز الثنائي: يبدأ الاختبار بكاشف صافٍ وينتهي باستنتاج من المشاهدة. |

### File/component integration audit

| Responsibility | Files |
| --- | --- |
| Source lesson/order, 33 activities/exercises, 20 final questions, guide | `src/data/curriculum/chemistryLesson4{,Questions,Test}.ts` |
| Existing curriculum/schema registration | `src/data/curriculum/{registry,schema}.ts` |
| New isolated word-equation form, original-image reference fallback | `src/scientific/{WordEquation.tsx,word-equation.css,index.ts}`, `src/lessons/ContentBlocks.tsx` |
| Four lazy, responsive qualitative SVG labs | `src/simulations/{ReactionObservationLab,MagnesiumCombustionLab,CombustionAirLab,WordEquationLab,Lesson4Visuals}.tsx`, `lesson4-labs.css`, `registry.ts` |
| Source labels/material/step solutions; opt-in complete and immutable submitted review | `src/assessment/{types,evaluate,QuestionView,InlineQuestion,FinalTestRunner,validate}` |
| Independent bank, blueprint/metadata, originality corpus, full lazy solutions | `src/data/testArea/{register,curriculumScope,originality,types}.ts`, `banks/chem-u1-l4.ts`, `solutions/chem-u1-l4.ts` |
| Complete-response reducer/UI policy; Arabic text versus Latin/formula input direction | `src/testArea/attemptReducer.ts`, `pages/TestRunnerPage.tsx`, `components/TestQuestionCard.tsx` |
| Fourth Teacher tab, source/lesson solutions, guide and independent-bank links | `src/teacher/{teacherContent.ts,TeacherSection.tsx}` |
| Scoped Lesson 4 readability/layout fixes | `src/styles/lesson4.css`, style entry import, optional lesson identity in `LessonShell` / `LessonFlow` |
| Audit and reproducible QA | This report, `lesson4-source-audit.json`, `tests/lesson4.test.tsx`, `scripts/verify-lesson4-rendering.mjs`, package script |

Shared changes are narrowly necessary integrations: optional source materials/index/solution fields, opt-in strict completion/read-only review, actual reference rendering, standard scientific isolation in procedure/callout/teacher range labels, and scope metadata for new-only styles. The scientific parser/formula/charge renderer and global palette were **not** redesigned. Only published-count/registry expectations in existing tests were updated. No earlier lesson data or old unit bank/solutions were edited.

### Executed verification

| Check | Executed result |
| --- | --- |
| `npm run verify` | **Passed**: TypeScript, **830 tests / 31 files**, production build (**167 modules**), postbuild deep-link fallback and distribution checks (**109 assets**) |
| Lesson 4 / Test Area test coverage | **115 Lesson 4 tests** pass within the full suite, including every one of the 48 inventory rows; Test Area content and solution audits also pass |
| `npm run verify:lesson4` | **427 passed / 0 failed**, production Chromium, 1280×900 desktop + 390×844 mobile + 320px stress |
| `npm run verify:badges` | **33 passed / 0 failed**, actual existing electron/ion/charge and showcase geometry |
| Browser serious/critical axe checks | **16 passes**, including real contrast (not disabled): opening, unsubmitted final, four lab states and Teacher source/final solutions in both device sizes |
| Regression/protected scope | Earlier lesson route/interactive spot checks, source/Teacher/Test Area tests and lazy-solution behavior pass; protected old lesson data, old unit bank/solution and `SiteContactBar` have no diff |

Evidence is locally reproducible under ignored `artifacts/lesson4/`: full/targeted/badge logs, browser `report.json`, geometry records, and **33 viewport screenshots**. It is deliberately not committed as a generated dataset. Actual desktop/mobile screenshots were opened and inspected, including source/reference panels, Mg burning/product, the lemon observation, burner states, iron/sulfur builder, both assessments and Teacher guide/solutions. All three observation scenarios were also exercised with exact state/output assertions. The initially observed sticky-header screenshot/click artifacts were corrected in the harness (instant centered pointer scrolling and actual viewport captures), not by moving the unchanged contact bar.

Real-browser findings were **fixed, not suppressed**: inherited low-contrast new-lesson microcopy/current index and teacher English badges; auto-minimum grid overflow in the new teacher cards; hidden intrinsic lab overflow; and keyboard access to narrow word-equation scrollers. Styles are Lesson 4 scoped; the new renderer also exposes a clearly platform-labelled narrow-screen scroll hint. Long reaction chains intentionally scroll horizontally inside their focusable component, never reverse or force page-level overflow. Keyboard Enter/arrow scrolling, true lower `CO₂` subscript geometry, isolated Roman `II`, heating above its arrow, reset behavior and reduced-motion states were actually exercised. Existing charges remain raised to the right, as confirmed by the 33-check browser regression.

### 2026-10-14 caption-follow-up verification

After updating the source locator, audit text, and regression checks:

| Check | Follow-up result |
| --- | --- |
| `npm run verify` | **Passed** TypeScript, production build, postbuild/deep-link and distribution checks; **829 passed, 2 skipped across 31 test files**. |
| `npm test -- tests/lesson4.test.tsx` | **116 passed / 0 failed**. |
| `npm run verify:lesson4` | Production Chromium: **429 passed / 0 failed** at desktop, mobile and 320px stress; the p24 caption matched the crop verbatim and remained RTL on desktop and mobile. |
| `npm run verify:badges` | **33 passed / 0 failed**. |
| `git diff --check`; `node --check scripts/verify-lesson4-rendering.mjs` | Both passed. |

The p24 quote already matched the crop, so no textbook wording was changed. The existing right-photo reference remains descriptive, not a scan or reconstruction.

### Reproduction and limits

```bash
npm ci
npm run verify
# Optional QA tools only, intentionally not saved to package/lock files:
npm install --no-save --package-lock=false puppeteer-core @sparticuz/chromium
npm run verify:badges
npm run verify:lesson4
```

A compatible local Chromium may instead be supplied as `CHROMIUM_PATH`. The Lesson 4 script serves the production bundle temporarily under its real `/Interactive-Chemistry-Grade8` base, uses the actual data/keys (not a duplicated key), and closes its browser/server. The ordinary dev preview remains the existing all-interface Vite server.

Limitations: original scans remain unavailable (no lossless crops/pixel comparison); the labs are qualitative pedagogical models, not calibrated physical simulations; the mobile checks are Chromium emulation, not physical devices or Safari/Firefox; no external accessibility certification or security remediation is claimed. The baseline npm audit had nine vulnerabilities, and existing jsdom/KaTeX/React test warnings persist despite successful gates. The existing Teacher gate remains a client-side organizational gate, not secure authentication.

### Delivery and deliberate boundaries

`origin/main` was fetched again immediately before final verification: **7d6b0d9c59e7cb51c319f63bedf4e5d4bdf77941**, still equal to the starting HEAD (`0 0`). All work stays on **`arena/43337c87-interactive-chemistry-grade8`**. There was no previous PR for this branch. The final operation is to open its one dedicated Lesson 4 PR against `main`; its actual URL belongs in the completion message. Leave it **open/unmerged**.

**No Unit 1 final test was created, the old 60-question interim Lessons 1–2 bank was not expanded, no unit-completion claim was added, WhatsApp text/number/URL/placement stayed unchanged, and no Lesson 5 work was begun. Stop after PR creation.**
