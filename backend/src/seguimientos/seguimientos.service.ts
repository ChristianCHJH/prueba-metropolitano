import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seguimiento } from './seguimientos.entity';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto';
import { Reporte, EstadoReporte } from '../reportes/reportes.entity';

@Injectable()
export class SeguimientosService {
  constructor(
    @InjectRepository(Seguimiento)
    private readonly seguimientoRepository: Repository<Seguimiento>,

    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,
  ) {}

  async registrar(dto: CrearSeguimientoDto): Promise<Seguimiento> {
    const reporte = await this.reporteRepository.findOne({
      where: { id: dto.reporteId, eliminado: false },
    });

    if (!reporte) {
      throw new NotFoundException(
        `Reporte con id ${dto.reporteId} no encontrado`,
      );
    }

    if (reporte.estadoReporte !== EstadoReporte.EN_RUTA) {
      throw new UnprocessableEntityException('El reporte no está EN_RUTA');
    }

    const seguimiento = this.seguimientoRepository.create({
      reporteId: dto.reporteId,
      latitud: dto.latitud,
      longitud: dto.longitud,
      usuarioCreacion: 1,
      usuarioActualizacion: 1,
    });

    return this.seguimientoRepository.save(seguimiento);
  }
}
