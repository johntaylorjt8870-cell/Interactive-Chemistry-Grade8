# Physics Lesson 1 — القوى المتلاقية — Phase B Final Report

Branch: `arena/01a0fc8f-interactive-physics-chemistry` · Commit `0b76bf3` (pushed) · Date: 2026-10-02
Companion source audit: `docs/source-reports/physics-lesson1-concurrent-forces-readability.md` (§§1–8 literal inventory, §9 F1–F9, §10 D1–D6, §11 verdict).

## The 17 points

1. **Source fidelity — verbatim content.** All textbook text of pp. 55–62 is reproduced word-for-word in `src/data/curriculum/physicsLesson1.ts` as `textbook-verbatim` / `textbook`-attributed blocks, including the unusual printed forms preserved exactly: «شدّة القوّة الأول 30 N» (p62, no ة), «أسائل:» (p57/p60), «مركّبتَيهما» (p60) vs «مركّبتَيها» (p61), «الزّنابض» (p56 step 3, F9 closed by direct reading), «وليكن الشعاع OM⃗» (p60), «(مرسم النقطة)» (p60), italic Latin `a` angle labels in نشاط p60, and the Pythagoras box wording (p59). Nothing shortened, summarized, or paraphrased; no number, unit, or symbol altered.

2. **Labeled platform additions.** Every non-textbook block carries `attribution: "platform"` and renders under the «إضافة من المنصة» badge: worked examples (given → required → formula → substitution → calculation → result → unit → interpretation → verification, rendered via KaTeX), concept explanations, the learn-box summary, and diagram descriptions replacing the photographed figures.

3. **Required interactives — concurrent-forces lab.** `ConcurrentForcesLab` rebuilds the p56 two-spring experiment: sliders for both angles and the weight, live tension readouts, toggleable carrier extensions showing the three lines of action always meeting at O (`data-carriers` verified in tests).

4. **Required interactives — parallelogram lab.** `ParallelogramLab`: F₁, F₂, and angle sliders; staged construction (rays → parallelogram → diagonal, `data-stage`); scale control («كل 1 cm يمثل 20 N» reproduces the book’s F = 5 × 20 = 100 N); resultant magnitude + direction readouts; at 90° the Pythagoras relation appears automatically (`data-pythagoras`).

5. **Required interactives — force-components lab.** `ForceComponentsLab`: one force resolved into two perpendicular components on either free axes or the incline preset (مستوي مائل), matching p60–61 including the platform-activity example.

6. **Animation.** Motion in the labs is CSS/SVG-transition based and fully honors `prefers-reduced-motion`: under the reduced-motion media query labs mount with `lab--still` and jump straight to the final stage (asserted in tests).

7. **Textbook examples and questions verbatim; no instant feedback in activities.** الكتاب examples (60/80 N at 60°; 6 N × 1 cm) and all ثمانية «أختبر نفسي» questions (p1-book-mc-1..6, p1-book-pr-1..2) are verbatim with page citations; the labs give no grading or right/wrong feedback — they are exploration only.

8. **Final test.** `phys-u2-l1-final`: 14 new questions, all types required — MCQ single (2), MCQ multiple (1), T/F (3), fill-blank (1), ordering (1), matching (1), numerical (3), diagram-interpretation (1), short-answer (1) — every one with an explanation; nothing is graded before submission (evaluate.ts pipeline, covered by tests).

9. **Physics Teacher Area.** Teacher tab → الفيزياء; `final-test-solutions?lesson=phys-u2-l1` shows per-question «التفسير وخطوات الحل» (14/14 with explanations after the p1-final-11 fix), plus a common-mistakes list and «مرجع الكتاب: الصفحة XX» per question. Chemistry teacher content untouched.

10. **Arabic RTL / BIDI.** All prose is RTL; tests assert no stray-direction runs in lesson steps; the ElectronConfiguration single-isolate BIDI fix is intact (45 electronConfiguration tests still green).

11. **Scientific notation isolated LTR.** `F₁⃗`, `F₂⃗`, `w⃗`, `OM⃗`, `60°`, `1cm` each render as a single LTR-isolated run. This required a real fix: the compact-chemical-formula promotion (`COMPACT_FORMULA_SOURCE`) was matching `F₁` ahead of its combining vector arrow/superscript, tearing `F₁⃗` into a formula + orphaned `⃗` and leaving stray `²` glyphs; the negative lookahead now rejects following subscripts, superscripts, and U+20D7, so physics symbols fall through to the whole-token MATH_RUN isolation. Chemistry formulas (H₂O, Cl₂, ions, ₂-8-₈ configurations, nuclides) unaffected — notationPromotion, scientificText (50), scientificRendering (54), rtlAndBidi (17) all green.

12. **Math via KaTeX, read L→R.** All formulas render through `MathFormula` (dir="ltr" containers); tests assert `.katex` nodes on the perpendicular/Pythagoras step; no per-equation CSS hacks were added.

13. **Regression tests.** New `tests/physicsLesson1.test.tsx` (40 tests: source fidelity incl. verbatim numerics, outline, interactives mounted and interactive, lab behaviors incl. reduced motion, final-test grading, teacher area, RTL/BIDI, KaTeX, no stray script glyphs, axe a11y). Updated `sourceFidelity.test.ts` (units 2, lessons 3, steps 54, physics pages 55–62) and `app.test.tsx` (physics home now shows the unit link «الوحدة الثانية — الحركة والقوى»). Full suite: **409 passed / 16 files**.

14. **Chemistry intact.** All chemistry lessons, labs, and teacher content render as before; every pre-existing chemistry test passes in the same run.

15. **Quality gates.** `npm run typecheck` exit 0; `npm run build` emits the three new lab bundles (ConcurrentForcesLab, ParallelogramLab, ForceComponentsLab); `npm run verify:dist` ✓ (base path, deep-link fallback, assets). CJK/placeholder scan of all touched files: clean.

16. **Visual verification: UNAVAILABLE** in this environment (no browser). Structural verification performed instead: jsdom rendering of every lesson step, interactive mounting/interaction assertions, axe (no serious/critical violations), stray-glyph walkers, RTL/LTR isolation checks, KaTeX node presence, and the production dist verification above. A live dev-server preview has been started in the sandbox for the user's own visual review.

17. **Git hygiene.** Single commit `0b76bf3` pushed to `arena/01a0fc8f-interactive-physics-chemistry` only; no merge, rebase, reset, force-push, or branch deletion; working tree clean.

## Handoff discrepancies (as required)

- `aff2477` referenced in the handoff does not exist in this clone; branch/PR facts re-verified from the remote instead.
- The handoff's F6 reading was wrong: the printed form is «أسائل:» (verified p57/p60), not «أسئلة».
- F9 was closed only by direct reading of the p56 step-3 image line («الزّنابض»); agreement with the p56 tools line and p60 step 1 is recorded as an observation, not evidence.
- Two CJK fragments («不同») that slipped into drafted Arabic content were caught by the scan and replaced before commit.
