import { useEffect } from 'react'

const BASE_TITLE = 'الكيمياء التفاعلية — الصف الثامن | Interactive Chemistry Grade 8'

/** Sets a page-specific document title, restored to the base title on unmount. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    const previous = document.title
    if (title) document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}

export { BASE_TITLE }
