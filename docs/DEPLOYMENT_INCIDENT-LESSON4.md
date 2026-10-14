# تقرير تشخيص النشر — الدرس الرابع «التفاعلات الكيميائية» لا يظهر على المنصة

**المستودع:** `johntaylorjt8870-cell/Interactive-Chemistry-Grade8`
**تاريخ التشخيص:** 2026-10-14
**الحالة المُشخَّصة:** `origin/main` عند `7d6b0d9c59e7cb51c319f63bedf4e5d4bdf77941`

---

## 1. الخلاصة (السبب الجذري)

> **الدرس الرابع لم يصل إلى `main` إطلاقاً، لذلك لم يُبنَ ولم يُنشر.**
>
> طلب السحب **#18 ما زال مفتوحاً (OPEN) ولم يُدمج**. أما طلب السحب **#19 فقد دُمج فعلاً —
> لكن فرعه الأساس لم يكن `main` بل فرع الميزة الخاص بـ #18**
> (`arena/43337c87-interactive-chemistry-grade8`). أي أن دمج #19 حرّك فرع الميزة
> خطوةً إلى الأمام، ولم يُضف أي التزام إلى `main`.

المشكلة إذن **ليست** في النشر، ولا في التخزين المؤقت، ولا في عرض الدرس، ولا في المسار
الأساسي لـ GitHub Pages، ولا في تسجيل الدرس في السجل أو التوجيه. كل هذه الطبقات سليمة.
المشكلة أن الشيفرة المنشورة هي نسخة `main` التي تسبق وجود الدرس الرابع.

**الإجراء الوحيد الكفيل بظهور الدرس الرابع هو دمج PR #18 في `main`.**
لم يُنفَّذ هذا الدمج هنا التزاماً بقيد «لا تدمج أي PR» الوارد في التكليف.

---

## 2. المنهجية

كل نتيجة أدناه مُستخرجة بتنفيذ فعلي (لا استنتاج ولا اعتماد على حالة جلسة سابقة).
المستودع المحلي كان استنساخاً ضحلاً (`shallow`) عند `7d6b0d9`، لذلك نُفِّذ
`git fetch --unshallow origin` أولاً، ثم فُحصت الحالة الحقيقية عبر `gh` و`git ls-remote`
وواجهات GitHub API.

---

## 3. الأدلة

### 3.1 حالة طلبَي السحب — `gh pr list --state all`

| PR | العنوان | الحالة | الفرع الأساس | فرع المصدر | التزام الدمج |
|----|---------|--------|--------------|------------|---------------|
| **#18** | `feat: Unit 1 Lesson 4 — التفاعلات الكيميائية (ص24–29)` | **OPEN** (`mergedAt: null`) | **`main`** | `arena/43337c87-…` | — |
| **#19** | `audit: correct Lesson 4 source transcription` | MERGED @ 2026-10-14T12:08:10Z | **`arena/43337c87-…`** ⚠️ | `arena/ea95fbdc-…` | `72a18634` |
| #17 | `feat(shell): WhatsApp contact chip…` | MERGED @ 2026-10-08T12:08:36Z | `main` | `arena/35236f9d-…` | `7d6b0d9c` |

**النتيجة الحاسمة:** الأساس (base) لـ PR #19 ليس `main`. والتزام دمجه `72a18634`
هو **رأس فرع PR #18 نفسه**، لا رأس `main`.

حالة PR #18 التفصيلية (`gh pr view 18`):

```
state:            OPEN
isDraft:          false
base:             main
head:             arena/43337c87-interactive-chemistry-grade8
mergedAt:         null
mergeable:        MERGEABLE
mergeStateStatus: CLEAN
commits:          10f9fed1, 0b071876, b1009a35, 72a18634
```

### 3.2 طوبولوجيا الفروع — `git log --graph 72a18634`

```
*   72a1863 Merge pull request #19 …      ← رأس فرع PR #18 الآن (وليس main)
|\
| * b1009a3 fix: verify Lesson 4 page 24 caption
| * 0b07187 fix: audit Lesson 4 source fidelity
|/
* 10f9fed feat: implement source-verified Unit 1 Lesson 4 chemical reactions
*   7d6b0d9 Merge pull request #17 …      ← رأس main الفعلي (آخر ما وصل إلى main)
```

