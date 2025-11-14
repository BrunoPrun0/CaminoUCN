import { useState } from 'react';
import { AsignaturaDraggableCard } from './AsignaturaDraggableCard';

type SemestreColumnProps = {
  numero: number;
  asignaturas: string[];
  creditos: number;
  onDrop: (codigoAsignatura: string, semestreOrigen: number, semestreDestino: number) => void;
  onEliminar?: () => void;
  isDraggable?: boolean;
  esManual?: boolean;
};

const MAX_CREDITOS = 32;

export function SemestreColumn({ 
  numero, 
  asignaturas, 
  creditos,
  onDrop,
  onEliminar,
  isDraggable = true,
  esManual = false
}: SemestreColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const codigoAsignatura = e.dataTransfer.getData('codigoAsignatura');
    const semestreOrigen = parseInt(e.dataTransfer.getData('semestreOrigen'));
    
    if (codigoAsignatura && !isNaN(semestreOrigen)) {
      onDrop(codigoAsignatura, semestreOrigen, numero);
    }
  };

  const porcentajeCreditos = Math.min((creditos / MAX_CREDITOS) * 100, 100);
  const estaLleno = creditos >= MAX_CREDITOS;
  const estaCercaLimite = creditos >= MAX_CREDITOS * 0.8;

  return (
    <div className="flex flex-col h-full">
      {/* Header del semestre */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-t-lg shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">Semestre {numero}</h3>
          {esManual && asignaturas.length === 0 && onEliminar && (
            <button
              onClick={onEliminar}
              className="text-white hover:text-red-200 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
              title="Eliminar semestre vacío"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Barra de progreso de créditos */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{creditos} / {MAX_CREDITOS} créditos</span>
            <span className={estaLleno ? 'font-bold' : ''}>
              {porcentajeCreditos.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-blue-300 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                estaLleno 
                  ? 'bg-red-500' 
                  : estaCercaLimite 
                  ? 'bg-yellow-400' 
                  : 'bg-green-400'
              }`}
              style={{ width: `${porcentajeCreditos}%` }}
            />
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex-1 border-2 border-dashed rounded-b-lg p-3 
          min-h-[400px] transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 bg-gray-50'
          }
          ${!isDraggable ? 'bg-gray-100' : ''}
        `}
      >
        {/* Lista de asignaturas */}
        <div className="space-y-2">
          {asignaturas.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-8">
              {isDraggable ? (
                <>
                  <div className="text-4xl mb-2">📚</div>
                  <p>Arrastra asignaturas aquí</p>
                </>
              ) : (
                <p>Sin asignaturas</p>
              )}
            </div>
          ) : (
            asignaturas.map((codigo) => (
              <AsignaturaDraggableCard
                key={codigo}
                codigoAsignatura={codigo}
                semestreOrigen={numero}
                isDraggable={isDraggable}
              />
            ))
          )}
        </div>

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}