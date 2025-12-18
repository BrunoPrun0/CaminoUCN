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
const CAPSTONE_CODE = 'ECIN-0100';
const CAPSTONE_NAME = 'Capstone Project';

// Función auxiliar para verificar si una asignatura es Capstone
function esCapstone(asignatura: Asignatura): boolean {
  return asignatura.codigo === CAPSTONE_CODE || 
         asignatura.asignatura === CAPSTONE_NAME ||
         asignatura.asignatura.toLowerCase().includes('capstone project');
}

export function calcularProyeccionAutomatica(
  progreso: Asignatura[]
): SemestreProyectado[] {
  const pendientes = progreso.filter((asig) => asig.estado !== 'APROBADO' && asig.estado!== 'INSCRITO');

  if (pendientes.length === 0) {
    return [];
  }

  // Identificar capstone y separarlo para asignarlo al final
  const capstone = pendientes.find((a) => esCapstone(a));
  let asignaturasRestantes = pendientes.filter((a) => !esCapstone(a));

  const aprobadas = new Set(
    progreso
      .filter((asig) => asig.estado === 'APROBADO' || asig.estado === 'INSCRITO')
      .map((asig) => asig.codigo)
  );

  const mapaAsignaturas = new Map(progreso.map((asig) => [asig.codigo, asig]));
  const codigosExistentes = new Set(progreso.map((asig) => asig.codigo));

  asignaturasRestantes.forEach((asig) => {
    asig.prereq = asig.prereq.filter((prereq) => codigosExistentes.has(prereq));
  });
  if (capstone) {
    capstone.prereq = capstone.prereq.filter((p) => codigosExistentes.has(p));
  }

  const semestres: SemestreProyectado[] = [];
  let numeroSemestre = 1;

  while (asignaturasRestantes.length > 0) {
    const semestreActual: string[] = [];
    let creditosActuales = 0;

    const nivelMinimo = Math.min(...asignaturasRestantes.map((a) => a.nivel));

    const disponibles = asignaturasRestantes.filter((asig) =>
      asig.prereq.every((prereq) => aprobadas.has(prereq))
    );

    if (disponibles.length === 0 && asignaturasRestantes.length > 0) {
      const conMenosPrereq = [...asignaturasRestantes].sort((a, b) => {
        const faltA = a.prereq.filter((p) => !aprobadas.has(p)).length;
        const faltB = b.prereq.filter((p) => !aprobadas.has(p)).length;
        return faltA - faltB;
      });

      if (conMenosPrereq[0]) {
        semestreActual.push(conMenosPrereq[0].codigo);
        creditosActuales += conMenosPrereq[0].creditos;
        aprobadas.add(conMenosPrereq[0].codigo);

        semestres.push({
          numero: numeroSemestre,
          asignaturas: semestreActual,
          creditos: creditosActuales,
        });

        asignaturasRestantes = asignaturasRestantes.filter(
          (asig) => !semestreActual.includes(asig.codigo)
        );
        numeroSemestre++;
        continue;
      } else {
        break;
      }
    }

    const priorizadas = priorizarAsignaturas(
      disponibles,
      nivelMinimo,
      aprobadas,
      semestreActual
    );

    for (const asig of priorizadas) {
      const nivelesActuales = semestreActual.map((cod) => {
        const a = mapaAsignaturas.get(cod);
        return a ? a.nivel : 0;
      });

      if (nivelesActuales.length > 0) {
        const maxNivel = Math.max(...nivelesActuales);
        const minNivel = Math.min(...nivelesActuales);
        const dispersoConNuevo =
          Math.max(maxNivel, asig.nivel) - Math.min(minNivel, asig.nivel);

        if (dispersoConNuevo > MAX_DISPERSION_NIVELES) {
          continue;
        }
      }

      if (creditosActuales + asig.creditos <= MAX_CREDITOS_POR_SEMESTRE) {
        semestreActual.push(asig.codigo);
        creditosActuales += asig.creditos;
        aprobadas.add(asig.codigo);
      }
    }

    if (semestreActual.length === 0) {
      break;
    }

    semestres.push({
      numero: numeroSemestre,
      asignaturas: semestreActual,
      creditos: creditosActuales,
    });

    asignaturasRestantes = asignaturasRestantes.filter(
      (asig) => !semestreActual.includes(asig.codigo)
    );

    numeroSemestre++;

    if (numeroSemestre > 20) {
      break;
    }
  }

  // Agregar capstone al final SOLO si ya se completaron todos los demás ramos
  if (capstone && !aprobadas.has(capstone.codigo)) {
    // Verificar que TODOS los ramos (excepto capstone) estén aprobados
    const todosLosRamos = progreso.filter((a) => !esCapstone(a));
    const todosAprobados = todosLosRamos.every(
      (a) => aprobadas.has(a.codigo) || a.estado === 'APROBADO'
    );

    if (todosAprobados) {
      semestres.push({
        numero: numeroSemestre,
        asignaturas: [capstone.codigo],
        creditos: capstone.creditos,
      });
    }
  }

  return semestres;
}

