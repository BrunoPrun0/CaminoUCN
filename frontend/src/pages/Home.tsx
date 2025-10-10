// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { obtenerMalla } from '../services/apiExternaService';
function Home() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const [progreso, setProgreso] = useState<Asignatura[]>([]);
  const [asignaturasPorSemestre, setAsignaturasPorSemestre] = useState<Record<number, Asignatura[]>>({});
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<{ codigo: string; nombre: string; catalogo: string } | null>(null);


  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState<'inicio' | 'malla' | 'proyecciones' | 'perfil'>('inicio');
  type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string;
};





  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
  if (paginaActual === 'malla' && usuario && carreraSeleccionada) {
    setLoading(true);

    obtenerMalla(carreraSeleccionada.codigo, carreraSeleccionada.catalogo, usuario.rut)
      .then(data => {
        setProgreso(data.progreso);

        const agrupadas = data.progreso.reduce(
          (acc: Record<number, Asignatura[]>, asig: Asignatura) => {
            const nivel = asig.nivel;
            if (!acc[nivel]) acc[nivel] = [];
            acc[nivel].push(asig);
            return acc;
          },
          {} as Record<number, Asignatura[]>
        );

        setAsignaturasPorSemestre(agrupadas);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener progreso:', err);
        setLoading(false);
      });
  }
}, [paginaActual, usuario, carreraSeleccionada]);


useEffect(() => {
  if (paginaActual === 'malla' && usuario && usuario.carreras.length === 1 && !carreraSeleccionada) {
    setCarreraSeleccionada(usuario.carreras[0]);
  }
}, [paginaActual, usuario, carreraSeleccionada]);



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

    {usuario != null && usuario.carreras.length > 1 && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona una carrera:</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={carreraSeleccionada?.codigo || ''}
          onChange={(e) => {
            const seleccionada = usuario.carreras.find(c => c.codigo === e.target.value);
            setCarreraSeleccionada(seleccionada || null);
          }}
        >
          <option value="">-- Selecciona --</option>
          {usuario.carreras.map((carrera) => (
            <option key={carrera.codigo} value={carrera.codigo}>
              {carrera.nombre} ({carrera.catalogo})
            </option>
          ))}
        </select>
      </div>
    )}

    {/* 👇 Este bloque debe estar completamente encerrado */}
    {!carreraSeleccionada ? (
      <p className="text-gray-500">Selecciona una carrera para ver su malla curricular.</p>
    ) : loading ? (
      <p className="text-gray-500">Cargando malla...</p>
    ) : (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-5 gap-4 mt-6 min-w-[1000px]">
          {Object.entries(asignaturasPorSemestre).map(([nivel, asignaturas]) => (
            <div key={nivel} className="bg-white shadow-md rounded p-4">
              <h3 className="text-lg font-bold text-blue-700 mb-2">Semestre {nivel}</h3>
              <ul className="space-y-2">
                {asignaturas.map((asig) => (
                  <li key={asig.codigo} className="border p-2 rounded text-sm bg-gray-50 flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{asig.codigo}</span>: {asig.asignatura} · <span className="text-gray-600">{asig.creditos} créditos</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      asig.estado === 'APROBADO' ? 'bg-green-200 text-green-800' :
                      asig.estado === 'REPROBADO' ? 'bg-red-200 text-red-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {asig.estado}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )}
  </div> // 👈 Este cierra el bloque de malla
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