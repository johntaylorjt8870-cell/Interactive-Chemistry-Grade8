import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface ProgressCtx {
  done: Set<string>
  mark: (id: string) => void
  total: number
}

const Ctx = createContext<ProgressCtx>({ done: new Set(), mark: () => {}, total: 10 })

export function ProgressProvider({ total, children }: { total: number; children: ReactNode }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const mark = useCallback((id: string) => {
    setDone((s) => (s.has(id) ? s : new Set(s).add(id)))
  }, [])
  const value = useMemo(() => ({ done, mark, total }), [done, mark, total])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useProgress = () => useContext(Ctx)
