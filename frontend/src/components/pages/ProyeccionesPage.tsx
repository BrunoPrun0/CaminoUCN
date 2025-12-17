import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMalla } from '../../contexts/MallaContext';
import { useProyeccion } from '../../contexts/ProyeccionContext';
import { CarreraSelector } from '../CarreraSelector';
import { ProyeccionAutomaticaView } from '../ProyeccionAutomaticaView';
import { ProyeccionManualView } from '../ProyeccionManualView';

type Tab = 'automatica' | 'manual' | 'guardadas';

export function ProyeccionesPage() {
  const { usuario } = useAuth();
  const { carreraSeleccionada, setCarreraSeleccionada, loading: mallaLoading } = useMalla();
  const { 
    proyeccionesGuardadas, 
    cargarProyeccion, 
    eliminarProyeccionGuardada,
    marcarFavorita,
    loading: proyeccionLoading 
  } = useProyeccion();
  
  const [tabActiva, setTabActiva] = useState<Tab>('automatica');

  const handleCargarProyeccion = async (id: number) => {
    await cargarProyeccion(id);
    setTabActiva('manual');
  };

  const handleEliminarProyeccion = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la proyección "${nombre}"?`)) {
      await eliminarProyeccionGuardada(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Proyecciones Académicas</h1>
        <p className="text-gray-600">
          Planifica tu ruta académica con proyecciones automáticas o personalizadas
        </p>
      </div>
      
      {/* Selector de carrera */}
      {usuario && (
        <CarreraSelector
          carreras={usuario.carreras}
          carreraSeleccionada={carreraSeleccionada}
          onSelectCarrera={setCarreraSeleccionada}
        />
      )}

      {!carreraSeleccionada ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <i className="fi fi-rr-graduation-cap text-6xl text-gray-400 mb-4"></i>
          <p className="text-gray-500 text-lg">
            Selecciona una carrera para ver las proyecciones
          </p>
        </div>
      ) : mallaLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-4">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
            <button
              onClick={() => setTabActiva('automatica')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                tabActiva === 'automatica'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fi fi-rr-journey"></i>
              Proyección Automática
            </button>
            <button
              onClick={() => setTabActiva('manual')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                tabActiva === 'manual'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fi fi-rr-edit"></i>
              Proyección Manual
            </button>
            <button
              onClick={() => setTabActiva('guardadas')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all relative flex items-center justify-center gap-2 ${
                tabActiva === 'guardadas'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fi fi-rr-disk"></i>
              Proyecciones Guardadas
              {proyeccionesGuardadas.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {proyeccionesGuardadas.length}
                </span>
              )}
            </button>
          </div>

          {/* Contenido de tabs */}
          <div>
            {tabActiva === 'automatica' && <ProyeccionAutomaticaView />}
            {tabActiva === 'manual' && <ProyeccionManualView />}
            {tabActiva === 'guardadas' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Mis Proyecciones Guardadas
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Tienes {proyeccionesGuardadas.length} de 3 proyecciones guardadas
                  </p>

                  {proyeccionLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : proyeccionesGuardadas.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <i className="fi fi-rr-document text-6xl text-gray-400 mb-4"></i>
                      <p className="text-gray-500 text-lg mb-2">
                        No tienes proyecciones guardadas
                      </p>
                      <p className="text-gray-400 text-sm">
                        Crea una proyección automática o manual y guárdala
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {proyeccionesGuardadas.map((proyeccion) => (
                        <div
                          key={proyeccion.id}
                          className={`border-2 rounded-lg p-4 hover:shadow-lg transition-all ${
                            proyeccion.isFavorite
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                {proyeccion.name}
                                {proyeccion.isFavorite && <i className="fi fi-sr-star text-yellow-500"></i>}
                              </h3>
                              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded text-xs font-semibold ${
                                proyeccion.isAutomatic
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                <i className={proyeccion.isAutomatic ? 'fi fi-rr-magic-wand' : 'fi fi-rr-edit'}></i>
                                {proyeccion.isAutomatic ? 'Automática' : 'Manual'}
                              </span>
                            </div>
                          </div>

                          {/* Estadísticas */}
                          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                            <div className="bg-gray-100 rounded p-2 text-center">
                              <div className="font-bold text-gray-700">
                                {proyeccion.semesters.length}
                              </div>
                              <div className="text-xs text-gray-500">Semestres</div>
                            </div>
                            <div className="bg-gray-100 rounded p-2 text-center">
                              <div className="font-bold text-gray-700">
                                {proyeccion.semesters.reduce((sum, s) => sum + s.courses.length, 0)}
                              </div>
                              <div className="text-xs text-gray-500">Asignaturas</div>
                            </div>
                          </div>

                          {/* Fecha */}
                          <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                            <i className="fi fi-rr-clock"></i>
                            Actualizada: {new Date(proyeccion.updatedAt).toLocaleDateString()}
                          </div>

                          {/* Acciones */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCargarProyeccion(proyeccion.id)}
                              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <i className="fi fi-rr-folder-open"></i>
                              Cargar
                            </button>
                            {!proyeccion.isFavorite && (
                              <button
                                onClick={() => marcarFavorita(proyeccion.id)}
                                className="px-3 py-2 border border-yellow-400 text-yellow-600 hover:bg-yellow-50 rounded text-sm font-semibold transition-colors"
                                title="Marcar como favorita"
                              >
                                <i className="fi fi-rr-star"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleEliminarProyeccion(proyeccion.id, proyeccion.name)}
                              className="px-3 py-2 border border-red-400 text-red-600 hover:bg-red-50 rounded text-sm font-semibold transition-colors"
                              title="Eliminar"
                            >
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}