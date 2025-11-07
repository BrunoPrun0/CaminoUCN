// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ← Importar BrowserRouter
import { AuthProvider } from './contexts/AuthContext' // ← Importar AuthProvider
import { MallaProvider } from './contexts/MallaContext';
import { ProyeccionProvider } from './contexts/ProyeccionContext';
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* ← Envolver con BrowserRouter */}
      <AuthProvider> {/* ← Envolver con AuthProvider */}
        <MallaProvider>
          <ProyeccionProvider>
            <App />
          </ProyeccionProvider>
        </MallaProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)