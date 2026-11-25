#!/usr/bin/env node
/**
 * Atomic builder for isolated lesson lab projects under `labs/<lessonId>/`.
 *
 * For every registered lab:
 * 1. Installs the lab's isolated `node_modules` (`npm ci`) if not present.
 * 2. Ensures all local `.woff2` font files referenced by the lab's CSS exist in
 *    `src/assets/fonts/` (populated from the lab's own `node_modules` packages
 *    without modifying any CSS or source file).
 * 3. Runs `tsc --noEmit` to typecheck the lab in isolation.
 * 4. Runs `vite build` and fails hard if any asset/font warning (`didn't resolve
 *    at build time`) or build error occurs.
 * 5. Copies `labs/<lessonId>/dist/` into `dist/labs/<lessonId>/` for atomic
 *    GitHub Pages deployment under `/Interactive-Chemistry-Grade8/labs/<lessonId>/`.
 */
import { spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REGISTERED_LAB_IDS = ['chem-u1-l3']

function runChecked(command, args, cwd, label) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (result.status !== 0) {
    console.error(`✗ [${label}] failed in ${cwd}:\n${combined}`)
    process.exit(1)
  }
  return combined
}

/**
 * Ensures all `.woff2` font files referenced via `../assets/fonts/<file>` in
 * the lab's stylesheets are present in `src/assets/fonts/`, sourcing any
 * missing file from the lab's own installed npm packages.
 */
export function ensureLabFonts(labDir) {
  const styleFiles = ['src/styles/fonts.css', 'src/styles/katex-lite.css']
    .map((rel) => join(labDir, rel))
    .filter((file) => existsSync(file))

  if (styleFiles.length === 0) return 0

  const referenced = new Set()
  for (const file of styleFiles) {
    const css = readFileSync(file, 'utf8')
    for (const match of css.matchAll(/url\(\.\.\/assets\/fonts\/([^)]+)\)/g)) {
      referenced.add(match[1])
    }
  }

  const fontsDestDir = join(labDir, 'src/assets/fonts')
  mkdirSync(fontsDestDir, { recursive: true })

  const candidateDirs = [
    join(labDir, 'node_modules/@fontsource/ibm-plex-sans-arabic/files'),
    join(labDir, 'node_modules/katex/dist/fonts'),
  ]

  for (const filename of referenced) {
    const target = join(fontsDestDir, filename)
    if (existsSync(target)) continue

    const sourceDir = candidateDirs.find((dir) => existsSync(join(dir, filename)))
    if (!sourceDir) {
      console.error(`✗ [labs/fonts] Missing font file "${filename}" in ${labDir} and its node_modules.`)
      process.exit(1)
    }
    copyFileSync(join(sourceDir, filename), target)
  }

  return referenced.size
}

export function buildAllLabs(root = process.cwd()) {
  const rootDist = join(root, 'dist')
  if (!existsSync(rootDist)) {
    console.error('✗ Root dist/ directory not found — run `vite build` before `build-labs.mjs`.')
    process.exit(1)
  }

  for (const labId of REGISTERED_LAB_IDS) {
    const labDir = resolve(root, 'labs', labId)
    if (!existsSync(join(labDir, 'package.json'))) {
      console.error(`✗ Registered lab "${labId}" is missing ${join('labs', labId, 'package.json')}.`)
      process.exit(1)
    }

    if (!existsSync(join(labDir, 'node_modules'))) {
      console.log(`• [${labId}] Installing isolated lab dependencies (npm ci)...`)
      runChecked('npm', ['ci'], labDir, `${labId}:npm-ci`)
    }

    const fontCount = ensureLabFonts(labDir)
    console.log(`• [${labId}] Verified ${fontCount} local font files in src/assets/fonts/.`)

    const tscBin = join(labDir, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
    runChecked(tscBin, ['--noEmit'], labDir, `${labId}:typecheck`)

    const buildOutput = runChecked('npm', ['run', 'build'], labDir, `${labId}:build`)
    if (/didn't resolve at build time/i.test(buildOutput)) {
      console.error(`✗ [${labId}] Unresolved asset/font reference during Vite build:\n${buildOutput}`)
      process.exit(1)
    }

    const labDistIndex = join(labDir, 'dist', 'index.html')
    if (!existsSync(labDistIndex)) {
      console.error(`✗ [${labId}] Expected build output missing at ${labDistIndex}.`)
      process.exit(1)
    }

    const targetDir = join(rootDist, 'labs', labId)
    rmSync(targetDir, { recursive: true, force: true })
    mkdirSync(targetDir, { recursive: true })
    cpSync(join(labDir, 'dist'), targetDir, { recursive: true })
    console.log(`✓ [${labId}] Built cleanly and copied to dist/labs/${labId}/index.html.`)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  buildAllLabs(process.cwd())
}
