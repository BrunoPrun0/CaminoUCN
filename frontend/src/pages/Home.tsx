// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { obtenerMalla } from '../services/apiExternaService';
function Home() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const [progreso, setProgreso] = useState<Asignatura[]>([]);

  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState<'inicio' | 'malla' | 'proyecciones' | 'perfil'>('inicio');
  type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
};




  const handleLogout = () => {
    logout();
    navigate('/login');
  };

 useEffect(() => {
  if (paginaActual === 'malla' && usuario) {
    const { codigo, catalogo } = usuario.carreras;

    setLoading(true);
    obtenerMalla(codigo, catalogo, usuario.rut)
      .then(data => {
        setProgreso(data.progreso);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener progreso:', err);
        setLoading(false);
      });
  }
}, [paginaActual, usuario]);





  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Menú Lateral Deslizante */}
      <nav className="fixed left-0 top-0 h-full w-16 hover:w-64 bg-gray-900 text-white transition-all duration-300 z-50 group">
        
        {/* Logo CAMINO */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏞</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xl font-bold whitespace-nowrap">
              CAMINO
            </span>
          </div>
        </div>

        {/* Items del Menú */}
        <ul className="space-y-2 p-4">
          {[
            { key: 'inicio', label: 'Inicio' },
            { key: 'malla', label: 'Mi Malla' },
            { key: 'proyecciones', label: 'Proyecciones' },
            { key: 'perfil', label: 'Perfil' },
          ].map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setPaginaActual(item.key as any)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition duration-200 ${
                  paginaActual === item.key 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">■</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Cerrar Sesión */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition duration-200"
          >
            <span className="text-lg">■</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="flex-1 ml-16 group-hover:ml-64 transition-all duration-300 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[calc(100vh-4rem)]">
          
          {/* Página de Inicio */}
          {paginaActual === 'inicio' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido a CAMINO</h1>
              <p className="text-gray-600">Selecciona una opción del menú para comenzar</p>
            </div>
          )}

          {/* Página de Malla */}
          {paginaActual === 'malla' && (
            <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Mi Malla</h1>
          <p className="text-gray-600 mb-6">Aquí podrás ver y gestionar tu malla curricular.</p>

    {loading ? (
      <p className="text-gray-500">Cargando malla...</p>
    ) : (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Código</th>
            <th className="p-2">Asignatura</th>
            <th className="p-2">Créditos</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {progreso.map((asig) => (
            <tr key={asig.codigo} className="border-b">
              <td className="p-2">{asig.codigo}</td>
              <td className="p-2">{asig.asignatura}</td>
              <td className="p-2">{asig.creditos}</td>
              <td className={`p-2 font-semibold ${
                asig.estado === 'APROBADO' ? 'text-green-600' :
                asig.estado === 'REPROBADO' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {asig.estado}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}


          {/* Página de Proyecciones */}
          {paginaActual === 'proyecciones' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Proyecciones</h1>
              <p className="text-gray-600">Aquí podrás ver tus proyecciones académicas.</p>
            </div>
          )}

          {/* Página de Perfil */}
          {paginaActual === 'perfil' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Perfil</h1>
              <p className="text-gray-600">Aquí podrás ver y editar tu perfil.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Home;