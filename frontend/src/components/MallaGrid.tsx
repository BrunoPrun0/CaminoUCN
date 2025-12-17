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
  
  //número total de columnas para la cuadrícula
  const totalColumns = numSemestres;
  //número de columnas dinámico.
  const gridStyle = {
    gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
  };


  return (
    <div className="pb-4 pt-4 px-4"> 
      
      <div 
        className="grid gap-4 mt-6" 
        style={gridStyle} // Aplica grid-template-columns: repeat(N, 1fr);
      >
        {Object.entries(asignaturasPorSemestre).map(([nivel, asignaturas]) => (
          <div 
            key={nivel} 
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