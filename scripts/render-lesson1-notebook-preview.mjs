/**
 * Renders «📒 دفتر الطالب» to a standalone HTML file with the app's real
 * stylesheet and real KaTeX output, so the notebook can be inspected without a
 * browser automation harness.
 *
 *   node scripts/render-lesson1-notebook-preview.mjs
 *   -> artifacts/lesson1-notebook/notebook-preview.html
 *
 * This is a *static* proof: it renders the actual `StudentNotebookView`
 * component through `react-dom/server` with the production CSS bundle, so what
 * you see is the component's real markup and the project's real styles. It is
 * not a substitute for `verify:lesson1-notebook` (no layout engine, no
 * interaction), which needs Chromium.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'artifacts', 'lesson1-notebook')
const bundleFile = path.join(outDir, 'preview-bundle.cjs')
const htmlFile = path.join(outDir, 'notebook-preview.html')

fs.mkdirSync(outDir, { recursive: true })

// 1. Bundle the component + data (React included) for Node.
await build({
  entryPoints: [path.join(root, 'scripts', 'preview', 'entry.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  outfile: bundleFile,
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@': path.join(root, 'src') },
  logLevel: 'warning',
})

const { render } = createRequire(import.meta.url)(bundleFile)
const { body, title } = render()

// 2. The production CSS, inlined so the file is self-contained.
const cssDir = path.join(root, 'dist', 'assets')
if (!fs.existsSync(cssDir)) {
  throw new Error('dist/assets not found — run `npm run build` first.')
}
const css = fs
  .readdirSync(cssDir)
  .filter((name) => name.endsWith('.css'))
  .map((name) => fs.readFileSync(path.join(cssDir, name), 'utf8'))
  .join('\n')

// 3. KaTeX fonts referenced by relative URL: point them at the dist folder.
const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — معاينة ثابتة</title>
<style>
${css.replace(/\(\/Interactive-Chemistry-Grade8\/assets\//g, '(../dist/assets/')}
/* Preview chrome only — everything else is the app's own stylesheet. */
body { margin: 0; background: var(--surface-sunken, #f5f6f8); }
.preview-frame { max-width: 76rem; margin: 0 auto; padding: 1.5rem; }
.preview-banner {
  font: 500 0.85rem/1.6 system-ui, sans-serif;
  color: #5b636e; background: #fff; border: 1px dashed #c8ccd4;
  border-radius: 8px; padding: 0.6rem 0.9rem; margin-block-end: 1rem;
}
body { direction: rtl; }
.lesson-shell { display: block; }
</style>
</head>
<body>
<div class="preview-frame">
<p class="preview-banner">
معاينة ثابتة (بلا متصفح آلي): هذه هي شيفرة المكوّن الحقيقي مع ورقة الأنماط الإنتاجية نفسها.
لا تُغني عن <code dir="ltr">npm run verify:lesson1-notebook</code> الذي يفحص التخطيط والتفاعل في Chromium.
</p>
<div class="lesson-shell" data-lesson-id="chem-u1-l1">
${body}
</div>
</div>
</body>
</html>
`

fs.writeFileSync(htmlFile, html, 'utf8')
console.log(`✓ ${path.relative(root, htmlFile)} (${(html.length / 1024).toFixed(0)} kB)`)
