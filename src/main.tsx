import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/noto-sans-arabic'
import '@fontsource-variable/inter'
import './styles/index.css'
import { App } from './app/App'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container #root was not found in index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
