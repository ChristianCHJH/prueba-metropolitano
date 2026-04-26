import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeguimientosService } from './seguimientos.service';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto';

@ApiTags('Seguimientos')
@Controller('seguimientos')
export class SeguimientosController {
  constructor(private readonly seguimientosService: SeguimientosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo punto GPS para un reporte EN_RUTA' })
  @ApiResponse({ status: 201, description: 'Punto GPS registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  @ApiResponse({ status: 422, description: 'El reporte no está EN_RUTA' })
  registrar(@Body() dto: CrearSeguimientoDto) {
    return this.seguimientosService.registrar(dto);
  }
}
