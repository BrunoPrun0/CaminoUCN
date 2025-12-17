import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useMalla } from './MallaContext';
import { calcularProyeccionAutomatica, puedeAgregarAsignatura } from '../utils/proyeccionAutomatica';
import * as proyeccionService from '../services/proyeccionesService';


type SemestreProyectado = {
  numero: number;
  asignaturas: string[];
  creditos: number;
};

type SemestreGuardado = {
  numero: number;
  courses: {
    courseApiId: string;
    credits: number;
  }[];
  creditos: number;
};

type ProyeccionGuardada = {
  id: number;
  name: string;
  isFavorite: boolean;
  isAutomatic: boolean;
  semesters: SemestreGuardado[];
  createdAt: string;
  updatedAt: string;
};

type ProyeccionContextType = {
  // Proyección automática
  proyeccionAutomatica: SemestreProyectado[];
  calcularAutomatica: () => void;
  
  // Proyección manual
  proyeccionManual: SemestreProyectado[];
  setProyeccionManual: (proyeccion: SemestreProyectado[]) => void;
  moverAsignatura: (
    codigoAsignatura: string,
    semestreOrigen: number,
    semestreDestino: number
  ) => { exito: boolean; mensaje?: string };
  removerAsignaturaDeSemestre: (    
    codigoAsignatura: string,
    semestreOrigen: number
  ) => { exito: boolean; mensaje?: string };
  agregarAsignaturaASemestre: (     
    codigoAsignatura: string,
    semestreDestino: number
  ) => { exito: boolean; mensaje?: string };
  agregarSemestre: () => void;
  eliminarSemestre: (numero: number) => void;
  
  // Proyecciones guardadas
  proyeccionesGuardadas: ProyeccionGuardada[];
  proyeccionSeleccionada: ProyeccionGuardada | null;
  cargarProyeccion: (id: number) => Promise<void>;
  guardarProyeccion: (nombre: string, esFavorita: boolean, esAutomatica: boolean) => Promise<void>;
  eliminarProyeccionGuardada: (id: number) => Promise<void>;
  marcarFavorita: (id: number) => Promise<void>;
  recargarProyecciones: () => Promise<void>;
  
  loading: boolean;
  error: string | null;
};

const ProyeccionContext = createContext<ProyeccionContextType | undefined>(undefined);

