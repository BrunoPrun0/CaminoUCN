import { useEffect, useState } from 'react';
import { BarChart2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'; // Asegúrate de tener lucide-react instalado

// Definimos el tipo de dato que viene del backend
type EstadisticaRamo = {
  codigo: string;
  nombre: string;
  interesados: number;
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState<EstadisticaRamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los datos
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // AJUSTA EL PUERTO SI ES NECESARIO (3000, 3001, etc.)
      const response = await fetch('http://localhost:3000/projections/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchStats();
  }, []);

  // Lógica visual: Colores según demanda
  const getBarColor = (cantidad: number) => {
    if (cantidad >= 10) return 'bg-red-500';     // Alta demanda (ajusta este número a tu realidad)
    if (cantidad >= 5) return 'bg-yellow-500';   // Media demanda
    return 'bg-blue-500';                        // Baja demanda
  };

  // Cálculo para el ancho de las barras (regla de tres simple)
  // Si no hay datos, ponemos 1 para evitar división por cero
  const maxInteresados = Math.max(...stats.map(s => s.interesados), 1);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-blue-600 font-semibold animate-pulse">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p className="font-bold flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </p>
        <button 
          onClick={fetchStats} 
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Demanda Académica</h2>
          <p className="text-gray-500">
            Proyección de solicitudes para el próximo semestre basada en las selecciones favoritas.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium flex items-center gap-2">
            <BarChart2 size={18} />
            <span>{stats.length} Asignaturas Solicitadas</span>
          </div>
          <button 
            onClick={fetchStats}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Si no hay datos (array vacío) */}
      {stats.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">Aún no hay proyecciones favoritas registradas.</p>
          <p className="text-sm text-gray-400">Los datos aparecerán aquí cuando los alumnos creen sus proyecciones.</p>
        </div>
      ) : (
        /* Tabla Visual de Barras */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header de la Tabla */}
          <div className="grid grid-cols-12 bg-gray-50 p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
            <div className="col-span-2 md:col-span-1">Código</div>
            <div className="col-span-6 md:col-span-4">Asignatura</div>
            <div className="col-span-4 md:col-span-5 hidden md:block">Demanda Visual</div>
            <div className="col-span-4 md:col-span-2 text-right">Interesados</div>
          </div>

          {/* Filas de la Tabla */}
          <div className="divide-y divide-gray-100">
            {stats.map((ramo) => (
              <div key={ramo.codigo} className="grid grid-cols-12 p-4 items-center hover:bg-gray-50 transition-colors group">
                
                {/* 1. Código */}
                <div className="col-span-2 md:col-span-1 font-mono text-sm text-gray-400">
                  {ramo.codigo}
                </div>

                {/* 2. Nombre */}
                <div className="col-span-6 md:col-span-4 font-medium text-gray-800 pr-4">
                  {ramo.nombre}
                </div>

                {/* 3. Barra de Progreso (Solo visible en pantallas medianas hacia arriba) */}
                <div className="hidden md:block col-span-5 pr-8">
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(ramo.interesados)}`}
                      style={{ width: `${(ramo.interesados / maxInteresados) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* 4. Cantidad Numérica */}
                <div className="col-span-4 md:col-span-2 flex justify-end items-center gap-2">
                  <span className="text-lg font-bold text-gray-700">{ramo.interesados}</span>
                  {/* Icono de estado pequeño */}
                  {ramo.interesados >= 10 ? (
                    <AlertCircle size={16} className="text-red-500" />
                  ) : (
                    <CheckCircle size={16} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};