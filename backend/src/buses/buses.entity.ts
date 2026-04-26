import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reporte } from '../reportes/reportes.entity';
import { EstadoBus } from '../estado-bus/estado-bus.entity';

@Entity('bus')
export class Bus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'codigo', type: 'varchar', unique: true })
  codigo: string;

  @Column({ name: 'capacidad', type: 'int' })
  capacidad: number;

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

  @OneToMany(() => Reporte, (reporte) => reporte.bus)
  reportes: Reporte[];

  @OneToMany(() => EstadoBus, (estadoBus) => estadoBus.bus)
  estadosBus: EstadoBus[];
}
