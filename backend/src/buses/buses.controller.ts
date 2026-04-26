import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BusesService } from './buses.service';
import { CrearBusDto } from './dto/crear-bus.dto';
import { ActualizarBusDto } from './dto/actualizar-bus.dto';
import { CrearEstadoBusDto } from '../estado-bus/dto/crear-estado-bus.dto';

@ApiTags('Buses')
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo bus en la flota' })
  @ApiResponse({ status: 201, description: 'Bus creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El código del bus ya existe' })
  crear(@Body() dto: CrearBusDto) {
    return this.busesService.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los buses activos con estado y reporte actual' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Listado de buses obtenido' })
  listar(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.busesService.listar(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un bus por ID' })
  @ApiParam({ name: 'id', description: 'ID del bus' })
  @ApiResponse({ status: 200, description: 'Detalle del bus' })
  @ApiResponse({ status: 404, description: 'Bus no encontrado' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.obtenerPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos de un bus' })
  @ApiParam({ name: 'id', description: 'ID del bus' })
  @ApiResponse({ status: 200, description: 'Bus actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Bus no encontrado' })
  @ApiResponse({ status: 409, description: 'El código del bus ya existe' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarBusDto,
  ) {
    return this.busesService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft delete) un bus' })
  @ApiParam({ name: 'id', description: 'ID del bus' })
  @ApiResponse({ status: 200, description: 'Bus eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Bus no encontrado o ya eliminado' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.eliminar(id);
  }

  @Get(':id/reportes')
  @ApiOperation({ summary: 'Listar reportes de un bus específico' })
  @ApiParam({ name: 'id', description: 'ID del bus' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Listado de reportes del bus' })
  @ApiResponse({ status: 404, description: 'Bus no encontrado' })
  listarReportes(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.busesService.listarReportesDeBus(
      id,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Get(':id/estados')
  @ApiOperation({ summary: 'Historial de estados operativos de un bus' })
  @ApiParam({ name: 'id', description: 'ID del bus' })
  @ApiResponse({ status: 200, description: 'Historial de estados obtenido' })
  @ApiResponse({ status: 404, description: 'Bus no encontrado' })
  listarEstados(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.listarEstadosDeBus(id);
  }

  @Post(':id/estado')
  @ApiOperation({ summary: 'Cambiar el estado operativo de un bus' })
  @ApiParam({ name: 'id', description: 'ID del bus' })
  @ApiResponse({ status: 201, description: 'Estado creado exitosamente' })
  @ApiResponse({ status: 404, description: 'Bus no encontrado' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearEstadoBusDto,
  ) {
    return this.busesService.cambiarEstado(id, dto.estadoOperativo);
  }
}
