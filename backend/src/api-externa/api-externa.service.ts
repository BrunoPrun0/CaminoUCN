import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ApiExternaService {
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
