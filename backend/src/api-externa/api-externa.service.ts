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
            console.log(avanceData);
            const progreso = mallaData.map((asig) => {
                const estado = avanceData.find((a) => a.course === asig.codigo)?.status || 'NO CURSADA';
                return {
                codigo: asig.codigo,
                asignatura: asig.asignatura,
                creditos: asig.creditos,
                nivel: asig.nivel,
                prereq: asig.prereq,
                estado,
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
