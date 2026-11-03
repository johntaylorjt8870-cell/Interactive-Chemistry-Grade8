import { renderToStaticMarkup } from 'react-dom/server'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'
import { lesson1StudentNotebook } from '@/data/curriculum/chemistryLesson1Notebook'

export function render() {
  return {
    title: lesson1StudentNotebook.title,
    body: renderToStaticMarkup(<StudentNotebookView notebook={lesson1StudentNotebook} />),
  }
}
