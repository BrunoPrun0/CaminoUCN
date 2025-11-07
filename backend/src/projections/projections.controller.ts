// src/projections/projections.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ProjectionsService } from './projections.service';
import { CrearProyeccionDto, ActualizarProyeccionDto } from './dto/projection.dto';

@Controller('projections')
export class ProjectionsController {
  constructor(private readonly projectionsService: ProjectionsService) {}

  @Get()
  async obtenerProyecciones(
    @Query('rut') rut: string,
    @Query('careerCode') careerCode: string,
  ) {
    console.log('📥 Obteniendo proyecciones para:', { rut, careerCode });
    return this.projectionsService.obtenerProyecciones(rut, careerCode);
  }

  @Get(':id')
  async obtenerProyeccion(@Param('id', ParseIntPipe) id: number) {
    console.log('📥 Obteniendo proyección:', id);
    return this.projectionsService.obtenerProyeccion(id);
  }

  @Post()
  async crearProyeccion(@Body() dto: CrearProyeccionDto) {
    console.log('📥 Creando proyección:', dto.name);
    return this.projectionsService.crearProyeccion(dto);
  }

  @Put()
  async actualizarProyeccion(@Body() dto: ActualizarProyeccionDto) {
    console.log('📥 Actualizando proyección:', dto.id);
    return this.projectionsService.actualizarProyeccion(dto);
  }

  @Delete(':id')
  async eliminarProyeccion(@Param('id', ParseIntPipe) id: number) {
    console.log('📥 Eliminando proyección:', id);
    return this.projectionsService.eliminarProyeccion(id);
  }

  @Put(':id/favorita')
  async marcarComoFavorita(@Param('id', ParseIntPipe) id: number) {
    console.log('📥 Marcando como favorita:', id);
    return this.projectionsService.marcarComoFavorita(id);
  }
}