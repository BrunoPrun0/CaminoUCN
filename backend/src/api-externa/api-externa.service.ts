// api-externa.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ApiExternaService {

    async getProgreso(codCarrera: string, catalogo: string, rut: string) {
        try {
            console.log('🎯 Service iniciando getProgreso para:', { codCarrera, catalogo, rut });
            
            const urlMalla = `https://losvilos.ucn.cl/hawaii/api/mallas?${codCarrera}-${catalogo}`;
            const urlAvance = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${rut}&codcarrera=${codCarrera}`;
            const headers = {'X-HAWAII-AUTH': 'jf400fejof13f'};
            
            // Obtener malla
            console.log('📡 Fetching malla desde:', urlMalla);
            const resMalla = await fetch(urlMalla, {
                method: 'GET',
                headers,
                redirect: 'follow'
            });
            const mallaData = await resMalla.json();
 
            if (mallaData.error) {
                throw new BadRequestException('Error ' + mallaData.error);
            }
            console.log('✅ Malla obtenida:', mallaData.length, 'asignaturas');

            // Obtener avance
            console.log('📡 Fetching avance desde:', urlAvance);
            const resAvance = await fetch(urlAvance, {
                method: 'GET',
                redirect: 'follow'
            });
            const avanceData = await resAvance.json();
           
            if (avanceData.error) {
                throw new BadRequestException('Error ' + avanceData.error);
            }

            console.log('✅ Avance obtenido:', avanceData.length, 'inscripciones');
            console.log('📋 Primera inscripción:', avanceData[0]);
            console.log('📋 Campos de inscripción:', Object.keys(avanceData[0] || {}));

            // Crear un mapa para obtener el estado más reciente de cada curso
            const estadosPorCodigo = new Map();
            
            // Procesar solo inscripciones no excluidas
            avanceData
                .filter(inscripcion => !inscripcion.excluded)
                .forEach(inscripcion => {
                    const codigo = inscripcion.course;
                    
                    // Si no existe o el periodo es más reciente, actualizar
                    if (!estadosPorCodigo.has(codigo) || 
                        inscripcion.period > estadosPorCodigo.get(codigo).period) {
                        estadosPorCodigo.set(codigo, inscripcion);
                    }
                });

            console.log('📊 Estados procesados:', estadosPorCodigo.size, 'cursos únicos');

            // Combinar malla con estados
            const progreso = mallaData.map((asig) => {
                const estadoReciente = estadosPorCodigo.get(asig.codigo);
                const estado = estadoReciente?.status || 'NO CURSADA';
                
                return {
                    codigo: asig.codigo,
                    asignatura: asig.asignatura,
                    creditos: asig.creditos,
                    nivel: asig.nivel,
                    prereq: asig.prereq ? asig.prereq.split(',') : [],
                    estado,
                    veces_cursado: 0 // Se calculará en el frontend
                };
            });
            
            // Construir el objeto de respuesta
            const respuesta = {
                rut,
                carrera: codCarrera,
                catalogo,
                totalAsignaturas: mallaData.length,
                aprobadas: progreso.filter((p) => p.estado === 'APROBADO').length,
                reprobadas: progreso.filter((p) => p.estado === 'REPROBADO').length,
                progreso,
                inscripciones: avanceData // ← CRÍTICO: Incluir las inscripciones
            };

            // 🔍 DEBUG FINAL: Verificar qué se va a retornar
            console.log('📦 Objeto respuesta construido:');
            console.log('   - totalAsignaturas:', respuesta.totalAsignaturas);
            console.log('   - aprobadas:', respuesta.aprobadas);
            console.log('   - reprobadas:', respuesta.reprobadas);
            console.log('   - progreso.length:', respuesta.progreso.length);
            console.log('   - inscripciones.length:', respuesta.inscripciones.length);
            console.log('   - Tiene campo inscripciones?:', 'inscripciones' in respuesta);
            console.log('   - Primera inscripción:', respuesta.inscripciones[0]);
            
            return respuesta;
            
        } catch (err) {
            console.error('❌ Error en getProgreso:', err);
            throw new Error('Error al conectar con la API externa malla');
        }
    }

    async login(email: string, password: string) {
        try {
            const data = await fetch(
                `https://puclaro.ucn.cl/eross/avance/login.php?email=${email}&password=${password}`
            );
            const studentData = await data.json();
            
            if (studentData.error) {
                throw new BadRequestException("Error " + studentData.error);   
            }
            
            return studentData;
            
        } catch (err) {
            console.error('❌ Error en login:', err);
            throw new Error('Error al conectar con la API externa');
        }
    }
}