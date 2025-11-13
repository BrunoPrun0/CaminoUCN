// src/components/ProyeccionManualView.tsx
import { useState } from 'react';
import { useProyeccion } from '../contexts/ProyeccionContext';
import { SemestreColumn } from './SemestreColumn';

export function ProyeccionManualView() {
  const { 
    proyeccionManual, 
    moverAsignatura, 
    agregarSemestre,
    eliminarSemestre,
    guardarProyeccion,
    proyeccionAutomatica,
    loading,
    error: contextError
  } = useProyeccion();
  
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [nombreProyeccion, setNombreProyeccion] = useState('Mi Proyección');
  const [esFavorita, setEsFavorita] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleDrop = (codigoAsignatura: string, semestreOrigen: number, semestreDestino: number) => {
    if (semestreOrigen === semestreDestino) return;

    const resultado = moverAsignatura(codigoAsignatura, semestreOrigen, semestreDestino);
    
    if (!resultado.exito) {
      setErrorMensaje(resultado.mensaje || 'No se pudo mover la asignatura');
      setTimeout(() => setErrorMensaje(null), 4000);
    }
  };

  const handleReiniciar = () => {
    if (confirm('¿Estás seguro? Esto reiniciará tu proyección manual con la proyección automática.')) {
      window.location.reload(); // Simple reload para reiniciar
    }
  };

  const handleGuardar = async () => {
    if (!nombreProyeccion.trim()) {
      alert('Debes ingresar un nombre para la proyección');
      return;
    }

    setGuardando(true);
    try {
      await guardarProyeccion(nombreProyeccion, esFavorita, false);
      setMensajeExito('¡Proyección guardada exitosamente!');
      setShowSaveModal(false);
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error: any) {
      alert(error.message || 'Error al guardar la proyección');
    } finally {
      setGuardando(false);
    }
  };

  const totalCreditos = proyeccionManual.reduce((sum, sem) => sum + sem.creditos, 0);
  const totalAsignaturas = proyeccionManual.reduce((sum, sem) => sum + sem.asignaturas.length, 0);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600 mt-4">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas y controles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
               <i className="fi fi-rr-edit"></i> Proyección Manual
            </h2>
            <p className="text-gray-600 text-sm">
              Arrastra y suelta las asignaturas para personalizar tu plan de estudios
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReiniciar}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <i className="fi fi-rr-refresh"></i> Reiniciar
            </button>
            <button
              onClick={agregarSemestre}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <i className="fi fi-rr-add"></i> Agregar Semestre
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <i className="fi fi-rr-disk"></i> Guardar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{proyeccionManual.length}</div>
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

      {/* Mensajes */}
      {mensajeExito && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {mensajeExito}
        </div>
      )}

      {errorMensaje && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start">
          <span className="mr-2">❌</span>
          <span className="flex-1">{errorMensaje}</span>
          <button 
            onClick={() => setErrorMensaje(null)}
            className="font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {contextError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {contextError}
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">💡 Instrucciones:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Arrastra las asignaturas entre semestres para reorganizar tu plan</li>
          <li>• Máximo 32 créditos por semestre</li>
          <li>• Respeta los prerequisitos de cada asignatura</li>
          <li>• Las asignaturas con 3+ intentos son prioritarias</li>
          <li>• Dispersión máxima de 3 niveles entre asignaturas</li>
        </ul>
      </div>

      {/* Grid de semestres */}
      <div className="overflow-x-auto pb-4">
        <div className="grid gap-4 min-w-max" style={{ 
          gridTemplateColumns: `repeat(${Math.min(proyeccionManual.length, 5)}, minmax(250px, 1fr))` 
        }}>
          {proyeccionManual.map((semestre) => (
            <SemestreColumn
              key={semestre.numero}
              numero={semestre.numero}
              asignaturas={semestre.asignaturas}
              creditos={semestre.creditos}
              onDrop={handleDrop}
              onEliminar={() => eliminarSemestre(semestre.numero)}
              isDraggable={true}
              esManual={true}
            />
          ))}
        </div>
      </div>

      {/* Modal para guardar */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Guardar Proyección Manual
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
                  placeholder="Ej: Plan Balanceado, Mi Ruta"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="favorita-manual"
                  checked={esFavorita}
                  onChange={(e) => setEsFavorita(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="favorita-manual" className="text-sm text-gray-700">
                  Marcar como favorita ⭐
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                💾 Solo puedes tener hasta 3 proyecciones guardadas
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