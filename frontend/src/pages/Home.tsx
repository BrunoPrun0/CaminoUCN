import { useState } from 'react'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MallaPage } from '../components/pages/MallaPage';
import { ProyeccionesPage } from '../components/pages/ProyeccionesPage';
import { PerfilPage } from '../components/pages/PerfilPage';

function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState<'inicio' | 'malla' | 'proyecciones' | 'perfil'>('inicio');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Menú Lateral */}
      <Sidebar 
        paginaActual={paginaActual}
        onPageChange={(page) => setPaginaActual(page as any)}
        onLogout={handleLogout}
      />

      {/* Contenido Principal */}
      <div className="flex-1 ml-16 transition-all duration-300 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[calc(100vh-4rem)]">
          
          {/* Página de Inicio */}
          {paginaActual === 'inicio' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido a CAMINO</h1>
              <p className="text-gray-600">Selecciona una opción del menú para comenzar</p>
            </div>
          )}

          {/* Página de Malla */}
          {paginaActual === 'malla' && <MallaPage />}
          
          {/* Página de Proyecciones */}
          {paginaActual === 'proyecciones' && <ProyeccionesPage />}

          {/* Página de Perfil */}
          {paginaActual === 'perfil' && <PerfilPage />}

        </div>
      </div>
    </div>
  );
}

export default Home;