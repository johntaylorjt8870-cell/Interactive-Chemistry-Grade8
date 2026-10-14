# Unit 1, Lesson 4 — independent final source-fidelity audit

**Lesson:** الدرس الرابع — التفاعلات الكيميائية
**Source pages:** 24–29 (six attached page images)
**Implementation audited:** PR #18, head `10f9fed13c60fe4265b2e8b90407ac147673507a`
**Audit/correction base:** PR #18 head; PR #18 itself is unchanged
**Initial audit date:** 2026-10-13
**Caption follow-up:** 2026-10-14 (user-supplied crop)

## Finding summary

The lesson is substantially complete: all readable headings, definitions, explanations, procedures, activities, equations, 16 multiple-choice options, and all 33 textbook activity/self-test units appear in the implementation. The 48 inventory IDs cover those elements, but the old automated check only compared repository-authored expected strings to repository-authored lesson data. It could establish implementation coverage, **not that the expected strings were faithful to the textbook**.

The image-to-implementation comparison found and corrected two demonstrable wording mismatches:

1. **Page 26, Bunsen procedure:** the implementation had «أشعل الموقد في الحالة (1)»; the attached page reads «أشعل الموقد كما في الحالة (1)». The source prompt and audit inventory now use the latter wording.
2. **Page 27, household-gas note:** the implementation had «(المركبتان) له رائحة قوية»; the attached page reads «(المركبتان) لها رائحة قوية». The source quote and audit inventory now use «لها».

A user-provided close crop on **2026-10-14** resolves the p24 text uncertainty. Its two lines read «إضافة قطرات ليمون إلى» / «بيكربونات الصوديوم (الكربونة)», matching the lesson quotation and inventory text exactly. No wording change was needed; the source locator no longer labels the quote unverified. The photograph itself remains a descriptive reference, not a reproduction.

### Evidence boundary

At the initial audit, the six page images were visible in the task message but no local image files were available. The user supplied a sharper p24 caption crop inline on 2026-10-14; I visually read it word-for-word and compared it with the implementation. The attachment was not mounted as a local file, so I could not retain it or make a pixel comparison of original artwork. The application uses labelled descriptive references for textbook figures; they are **not exact figure reproductions**.

### Status meanings

- **Verified against the attached textbook** — readable wording/structure and educationally important content match. For a figure row, this verifies its text/observation, not pixel-level artwork reproduction.
- **Partially verified** — the source subject, location and major visible details match, but the original artwork is absent and represented only by a descriptive reference.
- **Missing** — the source item has no corresponding student/teacher implementation.
- **Incorrect or inconsistent** — the implementation still contradicts a readable source item after correction.
- **Unreadable in the source** — the relevant detail cannot be independently read from the attached page image.

## Audit of all 48 original inventory rows

Status reflects the current post-crop audit. Five visual rows remain partial because their original artwork is absent and the references preserve educationally relevant details without reproducing pixels. L4-24-05 is verified for its exact caption and teaching observation; the photograph itself remains a descriptive reference, not a reproduction.