* `git ls-remote origin refs/heads/main` → `7d6b0d9c59e7cb51c319f63bedf4e5d4bdf77941`
* `git log --oneline origin/main..72a18634` → **4 التزامات** (كل عمل الدرس الرابع) خارج `main`.
* التزامات `main` بعد دمج PR #17: **صفر**. لا يوجد أي التزام للدرس الرابع على `main`.
* تحقّق إضافي: شجرة `72a18634` مطابقة لشجرة `b1009a35`
  (`5a1c159f75a27a554922dc1ad39a47c9dae0ef2b`)، أي أن تصحيحات التدقيق التي جاء بها #19
  استقرت كاملةً داخل فرع #18 — وهي محفوظة هناك، ولم تُفقد، لكنها ما زالت خارج `main`.

### 3.3 سير عمل النشر وسجلاته

`git ls-tree -r origin/main` يُظهر **ملف workflow واحداً فقط**: `.github/workflows/deploy-pages.yml`.
محفّزاته:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

`gh run list --limit 15` — **جميع** التشغيلات الـ15 على فرع `main` فقط، وجميعها `success`،
و**أحدثها**:

```
run id:     37774802274
workflow:   Build and Deploy to GitHub Pages
headBranch: main
headSha:    7d6b0d9c59e7cb51c319f63bedf4e5d4bdf77941
created:    2026-10-08T12:08:38Z
jobs:       "Build and verify" → success ; "Deploy" → success
```

**لا يوجد أي تشغيل workflow بعد 2026-10-08** — أي أنه لم يُبنَ أي شيء منذ دمج PR #17،
ولا مرة واحدة بخصوص الدرس الرابع. وهذا متسق تماماً مع بقاء `main` على حاله.

### 3.4 إعدادات GitHub Pages ومصدر النشر والعنوان الفعلي

`gh api repos/…/pages`:

```json
{
  "html_url": "https://johntaylorjt8870-cell.github.io/Interactive-Chemistry-Grade8/",
  "build_type": "workflow",
  "source": { "branch": "main", "path": "/" },
  "cname": null,
  "https_enforced": true,
  "custom_404": false,
  "public": true
}
```

`gh api repos/…/deployments` — أحدث نشر (ولا يوجد أحدث منه):

```
deployment id:  6935092146
ref:            main
sha:            7d6b0d9c
environment:    github-pages
status:         success @ 2026-10-08T12:09:56Z
environment_url: https://johntaylorjt8870-cell.github.io/Interactive-Chemistry-Grade8/
```

`gh api repos/…/pages/builds` → `[]` (متوقع: `build_type` هو `workflow`، فالنشر يتم عبر
`actions/deploy-pages` لا عبر باني Pages الكلاسيكي).

**الاستنتاج:** القطعة الفنية المنشورة حالياً بُنيت من `main @ 7d6b0d9c` — وهي نسخة
**تسبق** وجود أي ملف من ملفات الدرس الرابع. لذا فغياب الدرس عن الموقع المنشور نتيجة
حتمية ومثبتة، لا خلل عرض ولا تخزين مؤقت.

### 3.5 اختبار A/B على ناتج الإنتاج (الدليل المادي المباشر)

بُنيت النسختان محلياً بأمر البناء الإنتاجي الفعلي (`tsc -b && vite build && node scripts/postbuild.mjs`)،
ثم فُحصت معرّفات الدروس (`slug`) داخل حزمة `dist/assets/index-*.js`:

| البنية | `origin/main` @ `7d6b0d9` (= المنشور حالياً) | رأس PR #18 @ `72a18634` |
|--------|-----------------------------------------------|--------------------------|
| `atom-and-element` | ✓ | ✓ |
| `chemical-bonds` | ✓ | ✓ |
| `chemical-formulas` | ✓ | ✓ |
| `structural-chemistry` (الوحدة) | ✓ | ✓ |
| **`chemical-reactions` (الدرس الرابع)** | **✗ غير موجود** | **✓ موجود** |
| حزم `chem-u1-l4-*.js` | **✗ لا شيء** | ✓ `chem-u1-l4-BzpnG4Zc.js` (11.51 kB) + `chem-u1-l4-98DwsfDt.js` (16.58 kB) |
| محاكيات الدرس الرابع | **✗ لا شيء** | ✓ `Lesson4Visuals`, `WordEquationLab`, `CombustionAirLab`, `MagnesiumCombustionLab`, `ReactionObservationLab` |

البحث في بناء `main` عن `l4` أو `lesson4` أو `WordEquation` أو `Combustion` أو `Magnesium`
أو `ReactionObservation` داخل `dist/assets/` أعاد **صفر نتائج**.

