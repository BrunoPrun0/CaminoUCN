type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string;
};
const proyeccionCortaArray: Asignatura[] = [];
export const proyeccionCorta = (progreso: Asignatura[]) => {
    
    // Lista con las asignaturas no cursadas o reprobadas
    for (let i = 0; i < progreso.length; i++) {
        if (progreso[i].estado === "NO CURSADA" || progreso[i].estado === "REPROBADO"){
            proyeccionCortaArray.push(progreso[i]);
        }
    }
    proyeccionCortaArray.forEach((asignatura) =>{
        console.log(asignatura);
    })

    // Ordenar por nivel (?), por cantidad de prereq ?? ??? 30 o 35 creditos ??
    // Hacer otra array o no? 
};