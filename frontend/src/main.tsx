// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ← Importar BrowserRouter
import { AuthProvider } from './contexts/AuthContext' // ← Importar AuthProvider
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* ← Envolver con BrowserRouter */}
      <AuthProvider> {/* ← Envolver con AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)