function priorizarAsignaturas(
  disponibles: Asignatura[],
  nivelMinimo: number,
  aprobadas: Set<string>,
  semestreActual: string[]
): Asignatura[] {
  return disponibles.sort((a, b) => {
    if (a.veces_cursado >= 3 && b.veces_cursado < 3) return -1;
    if (b.veces_cursado >= 3 && a.veces_cursado < 3) return 1;

    const dispersoA = a.nivel < nivelMinimo + MAX_DISPERSION_NIVELES;
    const dispersoB = b.nivel < nivelMinimo + MAX_DISPERSION_NIVELES;

    if (dispersoA && !dispersoB) return -1;
    if (!dispersoA && dispersoB) return 1;

    const prereqA = a.prereq.length;
    const prereqB = b.prereq.length;
    if (prereqA !== prereqB) return prereqB - prereqA;

    if (a.nivel !== b.nivel) return a.nivel - b.nivel;

    return b.creditos - a.creditos;
  });
}

export function puedeAgregarAsignatura(
  codigoAsignatura: string,
  semestreDestino: SemestreProyectado,
  progreso: Asignatura[],
  semestresProyectados: SemestreProyectado[],
  numeroSemestreDestino: number
): { valido: boolean; razon?: string } {
  const asignatura = progreso.find((a) => a.codigo === codigoAsignatura);
  if (!asignatura) {
    return { valido: false, razon: 'Asignatura no encontrada' };
  }

  if (asignatura.estado === 'APROBADO') {
    return { valido: false, razon: 'Ya aprobaste esta asignatura' };
  }

  //  DEBE ir solo en el último semestre
  const esAsignaturaCapstone = esCapstone(asignatura);
  
  if (esAsignaturaCapstone) {
    // No puede haber otro capstone ya planificado
    const yaPlanificado = semestresProyectados.some((s) =>
      s.asignaturas.some((cod) => {
        const asig = progreso.find((a) => a.codigo === cod);
        return asig && esCapstone(asig);
      })
    );
    
    const semestreContieneCapstone = semestreDestino.asignaturas.some((cod) => {
      const asig = progreso.find((a) => a.codigo === cod);
      return asig && esCapstone(asig);
    });
    
    if (yaPlanificado && !semestreContieneCapstone) {
      return { valido: false, razon: 'El Capstone Project ya está planificado' };
    }

    //  Capstone debe ir completamente solo en su semestre
    if (
      semestreDestino.asignaturas.length > 0 &&
      !semestreContieneCapstone
    ) {
      return {
        valido: false,
        razon: 'El Capstone Project debe cursarse solo, sin otros ramos',
      };
    }

    // Verificar que NO haya semestres posteriores con OTROS ramos (no-Capstone)
    const haySemestrePosteriorConOtrosRamos = semestresProyectados.some((s) => {
      if (s.numero <= numeroSemestreDestino) return false;
      
      // Verificar si tiene ramos que NO sean Capstone
      return s.asignaturas.some((cod) => {
        const asig = progreso.find((a) => a.codigo === cod);
        return asig && !esCapstone(asig);
      });
    });

    if (haySemestrePosteriorConOtrosRamos) {
      return {
        valido: false,
        razon: 'El Capstone Project no puede tener otros ramos en semestres posteriores',
      };
    }

    // Verificar que TODOS los demás ramos estén aprobados o planificados antes
    const aprobadas = new Set(
      progreso.filter((a) => a.estado === 'APROBADO').map((a) => a.codigo)
    );

    // Agregar los ramos planificados en semestres anteriores
    for (const semestre of semestresProyectados) {
      if (semestre.numero < numeroSemestreDestino) {
        semestre.asignaturas.forEach((cod) => aprobadas.add(cod));
      }
    }

    // Verificar que todos los ramos (excepto capstone) estén aprobados
    const ramosPendientes = progreso.filter(
      (a) => !esCapstone(a) && 
             !aprobadas.has(a.codigo) && 
             a.estado !== 'APROBADO'
    );

    if (ramosPendientes.length > 0) {
      return {
        valido: false,
        razon: `Debes completar todos los ramos antes de tomar Capstone Project. Pendientes: ${ramosPendientes.length}`,
      };
    }
  }

  // Si el semestre tiene Capstone, no se puede agregar nada más
  const semestreContieneCapstone = semestreDestino.asignaturas.some((cod) => {
    const asig = progreso.find((a) => a.codigo === cod);
    return asig && esCapstone(asig);
  });
  
  if (semestreContieneCapstone && !esAsignaturaCapstone) {
    return {
      valido: false,
      razon: 'No puedes agregar otros ramos al semestre del Capstone Project',
    };
  }

  // Verificar si ya está en el semestre
  if (semestreDestino.asignaturas.includes(codigoAsignatura)) {
    return { valido: false, razon: 'La asignatura ya está en este semestre' };
  }

  const creditosActuales = semestreDestino.creditos + asignatura.creditos;

  if (creditosActuales > MAX_CREDITOS_POR_SEMESTRE) {
    return {
      valido: false,
      razon: `Excede límite de ${MAX_CREDITOS_POR_SEMESTRE} créditos (quedarían ${creditosActuales})`,
    };
  }

  const aprobadas = new Set(
    progreso.filter((a) => a.estado === 'APROBADO').map((a) => a.codigo)
  );

  for (let i = 0; i < semestresProyectados.length; i++) {
    if (semestresProyectados[i].numero < numeroSemestreDestino) {
      semestresProyectados[i].asignaturas.forEach((cod) => {
        if (cod !== codigoAsignatura) {
          aprobadas.add(cod);
        }
      });
    }
  }

  const prerequisitosFaltantes = asignatura.prereq.filter(
    (prereq) => !aprobadas.has(prereq)
  );

  if (prerequisitosFaltantes.length > 0) {
    return {
      valido: false,
      razon: `Falta(n) prerequisito(s): ${prerequisitosFaltantes.join(', ')}`,
    };
  }

  const asignaturasQueDependenDeEsta = progreso.filter((a) =>
    a.prereq.includes(codigoAsignatura)
  );

  for (const dependiente of asignaturasQueDependenDeEsta) {
    for (const semestre of semestresProyectados) {
      if (semestre.asignaturas.includes(dependiente.codigo)) {
        if (semestre.numero <= numeroSemestreDestino) {
          const nombreDependiente = dependiente.asignatura;
          return {
            valido: false,
            razon: `No puedes mover aquí porque "${nombreDependiente}" (semestre ${semestre.numero}) depende de esta asignatura`,
          };
        }
      }
    }
  }

  // VALIDACIÓN DE DISPERSIÓN DE NIVELES
  const nivelesActuales = semestreDestino.asignaturas
    .map((cod) => {
      const a = progreso.find((p) => p.codigo === cod);
      return a ? a.nivel : 0;
    })
    .filter((n) => n > 0);

  if (nivelesActuales.length > 0) {
    const maxNivel = Math.max(...nivelesActuales, asignatura.nivel);
    const minNivel = Math.min(...nivelesActuales, asignatura.nivel);

    if (maxNivel - minNivel > MAX_DISPERSION_NIVELES) {
      return {
        valido: false,
        razon: `Excede dispersión máxima de ${MAX_DISPERSION_NIVELES} niveles`,
      };
    }
  }

  return { valido: true };
}

