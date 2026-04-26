import { EstadoOperativo } from './bus.model';

export interface EstadoBus {
  id: number;
  busId: number;
  estadoOperativo: EstadoOperativo;
  fechaCreacion: string;
}
