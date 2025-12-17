import { useMalla } from '../contexts/MallaContext';

type AsignaturaDraggableCardProps = {
  codigoAsignatura: string;
  semestreOrigen: number;
  isDraggable?: boolean;
  onDragStart?: (codigo: string, semestre: number) => void;
};

export function AsignaturaDraggableCard({ 
  codigoAsignatura, 
  semestreOrigen,
  isDraggable = true,
  onDragStart
}: AsignaturaDraggableCardProps) {
  const { progreso, carreraSeleccionada } = useMalla();
  
  const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
  
  // Si no se encuentra la asignatura, podría ser de otra carrera
  if (!asignatura) {
    return (
      <div className="border-2 border-red-500 bg-red-500 p-2 rounded text-xs">
        <div className="font-semibold text-orange-700 mb-1">
          ⚠️ {codigoAsignatura}
        </div>
        <div className="text-orange-600">
          Esta asignatura no pertenece a la carrera actual ({carreraSeleccionada?.nombre || 'N/A'})
        </div>
        <div className="text-xs text-orange-500 mt-1">
          Cambia a la carrera correcta para visualizarla
        </div>
      </div>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return 'bg-green-500 text-white';
      case 'REPROBADO':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('codigoAsignatura', codigoAsignatura);
    e.dataTransfer.setData('semestreOrigen', semestreOrigen.toString());
    
    if (onDragStart) {
      onDragStart(codigoAsignatura, semestreOrigen);
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`
        border border-gray-200 p-2 rounded-md text-center shadow-sm 
        relative bg-white transition-all
        ${isDraggable ? 'cursor-move hover:shadow-md hover:scale-105' : 'cursor-default'}
        ${asignatura.veces_cursado >= 3 ? 'border-2 border-red-500' : ''}
      `}
    >
      {/* Código de la asignatura */}
      <div className="text-xs font-semibold text-gray-500 mb-1 tracking-wider">
        {asignatura.codigo}
      </div>

      {/* Nombre de la asignatura */}
      <div className="text-xs font-bold text-gray-800 leading-snug">
        {asignatura.asignatura}
      </div>

      {/* Créditos */}
      <div className="text-xs text-gray-600 mt-1">
        {asignatura.creditos} créditos
      </div>

      {/* Veces cursado */}
      {asignatura.veces_cursado > 0 && (
        <div className={`text-xs font-semibold mt-1 ${
          asignatura.veces_cursado >= 3 ? 'text-orange-600' : 'text-gray-500'
        }`}>
          {asignatura.veces_cursado === 1 
            ? '1 vez' 
            : `${asignatura.veces_cursado} veces`}
        </div>
      )}

      {/* Badge de estado */}
      <span className={`
        absolute top-0 right-0 mt-[-6px] mr-[-6px] 
        px-2 py-0.5 rounded-sm text-xs font-bold shadow-md 
        ${getEstadoColor(asignatura.estado)}
      `}>
        {asignatura.estado === 'NO CURSADA' ? 'PENDIENTE' : asignatura.estado}
      </span>

      {/* Indicador de prerequisitos obligatorios (3+ intentos) */}
      {asignatura.veces_cursado >= 3 && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs py-0.5 rounded-sm font-bold">
          PRIORIDAD
        </div>
      )}
    </div>
  );
}