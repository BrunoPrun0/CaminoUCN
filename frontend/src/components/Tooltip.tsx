import React from 'react';
import type { ReactNode } from 'react';
interface TooltipProps {
  content: ReactNode; // El contenido del tooltip (los prerrequisitos)
  children: ReactNode; // El elemento sobre el que se hace hover (la tarjeta AsignaturaCard)
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    // Usa 'group' para habilitar 'group-hover' en los estilos internos
    <div className="group relative flex"> 
      
      {children}
      
      {/* Contenido del Tooltip - Se oculta/muestra con group-hover */}
      <div 
        className="absolute bottom-full left-1/2 mb-2 z-50 
                  transform -translate-x-1/2 
                  scale-0 opacity-0 
                  transition-all duration-300 ease-in-out
                  rounded-lg p-3 
                  bg-gray-800 text-white text-sm shadow-xl 
                  group-hover:scale-100 group-hover:opacity-100 
                  min-w-max max-w-xs text-left" 
      >
        {content}
        {/* Flecha (opcional) */}
        <svg className="absolute text-gray-800 h-2 w-full left-0 top-full transform -translate-y-px pointer-events-none" viewBox="0 0 25 10">
          <polygon points="0,0 25,0 12.5,10" className="fill-current" />
        </svg>
      </div>
    </div>
  );
};