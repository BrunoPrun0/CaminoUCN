// src/components/AsignaturaCard.tsx

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  veces_cursado: number;
};

type AsignaturaCardProps = {
  asignatura: Asignatura;
};

export function AsignaturaCard({ asignatura }: AsignaturaCardProps) {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return 'bg-green-400 text-white';
      case 'REPROBADO':
        return 'bg-red-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // DEBUG: Ver qué datos recibe cada card
  if (asignatura.veces_cursado > 0) {
    console.log(`${asignatura.codigo} - veces_cursado:`, asignatura.veces_cursado);
  }

  return (
    <li className="border border-gray-200 p-3 rounded-md text-center shadow-sm relative">
      {/* Código de la asignatura */}
      <div className="text-xs font-semibold text-gray-500 mb-1 tracking-wider">
        {asignatura.codigo}
      </div>

      {/* Nombre de la asignatura */}
      <div className="text-sm font-bold text-gray-800 leading-snug">
        {asignatura.asignatura}
      </div>

      {/* Créditos */}
      <div className="text-xs text-gray-600 mt-1">
        {asignatura.creditos} créditos
      </div>

      {/* Veces cursado */}
      {asignatura.veces_cursado > 0 && (
        <div className={`text-xs font-semibold mt-1 ${
          asignatura.veces_cursado > 1 ? 'text-orange-600' : 'text-gray-500'
        }`}>
          {asignatura.veces_cursado === 1 
            ? '1 vez cursada' 
            : `${asignatura.veces_cursado} veces cursada`}
        </div>
      )}

      {/* Estado (Badge) */}
      <span className={`absolute top-0 right-0 mt-[-8px] mr-[-8px] px-3 py-1 rounded-sm text-xs font-bold shadow-md ${getEstadoColor(asignatura.estado)}`}>
        {asignatura.estado}
      </span>
    </li>
  );
}