// src/components/ProyeccionAutomaticaView.tsx
import { useState } from 'react';
import { useProyeccion } from '../contexts/ProyeccionContext';
import { SemestreColumn } from './SemestreColumn';

export function ProyeccionAutomaticaView() {
  const { proyeccionAutomatica, guardarProyeccion, loading } = useProyeccion();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [nombreProyeccion, setNombreProyeccion] = useState('Proyección Automática');
  const [esFavorita, setEsFavorita] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!nombreProyeccion.trim()) {
      alert('Debes ingresar un nombre para la proyección');
      return;
    }

    setGuardando(true);
    try {
      await guardarProyeccion(nombreProyeccion, esFavorita, true);
      setMensajeExito('¡Proyección guardada exitosamente!');
      setShowSaveModal(false);
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error: any) {
      alert(error.message || 'Error al guardar la proyección');
    } finally {
      setGuardando(false);
    }
  };

  const totalCreditos = proyeccionAutomatica.reduce((sum, sem) => sum + sem.creditos, 0);
  const totalAsignaturas = proyeccionAutomatica.reduce((sum, sem) => sum + sem.asignaturas.length, 0);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600 mt-4">Calculando proyección...</p>
      </div>
    );
  }

  if (proyeccionAutomatica.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎓</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          ¡Felicidades! Ya completaste todas las asignaturas
        </h3>
        <p className="text-gray-600">
          No hay asignaturas pendientes para proyectar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              📊 Proyección Automática
            </h2>
            <p className="text-gray-600 text-sm">
              Ruta óptima calculada automáticamente según prerequisitos y restricciones
            </p>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            💾 Guardar Proyección
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{proyeccionAutomatica.length}</div>
            <div className="text-sm text-gray-600">Semestres</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{totalAsignaturas}</div>
            <div className="text-sm text-gray-600">Asignaturas</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{totalCreditos}</div>
            <div className="text-sm text-gray-600">Créditos Totales</div>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {mensajeExito}
        </div>
      )}

      {/* Grid de semestres */}
      <div className="overflow-x-auto pb-4">
        <div className="grid gap-4 min-w-max" style={{ 
          gridTemplateColumns: `repeat(${Math.min(proyeccionAutomatica.length, 5)}, minmax(250px, 1fr))` 
        }}>
          {proyeccionAutomatica.map((semestre) => (
            <SemestreColumn
              key={semestre.numero}
              numero={semestre.numero}
              asignaturas={semestre.asignaturas}
              creditos={semestre.creditos}
              onDrop={() => {}} // No hay drag & drop en automática
              isDraggable={false}
              esManual={false}
            />
          ))}
        </div>
      </div>

      {/* Modal para guardar */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Guardar Proyección Automática
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la proyección
                </label>
                <input
                  type="text"
                  value={nombreProyeccion}
                  onChange={(e) => setNombreProyeccion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Plan Rápido, Graduación 2026"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="favorita"
                  checked={esFavorita}
                  onChange={(e) => setEsFavorita(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="favorita" className="text-sm text-gray-700">
                  Marcar como favorita ⭐
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}