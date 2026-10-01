import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { ThemeProvider } from './theme'

/**
 * Normalises Vite's `BASE_URL` into a router basename.
 *
 * On GitHub Pages the app is published under
 * `/Interactive-Physics-Chemistry-Grade8/`, so every route and link must be
 * created relative to that prefix. In development BASE_URL is `/`, so this
 * resolves to an empty basename.
 */
export function routerBasename(baseUrl: string): string {
  if (!baseUrl || baseUrl === '/') return ''
  return baseUrl.replace(/\/+$/, '')
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter
        basename={routerBasename(import.meta.env.BASE_URL)}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
