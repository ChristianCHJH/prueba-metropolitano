import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Bus } from './buses.entity';
import { CrearBusDto } from './dto/crear-bus.dto';
import { ActualizarBusDto } from './dto/actualizar-bus.dto';
import { EstadoBusService } from '../estado-bus/estado-bus.service';
import { EstadoOperativo, EstadoBus } from '../estado-bus/estado-bus.entity';
import { Reporte, EstadoReporte } from '../reportes/reportes.entity';
import { Seguimiento } from '../seguimientos/seguimientos.entity';
import { PaginatedData } from '../common/interceptors/transform.interceptor';

export interface BusEnriquecido {
  id: number;
  codigo: string;
  capacidad: number;
  estado: boolean;
  eliminado: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estadoOperativoActual: string | null;
  reporteActivo: ReporteConSeguimiento | null;
}

export interface ReporteConSeguimiento {
  id: number;
  estadoReporte: string;
  cantidadPasajeros: number;
  capacidadBus: number;
  porcentajeOcupacion: number;
  latitudInicio: number;
  longitudInicio: number;
  inicioEn: Date;
  ultimoSeguimiento: Seguimiento | null;
}

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,

    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,

    @InjectRepository(Seguimiento)
    private readonly seguimientoRepository: Repository<Seguimiento>,

    @InjectRepository(EstadoBus)
    private readonly estadoBusRepository: Repository<EstadoBus>,

    private readonly estadoBusService: EstadoBusService,
  ) {}

  async crear(dto: CrearBusDto): Promise<Bus> {
    const existente = await this.busRepository.findOne({
      where: { codigo: dto.codigo, eliminado: false },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un bus con el código "${dto.codigo}"`,
      );
    }

    const bus = this.busRepository.create({
      ...dto,
      usuarioCreacion: 1,
      usuarioActualizacion: 1,
    });

    return this.busRepository.save(bus);
  }

  async listar(
    page: number,
    limit: number,
  ): Promise<PaginatedData<BusEnriquecido>> {
    const [buses, total] = await this.busRepository.findAndCount({
      where: { eliminado: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { fechaCreacion: 'DESC' },
    });

    const data = await this.enriquecerBuses(buses);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async obtenerPorId(id: number): Promise<BusEnriquecido> {
    const bus = await this.busRepository.findOne({
      where: { id, eliminado: false },
    });

    if (!bus) {
      throw new NotFoundException(`Bus con id ${id} no encontrado`);
    }

    const [enriquecido] = await this.enriquecerBuses([bus]);
    return enriquecido;
  }

  async actualizar(id: number, dto: ActualizarBusDto): Promise<Bus> {
    const bus = await this.busRepository.findOne({
      where: { id, eliminado: false },
    });

    if (!bus) {
      throw new NotFoundException(`Bus con id ${id} no encontrado`);
    }

    if (dto.codigo && dto.codigo !== bus.codigo) {
      const existente = await this.busRepository.findOne({
        where: { codigo: dto.codigo, eliminado: false },
      });
      if (existente) {
        throw new ConflictException(
          `Ya existe un bus con el código "${dto.codigo}"`,
        );
      }
    }

    Object.assign(bus, dto, { usuarioActualizacion: 1 });
    return this.busRepository.save(bus);
  }

  async eliminar(id: number): Promise<void> {
    const bus = await this.busRepository.findOne({
      where: { id, eliminado: false },
    });

    if (!bus) {
      throw new NotFoundException(
        `Bus con id ${id} no encontrado o ya eliminado`,
      );
    }

    bus.eliminado = true;
    bus.usuarioActualizacion = 1;
    await this.busRepository.save(bus);
  }

  async listarReportesDeBus(
    busId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedData<Reporte>> {
    await this.validarBusExiste(busId);

    const [reportes, total] = await this.reporteRepository.findAndCount({
      where: { busId, eliminado: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { inicioEn: 'DESC' },
    });

    return {
      data: reportes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listarEstadosDeBus(busId: number): Promise<EstadoBus[]> {
    await this.validarBusExiste(busId);
    return this.estadoBusService.obtenerHistorialEstados(busId);
  }

  async cambiarEstado(
    busId: number,
    estadoOperativo: EstadoOperativo,
  ): Promise<EstadoBus> {
    await this.validarBusExiste(busId);
    return this.estadoBusService.crearEstado(busId, estadoOperativo);
  }

  private async validarBusExiste(id: number): Promise<Bus> {
    const bus = await this.busRepository.findOne({
      where: { id, eliminado: false },
    });
    if (!bus) {
      throw new NotFoundException(`Bus con id ${id} no encontrado`);
    }
    return bus;
  }

  private async enriquecerBuses(buses: Bus[]): Promise<BusEnriquecido[]> {
    if (buses.length === 0) return [];

    const busIds = buses.map((b) => b.id);

    const ultimosEstados = await this.estadoBusRepository
      .createQueryBuilder('eb')
      .where('eb.bus_id IN (:...ids)', { ids: busIds })
      .distinctOn(['eb.bus_id'])
      .orderBy('eb.bus_id')
      .addOrderBy('eb.fecha_creacion', 'DESC')
      .getMany();

    const estadoMap = new Map<number, EstadoBus>();
    for (const e of ultimosEstados) {
      estadoMap.set(Number(e.busId), e);
    }

    const reportesActivos = await this.reporteRepository.find({
      where: {
        busId: In(busIds),
        estadoReporte: In([EstadoReporte.EN_COLA, EstadoReporte.EN_RUTA]),
        eliminado: false,
      },
    });

    const reporteActivoMap = new Map<number, Reporte>();
    for (const r of reportesActivos) {
      reporteActivoMap.set(Number(r.busId), r);
    }

    const reporteIds = reportesActivos.map((r) => r.id);

    const ultimosSeguimientos =
      reporteIds.length > 0
        ? await this.seguimientoRepository
            .createQueryBuilder('s')
            .where('s.reporte_id IN (:...ids)', { ids: reporteIds })
            .distinctOn(['s.reporte_id'])
            .orderBy('s.reporte_id')
            .addOrderBy('s.fecha_creacion', 'DESC')
            .getMany()
        : [];

    const seguimientoMap = new Map<number, Seguimiento>();
    for (const s of ultimosSeguimientos) {
      seguimientoMap.set(Number(s.reporteId), s);
    }

    return buses.map((bus) => {
      const estadoActual = estadoMap.get(Number(bus.id));
      const reporteActivo = reporteActivoMap.get(Number(bus.id));
      const ultimoSeguimiento = reporteActivo
        ? seguimientoMap.get(Number(reporteActivo.id)) ?? null
        : null;

      const porcentajeOcupacion =
        reporteActivo && bus.capacidad > 0
          ? Math.round(
              (reporteActivo.cantidadPasajeros / bus.capacidad) * 100,
            )
          : 0;

      return {
        id: bus.id,
        codigo: bus.codigo,
        capacidad: bus.capacidad,
        estado: bus.estado,
        eliminado: bus.eliminado,
        fechaCreacion: bus.fechaCreacion,
        fechaActualizacion: bus.fechaActualizacion,
        estadoOperativoActual: estadoActual?.estadoOperativo ?? null,
        reporteActivo: reporteActivo
          ? {
              id: reporteActivo.id,
              estadoReporte: reporteActivo.estadoReporte,
              cantidadPasajeros: reporteActivo.cantidadPasajeros,
              capacidadBus: bus.capacidad,
              porcentajeOcupacion,
              latitudInicio: reporteActivo.latitudInicio,
              longitudInicio: reporteActivo.longitudInicio,
              inicioEn: reporteActivo.inicioEn,
              ultimoSeguimiento,
            }
          : null,
      };
    });
  }
}
