// src/components/pages/MallaPage.tsx
import { useMemo } from 'react';
import { useMalla } from '../../contexts/MallaContext';
import { useAuth } from '../../contexts/AuthContext';
import { CarreraSelector } from '../CarreraSelector';
import { MallaGrid } from '../MallaGrid';
import { ProgressBars } from '../ProgressBars';

function calcularCreditosTotales(progreso: any[]) {
  return progreso.reduce((sum, asig) => sum + asig.creditos, 0);
}

export function MallaPage() {
  const { usuario } = useAuth();
  const { 
    progreso, 
    asignaturasPorSemestre, 
    carreraSeleccionada, 
    setCarreraSeleccionada, 
    loading 
  } = useMalla();

  const metricasProgreso = useMemo(() => {
    const totalAsignaturas = progreso.length;
    let aprobadas = 0;
    let creditosAprobados = 0;
    
    progreso.forEach(asig => {
      if (asig.estado === 'APROBADO') {
        aprobadas++;
        creditosAprobados += asig.creditos;
      }
    });
    
    const creditosTotales = calcularCreditosTotales(progreso);
    const pctAsignaturas = totalAsignaturas > 0 
      ? ((aprobadas / totalAsignaturas) * 100).toFixed(1)
      : '0.0';
    
    const pctCreditos = creditosTotales > 0
      ? ((creditosAprobados / creditosTotales) * 100).toFixed(1)
      : '0.0';

    const reprobadas = progreso.filter(asig => asig.estado === 'REPROBADO').length;
    const pendientes = progreso.filter(asig => asig.estado !== 'APROBADO' && asig.estado !== 'REPROBADO').length;

    return {
      totalAsignaturas,
      aprobadas,
      reprobadas,
      pendientes,
      creditosAprobados,
      creditosTotales,
      pctAsignaturas,
      pctCreditos,
    };
  }, [progreso]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Mi Malla</h1>
      <p className="text-gray-600 mb-6">Aquí podrás ver y gestionar tu malla curricular.</p>

      {usuario && (
        <CarreraSelector
          carreras={usuario.carreras}
          carreraSeleccionada={carreraSeleccionada}
          onSelectCarrera={setCarreraSeleccionada}
        />
      )}

      {!carreraSeleccionada ? (
        <p className="text-gray-500">Selecciona una carrera para ver su malla curricular.</p>
      ) : loading ? (
        <p className="text-gray-500">Cargando malla...</p>
      ) : (
        <>
          <MallaGrid asignaturasPorSemestre={asignaturasPorSemestre} />
          <ProgressBars metricas={metricasProgreso} />
        </>
      )}
    </div>
  );
}