| Audit ID | Page and source element compared | Implementation location / result | Status |
|---|---|---|---|
| L4-24-01 | Lesson number 4 and title «التفاعلات الكيميائية» | `opening`; title and lesson metadata agree. | Verified against the attached textbook |
| L4-24-02 | «الأهداف» and six ordered goals | `opening`; all six appear in source order. | Verified against the attached textbook |
| L4-24-03 | «الكلمات المفتاحية» and six terms | `opening`; all six terms and order are retained. | Verified against the attached textbook |
| L4-24-04 | «التفاعل الكيميائي» / «ألاحظ وأجيب» headings | `observe-reactions`; both headings appear. | Verified against the attached textbook |
| L4-24-05 | Right-hand foam photograph and embedded red caption | `observe-reactions`; the caption matches the follow-up crop verbatim, and the descriptive reference preserves lemon/bicarbonate and foam; the original photo is not reproduced. | Verified against the attached textbook |
| L4-24-06 | Central gas-delivery / limewater photograph | `observe-reactions`; descriptive reference preserves the apparatus and cloudy-liquid observation; no original photo. | Partially verified |
| L4-24-07 | Left photo of drops on coloured fabric | `observe-reactions`; descriptive reference matches fabric/decolourisation context; no original photo. | Partially verified |
| L4-24-08a | Lemon-acid / bicarbonate observation question | `observe-reactions`; full prompt is present and has a separate teacher solution. | Verified against the attached textbook |
| L4-24-08b | Javel / coloured-clothes observation question | Same step; full prompt and teacher solution are present. | Verified against the attached textbook |
| L4-24-08c | CO₂ / limewater observation question | Same step; full prompt and teacher solution are present. | Verified against the attached textbook |
| L4-24-08d | Name all transformations in the preceding experiments | Same step; prompt and answer addressing all three are present. | Verified against the attached textbook |
| L4-25-01 | Magnesium-combustion and experiment headings | `magnesium-experiment`; headings match. | Verified against the attached textbook |
| L4-25-02 | Complete apparatus list, including goggles, tongs, ceramic dish and sand | Same step; all five listed apparatus items are retained. | Verified against the attached textbook |
| L4-25-03 | Magnesium procedure and observation prompt | Same step; safety glasses, tongs, ribbon, lit burner, caution and question are present. | Verified against the attached textbook |
| L4-25-04 | Photograph of burning magnesium | `magnesium-experiment`; descriptive reference covers bright burning and white product; original photo is absent. | Partially verified |
| L4-25-05a–c | Three numbered magnesium experiment questions | Same step; all three questions appear in order with separate solutions. | Verified against the attached textbook |
| L4-25-06 | «أستنتج» and chemical-reaction definition | `reaction-definition`; definition matches. | Verified against the attached textbook |
| L4-25-07 | Qualified indicator list («غالباً»; colour, precipitate, gas, heat, ellipsis) | Same step; wording/order and qualification are retained. | Verified against the attached textbook |
| L4-25-08a | Activity: name the gas that supports magnesium burning | `magnesium-word-activity`; prompt and oxygen solution are present. | Verified against the attached textbook |
| L4-25-08b | Activity: name product and infer its formula | Same step; prompt and platform-labelled MgO solution are present. | Verified against the attached textbook |
| L4-25-08c | Activity: write the word equation | Same step; prompt and platform-labelled equation solution are present. | Verified against the attached textbook |
| L4-25-09 | Incomplete Mg + blank → blank diagram, «تسخين», role labels | Same step; blanks, plus, forward arrow, condition and two reactant/one product labels are represented. | Verified against the attached textbook |
| L4-26-01a | Iron + sulfur → iron(II) sulfide activity | `word-equation-activities`; `II` is retained as part of the product name; full solution present. | Verified against the attached textbook |
| L4-26-01b | Hydrogen + oxygen → water activity | Same step; wording and word-equation solution are present. | Verified against the attached textbook |
| L4-26-02 | Bunsen-burner experiment heading and apparatus/air-hole description | `burner-experiment`; burner, air hole above valve and ceramic plate are represented. | Verified against the attached textbook |
| L4-26-03a–b | Execution prompts for conditions (1) and (2) | Same step; p26 prompt corrected to «أشعل الموقد كما في الحالة (1)…»; second prompt retained. | Verified against the attached textbook |
| L4-26-04 | Two columns × two rows: blue/clean condition (1), yellow/soot condition (2), repeated labels | `burner-experiment`; descriptive reference records the layout and labels, but not the original drawing/photo. | Partially verified |
| L4-26-05a–d | Four numbered questions: flame colour, cause, black deposit, product comparison | Same step; all four prompts appear in order and have separate worked solutions. | Verified against the attached textbook |
| L4-26-06 | Combustion definition and «درجة حرارة مناسبة» | `combustion-conclusions`; definition is retained without inventing a temperature. | Verified against the attached textbook |
| L4-26-07 | Products vary with available air/oxygen | Same step; statement is present. | Verified against the attached textbook |
| L4-26-08 | Combustion is complete or incomplete | Same step; statement is present. | Verified against the attached textbook |
| L4-26-09a–b | Sufficient-oxygen / insufficient-oxygen conditions | Same step; both conditions are present and correctly ordered. | Verified against the attached textbook |
| L4-27-01 | «هل تعلم؟!» domestic-gas / odorant / soap note | `household-gas`; wording now uses the source pronoun «لها» for المركبتان; source's final leak-test phrase is preserved. | Verified against the attached textbook |
| L4-27-02 | «إضاءة» on CO, colour/toxicity, red-cell effect and symptoms | `carbon-monoxide`; full statement and plain `(CO)` appear. | Verified against the attached textbook |
| L4-27-03 | Sealed-room / fuel-heater research task | `research-heaters`; full question is present; explanatory answer is platform-labelled. | Verified against the attached textbook |
| L4-27-04 | Repeated reaction definition in «تعلّمت» | `learned-summary`; the deliberate repeat from p25 is retained. | Verified against the attached textbook |
| L4-27-05 | General word-equation label and reactants → products diagram | Same step; roles and right-pointing arrow are represented in a structured word equation. | Verified against the attached textbook |
| L4-27-06a–b | Repeated oxygen conditions in the summary | Same step; both repeated statements are present. | Verified against the attached textbook |
| L4-28-01 | «أختبر نفسي», question 1 and full MC instruction | `book-question-1`; heading and instruction appear. | Verified against the attached textbook |
| L4-28-02a–d | Four MC stems and all 16 a–d options | Same step; all stems, option texts and labels/order are retained. | Verified against the attached textbook |
| L4-28-03 | Question 2 heading and instruction | `book-question-2`; heading and instruction appear. | Verified against the attached textbook |
| L4-28-04a–c | Three incomplete word equations, reactant order, plus signs, forward arrows and product blanks | Same step; printed order is preserved: oxygen/magnesium, zinc/sulfur, sulfur/iron. | Verified against the attached textbook |
| L4-28-05 | Question 3 heading and word-equation instruction | `book-question-3`; heading and instruction appear. | Verified against the attached textbook |
| L4-28-06a–c | Carbon combustion, hydrogen/azot → ammonia, zinc oxidation prompts | Same step; all three prompts and platform solutions retain «الأزوت» as printed. | Verified against the attached textbook |
| L4-29-01 | Compare complete and incomplete butane combustion products | `book-question-4`; full comparison prompt and qualified scientific solution are present. | Verified against the attached textbook |
| L4-29-02 | Experimental detection of carbon dioxide | `book-question-5`; prompt and limewater method → observation → conclusion solution are present. | Verified against the attached textbook |
| L4-29-03 | Question 6 classify both combustion figures and explain black layer | `book-question-6`; complete prompt and all three answer elements are present. | Verified against the attached textbook |
| L4-29-04a–b | Figure (1) right/blue and figure (2) left/yellow/plate | `book-question-6`; text reference preserves side/number/colour, but the two original images are not reproduced. | Partially verified |

