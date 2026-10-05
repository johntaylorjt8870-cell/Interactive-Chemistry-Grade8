import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { EmptyState } from '@/components/EmptyState'
import { getTestDefinition, hasTest } from '@/data/testArea/registry'
import type { SolutionSet, TestBank } from '@/data/testArea/types'
import { SolutionCard } from '@/testArea/components/SolutionCard'
import { SolutionChunkNav } from '@/testArea/components/SolutionChunkNav'
import { chunkCount, chunksOf } from '@/testArea/utils/chunk'

/* ============================================================================
   Solutions browser — «حلول الاختبارات»
   ----------------------------------------------------------------------------
   A separate area with its own route, its own navigation and its own lazy
   module: the questions and the solutions are loaded independently, so an
   attempt never ships an explanation and the solutions can be read without
   opening a test.

   Sixty solutions would be unreadable on one page, so the set is split into
   the parts the blueprint declares, with a part indicator, previous / next
   controls and a way back to the list at every position.
   ========================================================================= */

export function SolutionsBrowserPage() {
  const { testId = '' } = useParams<{ testId: string }>()
  const [bank, setBank] = useState<TestBank | null>(null)
  const [solutions, setSolutions] = useState<SolutionSet | null>(null)
  const [chunkIndex, setChunkIndex] = useState(0)

  useEffect(() => {
    let active = true
    setBank(null)
    setSolutions(null)
    setChunkIndex(0)
    const definition = getTestDefinition(testId)
    if (!definition) return
    void Promise.all([definition.load(), definition.loadSolutions()]).then(
      ([bankModule, solutionModule]) => {
        if (!active) return
        setBank(bankModule.default)
        setSolutions(solutionModule.default)
      },
    )
    return () => {
      active = false
    }
  }, [testId])

  const chunks = useMemo(
    () => (bank ? chunksOf(bank.questions.length, bank.blueprint.solutionChunkSize) : []),
    [bank],
  )

  if (!hasTest(testId)) {
    return (
      <div className="container ta-page">
        <EmptyState title="لا حلول لهذا الاختبار" headingLevel={1} tone="not-found">
          <p>الرابط يشير إلى اختبار غير مسجّل في منطقة الاختبارات.</p>
        </EmptyState>
      </div>
    )
  }

  if (!bank || !solutions) {
    return (
      <div className="container ta-page">
        <p className="ta-loading" role="status">
          جارٍ تحميل الحلول…
        </p>
      </div>
    )
  }

  const index = Math.min(Math.max(chunkIndex, 0), Math.max(chunks.length - 1, 0))
  const chunk = chunks[index]
  const solutionById = new Map(solutions.solutions.map((solution) => [solution.questionId, solution]))

  return (
    <div className="container ta-page">
      <header className="ta-page__head">
        <p className="ta-page__eyebrow">حلول الاختبارات · منطقة الاختبارات</p>
        <h1 className="ta-page__title ta-page__title--small">حلول {bank.title}</h1>
        <p className="ta-page__lead">
          كل حل يشرح لماذا الإجابة صحيحة، والقاعدة التي تحملها، وخطوات الوصول إليها، ومعنى الناتج،
          وكيفية التحقق منه، والأخطاء الشائعة التي يقع فيها الطلاب، ولماذا الخيارات الأخرى خاطئة.
          عدد الأجزاء: {chunkCount(bank.questions.length, bank.blueprint.solutionChunkSize)}.
        </p>
      </header>

      <SolutionChunkNav
        testId={bank.id}
        total={bank.questions.length}
        chunkSize={bank.blueprint.solutionChunkSize}
        index={index}
        onIndexChange={setChunkIndex}
      />

      <div className="ta-solutions">
        {chunk?.questionIndices.map((questionIndex) => {
          const question = bank.questions[questionIndex]
          const solution = question ? solutionById.get(question.id) : undefined
          if (!question || !solution) return null
          return (
            <SolutionCard
              key={question.id}
              question={question}
              solution={solution}
              number={questionIndex + 1}
            />
          )
        })}
      </div>

      <SolutionChunkNav
        testId={bank.id}
        total={bank.questions.length}
        chunkSize={bank.blueprint.solutionChunkSize}
        index={index}
        onIndexChange={setChunkIndex}
      />
    </div>
  )
}
