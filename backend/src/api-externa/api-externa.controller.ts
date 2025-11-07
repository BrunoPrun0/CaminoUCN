// api-externa.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiExternaService } from './api-externa.service';

@Controller('api-externa')
export class ApiExternaController {
  constructor(private readonly apiExternaService: ApiExternaService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.apiExternaService.login(body.email, body.password);
  }

  @Post('progreso')
  async getProgreso(
    @Body() body: { codCarrera: string; catalogo: string; rut: string }
  ) {
    console.log('📥 Controller recibió:', body);
    
    const resultado = await this.apiExternaService.getProgreso(
      body.codCarrera,
      body.catalogo,
      body.rut
    );
    
    // 🔍 DEBUG: Ver qué va a retornar el controller
    console.log('📤 Controller va a retornar:', {
      tieneInscripciones: 'inscripciones' in resultado,
      cantidadInscripciones: resultado.inscripciones?.length || 0,
      primeraInscripcion: resultado.inscripciones?.[0],
      cantidadProgreso: resultado.progreso?.length || 0
    });
    
    return resultado;
  }
}