### Per-row status totals

- **Verified against the attached textbook:** 43
- **Partially verified:** 5 (the original artwork for these figure rows is absent)
- **Unreadable in the source:** 0
- **Missing:** 0 source-content rows
- **Incorrect or inconsistent after the two wording corrections:** 0

The five partial rows remain image-centered references without original artwork. The p24 right-photo caption and its teaching observation are now verified, but the photo is still not reproduced. No status claims exact figure reproduction.

## Exercise, solution and assessment audit

### Textbook exercises

The implementation contains all **33** source question/activity units in the source flow and Teacher Area: 20 in-lesson prompts/activities and 13 self-test units. The latter include all four MC questions × four choices, three blank word equations, three word-equation writing prompts, and all three p29 exercises. Teacher solutions are present for each unit; they include reasoning for observations and products, completed word equations, all p26 subparts, MC answer reasoning, the p29 comparison and detection procedure, and the three required p29 figure-6 subparts. The p24 red caption has now been independently verified from the follow-up crop; its photo remains a descriptive reference rather than reproduced artwork.

### Teacher Area

The independent Lesson 4 Teacher tab has a platform-labelled concept/experiment guide, 33 textbook-item solutions and 20 lesson-test solutions. The answers are consistent with the readable source and chemistry: Mg + O₂ produces MgO; iron + sulfur gives iron(II) sulfide in the p26 activity; hydrogen + oxygen gives water; the p28 reactant order is kept in the source prompts; and CO is distinguished from CO₂. For incomplete butane combustion, the solution appropriately avoids claiming one fixed mixture and allows CO and/or carbon/soot with water; the p26/p29 figures support the qualitative comparison, not numerical product yields.