هذا يثبت أن الموقع المنشور لا يحتوي الدرس الرابع — وأن الدمج وحده كفيل بإظهاره،
دون أي تعديل على محتوى الدرس.

### 3.6 تسجيل الدرس ومسارات التنقل والتوجيه (سليمة على الفرع)

فُحص الفرق `origin/main…72a18634` (48 ملفاً، ‎+4006/−45):

* `src/data/curriculum/registry.ts` — التسجيل **صحيح وكامل**:
  ```diff
  +import { chemistryLesson4 } from './chemistryLesson4'
  -      lessons: [chemistryLesson1, chemistryLesson2, chemistryLesson3],
  +      lessons: [chemistryLesson1, chemistryLesson2, chemistryLesson3, chemistryLesson4],
  -      source: { pages: Array.from({ length: 21 }, …) }   // ص 3–23
  +      source: { pages: Array.from({ length: 27 }, …) }   // ص 3–29
  ```
* `src/app/navigation.ts` و`src/app/router.tsx` — **لم يمسّهما PR #18 إطلاقاً**، وهذا صحيح
  by design: المسارات عامة (`/:subject/:unitSlug/:lessonSlug`) ومشتقة من السجل، فلا حاجة
  لأي تعديل توجيهي عند إضافة درس.
* ملفات الدرس الرابع موجودة على الفرع: `chemistryLesson4.ts` (29 kB)،
  `chemistryLesson4Questions.ts` (36 kB)، `chemistryLesson4Test.ts` (32 kB)،
  `testArea/banks/chem-u1-l4.ts`، `testArea/solutions/chem-u1-l4.ts`،
  `scientific/WordEquation.tsx` + `word-equation.css`، `styles/lesson4.css`،
  `simulations/lesson4-labs.css`، و5 محاكيات، و3 تقارير مصدر في `docs/source-reports/`.
* **لا مساس بمحتوى الدروس 1–3:** `chemistryLesson1.ts` و`chemistryLesson2.ts`
  و`chemistryLesson3.ts` و`banks/chem-u1-l1.ts` و`solutions/chem-u1-l1.ts` — فروقها **فارغة تماماً**.
* **لا مساس بـ `.github/`:** الفرق لا يحتوي أي ملف داخل `.github/`.
* تعديل `src/data/curriculum/schema.ts` إضافةٌ تراكمية آمنة فقط (نوع كتلة جديد
  `kind: 'word-equation'` ضمن اتحاد `ContentBlock`) — لا تغيير في أي نوع قائم.

**الخلاصة:** لا يوجد أي خلل في التسجيل أو التوجيه أو التنقل. لا حاجة إلى أي تعديل على
الدرس الرابع أو على بنيته.

### 3.7 ما تعذّر فحصه (مُصرَّح به صراحة)

**لم أتمكن من اختبار الموقع المنشور مباشرة.** منفذ الخروج في بيئة التنفيذ مقيّد
بـ `github.com` و`codeload.github.com` و`api.github.com` و`registry.npmjs.org` و`pypi.org`
و`files.pythonhosted.org` فقط، والنطاق `johntaylorjt8870-cell.github.io` **خارجها**.

فحص الوصول الفعلي المُنفَّذ:

```
github.com                              → HTTP 200
api.github.com                          → HTTP 200
johntaylorjt8870-cell.github.io         → curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL  (HTTP 000)
…/chemistry/structural-chemistry/chemical-reactions → curl: (35) SSL_ERROR_SYSCALL           (HTTP 000)
```

**البديل المُنفَّذ عوضاً عن ذلك (موثوق ومكافئ):** بدلاً من قراءة الموقع مباشرة، حُدِّد
الالتزام الذي بُنيت منه القطعة المنشورة من سجل النشر الرسمي
(`deployment 6935092146 → main @ 7d6b0d9c`)، ثم أُعيد بناء ذلك الالتزام نفسه محلياً
وفُحص ناتجه (§3.5). النتيجة: لا أثر للدرس الرابع في ناتج `7d6b0d9c`. وبما أن
`html_url` و`environment_url` متطابقان ولا يوجد نشر أحدث، فالموقع المنشور يطابق ذلك الناتج.

لم يُدَّعَ في أي موضع من هذا التقرير أن الموقع المنشور فُحص مباشرة.

---

## 4. العامل المساهم: لا يوجد أي تحقّق آلي على طلبات السحب

أثناء التشخيص ثبتت ثغرة عملية هي سبب مرور الحالة دون انتباه:

