import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppRoutes } from '@/app/router'
import { ThemeProvider } from '@/app/theme'

/** Renders the real route tree at a given path, inside a memory router. */
export function renderApp(path = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

/** Renders arbitrary UI with the theme provider (for component-level tests). */
export function renderWithTheme(children: ReactNode) {
  return render(<ThemeProvider>{children}</ThemeProvider>)
}
