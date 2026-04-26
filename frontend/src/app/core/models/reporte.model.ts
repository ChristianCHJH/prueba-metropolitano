import { Bus } from './bus.model';

export type EstadoReporte = 'EN_COLA' | 'EN_RUTA' | 'FINALIZADO';

export interface Reporte {
  id: number;
  busId: number;
  bus?: Bus;
  estadoReporte: EstadoReporte;
  cantidadPasajeros: number;
  latitudInicio: number;
  longitudInicio: number;
  latitudFin: number | null;
  longitudFin: number | null;
  inicioEn: string;
  finEn: string | null;
  eliminado: boolean;
  fechaCreacion: string;
}
