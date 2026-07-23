import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev-only hook for the M1 RLS leak test (docs/leak-test.md)
if (import.meta.env.DEV) {
  void import('./lib/supabase').then(({ supabase }) => {
    ;(window as unknown as { __bc: { supabase: typeof supabase } }).__bc = {
      supabase,
    }
  })
}
