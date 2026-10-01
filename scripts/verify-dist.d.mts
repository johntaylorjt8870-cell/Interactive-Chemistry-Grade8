/** Type declarations for the production-build verification script. */
export type DistIssue = { code: string; message: string }
export type DistReport = { issues: DistIssue[]; notes: string[] }

export declare const EXPECTED_BASE_PATH: string

export declare function verifyDist(
  root: string,
  options?: { basePath?: string },
): DistReport