// Nueva función: Validar eliminación de semestre
export function puedeEliminarSemestre(
  numeroSemestre: number,
  semestresProyectados: SemestreProyectado[],
  progreso: Asignatura[]
): { valido: boolean; razon?: string } {
  const semestre = semestresProyectados.find(s => s.numero === numeroSemestre);
  
  if (!semestre) {
    return { valido: false, razon: 'Semestre no encontrado' };
  }

  // Verificar si el semestre actual tiene el Capstone
  const tieneCapstone = semestre.asignaturas.some((cod) => {
    const asig = progreso.find((a) => a.codigo === cod);
    return asig && esCapstone(asig);
  });

  if (tieneCapstone) {
    // Si tiene Capstone, miramos el semestre anterior
    const semestreAnterior = semestresProyectados.find(
      s => s.numero === numeroSemestre - 1
    );

    if (!semestreAnterior) {
      return { 
        valido: false, 
        razon: 'No se puede eliminar el semestre inicial del Capstone' 
      };
    }

    // El semestre anterior DEBE estar vacío para recibir el Capstone
    if (semestreAnterior.asignaturas.length > 0) {
      return {
        valido: false,
        razon: 'Debes vaciar el semestre anterior antes de eliminar este, para que el Capstone pueda volver.'
      };
    }
    
    // Si el anterior está vacío, es válido eliminar este.
    return { valido: true };
  }

  // Si NO tiene Capstone, solo se puede borrar si está vacío
  if (semestre.asignaturas.length > 0) {
    return {
      valido: false,
      razon: 'El semestre debe estar vacío para eliminarlo (o contener solo el Capstone con el anterior vacío).'
    };
  }

  return { valido: true };
}