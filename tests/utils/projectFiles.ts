import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Reads a file from the project root.
 *
 * Vitest serves modules over a virtual URL, so `new URL(relative, import.meta.url)`
 * cannot be used to reach project files from a test; resolving against the
 * process working directory (the repository root) is both simpler and correct.
 */
export function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}
