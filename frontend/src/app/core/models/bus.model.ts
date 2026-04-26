import { EstadoReporte } from './reporte.model';
import { Seguimiento } from './seguimiento.model';

export type EstadoOperativo =
  | 'DISPONIBLE'
  | 'EN_COLA'
  | 'EN_RUTA'
  | 'FINALIZADO'
  | 'FUERA_DE_SERVICIO'
  | 'EN_MANTENIMIENTO';

export interface ReporteActivo {
  id: number;
  estadoReporte: EstadoReporte;
  cantidadPasajeros: number;
  capacidadBus: number;
  porcentajeOcupacion: number;
  latitudInicio: number;
  longitudInicio: number;
  inicioEn: string;
  ultimoSeguimiento: Seguimiento | null;
}

export interface Bus {
  id: number;
  codigo: string;
  capacidad: number;
  estado: boolean;
  eliminado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  estadoOperativoActual: EstadoOperativo | null;
  reporteActivo: ReporteActivo | null;
}
