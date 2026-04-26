import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Bus } from '../buses/buses.entity';
import { Seguimiento } from '../seguimientos/seguimientos.entity';

export enum EstadoReporte {
  EN_COLA = 'EN_COLA',
  EN_RUTA = 'EN_RUTA',
  FINALIZADO = 'FINALIZADO',
}

@Entity('reporte')
export class Reporte {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'bus_id', type: 'bigint' })
  busId: number;

  @Column({
    name: 'estado_reporte',
    type: 'enum',
    enum: EstadoReporte,
    default: EstadoReporte.EN_COLA,
  })
  estadoReporte: EstadoReporte;

  @Column({ name: 'cantidad_pasajeros', type: 'int' })
  cantidadPasajeros: number;

  @Column({ name: 'latitud_inicio', type: 'decimal', precision: 10, scale: 7 })
  latitudInicio: number;

  @Column({
    name: 'longitud_inicio',
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  longitudInicio: number;

  @Column({
    name: 'latitud_fin',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitudFin: number;

  @Column({
    name: 'longitud_fin',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitudFin: number;

  @Column({
    name: 'inicio_en',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  inicioEn: Date;

  @Column({ name: 'fin_en', type: 'timestamptz', nullable: true })
  finEn: Date;

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

  @ManyToOne(() => Bus, (bus) => bus.reportes)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @OneToMany(() => Seguimiento, (seguimiento) => seguimiento.reporte)
  seguimientos: Seguimiento[];
}
