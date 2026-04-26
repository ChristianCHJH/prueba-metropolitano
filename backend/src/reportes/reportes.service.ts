import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Reporte, EstadoReporte } from './reportes.entity';
import { CrearReporteDto } from './dto/crear-reporte.dto';
import { CompletarReporteDto } from './dto/completar-reporte.dto';
import { Bus } from '../buses/buses.entity';
import { EstadoBusService } from '../estado-bus/estado-bus.service';
import { EstadoOperativo } from '../estado-bus/estado-bus.entity';
import { Seguimiento } from '../seguimientos/seguimientos.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,

    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,

    @InjectRepository(Seguimiento)
    private readonly seguimientoRepository: Repository<Seguimiento>,

    private readonly estadoBusService: EstadoBusService,
  ) {}

  async iniciarReporte(dto: CrearReporteDto): Promise<Reporte> {
    const bus = await this.busRepository.findOne({
      where: { id: dto.busId, eliminado: false },
    });

    if (!bus) {
      throw new NotFoundException(`Bus con id ${dto.busId} no encontrado`);
    }

    const reporteActivo = await this.reporteRepository.findOne({
      where: {
        busId: dto.busId,
        estadoReporte: In([EstadoReporte.EN_COLA, EstadoReporte.EN_RUTA]),
        eliminado: false,
      },
    });

    if (reporteActivo) {
      throw new ConflictException('El bus ya tiene un reporte activo');
    }

    await this.estadoBusService.crearEstado(dto.busId, EstadoOperativo.EN_COLA);

    const reporte = this.reporteRepository.create({
      busId: dto.busId,
      cantidadPasajeros: dto.cantidadPasajeros,
      latitudInicio: dto.latitudInicio,
      longitudInicio: dto.longitudInicio,
      estadoReporte: EstadoReporte.EN_COLA,
      inicioEn: new Date(),
      usuarioCreacion: 1,
      usuarioActualizacion: 1,
    });

    return this.reporteRepository.save(reporte);
  }

  async obtenerPorId(id: number): Promise<Reporte> {
    const reporte = await this.reporteRepository.findOne({
      where: { id, eliminado: false },
      relations: ['bus'],
    });

    if (!reporte) {
      throw new NotFoundException(`Reporte con id ${id} no encontrado`);
    }

    return reporte;
  }

  async completarReporte(
    id: number,
    dto: CompletarReporteDto,
  ): Promise<Reporte> {
    const reporte = await this.reporteRepository.findOne({
      where: { id, eliminado: false },
    });

    if (!reporte) {
      throw new NotFoundException(`Reporte con id ${id} no encontrado`);
    }

    if (reporte.estadoReporte === EstadoReporte.FINALIZADO) {
      throw new UnprocessableEntityException(
        'El reporte ya se encuentra en estado FINALIZADO',
      );
    }

    reporte.latitudFin = dto.latitudFin;
    reporte.longitudFin = dto.longitudFin;
    reporte.estadoReporte = EstadoReporte.FINALIZADO;
    reporte.finEn = new Date();
    reporte.usuarioActualizacion = 1;

    await this.reporteRepository.save(reporte);

    await this.estadoBusService.crearEstado(
      reporte.busId,
      EstadoOperativo.FINALIZADO,
    );

    return this.reporteRepository.findOne({
      where: { id },
      relations: ['bus'],
    });
  }

  async obtenerSeguimientos(reporteId: number): Promise<Seguimiento[]> {
    const reporte = await this.reporteRepository.findOne({
      where: { id: reporteId, eliminado: false },
    });

    if (!reporte) {
      throw new NotFoundException(
        `Reporte con id ${reporteId} no encontrado`,
      );
    }

    return this.seguimientoRepository.find({
      where: { reporteId, eliminado: false },
      order: { fechaCreacion: 'ASC' },
    });
  }
}
