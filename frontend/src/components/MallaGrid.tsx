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
  
  // Ancho de la columna y espacio entre columnas
  const anchoColumna = 224;
  const anchoGap = 16;
  
  // Cálculo del ancho total
  const totalWidth = (numSemestres * anchoColumna) + (Math.max(0, numSemestres - 1) * anchoGap);
  const containerWidth = `${totalWidth + 20}px`;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 mt-6" style={{ minWidth: containerWidth }}>
        {Object.entries(asignaturasPorSemestre).map(([nivel, asignaturas]) => (
          <div key={nivel} className="bg-white rounded p-4 flex-shrink-0 w-56">
            <h3 className="text-xl font-extrabold text-gray-700 mb-4 text-center">
              Semestre {toRoman(nivel)}
            </h3>
            <ul className="space-y-3">
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