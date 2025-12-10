import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ensure hash routing works on GitHub Pages
if (!window.location.hash || window.location.hash === '#') {
  window.history.replaceState(null, '', window.location.pathname + '#/');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
