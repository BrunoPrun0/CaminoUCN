// src/contexts/MallaContext.tsx
import { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { obtenerMalla } from '../services/apiExternaService';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string[];
  veces_cursado: number;
};

type MallaContextType = {
  progreso: Asignatura[];
  asignaturasPorSemestre: Record<number, Asignatura[]>;
  carreraSeleccionada: { codigo: string; nombre: string; catalogo: string } | null;
  setCarreraSeleccionada: (carrera: { codigo: string; nombre: string; catalogo: string } | null) => void;
  loading: boolean;
  error: string | null;
  recargarMalla: () => Promise<void>;
};

const MallaContext = createContext<MallaContextType | undefined>(undefined);

export function MallaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [progreso, setProgreso] = useState<Asignatura[]>([]);
  const [asignaturasPorSemestre, setAsignaturasPorSemestre] = useState<Record<number, Asignatura[]>>({});
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<{ codigo: string; nombre: string; catalogo: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

   // Función para cargar la malla
  const cargarMalla = async (carrera: { codigo: string; nombre: string; catalogo: string }) => {
    if (!usuario) return;

    setLoading(true);
    setError(null);

    try {
      const data = await obtenerMalla(carrera.codigo, carrera.catalogo, usuario.rut);
      
      // 🔍 DEBUG PASO 1: Ver estructura completa de datos
      console.log('=== DEBUG INICIO ===');
      console.log('1️⃣ Datos completos del API:', data);
      console.log('2️⃣ ¿Tiene campo inscripciones?:', 'inscripciones' in data);
      console.log('3️⃣ Tipo de inscripciones:', typeof data.inscripciones);
      console.log('4️⃣ ¿Es array?:', Array.isArray(data.inscripciones));
      
      if (data.inscripciones) {
        console.log('5️⃣ Cantidad de inscripciones:', data.inscripciones.length);
        console.log('6️⃣ Primera inscripción (ejemplo):', data.inscripciones[0]);
        console.log('7️⃣ Campos de la primera inscripción:', Object.keys(data.inscripciones[0] || {}));
      } else {
        console.log('❌ NO HAY CAMPO INSCRIPCIONES EN LA RESPUESTA');
      }
      
      // Contar las veces que cada curso fue cursado (excluyendo los excluded)
      const conteoInscripciones: Record<string, number> = {};
      
      if (data.inscripciones && Array.isArray(data.inscripciones)) {
        console.log('8️⃣ Procesando inscripciones...');
        
        data.inscripciones.forEach((inscripcion: any, index: number) => {
          // Debug cada inscripción
          if (index < 3) { // Solo las primeras 3 para no saturar la consola
            console.log(`   Inscripción ${index}:`, {
              course: inscripcion.course,
              excluded: inscripcion.excluded,
              status: inscripcion.status,
              period: inscripcion.period
            });
          }
          
          // Solo contar inscripciones no excluidas
          if (!inscripcion.excluded) {
            const codigo = inscripcion.course;
            conteoInscripciones[codigo] = (conteoInscripciones[codigo] || 0) + 1;
          }
        });
      } else {
        console.log('❌ inscripciones NO es un array válido');
      }
      
      console.log('9️⃣ Conteo final de inscripciones:', conteoInscripciones);
      
      // Ver cuántas asignaturas tienen veces_cursado > 0
      const asignaturasConVarias = Object.entries(conteoInscripciones)
        .filter(([_, count]) => count > 0)
        .map(([codigo, count]) => ({ codigo, count }));
      
      console.log('🔟 Asignaturas cursadas (al menos 1 vez):', asignaturasConVarias);

      // Actualizar el progreso con las veces cursado
      const progresoActualizado = data.progreso.map((asig: Asignatura) => {
        const veces = conteoInscripciones[asig.codigo] || 0;
        
        // Debug para las primeras asignaturas
        if (veces > 0) {
          console.log(`   ✅ ${asig.codigo} (${asig.asignatura}): ${veces} veces`);
        }
        
        return {
          ...asig,
          veces_cursado: veces
        };
      });
      
      console.log('1️⃣1️⃣ Progreso actualizado (primeras 5):', progresoActualizado.slice(0, 5));
      console.log('1️⃣2️⃣ Asignaturas con veces_cursado > 0:', 
        progresoActualizado.filter(a => a.veces_cursado > 0)
      );
      console.log('=== DEBUG FIN ===');

      setProgreso(progresoActualizado);

      const agrupadas = progresoActualizado.reduce(
        (acc: Record<number, Asignatura[]>, asig: Asignatura) => {
          const nivel = asig.nivel;
          if (!acc[nivel]) acc[nivel] = [];
          acc[nivel].push(asig);
          return acc;
        },
        {} as Record<number, Asignatura[]>
      );

      setAsignaturasPorSemestre(agrupadas);
    } catch (err) {
      console.error('❌ Error al obtener progreso:', err);
      setError('Error al cargar la malla curricular');
    } finally {
      setLoading(false);
    }
  };

  // Función para recargar manualmente
  const recargarMalla = async () => {
    if (carreraSeleccionada) {
      await cargarMalla(carreraSeleccionada);
    }
  };

  // Seleccionar automáticamente la primera carrera si solo hay una
  useEffect(() => {
    if (usuario && usuario.carreras.length === 1 && !carreraSeleccionada) {
      setCarreraSeleccionada(usuario.carreras[0]);
    }
  }, [usuario, carreraSeleccionada]);

  // Cargar la malla cuando se selecciona una carrera
  useEffect(() => {
    if (carreraSeleccionada && usuario) {
      cargarMalla(carreraSeleccionada);
    }
  }, [carreraSeleccionada, usuario]);

  // Limpiar datos cuando el usuario cierra sesión
  useEffect(() => {
    if (!usuario) {
      setProgreso([]);
      setAsignaturasPorSemestre({});
      setCarreraSeleccionada(null);
      setError(null);
    }
  }, [usuario]);

  return (
    <MallaContext.Provider
      value={{
        progreso,
        asignaturasPorSemestre,
        carreraSeleccionada,
        setCarreraSeleccionada,
        loading,
        error,
        recargarMalla,
      }}
    >
      {children}
    </MallaContext.Provider>
  );
}

export function useMalla() {
  const context = useContext(MallaContext);
  if (context === undefined) {
    throw new Error('useMalla debe usarse dentro de un MallaProvider');
  }
  return context;
}