import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Bus } from '../buses/buses.entity';

export enum EstadoOperativo {
  DISPONIBLE = 'DISPONIBLE',
  EN_COLA = 'EN_COLA',
  EN_RUTA = 'EN_RUTA',
  FINALIZADO = 'FINALIZADO',
  FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
}

@Entity('estado_bus')
export class EstadoBus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'bus_id', type: 'bigint' })
  busId: number;

  @Column({
    name: 'estado_operativo',
    type: 'enum',
    enum: EstadoOperativo,
  })
  estadoOperativo: EstadoOperativo;

  @Column({ name: 'usuario_creacion', type: 'bigint' })
  usuarioCreacion: number;

  @Column({ name: 'usuario_actualizacion', type: 'bigint' })
  usuarioActualizacion: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'timestamptz' })
  fechaActualizacion: Date;

  @Column({ name: 'estado', default: true })
  estado: boolean;

  @Column({ name: 'eliminado', default: false })
  eliminado: boolean;

  @ManyToOne(() => Bus, (bus) => bus.estadosBus)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;
}
