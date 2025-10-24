type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string[];
};
const proyeccionCortaArray: Asignatura[] = [];
const ramosAprobados: Asignatura[] = [];
const ramosPendientes: Asignatura[] = [];
export const proyeccionCorta = (progreso: Asignatura[]) => {
    
    // Lista con las asignaturas no cursadas o reprobadas
    // max 2 sobrecupos (2 semestres con 35 creditos)
    for (let i = 0; i < progreso.length; i++) {
        if (progreso[i].estado === "NO CURSADA" || progreso[i].estado === "REPROBADO"){
            proyeccionCortaArray.push(progreso[i]);
        }
    }
    proyeccionCortaArray.forEach((asignatura) =>{
        console.log(asignatura);
    })

    
};