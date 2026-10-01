# إضافة أول وحدة ودرس — Adding the first unit and lesson

> لا تُنفَّذ أي خطوة هنا قبل توفير صور صفحات الكتاب المدرسي وقراءتها.
> راجع `docs/SOURCE_FIDELITY.md` أولاً.

## 1. تقرير القراءة

قبل أي شيفرة، يُحرَّر تقرير يوضّح لكل صفحة: هل النص العربي مقروء؟ النص اللاتيني؟
المعادلات؟ الأرقام؟ الوحدات؟ الجداول؟ الأشكال؟ التجارب؟ الأسئلة؟
وأي عنصر غير واضح يُذكر صراحة ويُطلب توضيحه.

## 2. تسجيل الوحدة والدرس

كل شيء يُعلن في `src/data/curriculum/registry.ts`:

```ts
const PHYSICS: SubjectDefinition = {
  ...,
  status: 'source-verified',
  units: [
    {
      id: 'physics-u1',
      slug: 'unit-1',                 // المسار: /physics/unit-1
      title: '<عنوان الوحدة كما هو مطبوع>',
      order: 1,
      status: 'source-verified',
      source: { pages: [{ page: '10' }], verified: true },
      lessons: [
        {
          id: 'physics-u1-l1',
          slug: 'lesson-1',           // المسار: /physics/unit-1/lesson-1
          title: '<عنوان الدرس كما هو مطبوع>',
          order: 1,
          status: 'source-verified',
          source: { pages: [{ page: '10' }, { page: '11' }], verified: true },
          steps: [ /* ... */ ],
          tests: [ /* الاختبار النهائي */ ],
        },
      ],
    },
  ],
}
```

## 3. بناء الخطوات

كل خطوة وحدة عمل واحدة، بترتيب الكتاب:

| النوع | الاستخدام |
| --- | --- |
| `source` | نص الكتاب حرفياً + رقم الصفحة |
| `explanation` | شرح المنصة (يُوسم تلقائياً) |
| `example` | مثال محلول بخطوات التفكير |
| `experiment` | خطوات عملية + قياسات + نتيجة (تفاعل حقيقي) |
| `simulation` | محاكاة مرتبطة بعنصر مسجَّل في `src/simulations/registry.ts` |
| `activity` | نشاط موجّه |
| `question` | سؤال داخل الشرح (بلا تصحيح فوري) |
| `apply` | تطبيق القانون في حالة جديدة |
| `note` / `common-error` | تنبيه / خطأ شائع |
| `summary` | خلاصة |
| `final-test` | اختبار شامل 10–20 سؤالاً جديداً |

## 4. العناصر التفاعلية

تُسجَّل في `src/simulations/registry.ts` وتُحمَّل عند الحاجة فقط:

```ts
defineInteractive({
  id: 'pressure-vs-area',
  kind: 'experiment',
  title: '…',
  description: '…',
  load: () => import('./pressure-vs-area/PressureVsArea'),
})
```

كل عنصر تفاعلي يجب أن يملك حالة حقيقية (فعل → ملاحظة/قياس → نتيجة)، وأن يحترم
`prefers-reduced-motion` (يُمرَّر إليه عبر `InteractiveProps.reducedMotion`).

## 5. قبل الدمج

```bash
npm run verify   # أنواع + اختبارات + بناء + تحقّق من مخرجات الإنتاج
```

وتأكد من:

* كل خطوة مصدرية تحمل `source.pages` و`verified: true`.
* لا نص مُلخَّص أو معدَّل داخل `textbook-verbatim`.
* كل إضافة من المنصة داخل `PlatformAddition` أو بوسم `attribution: 'platform'`.
* الاختبار النهائي: 10–20 سؤالاً، بلا نسخ حرفي لأسئلة الكتاب، وبتنويع في الأنماط.
* كل سؤال من الكتاب يحمل `origin: 'textbook'` و`source.page`.
* حلول أسئلة الكتاب والاختبار النهائي تُضاف في مساحة المعلم مع رقم الصفحة.
