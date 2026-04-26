import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { CrearReporteDto } from './dto/crear-reporte.dto';
import { CompletarReporteDto } from './dto/completar-reporte.dto';
import { EstadoReporte } from './reportes.entity';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los reportes con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoReporte })
  @ApiResponse({ status: 200, description: 'Listado de reportes' })
  listar(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('estado') estado?: EstadoReporte,
  ) {
    return this.reportesService.listar(Number(page), Number(limit), estado);
  }

  @Post()
  @ApiOperation({ summary: 'Iniciar un nuevo reporte de viaje para un bus' })
  @ApiResponse({ status: 201, description: 'Reporte iniciado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Bus no encontrado' })
  @ApiResponse({ status: 409, description: 'El bus ya tiene un reporte activo' })
  iniciarReporte(@Body() dto: CrearReporteDto) {
    return this.reportesService.iniciarReporte(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un reporte por ID' })
  @ApiParam({ name: 'id', description: 'ID del reporte' })
  @ApiResponse({ status: 200, description: 'Detalle del reporte' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.obtenerPorId(id);
  }

  @Patch(':id/completar')
  @ApiOperation({ summary: 'Finalizar un reporte de viaje' })
  @ApiParam({ name: 'id', description: 'ID del reporte a completar' })
  @ApiResponse({ status: 200, description: 'Reporte completado exitosamente' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  @ApiResponse({ status: 422, description: 'El reporte ya está finalizado' })
  completarReporte(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompletarReporteDto,
  ) {
    return this.reportesService.completarReporte(id, dto);
  }

  @Get(':id/seguimientos')
  @ApiOperation({ summary: 'Obtener todos los puntos GPS de un reporte' })
  @ApiParam({ name: 'id', description: 'ID del reporte' })
  @ApiResponse({ status: 200, description: 'Listado de seguimientos' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  obtenerSeguimientos(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.obtenerSeguimientos(id);
  }
}
