import { AsignaturaCard } from './AsignaturaCard';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string[];
  veces_cursado: number;
};

type MallaGridProps = {
  asignaturasPorSemestre: Record<number, Asignatura[]>;
};

const toRoman = (numStr: string | number) => {
  const num = typeof numStr === 'string' ? parseInt(numStr, 10) : numStr;
  const romanMap: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'
  };
  return romanMap[num] || String(numStr);
};

export function MallaGrid({ asignaturasPorSemestre }: MallaGridProps) {
  const numSemestres = Object.keys(asignaturasPorSemestre).length;
  
  // Calcula el número total de columnas para la cuadrícula
  const totalColumns = numSemestres;
  
  // Generamos el estilo CSS para la cuadrícula: grid-template-columns: repeat(10, minmax(0, 1fr));
  // Usamos una utilidad inline para asegurar que el número de columnas sea dinámico.
  const gridStyle = {
    gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
  };


  return (
    // Eliminamos el overflow-x-auto, ya que no queremos scroll.
    // Usamos p-4 en móvil y desktop para dar espacio.
    <div className="pb-4 pt-4 px-4"> 
      
      {/* 1. Cambiamos de 'flex' a 'grid'.
        2. Usamos 'gap-4' para el espaciado.
        3. Aplicamos el 'gridStyle' dinámico.
        4. Opcional: En pantallas grandes (lg), podríamos forzar un ancho máximo si es necesario.
      */}
      <div 
        className="grid gap-4 mt-6" 
        style={gridStyle} // Aplica grid-template-columns: repeat(N, 1fr);
      >
        {Object.entries(asignaturasPorSemestre).map(([nivel, asignaturas]) => (
          <div 
            key={nivel} 
            // 5. Eliminamos w-56, flex-shrink-0, y min-w-max. 
            // Tailwind ya tiene clases grid-column-span-1 implícitas.
            className="bg-white rounded p-4 shadow-lg border border-gray-100"
          >
            <h3 className="text-sm font-bold text-gray-700 mb-2 text-center">
              Semestre {toRoman(nivel)}
            </h3>
            <ul className="space-y-2">
              {asignaturas.map((asig) => (
                <AsignaturaCard key={asig.codigo} asignatura={asig} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}