# سجل المصدر والتغطية — الدرس الخامس: قانونا التفاعل الكيميائي

- **المستودع:** Interactive Chemistry — Grade 8
- **الصفحات:** 30–35
- **مسار الدرس:** `chemistry/structural-chemistry/mass-and-fixed-proportions`
- **سجل المصدر البرمجي:** [`../../src/data/curriculum/lesson5SourceLedger.ts`](../../src/data/curriculum/lesson5SourceLedger.ts) — 42 مدخلاً (38 `implemented`، 3 `reconstructed`، 1 `decorative`، 0 `unresolved`)
- **سجل التغطية الآلي:** [`lesson5-source-audit.json`](./lesson5-source-audit.json)
- **التقرير الكامل لإعادة البناء:** [`lesson5-rebuild-and-coverage.md`](./lesson5-rebuild-and-coverage.md)
- **اختبار الدرس:** `chem-u1-l5-final` — 20 سؤالاً، إضافة من المنصة
- **بنك منفصل/اختبار وحدة:** لم يُنشأ أي منهما.

> **تحديث 2026-10-24:** حلّت هذه النسخة محل تقرير الاستيعاب السابق الذي بُني على نسخ نصي للصفحات بحالة وضوح `partial` ودون ملفات صور في المستودع. أُعيد بناء الدرس من صور الصفحات 30–35 المرفقة مباشرة، فصارت حالة الوضوح `clear` والعنوان هو المطبوع نفسه «قانونا التفاعل الكيميائي»، وانظر تقرير إعادة البناء لأدلة التحقق الكاملة (274/274 فحص Chromium).

## دفتر الصفحات والتغطية

| الصفحة | العناصر المطبوعة | التنفيذ وحالته |
| --- | --- | --- |
| 30 | العنوان، الأهداف الأربعة، الكلمات المفتاحية، «أُلاحِظُ وأستنتجُ» وسؤالها، شكل الميزان بعدّاته | خطوة `opening` حرفياً؛ خطوة `atom-count-source` وسؤال `l5-observe-atoms`؛ الشكل مُعاد بناؤه `source-figure-p30-balance` (`reconstructed`) |
| 31 | «أستنتجُ» الذرات، «إثراء» البيكربونات وصورتاه، أدوات التجربة، شكل الميزانين 125.100 | خطوات `atom-conclusion-source` و`enrichment-bicarbonate` و`mass-experiment-source`؛ الصورتان في بطاقة مرجعية (`decorative` مبررة)؛ الشكل `source-figure-p31-scale` (`reconstructed`) |
| 32 | خطوات التنفيذ 1–4، نص قانون لافوازييه وبطاقته، عنوان وتجارب الرصاص | خطوتا `mass-experiment-source` و`mass-law-source` وسؤالا الملاحظة/المقارنة؛ شكل التجارب `source-figure-p32-trials` (`reconstructed`) |
| 33 | جدول التجارب وأسئلته الخمسة، نص قانون بروست وبطاقته | خطوتا `proust-table-source` و`proust-conclusion-source` و6 أسئلة كتابية بترتيبها المطبوع مع تنبيه الخطأ المطبعي «الكبريت/الرصاص» |
| 34 | نشاطا الحديد/الكبريت وبندا «تعلَّمتُ» | خطوتا `iron-sulfur-source` و`learned-summary` حرفياً وسؤالان كتابيان |
| 35 | «أختبر نفسي» 1–3 وجدول CO2 وفروعه | خطوات `book-question-1/2/3`؛ قيمة 2.66 محفوظة كما طُبعت والحساب بالكسر الدقيق 8/3 |

## قائمة أسئلة المصدر

19 وحدة (`lesson5BookQuestionIds`): 11 نشاطاً وتجربة + 8 وحدات «أختبر نفسي» (منها فروع جدول CO2 الأربعة). كل وحدة `origin: 'textbook'` بمرجع صفحة وهدف وتلميح وحل منصة خطوة بخطوة لا يظهر أثناء المحاولة.

| الصفحة | الوحدات |
| --- | --- |
| 30 | `l5-observe-atoms` |
| 32 | `l5-calcium-observation`, `l5-calcium-compare` |
| 33 | `l5-proust-table`, `l5-trial1-mass-ratio`, `l5-trial2-mass-ratio`, `l5-trial2-excess-sulfur`, `l5-trial3-mass-ratio`, `l5-trial3-excess-lead` |
| 34 | `l5-iron-sulfur-ratio-table`, `l5-iron-sulfur-60-30` |
| 35 | `l5-selftest-water-ratio`, `l5-selftest-atom-count`, `l5-selftest-mass`, `l5-selftest-carbon-table` (+`co-table`, `co-law`, `co-carbon-mass`, `co-oxygen-mass`) |

إضافة إلى ذلك: 20 سؤال تدريب من المنصة (`l5-practice-01..20`، موسومة صراحة إضافات) واختبار نهائي من 20 سؤالاً (`l5-final-01..20`) بمخطط أهداف/صعوبة — لا تُحسب أسئلة المنصة ضمن تغطية الكتاب.

## تنبيهان مصدريان محفوظان بوعي

1. **خطأ مطبعي ص33:** السؤال الأخير مطبوع «بقي 8g من الكبريت» بينما شكل ص32 يقول «رصاص متبقّي 8g». النص محفوظ حرفياً مع تنبيه منصة ظاهر داخل السؤال وحل على الرصاص.
2. **قيمة 2.66 ص35:** محفوظة كما طُبعت في الجدول؛ الحلول تبيّن أن 32/12 = 2.666… وأن التقريب المعتاد لمنزلتين 2.67، وتحسب بالكسر 8/3.

## الفحوص

انظر جدول الأدلة في [تقرير إعادة البناء](./lesson5-rebuild-and-coverage.md): أنواع واختبارات وبناء و`verify:dist`، و`verify:lesson5` بـ274/274 فحص Chromium (مكتبي 1365×960 وجوال 390×844، بلا تجاوز أفقي ولا أخطاء KaTeX ولا مخالفات Axe خطيرة/حرجة في الخطوات الـ28)، و`verify:lesson4` بـ481/481 تأكيداً لعدم الانحدار.
