// src/pages/Home.tsx
import { useState, useMemo } from 'react'; 
import { useAuth } from '../contexts/AuthContext';
import { useMalla } from '../contexts/MallaContext';
import { useNavigate } from 'react-router-dom';
import { proyeccionCorta } from '../utils/mallaUtils';

const toRoman = (numStr) => {
    const num = parseInt(numStr, 10);
    const romanMap = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
        6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'
    };
    return romanMap[num] || numStr;
}; // función auxiliar para convertir números a romanos

// Asumiendo que obtienes el total de créditos de la carrera,
// pero como el total de créditos no está disponible en los contextos proporcionados,
// usaremos el total de créditos de las asignaturas cargadas (progreso) como el total.
function calcularCreditosTotales(progreso) {
    // Esto calcula el total de créditos de todas las asignaturas conocidas en el progreso.
    return progreso.reduce((sum, asig) => sum + asig.creditos, 0);
}


function Home() {
  const { logout, usuario } = useAuth();
  const { 
    progreso, 
    asignaturasPorSemestre, 
    carreraSeleccionada, 
    setCarreraSeleccionada, 
    loading 
  } = useMalla();
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState<'inicio' | 'malla' | 'proyecciones' | 'perfil'>('inicio');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- Lógica para calcular las métricas de progreso (incluyendo porcentajes) ---
  const metricasProgreso = useMemo(() => {
    const totalAsignaturas = progreso.length;
    let aprobadas = 0;
    let creditosAprobados = 0;
    
    progreso.forEach(asig => {
      if (asig.estado === 'APROBADO') {
        aprobadas++;
        creditosAprobados += asig.creditos;
      }
    });
    
    // Cálculo del total de créditos basado en la data cargada
    const creditosTotales = calcularCreditosTotales(progreso);

    // Porcentaje de avance
    const pctAsignaturas = totalAsignaturas > 0 
        ? ((aprobadas / totalAsignaturas) * 100).toFixed(1)
        : '0.0';
    
    const pctCreditos = creditosTotales > 0
        ? ((creditosAprobados / creditosTotales) * 100).toFixed(1)
        : '0.0';

    const reprobadas = progreso.filter(asig => asig.estado === 'REPROBADO').length;
    const pendientes = progreso.filter(asig => asig.estado !== 'APROBADO' && asig.estado !== 'REPROBADO').length;


    return {
      totalAsignaturas,
      aprobadas,
      reprobadas,
      pendientes,
      creditosAprobados,
      creditosTotales,
      pctAsignaturas,
      pctCreditos,
    };
  }, [progreso]);
  // ----------------------------------------------------------------------


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

              {/* Lógica para seleccionar la carrera */}
              {usuario != null && usuario.carreras.length > 1 && (
                  <div className="mb-4 ">
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

              {/* Visualización de la malla */}
              {!carreraSeleccionada ? (
                  <p className="text-gray-500">Selecciona una carrera para ver su malla curricular.</p>
              ) : loading ? (
                  <p className="text-gray-500">Cargando malla...</p>
              ) : (
                <>
                  


                  {/* ** INICIO DE LA LÓGICA DE VISUALIZACIÓN DE MALLA POR SEMESTRE ** */}
                  {(() => {
                      const numSemestres = Object.keys(asignaturasPorSemestre).length;
                      
                      // Ancho de la columna
                      const anchoColumna = 224; 
                      // Espacio entre columnas
                      const anchoGap = 16;
                      
                      // Cálculo: (N * AnchoColumna) + ((N-1) * AnchoGap)
                      const totalWidth = (numSemestres * anchoColumna) + (Math.max(0, numSemestres - 1) * anchoGap);
                      
                      // margen extra de 20px para visibilidad
                      const containerWidth = `${totalWidth + 20}px`;
                      
                      return (
                          <div className="overflow-x-auto pb-4"> 
                              {/* APLICO EL minWidth CALCULADO AQUÍ */}
                              <div className="flex gap-4 mt-6 " style={{ minWidth: containerWidth }}>
                                  {Object.entries(asignaturasPorSemestre).map(([nivel, asignaturas]) => (
                                      <div key={nivel} className="bg-white rounded p-4 flex-shrink-0 w-56">
                                          <h3 className="text-xl font-extrabold text-gray-700 mb-4 text-center">
                                              Semestre {toRoman(nivel)} 
                                          </h3>
                                          <ul className="space-y-3">
                                              {asignaturas.map((asig) => (
                                                  <li key={asig.codigo} className="border border-gray-200 p-3 rounded-md text-center shadow-sm relative">
                                                      {/* 1. Código de la asignatura */}
                                                      <div className="text-xs font-semibold text-gray-500 mb-1 tracking-wider">
                                                          {asig.codigo}
                                                      </div>

                                                      {/* 2. Nombre de la asignatura */}
                                                      <div className="text-sm font-bold text-gray-800 leading-snug">
                                                          {asig.asignatura}
                                                      </div>
                                                      {/* 3. Créditos */}
                                                      <div className="text-xs text-gray-600 mt-1">
                                                          {asig.creditos} créditos
                                                      </div>
                                                      
                                                      {/* 4. Estado (Badge) */}
                                                      <span className={`absolute top-0 right-0 mt-[-8px] mr-[-8px] px-3 py-1 rounded-sm text-xs font-bold shadow-md ${
                                                          asig.estado === 'APROBADO' ? 'bg-green-400 text-white' :
                                                          asig.estado === 'REPROBADO' ? 'bg-red-400 text-white' :
                                                          'bg-gray-400 text-white'
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
                      );
                  })()}
                  {/* ** FIN DE LA LÓGICA DE VISUALIZACIÓN DE MALLA POR SEMESTRE ** */}{/* --- SECCIÓN: Barras de Porcentaje de Avance  */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-6">Avance General</h2>
                  <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Porcentaje de Avance</h3>

                    {/* Barra de Porcentaje por ASIGNATURAS */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Avance por Asignaturas</span>
                            <span className="text-lg font-bold text-green-600">{metricasProgreso.pctAsignaturas}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${metricasProgreso.pctAsignaturas}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            ({metricasProgreso.aprobadas} de {metricasProgreso.totalAsignaturas} asignaturas aprobadas)
                        </p>
                    </div>

                    {/* Barra de Porcentaje por CRÉDITOS */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Avance por Créditos</span>
                            <span className="text-lg font-bold text-blue-600">{metricasProgreso.pctCreditos}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${metricasProgreso.pctCreditos}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            ({metricasProgreso.creditosAprobados} de {metricasProgreso.creditosTotales} créditos aprobados)
                        </p>
                    </div>
                  </div>
                  {/* --- FIN SECCIÓN: Barras de Porcentaje de Avance --- */}
                </>
              )}
            </div>
          )}
          
          {/* Página de Proyecciones */}
          {paginaActual === 'proyecciones' && (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Proyecciones</h1>
                <p className="text-gray-600">Aquí podrás ver tus proyecciones académicas.</p>
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
                {!carreraSeleccionada ? (
                  <p className="text-gray-500">Selecciona una carrera para ver su malla curricular.</p>
                ) : loading ? (
                  <p className="text-gray-500">Cargando malla...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-5 gap-4 mt-6 min-w-[1000px]">
                      
                    </div>
                  </div>
                )}

              
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