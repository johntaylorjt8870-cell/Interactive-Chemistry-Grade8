#!/usr/bin/env node
/**
 * Verifies the production build in `dist/`.
 *
 * A build that succeeds is not the same as a deployment that works. These
 * checks cover the failure modes that actually break a GitHub Pages project
 * site: asset URLs missing the repository base path, deep links falling back to
 * a missing 404.html, unbundled source references, and accidental localhost
 * URLs in the published bundle.
 *
 * Exported as a function so the test suite can run the same checks.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

export const EXPECTED_BASE_PATH = '/Interactive-Physics-Chemistry-Grade8/'

/** @param {string} root repository root */
export function verifyDist(root, { basePath = EXPECTED_BASE_PATH } = {}) {
  const dist = join(root, 'dist')
  const issues = []
  const notes = []

  const fail = (code, message) => issues.push({ code, message })

  if (!existsSync(dist) || !statSync(dist).isDirectory()) {
    fail('dist/missing', 'dist/ does not exist — run `npm run build` first.')
    return { issues, notes }
  }

  const indexPath = join(dist, 'index.html')
  if (!existsSync(indexPath)) {
    fail('dist/no-index', 'dist/index.html is missing.')
    return { issues, notes }
  }

  const html = readFileSync(indexPath, 'utf8')

  if (!/<html lang="ar" dir="rtl">/.test(html)) {
    fail('html/direction', 'index.html must declare lang="ar" and dir="rtl".')
  }

  if (/\/src\/main\.tsx/.test(html)) {
    fail('html/unbundled-source', 'index.html still references the TypeScript entry point.')
  }

  // Every local asset URL must carry the Pages base path.
  const assetRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => !/^(https?:)?\/\//.test(url) && !url.startsWith('data:'))

  if (assetRefs.length === 0) {
    fail('html/no-assets', 'index.html references no assets at all — the build is empty.')
  }

  for (const ref of assetRefs) {
    if (!ref.startsWith(basePath)) {
      fail('html/base-path', `Asset URL "${ref}" does not start with the Pages base path ${basePath}.`)
      continue
    }
    const assetPath = join(dist, ref.slice(basePath.length))
    if (!existsSync(assetPath)) {
      fail('html/missing-asset', `Asset "${ref}" is referenced but was not emitted.`)
    }
  }

  // Deep links: the SPA needs 404.html to be a copy of index.html.
  const notFoundPath = join(dist, '404.html')
  if (!existsSync(notFoundPath)) {
    fail('dist/no-404', 'dist/404.html is missing, so deep links will 404 on GitHub Pages.')
  } else if (readFileSync(notFoundPath, 'utf8') !== html) {
    fail('dist/404-differs', 'dist/404.html is not an exact copy of dist/index.html.')
  }

  const assetsDir = join(dist, 'assets')
  if (!existsSync(assetsDir)) {
    fail('dist/no-assets-dir', 'dist/assets is missing.')
    return { issues, notes }
  }

  const files = readdirSync(assetsDir)
  const textFiles = files.filter((file) => /\.(js|css)$/.test(file))

  if (!files.some((file) => file.endsWith('.js'))) {
    fail('dist/no-js', 'No JavaScript bundle was emitted.')
  }
  if (!files.some((file) => file.endsWith('.css'))) {
    fail('dist/no-css', 'No CSS bundle was emitted.')
  }
  if (!files.some((file) => /\.(woff2?|ttf)$/.test(file))) {
    fail('dist/no-fonts', 'No font files were emitted — Arabic typography would fall back to a system font.')
  }

  const cssBundle = textFiles
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(join(assetsDir, file), 'utf8'))
    .join('\n')

  if (!/katex/i.test(cssBundle)) {
    fail('dist/no-katex-css', 'KaTeX styles are missing from the CSS bundle.')
  }

  for (const file of textFiles) {
    const content = readFileSync(join(assetsDir, file), 'utf8')
    if (/(localhost|127\.0\.0\.1)(:\d+)?/.test(content)) {
      fail('bundle/localhost', `${file} contains a localhost reference.`)
    }
    if (/\/Interactive-Physics-Chemistry-Grade8\/Interactive-Physics-Chemistry-Grade8\//.test(content)) {
      fail('bundle/double-base', `${file} contains a doubled base path.`)
    }
  }

  const bundleNames = files.filter((file) => file.endsWith('.js'))
  notes.push(`bundles: ${bundleNames.join(', ')}`)
  notes.push(`assets: ${files.length} files`)

  return { issues, notes }
}

function main() {
  const root = process.cwd()
  const { issues, notes } = verifyDist(root)

  for (const note of notes) console.log(`• ${note}`)

  if (issues.length > 0) {
    console.error('\nProduction build verification failed:')
    for (const issue of issues) console.error(`  ✗ [${issue.code}] ${issue.message}`)
    process.exit(1)
  }

  console.log('✓ Production build verified: base path, deep-link fallback and asset emission are correct.')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}

export { relative }