### Twenty-question lesson test

The lesson-level test contains exactly **20** platform-authored, deterministic questions with full teacher reasoning. It covers material transformation/roles, observations, magnesium and MgO, word equations, oxygen sufficiency, combustion products and the p26 figure, household gas/odorant, CO hazard and the CO₂ limewater test. The two numerical-format items count named substances; they do **not** add a physical measurement or value absent from the textbook. Review remains hidden until completed submission, as checked by unit and browser tests.

A separate **20-question Test Area bank** is also implemented with full solutions and stays separate from the textbook exercises and lesson test. No Unit 1 final test, Lesson 5 content, or unrelated lesson/contact changes were made.

## Formula, symbol and browser audit

Actual production Chromium was rerun after the caption follow-up. It exercised the lesson, Teacher Area, lesson test and Test Area at desktop, mobile and 320-pixel stress widths, including exact p24 caption text and RTL direction at desktop and mobile.

- All printed word-equation arrows render rightward in a single LTR chain; Arabic substance names retain RTL shaping and the source reactant order. Page-25 «تسخين» stays above the arrow; `II` remains an isolated Roman numeral in the iron(II) product name.
- Page 27 prints `CO`, with no subscript, superscript or charge. No textbook page 24–29 contains an ionic charge or superscript. The rendered platform CO₂ explanation uses a true lower `<sub>2</sub>`; MgO is un-subscripted. This is platform/answer content, not a source formula.
- No source equilibrium/reversible arrow or symbolic balanced chemical equation appears; the implementation does not represent a balanced symbolic equation as printed textbook material.
- Narrow word equations remain horizontally scrollable within their own focusable region; no page-level horizontal overflow was detected.

## Corrections and exact scope

1. **p26** — corrected the first Bunsen execution prompt to include «كما» and match the attached page. Updated lesson data, the expected-source JSON inventory, the historical transcription, and an assertion in `tests/lesson4.test.tsx`.
2. **p27** — corrected «له رائحة قوية» to «لها رائحة قوية» in the household-gas textbook quotation and inventory. Updated the historical transcription and added an assertion.
3. **p24 caption** — compared the user-supplied crop word-for-word; it reads «إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)», exactly matching the existing lesson quotation. No source wording was changed; the stale unverified locator label was removed. The photo itself remains a descriptive reference, not an exact reproduction.
4. **Figures** — no scans were fabricated or described as exact redraws; existing descriptive source references were retained.

## Verification results

After the source corrections and p24 caption follow-up:

- `npm run verify`: passed TypeScript, production build, postbuild/deep-link and distribution checks; **829 tests passed, 2 skipped across 31 files**.
- `npm run verify:lesson4`: actual production Chromium, **429 passed / 0 failed**, covering desktop 1280×900, mobile 390×844, and 320px stress; includes the exact p24 caption check in RTL on both widths, actual interaction, teacher solutions, assessment, source `II` and `CO` direction/script checks, RTL/LTR equation geometry, CO₂ subscript, reduced motion and no-overflow checks.
- `npm run verify:badges`: actual Chromium scientific-notation regression, **33 passed / 0 failed**, including raised ionic charges positioned on the right. The lesson source itself contains no ionic charge to render.
- `git diff --check`: passed.

The full unit suite emits existing KaTeX warnings for Arabic prose, jsdom/axe canvas warnings, and React async `act(...)` warnings; no test failed. Browser artifacts are ignored under `artifacts/lesson4/browser/` and `artifacts/badge-rendering/`; generated screenshots were not added to Git.

## Remaining limitations

- The p24 caption wording is now verified from the user-provided crop. The original p24 photograph and other textbook illustrations are not available as local assets or reproduced in the app; descriptive references preserve page, order and teaching-relevant meaning only. No pixel-fidelity claim is made.
- The status table is an image-based human comparison documented here; the existing 48 automated assertions remain coverage checks, not a machine-verified transcription system.
- Browser testing is Chromium only; it does not certify Firefox, Safari, physical-device display, or scientific instrumentation accuracy.
