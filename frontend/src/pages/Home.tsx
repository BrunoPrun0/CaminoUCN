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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Menú Lateral: Le pasamos el ROL */}
      <Sidebar 
  paginaActual={paginaActual}
  onPageChange={(p) => setPaginaActual(p as any)}
  onLogout={handleLogout}
  rol={usuario?.rol} 
/>

      {/* Contenido Principal */}
      <div className="flex-1 ml-16 transition-all duration-300 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[calc(100vh-4rem)]">
          
          {/* Lógica de Estudiante */}
          {paginaActual === 'inicio' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido a CAMINO</h1>
              <p className="text-gray-600">Hola {usuario?.rut}, selecciona una opción.</p>
            </div>
          )}

          {paginaActual === 'malla' && <MallaPage />}
          {paginaActual === 'proyecciones' && <ProyeccionesPage />}
          
          {/* Lógica de Admin */}
          {paginaActual === 'dashboard' && <AdminDashboard />}

          {/* Común para ambos */}
          {paginaActual === 'perfil' && <PerfilPage />}

        </div>
      </div>
    </div>
  );
}

export default Home;