import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Reporte } from '../models/reporte.model';
import { Seguimiento } from '../models/seguimiento.model';

export interface IniciarReporteDto {
  busId: number;
  cantidadPasajeros: number;
  latitudInicio: number;
  longitudInicio: number;
}

export interface CompletarReporteDto {
  latitudFin: number;
  longitudFin: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/reportes';

  listar(page: number, limit: number, estado?: string): Observable<ApiResponse<Reporte[]>> {
    let url = `${this.baseUrl}?page=${page}&limit=${limit}`;
    if (estado) url += `&estado=${estado}`;
    return this.http.get<ApiResponse<Reporte[]>>(url).pipe(
      catchError(err => throwError(() => err))
    );
  }

  iniciar(dto: IniciarReporteDto): Observable<ApiResponse<Reporte>> {
    return this.http.post<ApiResponse<Reporte>>(this.baseUrl, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  obtenerPorId(id: number): Observable<ApiResponse<Reporte>> {
    return this.http.get<ApiResponse<Reporte>>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  completar(id: number, dto: CompletarReporteDto): Observable<ApiResponse<Reporte>> {
    return this.http.patch<ApiResponse<Reporte>>(`${this.baseUrl}/${id}/completar`, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  obtenerSeguimientos(id: number): Observable<ApiResponse<Seguimiento[]>> {
    return this.http.get<ApiResponse<Seguimiento[]>>(`${this.baseUrl}/${id}/seguimientos`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
