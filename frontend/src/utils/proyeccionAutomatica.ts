type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string[];
  veces_cursado: number;
};

type SemestreProyectado = {
  numero: number;
  asignaturas: string[];
  creditos: number;
};

const MAX_CREDITOS_POR_SEMESTRE = 32;
const MAX_DISPERSION_NIVELES = 3;

export function calcularProyeccionAutomatica(
  progreso: Asignatura[]
): SemestreProyectado[] {
  
  // 1. Filtrar asignaturas pendientes (no aprobadas)
  const pendientes = progreso.filter(
    asig => asig.estado !== 'APROBADO'
  );

  if (pendientes.length === 0) {
    return []; // Ya terminó la carrera
  }

  // 2. Crear mapa de asignaturas aprobadas
  const aprobadas = new Set(
    progreso
      .filter(asig => asig.estado === 'APROBADO')
      .map(asig => asig.codigo)
  );

  // 3. Crear mapa de asignaturas por código para fácil acceso
  const mapaAsignaturas = new Map(
    progreso.map(asig => [asig.codigo, asig])
  );

  // 4. NUEVO: Crear conjunto de todos los códigos que existen en la malla
  const codigosExistentes = new Set(progreso.map(asig => asig.codigo));

  // 5. NUEVO: Limpiar prerequisitos inválidos (que no existen en la malla)
  pendientes.forEach(asig => {
    asig.prereq = asig.prereq.filter(prereq => {
      const existe = codigosExistentes.has(prereq);
      if (!existe) {
        console.warn(`⚠️ Prerequisito inválido: ${prereq} no existe en la malla (requerido por ${asig.codigo})`);
      }
      return existe;
    });
  });

  const semestres: SemestreProyectado[] = [];
  let asignaturasRestantes = [...pendientes];
  let numeroSemestre = 1;

  while (asignaturasRestantes.length > 0) {
    const semestreActual: string[] = [];
    let creditosActuales = 0;

    // 6. Calcular nivel mínimo de las asignaturas restantes
    const nivelMinimo = Math.min(...asignaturasRestantes.map(a => a.nivel));

    // 7. Filtrar asignaturas disponibles (prerequisitos cumplidos)
    const disponibles = asignaturasRestantes.filter(asig => {
      return asig.prereq.every(prereq => aprobadas.has(prereq));
    });

    if (disponibles.length === 0 && asignaturasRestantes.length > 0) {
      console.error('❌ No hay asignaturas disponibles pero quedan pendientes');
      console.error('📋 Asignaturas restantes:', asignaturasRestantes.map(a => ({
        codigo: a.codigo,
        nombre: a.asignatura,
        prereq: a.prereq,
        prereqFaltantes: a.prereq.filter(p => !aprobadas.has(p))
      })));
      
      // NUEVO: Intentar forzar al menos una asignatura con menos prerequisitos faltantes
      const conMenosPrereq = [...asignaturasRestantes].sort((a, b) => {
        const faltantesA = a.prereq.filter(p => !aprobadas.has(p)).length;
        const faltantesB = b.prereq.filter(p => !aprobadas.has(p)).length;
        return faltantesA - faltantesB;
      });
      
      if (conMenosPrereq[0]) {
        console.warn('Forzando asignatura con menos prerequisitos faltantes:', conMenosPrereq[0].codigo);
        semestreActual.push(conMenosPrereq[0].codigo);
        creditosActuales += conMenosPrereq[0].creditos;
        aprobadas.add(conMenosPrereq[0].codigo);
        
        semestres.push({
          numero: numeroSemestre,
          asignaturas: semestreActual,
          creditos: creditosActuales,
        });
        
        asignaturasRestantes = asignaturasRestantes.filter(
          asig => !semestreActual.includes(asig.codigo)
        );
        numeroSemestre++;
        continue;
      } else {
        break;
      }
    }

    // 8. Priorizar asignaturas según las reglas
    const priorizadas = priorizarAsignaturas(
      disponibles,
      nivelMinimo,
      aprobadas
    );

    // 9. Seleccionar asignaturas para el semestre
    for (const asig of priorizadas) {
      if (creditosActuales + asig.creditos <= MAX_CREDITOS_POR_SEMESTRE) {
        semestreActual.push(asig.codigo);
        creditosActuales += asig.creditos;
        aprobadas.add(asig.codigo); // Simular que se aprobará
      }
    }

    if (semestreActual.length === 0) {
      console.error('No se pudo agregar ninguna asignatura al semestre');
      break;
    }

    semestres.push({
      numero: numeroSemestre,
      asignaturas: semestreActual,
      creditos: creditosActuales,
    });

    // 10. Remover asignaturas seleccionadas
    asignaturasRestantes = asignaturasRestantes.filter(
      asig => !semestreActual.includes(asig.codigo)
    );

    numeroSemestre++;

    // Protección contra loops infinitos
    if (numeroSemestre > 20) {
      console.error('Proyección excede 20 semestres, deteniendo...');
      break;
    }
  }

  return semestres;
}

