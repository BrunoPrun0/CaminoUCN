// src/components/ProgressBars.tsx

type MetricasProgreso = {
  totalAsignaturas: number;
  aprobadas: number;
  reprobadas: number;
  pendientes: number;
  creditosAprobados: number;
  creditosTotales: number;
  pctAsignaturas: string;
  pctCreditos: string;
};

type ProgressBarsProps = {
  metricas: MetricasProgreso;
};

export function ProgressBars({ metricas }: ProgressBarsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Avance General</h2>
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Porcentaje de Avance</h3>

      {/* Barra de Porcentaje por ASIGNATURAS */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Avance por Asignaturas</span>
          <span className="text-lg font-bold text-green-600">{metricas.pctAsignaturas}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${metricas.pctAsignaturas}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ({metricas.aprobadas} de {metricas.totalAsignaturas} asignaturas aprobadas)
        </p>
      </div>

      {/* Barra de Porcentaje por CRÉDITOS */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Avance por Créditos</span>
          <span className="text-lg font-bold text-blue-600">{metricas.pctCreditos}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${metricas.pctCreditos}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ({metricas.creditosAprobados} de {metricas.creditosTotales} créditos aprobados)
        </p>
      </div>
    </div>
  );
}