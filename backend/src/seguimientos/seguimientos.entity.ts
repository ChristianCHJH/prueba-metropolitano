import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reporte } from '../reportes/reportes.entity';

@Entity('seguimiento')
export class Seguimiento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'reporte_id', type: 'bigint' })
  reporteId: number;

  @Column({ name: 'latitud', type: 'decimal', precision: 10, scale: 7 })
  latitud: number;

  @Column({ name: 'longitud', type: 'decimal', precision: 10, scale: 7 })
  longitud: number;

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

  @ManyToOne(() => Reporte, (reporte) => reporte.seguimientos)
  @JoinColumn({ name: 'reporte_id' })
  reporte: Reporte;
}
