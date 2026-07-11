import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'
import { BirthDetailsProvider } from './context/BirthDetailsContext.tsx'
import { CitiesProvider } from './context/CitiesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BirthDetailsProvider>
        <CitiesProvider>
          <App />
        </CitiesProvider>
      </BirthDetailsProvider>
    </LanguageProvider>
  </StrictMode>,
)
