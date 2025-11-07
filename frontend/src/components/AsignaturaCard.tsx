// src/components/AsignaturaCard.tsx
import { Tooltip } from './Tooltip'; 
import React from 'react';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  prereq: string[]; 
  veces_cursado: number;
};

type AsignaturaCardProps = {
  asignatura: Asignatura;
};
export function AsignaturaCard({ asignatura }: AsignaturaCardProps) {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return 'bg-green-500 text-white';
      case 'REPROBADO':
        return 'bg-red-500 text-white';
      default: // PENDIENTE o cualquier otro
        return 'bg-blue-500 text-white';
    }
  };

  // 1. Contenido del Tooltip
  const tooltipContent = (
    <div className="text-left">
      <p className="font-bold mb-1 text-base">Requisitos Previos:</p>
      
      {asignatura.prereq && asignatura.prereq.length > 0 ? (
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          {/* Muestra los códigos de los prerrequisitos */}
          {asignatura.prereq.map((prereqCode, index) => (
            <li key={index} className="text-gray-200">
              {prereqCode}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300">No tiene requisitos.</p>
      )}
    </div>
  );

  return (
    //  tooltip
    <Tooltip content={tooltipContent}>
      {/* contenido de la tarjeta (el 'children' del tooltip) */}
      <div className="w-full relative"> {/* Envoltorio necesario para el flex de Tooltip */}
        <li className="border border-gray-200 p-3 rounded-md text-center shadow-sm transition-shadow duration-200 hover:shadow-lg bg-white">
          
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
      </div>
    </Tooltip>
  );
}