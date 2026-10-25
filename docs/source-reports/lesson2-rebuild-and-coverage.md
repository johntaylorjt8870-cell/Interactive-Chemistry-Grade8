# تقرير إعادة بناء الدرس الثاني وتغطية المصدر (الصفحات 13–17)

يوثّق هذا التقرير تغطية صفحات الكتاب المدرسي `13–17` لدرس **«الروابط الكيميائية»** (`chem-u1-l2`) وبنيته التعليمية المكتفية بذاتها لطالب الصف الثامن.

## 1) أمانة المصدر وفصل إضافات المنصة

- السجل البرمجي الكامل: `src/data/curriculum/lesson2SourceLedger.ts` (**41 مدخلاً**: `38 implemented`، `2 reconstructed`، `1 decorative`، `0 unresolved`).
- جميع نصوص الكتاب وأنشطته وأسئلة «أختبر نفسي» محفوظة بنصّها المطبوع وترتيب صفحاتها (`13 ← 14 ← 15 ← 16 ← 17`) مع وسم مصدر صريح ورقم الصفحة.
- جميع شروح التأسيس (مكوّنات الذرّة، شحنة الأيون، الفلزّات واللافلزّات، حدود قاعدة الثمانية، الأمثلة الإضافية `Na₂O` و`H₂O` و`HCl`، والرسوم السبعة والمختبرات الجديدة) موسومة صراحةً بوصفها **إضافة من المنصة (`attribution: 'platform'`)** دون نسبتها إلى الكتاب المدرسي.

## 2) هيكل البناء التربوي المكتفي بذاته

- **عدد الخطوات:** `38` خطوة (`37` خطوة تعلم وتدريب + خطوة `final-test`).
- **الأشكال التعليمية المدمجة (7):**
  1. `lesson2-valence-map` (الخطوة 4: `atoms-and-shells`)
  2. `lesson2-ion-balance` (الخطوة 6: `neutral-atom-and-ions`)
  3. `lesson2-transfer-cao` (الخطوة 17: `ionic-ratio-example`)
  4. `lesson2-lewis-anatomy` (الخطوة 21: `covalent-meaning`)
  5. `lesson2-octet-bridge` (الخطوة 24: `octet-bridge`)
  6. `lesson2-bond-anatomy` (الخطوة 28: `bond-compare`)
  7. `lesson2-transfer-mgcl2` (الخطوة 35: `ionic-mgcl2-review`)
- **التفاعلات والمحاكيات المسجّلة للدرس الثاني (6):**
  1. `lesson2-valence-counter` (الخطوة 5: `valence-counter`)
  2. `lesson2-element-behavior-lab` (الخطوة 9: `element-behavior-lab`)
  3. `ionic-bonding-lab` (الخطوة 13: `ionic-lab`)
  4. `lesson2-bond-steps` (الخطوة 19: `ionic-steps`)
  5. `covalent-bond-lab` (الخطوة 23: `covalent-lab`)
  6. `lesson2-error-spotter` (الخطوة 32: `error-spotter` — 6 عبارات)
- **بنك التدريب المتدرّج:** `34` سؤالاً (`src/data/curriculum/chemistryLesson2Practice.ts`) بتعليل الخيار الصحيح واستبعاد البدائل الخاطئة.
- **الاختبار النهائي:** `17` سؤالاً / `20` جزءاً محتسباً (`src/data/curriculum/chemistryLesson2Test.ts`).

## 3) ملخص التحقّق

- `npm run verify`: نجاح `tsc -b` و`vitest run` (`40/40` ملف اختبار، `1,034` اختباراً ناجحاً) و`vite build` و`verify:dist`.
- `npm run verify:lesson2`: نجاح `1,112 / 1,112` فحصاً في Chromium الحقيقي عبر المقاسات `1440×900` و`1365×960` و`390×844`.
