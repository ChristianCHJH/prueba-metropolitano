import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Seguimiento } from '../models/seguimiento.model';

export interface RegistrarSeguimientoDto {
  reporteId: number;
  latitud: number;
  longitud: number;
}

@Injectable({ providedIn: 'root' })
export class SeguimientosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/seguimientos';

  registrar(dto: RegistrarSeguimientoDto): Observable<ApiResponse<Seguimiento>> {
    return this.http.post<ApiResponse<Seguimiento>>(this.baseUrl, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  listarPorReporte(reporteId: number): Observable<ApiResponse<Seguimiento[]>> {
    return this.http.get<ApiResponse<Seguimiento[]>>(`${this.baseUrl}/reporte/${reporteId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
