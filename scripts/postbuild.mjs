#!/usr/bin/env node
/**
 * Post-build step.
 *
 * GitHub Pages serves a static site with no server-side routing. The app uses
 * a real (non-hash) router under the repository base path, so a deep link such
 * as `/Interactive-Physics-Chemistry-Grade8/physics` would otherwise hit
 * Pages' 404 page. Publishing `404.html` as a copy of `index.html` makes the
 * app boot for that URL and resolve the route client-side.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const index = join(dist, 'index.html')
const notFound = join(dist, '404.html')

if (!existsSync(index)) {
  console.error('✗ dist/index.html not found — run the Vite build first.')
  process.exit(1)
}

copyFileSync(index, notFound)
// Prevent Jekyll processing of the published artifact (belt and braces).
writeFileSync(join(dist, '.nojekyll'), '')

console.log('✓ dist/404.html created for deep links; dist/.nojekyll written.')