export function ProyeccionProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const { progreso, carreraSeleccionada } = useMalla();
  
  const [proyeccionAutomatica, setProyeccionAutomatica] = useState<SemestreProyectado[]>([]);
  const [proyeccionManual, setProyeccionManual] = useState<SemestreProyectado[]>([]);
  const [proyeccionesGuardadas, setProyeccionesGuardadas] = useState<ProyeccionGuardada[]>([]);
  const [proyeccionSeleccionada, setProyeccionSeleccionada] = useState<ProyeccionGuardada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular proyección automática
  const calcularAutomatica = () => {
    if (progreso.length === 0) return;
    
    console.log('Calculando proyección automática...');
    const proyeccion = calcularProyeccionAutomatica(progreso);
    setProyeccionAutomatica(proyeccion);
    
    // Inicializar proyección manual con la automática
    if (proyeccionManual.length === 0) {
      setProyeccionManual(proyeccion);
    }
    setProyeccionManual(proyeccion);
  };

  // Mover asignatura en proyección manual
  const moverAsignatura = (
    codigoAsignatura: string,
    semestreOrigen: number,
    semestreDestino: number
  ): { exito: boolean; mensaje?: string } => {
    
    const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
    if (!asignatura) {
      return { exito: false, mensaje: 'Asignatura no encontrada' };
    }

    // Crear copia de la proyección manual
    const nuevaProyeccion = [...proyeccionManual];
    
    // Encontrar semestre origen y destino
    const semOrigen = nuevaProyeccion.find(s => s.numero === semestreOrigen);
    const semDestino = nuevaProyeccion.find(s => s.numero === semestreDestino);
    
    if (!semOrigen || !semDestino) {
      return { exito: false, mensaje: 'Semestre no encontrado' };
    }

    // Validar si se puede mover
    const validacion = puedeAgregarAsignatura(
      codigoAsignatura,
      semDestino,
      progreso,
      nuevaProyeccion,
      semestreDestino
    );

    if (!validacion.valido) {
      return { exito: false, mensaje: validacion.razon };
    }

    // Realizar el movimiento
    semOrigen.asignaturas = semOrigen.asignaturas.filter(c => c !== codigoAsignatura);
    semOrigen.creditos -= asignatura.creditos;
    
    semDestino.asignaturas.push(codigoAsignatura);
    semDestino.creditos += asignatura.creditos;

    setProyeccionManual(nuevaProyeccion);
    return { exito: true };
  };

  // Agregar nuevo semestre
  const agregarSemestre = () => {
    const nuevoNumero = proyeccionManual.length > 0 
      ? Math.max(...proyeccionManual.map(s => s.numero)) + 1 
      : 1;
    
    setProyeccionManual([
      ...proyeccionManual,
      { numero: nuevoNumero, asignaturas: [], creditos: 0 }
    ]);
  };

  // Eliminar semestre
  const eliminarSemestre = (numero: number) => {
    // No permitir eliminar si tiene asignaturas
    const semestre = proyeccionManual.find(s => s.numero === numero);
    if (semestre && semestre.asignaturas.length > 0) {
      setError('No puedes eliminar un semestre con asignaturas');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setProyeccionManual(proyeccionManual.filter(s => s.numero !== numero));
  };

  // Cargar proyecciones guardadas
  const recargarProyecciones = async () => {
    if (!usuario || !carreraSeleccionada) return;

    setLoading(true);
    setError(null);

    try {
      const proyecciones = await proyeccionService.obtenerProyecciones(
        usuario.rut,
        carreraSeleccionada.codigo
      );
      
      // Convertir el formato del backend al formato esperado
      const proyeccionesConvertidas: ProyeccionGuardada[] = proyecciones.map(p => ({
        ...p,
        semesters: p.semesters.map(sem => ({
          numero: sem.numero,
          courses: sem.courses,
          creditos: sem.courses.reduce((sum, c) => sum + c.credits, 0)
        }))
      }));
      
      setProyeccionesGuardadas(proyeccionesConvertidas);
    } catch (err) {
      console.error('Error al cargar proyecciones:', err);
      setError('Error al cargar proyecciones guardadas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar una proyección específica
  const cargarProyeccion = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const proyeccion = await proyeccionService.obtenerProyeccion(id);
      
      // Convertir formato del backend al formato del frontend
      const semestres: SemestreProyectado[] = proyeccion.semesters.map(sem => ({
        numero: sem.numero,
        asignaturas: sem.courses.map(c => c.courseApiId),
        creditos: sem.courses.reduce((sum, c) => sum + c.credits, 0)
      }));

      setProyeccionManual(semestres);
      
      // Convertir y guardar la proyección seleccionada
      const proyeccionConvertida: ProyeccionGuardada = {
        ...proyeccion,
        semesters: proyeccion.semesters.map(sem => ({
          numero: sem.numero,
          courses: sem.courses,
          creditos: sem.courses.reduce((sum, c) => sum + c.credits, 0)
        }))
      };
      
      setProyeccionSeleccionada(proyeccionConvertida);
    } catch (err) {
      console.error('Error al cargar proyección:', err);
      setError('Error al cargar proyección');
    } finally {
      setLoading(false);
    }
  };

  const removerAsignaturaDeSemestre = (
  codigoAsignatura: string,
  semestreOrigen: number
): { exito: boolean; mensaje?: string } => {
  const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
  if (!asignatura) {
    return { exito: false, mensaje: 'Asignatura no encontrada' };
  }

  const nuevaProyeccion = [...proyeccionManual];
  const semOrigen = nuevaProyeccion.find(s => s.numero === semestreOrigen);
  
  if (!semOrigen) {
    return { exito: false, mensaje: 'Semestre no encontrado' };
  }

  // Remover la asignatura
  semOrigen.asignaturas = semOrigen.asignaturas.filter(c => c !== codigoAsignatura);
  semOrigen.creditos -= asignatura.creditos;

  setProyeccionManual(nuevaProyeccion);
  return { exito: true };
};

// Agregar asignatura a un semestre (desde el cajón)
const agregarAsignaturaASemestre = (
  codigoAsignatura: string,
  semestreDestino: number
): { exito: boolean; mensaje?: string } => {
  const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
  if (!asignatura) {
    return { exito: false, mensaje: 'Asignatura no encontrada' };
  }

  const nuevaProyeccion = [...proyeccionManual];
  const semDestino = nuevaProyeccion.find(s => s.numero === semestreDestino);
  
  if (!semDestino) {
    return { exito: false, mensaje: 'Semestre no encontrado' };
  }

  // Validar si se puede agregar
  const validacion = puedeAgregarAsignatura(
    codigoAsignatura,
    semDestino,
    progreso,
    nuevaProyeccion,
    semestreDestino
  );

  if (!validacion.valido) {
    return { exito: false, mensaje: validacion.razon };
  }

  // Agregar la asignatura
  semDestino.asignaturas.push(codigoAsignatura);
  semDestino.creditos += asignatura.creditos;

  setProyeccionManual(nuevaProyeccion);
  return { exito: true };
};

  // Guardar proyección
  const guardarProyeccion = async (nombre: string, esFavorita: boolean, esAutomatica: boolean) => {
    if (!usuario || !carreraSeleccionada) return;

    setLoading(true);
    setError(null);

    try {
      const proyeccionAGuardar = esAutomatica ? proyeccionAutomatica : proyeccionManual;
      
     const semesters = proyeccionAGuardar.map(sem => ({
        numero: sem.numero,
        courses: sem.asignaturas.map(codigo => {
          const asig = progreso.find(a => a.codigo === codigo);
          
          return {
            courseApiId: codigo,
            nombre: asig?.asignatura || codigo, 
            credits: asig?.creditos || 0
          };
        })
      }));

      const payload = {
        rut: usuario.rut,
        careerCode: carreraSeleccionada.codigo,
        catalogCode: carreraSeleccionada.catalogo,
        name: nombre,
        studentName: undefined, 
        studentEmail: undefined, 
        isFavorite: esFavorita,
        isAutomatic: esAutomatica,
        semesters
      };

      await proyeccionService.crearProyeccion(payload);
      await recargarProyecciones();
    } catch (err: any) {
      console.error('Error al guardar proyección:', err);
      setError(err.message || 'Error al guardar proyección');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  

  // Eliminar proyección
  const eliminarProyeccionGuardada = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await proyeccionService.eliminarProyeccion(id);
      await recargarProyecciones();
      
      if (proyeccionSeleccionada?.id === id) {
        setProyeccionSeleccionada(null);
      }
    } catch (err) {
      console.error('Error al eliminar proyección:', err);
      setError('Error al eliminar proyección');
    } finally {
      setLoading(false);
    }
  };

  // Marcar como favorita
  const marcarFavorita = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await proyeccionService.marcarComoFavorita(id);
      await recargarProyecciones();
    } catch (err) {
      console.error('Error al marcar favorita:', err);
      setError('Error al marcar como favorita');
    } finally {
      setLoading(false);
    }
  };

  // Calcular automática cuando cambie el progreso
  useEffect(() => {
    if (progreso.length > 0 && carreraSeleccionada) {
      calcularAutomatica();
    }
  }, [progreso, carreraSeleccionada]);

  // CRÍTICO: Limpiar proyecciones cuando cambia la carrera
  useEffect(() => {
    if (usuario && carreraSeleccionada) {
      // Limpiar estados antes de cargar nueva carrera
      setProyeccionManual([]);
      setProyeccionAutomatica([]);
      setProyeccionSeleccionada(null);
      
      // Cargar proyecciones de la nueva carrera
      recargarProyecciones();
    }
  }, [usuario, carreraSeleccionada?.codigo]); // Depender del código específico

  // Limpiar cuando se cierra sesión
  useEffect(() => {
    if (!usuario) {
      setProyeccionAutomatica([]);
      setProyeccionManual([]);
      setProyeccionesGuardadas([]);
      setProyeccionSeleccionada(null);
      setError(null);
    }
  }, [usuario]);

  return (
    <ProyeccionContext.Provider
      value={{
        proyeccionAutomatica,
        calcularAutomatica,
        proyeccionManual,
        setProyeccionManual,
        moverAsignatura,
        removerAsignaturaDeSemestre,  // ← AGREGAR
      agregarAsignaturaASemestre,
        agregarSemestre,
        eliminarSemestre,
        proyeccionesGuardadas,
        proyeccionSeleccionada,
        cargarProyeccion,
        guardarProyeccion,
        eliminarProyeccionGuardada,
        marcarFavorita,
        recargarProyecciones,
        loading,
        error,
      }}
    >
      {children}
    </ProyeccionContext.Provider>
  );
}

export function useProyeccion() {
  const context = useContext(ProyeccionContext);
  if (context === undefined) {
    throw new Error('useProyeccion debe usarse dentro de un ProyeccionProvider');
  }
  return context;
}