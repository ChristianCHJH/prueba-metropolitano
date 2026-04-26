import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { BusesService } from '../../core/services/buses.service';
import { Bus } from '../../core/models/bus.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { OcupacionBarComponent } from '../../shared/components/ocupacion-bar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    SkeletonModule,
    StatusBadgeComponent,
    OcupacionBarComponent,
  ],
  template: `
    <div class="p-6 flex flex-col gap-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">Dashboard</h1>
        <p class="text-surface-400 text-sm mt-1">Monitoreo en tiempo real de la flota</p>
      </div>

      <!-- KPI Cards -->
      @if (cargando()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
              <p-skeleton height="1rem" width="60%" styleClass="mb-3" />
              <p-skeleton height="2.5rem" width="40%" />
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <div class="flex items-center justify-between mb-3">
              <p class="text-surface-400 text-sm font-medium">Total Buses</p>
              <div class="w-8 h-8 bg-brand/20 rounded-lg flex items-center justify-center">
                <i class="pi pi-car text-brand text-sm"></i>
              </div>
            </div>
            <p class="text-3xl font-bold text-surface-100">{{ totalBuses() }}</p>
          </div>

          <!-- En Ruta -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <div class="flex items-center justify-between mb-3">
              <p class="text-surface-400 text-sm font-medium">En Ruta</p>
              <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i class="pi pi-map-marker text-green-400 text-sm"></i>
              </div>
            </div>
            <p class="text-3xl font-bold text-green-400">{{ countEstado('EN_RUTA') }}</p>
          </div>

          <!-- En Cola -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <div class="flex items-center justify-between mb-3">
              <p class="text-surface-400 text-sm font-medium">En Cola</p>
              <div class="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <i class="pi pi-clock text-amber-400 text-sm"></i>
              </div>
            </div>
            <p class="text-3xl font-bold text-amber-400">{{ countEstado('EN_COLA') }}</p>
          </div>

          <!-- Fuera de Servicio -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <div class="flex items-center justify-between mb-3">
              <p class="text-surface-400 text-sm font-medium">Fuera de Servicio</p>
              <div class="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <i class="pi pi-times-circle text-red-400 text-sm"></i>
              </div>
            </div>
            <p class="text-3xl font-bold text-red-400">{{ countEstado('FUERA_DE_SERVICIO') }}</p>
          </div>
        </div>
      }

      <!-- Tabla flota en vivo -->
      <div class="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-surface-700 flex items-center justify-between">
          <div>
            <h2 class="text-surface-100 font-semibold">Flota en Vivo</h2>
            <p class="text-surface-400 text-xs mt-0.5">Actualización cada 30 segundos</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-surface-400 text-xs">En vivo</span>
          </div>
        </div>

        <p-table
          [value]="buses()"
          [loading]="cargando()"
          styleClass="p-datatable-sm"
          class="w-full">
          <ng-template pTemplate="header">
            <tr>
              <th>Código</th>
              <th>Capacidad</th>
              <th>Estado Operativo</th>
              <th>Ocupación</th>
              <th>Último Seguimiento</th>
              <th class="text-center w-24">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-bus>
            <tr>
              <td>
                <span class="font-mono font-semibold text-surface-100">{{ bus.codigo }}</span>
              </td>
              <td>
                <span class="text-surface-400">{{ bus.capacidad }} pasajeros</span>
              </td>
              <td>
                @if (bus.estadoOperativoActual) {
                  <app-status-badge [estado]="bus.estadoOperativoActual" />
                } @else {
                  <span class="text-surface-400 text-xs">—</span>
                }
              </td>
              <td>
                @if (bus.reporteActivo) {
                  <app-ocupacion-bar
                    [porcentaje]="bus.reporteActivo.porcentajeOcupacion"
                    [pasajeros]="bus.reporteActivo.cantidadPasajeros"
                    [capacidad]="bus.reporteActivo.capacidadBus" />
                } @else {
                  <span class="text-surface-400 text-xs">—</span>
                }
              </td>
              <td>
                @if (bus.reporteActivo?.ultimoSeguimiento) {
                  <span class="text-surface-400 text-xs">
                    {{ tiempoRelativo(bus.reporteActivo!.ultimoSeguimiento!.fechaCreacion) }}
                  </span>
                } @else {
                  <span class="text-surface-400 text-xs">Sin datos</span>
                }
              </td>
              <td class="text-center">
                <p-button
                  icon="pi pi-eye"
                  severity="info"
                  [rounded]="true"
                  [text]="true"
                  size="small"
                  pTooltip="Ver detalle"
                  (onClick)="verDetalle(bus.id)" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-10 text-surface-400">
                <i class="pi pi-car text-4xl mb-3 block opacity-30"></i>
                No hay buses registrados
              </td>
            </tr>
          </ng-template>
        </p-table>

        <!-- Paginador -->
        @if (totalRecords() > 0) {
          <div class="border-t border-surface-700">
            <p-paginator
              [rows]="pageSize"
              [totalRecords]="totalRecords()"
              [first]="first()"
              (onPageChange)="onPageChange($event)"
              [rowsPerPageOptions]="[10, 25, 50]" />
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly busesService = inject(BusesService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  buses = signal<Bus[]>([]);
  cargando = signal(true);
  totalRecords = signal(0);
  first = signal(0);
  pageSize = 10;
  private refreshInterval?: ReturnType<typeof setInterval>;

  totalBuses = computed(() => this.totalRecords());
  countEstado = (estado: string) =>
    this.buses().filter(b => b.estadoOperativoActual === estado).length;

  ngOnInit(): void {
    this.cargarDatos();
    this.refreshInterval = setInterval(() => this.cargarDatos(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  cargarDatos(): void {
    const page = Math.floor(this.first() / this.pageSize) + 1;
    this.busesService.listar(page, this.pageSize).subscribe({
      next: res => {
        this.buses.set(res.data);
        this.totalRecords.set(res.meta?.total ?? res.data.length);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información de la flota',
        });
      },
    });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first.set(event.first ?? 0);
    this.cargando.set(true);
    this.cargarDatos();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/buses', id]);
  }

  tiempoRelativo(fecha: string): string {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
    if (diff < 1) return 'Hace menos de 1 min';
    if (diff === 1) return 'Hace 1 min';
    if (diff < 60) return `Hace ${diff} min`;
    const h = Math.floor(diff / 60);
    return `Hace ${h} h`;
  }
}
