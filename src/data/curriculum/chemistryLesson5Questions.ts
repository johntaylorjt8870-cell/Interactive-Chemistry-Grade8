/**
 * Compatibility shim. Lesson 5 textbook questions now live in
 * `./chemistryLesson5Book` (the Lessons 1–4 file convention); this module
 * re-exports them so older imports keep working.
 */
export {
  bookActivitySolutions,
  bookAssessment,
  bookQuestions,
  leadSulfurWorksheetColumns,
  leadSulfurWorksheetRows,
  lesson5BookQuestionCount,
  lesson5BookQuestionIds,
  lesson5Figures,
} from './chemistryLesson5Book'
