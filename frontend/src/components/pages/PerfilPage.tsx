// src/components/pages/PerfilPage.tsx
import { useAuth } from '../../contexts/AuthContext';

export function PerfilPage() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Perfil</h1>
      <p className="text-gray-600 mb-6">Información de tu perfil académico.</p>

      {usuario && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="border-b pb-3">
            <label className="text-sm text-gray-500 font-medium">RUT</label>
            <p className="text-lg text-gray-800">{usuario.rut}</p>
          </div>

          <div className="border-b pb-3">
            <label className="text-sm text-gray-500 font-medium">Nombre</label>
            <p className="text-lg text-gray-800">{usuario.nombre}</p>
          </div>

          <div className="border-b pb-3">
            <label className="text-sm text-gray-500 font-medium">Carreras</label>
            <ul className="mt-2 space-y-2">
              {usuario.carreras.map((carrera) => (
                <li key={carrera.codigo} className="text-gray-700">
                  <span className="font-semibold">{carrera.nombre}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({carrera.codigo} - Catálogo {carrera.catalogo})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}