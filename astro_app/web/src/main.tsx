import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'
import { BirthDetailsProvider } from './context/BirthDetailsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BirthDetailsProvider>
        <App />
      </BirthDetailsProvider>
    </LanguageProvider>
  </StrictMode>,
)
