import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ApiExternaService {

    
   async getProgreso(codCarrera: string, catalogo: string, rut: string) {
       
        try {
            const urlMalla = `https://losvilos.ucn.cl/hawaii/api/mallas?${codCarrera}-${catalogo}`;
            const urlAvance = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${rut}&codcarrera=${codCarrera}`;
            const headers = {'X-HAWAII-AUTH': 'jf400fejof13f'};
            const resMalla = await fetch(urlMalla,{
                method: 'GET',
                headers,
                redirect: 'follow'
            });
      
            const mallaData = await resMalla.json();
 
            if (mallaData.error){
                throw new BadRequestException('Error '+ mallaData.error);
                
            }

            const resAvance = await fetch(urlAvance, {
                method: 'GET',
                redirect: 'follow'
            })
            const avanceData = await resAvance.json();
           
            if(avanceData.error){
                throw new BadRequestException('Error '+ mallaData.error);
            }
<<<<<<< Updated upstream
            const progreso = mallaData.map((asig) => {
                const estado = avanceData.find((a) => a.course === asig.codigo)?.status || 'NO CURSADA';
                return {
                codigo: asig.codigo,
                asignatura: asig.asignatura,
                creditos: asig.creditos,
                nivel: asig.nivel,
                prereq: asig.prereq,
                estado,
=======

            console.log('✅ Avance obtenido:', avanceData.length, 'inscripciones');
            console.log('📋 Primera inscripción:', avanceData[0]);
            console.log('📋 Campos de inscripción:', Object.keys(avanceData[0] || {}));

            // Ordenar inscripciones por periodo (más reciente primero)
            const inscripcionesOrdenadas = [...avanceData].sort((a, b) => {
                return b.period.localeCompare(a.period);
            });

            // Crear un mapa para obtener el estado más reciente de cada curso
            const estadosPorCodigo = new Map();
            
            // Procesar solo inscripciones no excluidas (ya ordenadas)
            inscripcionesOrdenadas
                .filter(inscripcion => !inscripcion.excluded)
                .forEach(inscripcion => {
                    const codigo = inscripcion.course;
                    
                    // Si no existe, agregar (como están ordenadas, el primero es el más reciente)
                    if (!estadosPorCodigo.has(codigo)) {
                        estadosPorCodigo.set(codigo, inscripcion);
                    }
                });

            console.log('📊 Estados procesados:', estadosPorCodigo.size, 'cursos únicos');

            // Combinar malla con estados
            const progreso = mallaData.map((asig) => {
                const estadoReciente = estadosPorCodigo.get(asig.codigo);
                const estado = estadoReciente?.status || 'NO CURSADA';
                
                // Normalizar prerequisitos: siempre retornar array
                let prereqArray: string[] = [];
                if (asig.prereq) {
                    if (typeof asig.prereq === 'string') {
                        prereqArray = asig.prereq.split(',').map(p => p.trim()).filter(p => p.length > 0);
                    } else if (Array.isArray(asig.prereq)) {
                        prereqArray = asig.prereq.map(p => p.trim()).filter(p => p.length > 0);
                    }
                }
                
                return {
                    codigo: asig.codigo,
                    asignatura: asig.asignatura,
                    creditos: asig.creditos,
                    nivel: asig.nivel,
                    prereq: prereqArray,
                    estado,
                    veces_cursado: 0 // Se calculará en el frontend
                };
            });
            
            // Contar aprobadas y reprobadas correctamente
            // Solo contar el estado más reciente de cada asignatura
            const aprobadas = progreso.filter((p) => p.estado === 'APROBADO').length;
            const reprobadas = progreso.filter((p) => p.estado === 'REPROBADO').length;
            
            console.log('📊 Estadísticas:');
            console.log('   - Aprobadas:', aprobadas);
            console.log('   - Reprobadas:', reprobadas);
            console.log('   - No cursadas:', progreso.filter((p) => p.estado === 'NO CURSADA').length);
            
            // Construir el objeto de respuesta
            const respuesta = {
                rut,
                carrera: codCarrera,
                catalogo,
                totalAsignaturas: mallaData.length,
                aprobadas,
                reprobadas,
                progreso,
                inscripciones: avanceData // ← CRÍTICO: Incluir las inscripciones
>>>>>>> Stashed changes
            };
         });
            
        return {
            rut,
            carrera: codCarrera,
            catalogo,
            totalAsignaturas: mallaData.length,
            aprobadas: progreso.filter((p) => p.estado === 'APROBADO').length,
            reprobadas: progreso.filter((p) => p.estado === 'REPROBADO').length,
            progreso,
        };
        } catch (err) {
            throw new Error('Error al conectar con la API externa malla');
        }
    }


    async login(email: string, password:string) {
        try {
            const data = await fetch(`https://puclaro.ucn.cl/eross/avance/login.php?email=${email}&password=${password}`);
            const studentData = await data.json();
            if (studentData.error){
                throw new BadRequestException("Error " + studentData.error);   
            }
                return studentData;
            
        } catch (err) {
            throw new Error('Error al conectar con la API externa');
 
        }
    }

}
