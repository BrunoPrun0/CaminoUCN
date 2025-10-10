import { Body, Controller, Post } from '@nestjs/common';
import { ApiExternaService } from './api-externa.service';

@Controller('api-externa')
export class ApiExternaController {
    constructor(private apiExterna: ApiExternaService){}

    @Post('login')
    async loginUsuario(@Body()body: {email : string, password: string}) {
        const {email,password} = body;
       return this.apiExterna.login(email,password);
        
    }
    @Post('progreso')
    async progresoUsuario(@Body()body: {codCarrera: string , catalogo: string, rut: string}){
        console.log(' no error aca');
        const {codCarrera, catalogo, rut} = body;
        return this.apiExterna.getProgreso(codCarrera, catalogo, rut);
    }
}
