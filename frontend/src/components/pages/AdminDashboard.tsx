import { useEffect, useState } from 'react';
import { BarChart2, AlertCircle, CheckCircle, RefreshCw, Filter } from 'lucide-react';
import { obtenerCarrerasDashboard, obtenerEstadisticas } from '../../services/adminService';

type EstadisticaRamo = {
  codigo: string;
  nombre: string;
  interesados: number;
};

type CarreraOption = {
  codigo: string;
  nombre: string;
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState<EstadisticaRamo[]>([]);
  const [carreras, setCarreras] = useState<CarreraOption[]>([]); 
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<string>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Cargar lista de carreras al inicio
  useEffect(() => {
    const cargarCarreras = async () => {
      try {
        const data = await obtenerCarrerasDashboard();
        setCarreras(data);
      } catch (err) {
        console.error("Error cargando carreras:", err);
      }
    };
    cargarCarreras();
  }, []);

  // 2. Cargar estadísticas cuando cambia el filtro
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerEstadisticas(carreraSeleccionada);
      setStats(data);
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [carreraSeleccionada]);

  // Cálculos visuales
  const maxInteresados = Math.max(...stats.map(s => s.interesados), 1);
  const getBarColor = (val: number) => val >= 10 ? 'bg-red-500' : val >= 5 ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Demanda Académica</h2>
            <p className="text-gray-500">Proyección de solicitudes para el próximo semestre.</p>
          </div>
          <button onClick={fetchStats} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Recargar">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* SELECTOR DE CARRERA (Dinámico) */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <Filter size={20} />
            <span>Filtrar por Carrera:</span>
          </div>
          <select
            value={carreraSeleccionada}
            onChange={(e) => setCarreraSeleccionada(e.target.value)}
            className="flex-1 max-w-md bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="general">🌍 Vista General (Todas)</option>
            {carreras.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {/* CAMBIO APLICADO: Mostrar Nombre (Código) */}
                {c.nombre} ({c.codigo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTENIDO (Tabla o Mensajes) */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-blue-600 font-medium">Analizando datos...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 flex flex-col items-center">
          <p className="flex items-center gap-2 font-bold"><AlertCircle /> {error}</p>
          <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md">Reintentar</button>
        </div>
      ) : stats.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500 font-medium">Sin datos para mostrar.</p>
          <p className="text-sm text-gray-400">Nadie ha guardado proyecciones favoritas en esta categoría aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 p-4 text-xs font-semibold text-gray-500 uppercase border-b">
            <div className="col-span-2">Código</div>
            <div className="col-span-6 md:col-span-5">Asignatura</div>
            <div className="hidden md:block col-span-4">Demanda</div>
            <div className="col-span-4 md:col-span-1 text-right">Cant.</div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.map((ramo) => (
              <div key={ramo.codigo} className="grid grid-cols-12 p-4 items-center hover:bg-gray-50 group">
                <div className="col-span-2 font-mono text-sm text-gray-400">{ramo.codigo}</div>
                <div className="col-span-6 md:col-span-5 font-medium text-gray-800 pr-2 truncate">{ramo.nombre}</div>
                <div className="hidden md:block col-span-4 pr-6">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(ramo.interesados)}`} style={{ width: `${(ramo.interesados / maxInteresados) * 100}%` }}></div>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-1 text-right font-bold text-gray-700">{ramo.interesados}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};