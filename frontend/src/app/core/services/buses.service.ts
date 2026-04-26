import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Bus, EstadoOperativo } from '../models/bus.model';
import { Reporte } from '../models/reporte.model';
import { EstadoBus } from '../models/estado-bus.model';

export interface CrearBusDto {
  codigo: string;
  capacidad: number;
}

export interface ActualizarBusDto {
  codigo?: string;
  capacidad?: number;
}

@Injectable({ providedIn: 'root' })
export class BusesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/buses';

  listar(page: number, limit: number): Observable<ApiResponse<Bus[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ApiResponse<Bus[]>>(this.baseUrl, { params }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  obtenerPorId(id: number): Observable<ApiResponse<Bus>> {
    return this.http.get<ApiResponse<Bus>>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  crear(dto: CrearBusDto): Observable<ApiResponse<Bus>> {
    return this.http.post<ApiResponse<Bus>>(this.baseUrl, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  actualizar(id: number, dto: ActualizarBusDto): Observable<ApiResponse<Bus>> {
    return this.http.put<ApiResponse<Bus>>(`${this.baseUrl}/${id}`, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  listarReportes(id: number, page: number, limit: number): Observable<ApiResponse<Reporte[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ApiResponse<Reporte[]>>(`${this.baseUrl}/${id}/reportes`, { params }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  listarEstados(id: number): Observable<ApiResponse<EstadoBus[]>> {
    return this.http.get<ApiResponse<EstadoBus[]>>(`${this.baseUrl}/${id}/estados`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  cambiarEstado(id: number, estadoOperativo: EstadoOperativo): Observable<ApiResponse<EstadoBus>> {
    return this.http.post<ApiResponse<EstadoBus>>(`${this.baseUrl}/${id}/estado`, { estadoOperativo }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