function priorizarAsignaturas(
  disponibles: Asignatura[],
  nivelMinimo: number,
  aprobadas: Set<string>
): Asignatura[] {
  
  return disponibles.sort((a, b) => {
    // PRIORIDAD 1: Asignaturas con 3+ intentos (OBLIGATORIO siguiente semestre)
    if (a.veces_cursado >= 3 && b.veces_cursado < 3) return -1;
    if (b.veces_cursado >= 3 && a.veces_cursado < 3) return 1;

    // PRIORIDAD 2: Dispersión máxima de 3 niveles
    // Si hay un ramo de nivel bajo y el mínimo es alto, priorizarlo
    const dispersoA = a.nivel < nivelMinimo + MAX_DISPERSION_NIVELES;
    const dispersoB = b.nivel < nivelMinimo + MAX_DISPERSION_NIVELES;
    
    if (dispersoA && !dispersoB) return -1;
    if (!dispersoA && dispersoB) return 1;

    // PRIORIDAD 3: Por cantidad de prerequisitos cumplidos
    // (Más prerequisitos = más avanzado en la malla)
    const prereqA = a.prereq.length;
    const prereqB = b.prereq.length;
    if (prereqA !== prereqB) return prereqB - prereqA;

    // PRIORIDAD 4: Por nivel (menor nivel primero)
    if (a.nivel !== b.nivel) return a.nivel - b.nivel;

    // PRIORIDAD 5: Por créditos (más créditos primero para optimizar)
    return b.creditos - a.creditos;
  });
}

// Función para validar si una asignatura puede agregarse a un semestre
export function puedeAgregarAsignatura(
  codigoAsignatura: string,
  semestreDestino: SemestreProyectado,
  progreso: Asignatura[],
  semestresProyectados: SemestreProyectado[],
  numeroSemestreDestino: number
): { valido: boolean; razon?: string } {
  
  const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
  if (!asignatura) {
    return { valido: false, razon: 'Asignatura no encontrada' };
  }

  // Ya está aprobada
  if (asignatura.estado === 'APROBADO') {
    return { valido: false, razon: 'Ya aprobaste esta asignatura' };
  }

  // Verificar créditos (sin contar la asignatura si ya está en el semestre)
  const yaEstaEnSemestre = semestreDestino.asignaturas.includes(codigoAsignatura);
  const creditosActuales = yaEstaEnSemestre 
    ? semestreDestino.creditos 
    : semestreDestino.creditos + asignatura.creditos;
    
  if (creditosActuales > MAX_CREDITOS_POR_SEMESTRE) {
    return { 
      valido: false, 
      razon: `Excede límite de ${MAX_CREDITOS_POR_SEMESTRE} créditos (quedarían ${creditosActuales})` 
    };
  }

  // ====== VALIDACIÓN 1: PREREQUISITOS (hacia atrás) ======
  const aprobadas = new Set(
    progreso
      .filter(a => a.estado === 'APROBADO')
      .map(a => a.codigo)
  );

  // Agregar asignaturas de semestres anteriores en la proyección
  for (let i = 0; i < semestresProyectados.length; i++) {
    if (semestresProyectados[i].numero < numeroSemestreDestino) {
      semestresProyectados[i].asignaturas.forEach(cod => {
        if (cod !== codigoAsignatura) { // No contar la misma asignatura
          aprobadas.add(cod);
        }
      });
    }
  }

  const prerequisitosFaltantes = asignatura.prereq.filter(
    prereq => !aprobadas.has(prereq)
  );

  if (prerequisitosFaltantes.length > 0) {
    return { 
      valido: false, 
      razon: `Falta(n) prerequisito(s): ${prerequisitosFaltantes.join(', ')}` 
    };
  }

  // ====== VALIDACIÓN 2: POSTREQUISITOS (hacia adelante) ======
  // Buscar todas las asignaturas que tienen a esta como prerequisito
  const asignaturasQueDependenDeEsta = progreso.filter(a => 
    a.prereq.includes(codigoAsignatura)
  );

  // Verificar si alguna de esas asignaturas está en semestres anteriores o igual
  for (const dependiente of asignaturasQueDependenDeEsta) {
    for (const semestre of semestresProyectados) {
      if (semestre.asignaturas.includes(dependiente.codigo)) {
        // Si la asignatura dependiente está en un semestre anterior o igual al destino
        if (semestre.numero <= numeroSemestreDestino) {
          const nombreDependiente = dependiente.asignatura;
          return {
            valido: false,
            razon: `No puedes mover aquí porque "${nombreDependiente}" (semestre ${semestre.numero}) depende de esta asignatura`
          };
        }
      }
    }
  }

  // ====== VALIDACIÓN 3: DISPERSIÓN DE NIVELES ======
  const nivelMinimo = Math.min(
    ...progreso
      .filter(a => a.estado !== 'APROBADO')
      .map(a => a.nivel)
  );

  if (asignatura.nivel > nivelMinimo + MAX_DISPERSION_NIVELES) {
    return { 
      valido: false, 
      razon: `Excede dispersión máxima de ${MAX_DISPERSION_NIVELES} niveles` 
    };
  }

  return { valido: true };
}