import { useEffect } from 'react'

const BASE_TITLE = 'منصة الفيزياء والكيمياء — الصف الثامن'

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