```
gh pr checks 18                                  → no checks reported
GET /commits/72a18634…/check-runs                → total_count: 0
GET /commits/72a18634…/status                    → state: "pending", total_count: 0
gh run list (كل الفروع)                          → 0 تشغيل على أي فرع غير main
```

`deploy-pages.yml` هو الـworkflow الوحيد، ولا يُحفَّز إلا عند الدفع إلى `main`. لذلك:

* **لم يُبنَ الدرس الرابع ولا اختُبر في أي بيئة CI قطّ** — لا typecheck ولا build ولا
  `verify:dist` ولا الاختبارات.
* GitHub يعرض PR #18 بمؤشر `mergeable: MERGEABLE` و`mergeStateStatus: CLEAN`
  **مع صفر فحوص** — أي «نظيف» بمعنى «بلا تعارض وبلا فحوص مطلوبة»، لا بمعنى «تم التحقق منه».
* هذه الإشارة الخادعة هي التي سمحت بدمج PR فرعي (#19) داخل فرع الميزة بينما بقي PR الميزة
  نفسه (#18) مفتوحاً دون أن ينبّه شيءٌ إلى أن `main` لم يتلقَّ الدرس.

---

## 5. التغييرات في طلب السحب هذا

طلب سحب إصلاحي مستقل، **بملفين جديدين فقط**، وصفر تعديل على أي ملف قائم:

| الملف | النوع | الغرض |
|-------|-------|-------|
| `.github/workflows/ci.yml` | **جديد** | بوابة تحقّق على `pull_request`: typecheck ثم build ثم `verify:dist` ثم الاختبارات — بنفس ترتيب `deploy-pages.yml` تماماً. |
| `docs/DEPLOYMENT_INCIDENT-LESSON4.md` | **جديد** | هذا التقرير. |

خصائص `ci.yml` التي تجعله آمناً بالحد الأدنى:

* **لا ينشر شيئاً إطلاقاً:** يطلب `contents: read` فقط — بلا `pages: write` ولا `id-token: write`.
* لا يستدعي `actions/configure-pages` ولا `upload-pages-artifact` ولا `deploy-pages`.
* **`deploy-pages.yml` لم يُمسّ** — يبقى مسار النشر الوحيد كما هو، وتبقى عقود
  `tests/deployment.test.ts` (التي تقرأ ذلك الملف حصراً) سارية دون تغيير.
* محفَّزه `pull_request` فقط (لا `push`)، فلا يكرر بناء `main` ولا يتزاحم مع مجموعة
  التزامن `pages`.
* `concurrency: ci-${{ github.ref }}` مع `cancel-in-progress: true` لإلغاء التشغيلات
  المتقادمة على نفس الفرع.
* `actions/checkout@v4` و`actions/setup-node@v4` مع Node 22 و`cache: npm` — مطابقة
  لإصدارات النشر المثبّتة.

### ما لم يُغيَّر (عمداً)

* **لا** إعادة كتابة للدرس الرابع ولا إعادة إنشاء لمحتواه.
* **لا** تعديل على الشحنات الكيميائية أو المعادلات أو حلول المعلم أو الاختبارات.
* **لا** تعديل على أي درس آخر (1–3) أو على سجلّات منطقة الاختبار أو الحلول.
* **لا** تعديل على `registry.ts` أو `navigation.ts` أو `router.tsx` أو `vite.config.ts`
  أو `deploy-pages.yml` — فكلها سليمة (§3.6).
* **لا** إصلاح افتراضي: لم يُكتب أي تغيير قبل إثبات السبب بالأدلة أعلاه.

---

## 6. التحقق المُنفَّذ

### 6.1 على رأس PR #18 (`72a18634`) — في `git worktree` معزول

| الفحص | الأمر | النتيجة |
|-------|-------|---------|
| تثبيت التبعيات | `npm ci` | ✓ نجاح (Node v22.22.3 / npm 10.9.8) |
| فحص الأنواع | `npm run typecheck` | ✓ نجاح، صفر أخطاء |
| بناء الإنتاج | `npm run build` | ✓ `built in 2.60s` + `dist/404.html` و`dist/.nojekyll` أُنشئا |
| التحقق من الناتج | `npm run verify:dist` | ✓ `109` أصلاً، صفر مشاكل — «base path, deep-link fallback and asset emission are correct» |
| كامل الاختبارات | `npm test` | ✓ **31 ملفاً / 831 اختباراً — كلها ناجحة** (48.92s) |
| اختبارات الدرس الرابع | `npx vitest run tests/lesson4.test.tsx` | ✓ **116 اختباراً ناجحاً** (5.45s) |
| وجود الدرس في الناتج | فحص `dist/assets/` | ✓ `slug:"chemical-reactions"` + حزمتا `chem-u1-l4` + 5 محاكيات |

### 6.2 على `origin/main` (`7d6b0d9c`) — إثبات النقيض

| الفحص | النتيجة |
|-------|---------|
| بناء الإنتاج | ✓ نجح (`index-C9TStmGz.js`) — أي أن `main` سليم وقابل للنشر |
| البحث عن أثر الدرس الرابع في `dist/assets/` | ✗ **صفر نتائج** — يؤكد §3.5 |

### 6.3 على فرع هذا الطلب

* `npm ci` → `npm run typecheck` → `npm test` → `npm run build` → `npm run verify:dist`: كلها ناجحة.
* تحليل `ci.yml` بمحلّل `yaml` (المستخدم في `tests/deployment.test.ts`): بنية سليمة،
  والمحفّزات والصلاحيات كما هو مقصود.
* `tests/deployment.test.ts` ما زالت ناجحة — لأن `deploy-pages.yml` لم يُمسّ.

---

## 7. الإجراء المطلوب لإغلاق المشكلة (خارج نطاق هذا الطلب)

> ⚠️ **هذا الطلب لا يُظهر الدرس الرابع على المنصة، ولا يستطيع ذلك.**
> التغيير الوحيد الذي يُظهره هو وصول التزامات PR #18 إلى `main`.

الخطوات على المالك:

1. **مراجعة PR #18 ودمجه في `main`.** حالته `MERGEABLE` / `CLEAN`، وفرعه
   `arena/43337c87-interactive-chemistry-grade8` عند `72a18634` يحتوي كل شيء:
   تنفيذ الدرس + تصحيحات تدقيق الأمانة المصدرية القادمة من #19 (§3.2).
   **لم يُدمج هنا التزاماً بقيد «لا تدمج أي PR».**
2. الدمج يُطلق `push` إلى `main` → يعمل `deploy-pages.yml` تلقائياً
   (build → verify:dist → tests → upload artifact → deploy).
3. **التحقق بعد الدمج** (يلزم منفذ غير مقيّد للوصول إلى `github.io`):
   * `gh run list --branch main --limit 1` → تشغيل جديد بحالة `success`.
   * `gh api repos/johntaylorjt8870-cell/Interactive-Chemistry-Grade8/deployments` →
     نشر جديد بـ `sha` مختلفة عن `7d6b0d9c`.
   * فتح `https://johntaylorjt8870-cell.github.io/Interactive-Chemistry-Grade8/chemistry/structural-chemistry/chemical-reactions`.
   * إن ظهرت نسخة قديمة، فهي ذاكرة تخزين مؤقت للمتصفح/الـCDN بعد نشر ناجح —
     تُحلّ بتحميل قسري (`Ctrl/Cmd + Shift + R`)؛ علماً بأن `dist/assets/*.js` تحمل
     بصمات محتوى (content hashes)، فالأصول نفسها لا تُخزَّن مؤقتاً بشكل خاطئ.

**لا حاجة إلى أي عمل على الدرس الخامس أو الاختبار النهائي للوحدة الأولى** — لم يُبدَأ شيء
منهما، التزاماً بالقيود.

---

## 8. القيود التي التُزمت

| القيد | الحالة |
|-------|--------|
| لا تدمج أي PR | ✓ لم يُدمج أي PR (بقي #18 مفتوحاً كما كان) |
| لا تغلق أي PR ولا تحذف أي فرع | ✓ #18 و#16 و#6 ما زالت مفتوحة؛ لم يُحذف أي فرع |
| لا تبدأ الدرس الخامس ولا اختبار الوحدة النهائي | ✓ لم يُنشأ أي منهما |
| لا تعِد كتابة الدرس الرابع ولا تعِد إنشاء محتواه | ✓ صفر تعديل على أي ملف درس |
| لا تغيّر الشحنات/المعادلات/حلول المعلم/الاختبارات/أي درس آخر | ✓ التغييران الجديدان لا يمسّان `src/` ولا `tests/` إطلاقاً |
| لا تنشئ إصلاحاً افتراضياً قبل تحديد السبب | ✓ التشخيص والأدلة (§3) سبقت أي تغيير (§5) |
| توقف بعد التقرير واترك أي PR جديد مفتوحاً للمراجعة | ✓ الطلب الجديد مفتوح للمراجعة ولم يُدمج |
