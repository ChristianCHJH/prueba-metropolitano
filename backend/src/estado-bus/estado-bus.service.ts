import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoBus, EstadoOperativo } from './estado-bus.entity';

@Injectable()
export class EstadoBusService {
  constructor(
    @InjectRepository(EstadoBus)
    private readonly estadoBusRepository: Repository<EstadoBus>,
  ) {}

  async crearEstado(
    busId: number,
    estadoOperativo: EstadoOperativo,
  ): Promise<EstadoBus> {
    const nuevoEstado = this.estadoBusRepository.create({
      busId,
      estadoOperativo,
      usuarioCreacion: 1,
      usuarioActualizacion: 1,
    });
    return this.estadoBusRepository.save(nuevoEstado);
  }

  async obtenerUltimoEstado(busId: number): Promise<EstadoBus | null> {
    return this.estadoBusRepository.findOne({
      where: { busId },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerHistorialEstados(busId: number): Promise<EstadoBus[]> {
    return this.estadoBusRepository.find({
      where: { busId },
      order: { fechaCreacion: 'DESC' },
    });
  }
}
