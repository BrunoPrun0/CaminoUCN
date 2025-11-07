// src/components/pages/ProyeccionesPage.tsx
import { useAuth } from '../../contexts/AuthContext';
import { useMalla } from '../../contexts/MallaContext';
import { CarreraSelector } from '../CarreraSelector';

export function ProyeccionesPage() {
  const { usuario } = useAuth();
  const { carreraSeleccionada, setCarreraSeleccionada, loading } = useMalla();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Proyecciones</h1>
      <p className="text-gray-600 mb-6">Aquí podrás ver tus proyecciones académicas.</p>
      
      {usuario && (
        <CarreraSelector
          carreras={usuario.carreras}
          carreraSeleccionada={carreraSeleccionada}
          onSelectCarrera={setCarreraSeleccionada}
        />
      )}

      {!carreraSeleccionada ? (
        <p className="text-gray-500">Selecciona una carrera para ver las proyecciones.</p>
      ) : loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-5 gap-4 mt-6 min-w-[1000px]">
            {/* Aquí va el contenido de proyecciones */}
            <p className="col-span-5 text-gray-500 text-center py-8">
              Contenido de proyecciones próximamente...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}