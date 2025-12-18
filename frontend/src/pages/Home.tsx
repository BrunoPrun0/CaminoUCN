import { useState, useEffect } from 'react'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

import { MallaPage } from '../components/pages/MallaPage';
import { ProyeccionesPage } from '../components/pages/ProyeccionesPage';
import { PerfilPage } from '../components/pages/PerfilPage';
import { AdminDashboard } from '../components/pages/AdminDashboard'; 

function Home() {
  const { usuario, logout } = useAuth(); 
  const navigate = useNavigate();

  const [paginaActual, setPaginaActual] = useState<'inicio' | 'malla' | 'proyecciones' | 'perfil' | 'dashboard'>('inicio');

  useEffect(() => {
    if (usuario?.rol === 'ADMIN' && paginaActual === 'inicio') {
      setPaginaActual('dashboard');
    }
  }, [usuario, paginaActual]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    switch(paginaActual) {
      case 'malla': return 'Visualización de Malla Curricular';
      case 'proyecciones': return 'Proyecciones Académicas';
      case 'dashboard': return 'Panel de Administración';
      case 'perfil': return 'Mi Perfil';
      default: return 'Inicio';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <header className="sr-only">
        <h1>Sistema CAMINO - {getPageTitle()}</h1>
      </header>

      <Sidebar 
        paginaActual={paginaActual}
        onPageChange={(p) => setPaginaActual(p as any)}
        onLogout={handleLogout}
        rol={usuario?.rol} 
      />

      <main 
        id="main-content"
        className="flex-1 ml-16 transition-all duration-300 p-8"
        role="main"
        aria-label="Contenido principal"
      >
        <div 
          className="bg-white rounded-2xl shadow-lg p-8 min-h-[calc(100vh-4rem)]"
          tabIndex={-1}
        >
          {paginaActual === 'inicio' && (
            <section aria-labelledby="welcome-title">
              <h1 id="welcome-title" className="text-3xl font-bold text-gray-800 mb-4">
                Bienvenido a CAMINO
              </h1>
              <p className="text-gray-600">
                Hola {usuario?.rut}, utiliza el menú lateral para seleccionar una opción.
              </p>
            </section>
          )}

          {paginaActual === 'malla' && (
            <section aria-label="Sección Malla">
              <MallaPage />
            </section>
          )}

          {paginaActual === 'proyecciones' && (
            <section aria-label="Sección Proyecciones">
              <ProyeccionesPage />
            </section>
          )}
          
          {paginaActual === 'dashboard' && (
            <section aria-label="Panel de Administración">
              <AdminDashboard />
            </section>
          )}

          {paginaActual === 'perfil' && (
            <section aria-label="Perfil de Usuario">
              <PerfilPage />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;