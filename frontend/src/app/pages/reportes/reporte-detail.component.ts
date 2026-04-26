import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ReportesService } from '../../core/services/reportes.service';
import { Reporte } from '../../core/models/reporte.model';
import { Seguimiento } from '../../core/models/seguimiento.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { OcupacionBarComponent } from '../../shared/components/ocupacion-bar.component';
import { RouteMapComponent } from '../../shared/components/route-map.component';

@Component({
  selector: 'app-reporte-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    TableModule,
    SkeletonModule,
    StatusBadgeComponent,
    OcupacionBarComponent,
    RouteMapComponent,
  ],
  template: `
    <div class="p-6 flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center gap-4 flex-wrap">
        <p-button
          icon="pi pi-arrow-left"
          severity="secondary"
          [text]="true"
          label="Volver"
          (onClick)="volver()" />
        @if (cargando()) {
          <p-skeleton height="2rem" width="200px" />
        } @else if (reporte()) {
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-2xl font-bold text-surface-100">Reporte #{{ reporte()!.id }}</h1>
            <app-status-badge [estado]="reporte()!.estadoReporte" />
          </div>
        }
      </div>

      @if (cargando()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <p-skeleton height="6rem" />
          }
        </div>
      } @else if (reporte()) {
        <!-- Info Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Bus -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <p class="text-surface-400 text-xs mb-2 uppercase tracking-wide">Bus</p>
            <p class="text-surface-100 text-xl font-bold font-mono">
              {{ reporte()!.bus?.codigo ?? 'Bus #' + reporte()!.busId }}
            </p>
          </div>

          <!-- Pasajeros -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <p class="text-surface-400 text-xs mb-2 uppercase tracking-wide">Pasajeros</p>
            <p class="text-surface-100 text-xl font-bold">{{ reporte()!.cantidadPasajeros }}</p>
            @if (reporte()!.bus) {
              <div class="mt-2">
                <app-ocupacion-bar
                  [porcentaje]="calcularOcupacion()"
                  [pasajeros]="reporte()!.cantidadPasajeros"
                  [capacidad]="reporte()!.bus!.capacidad" />
              </div>
            }
          </div>

          <!-- Inicio -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <p class="text-surface-400 text-xs mb-2 uppercase tracking-wide">Inicio</p>
            <p class="text-surface-100 font-semibold">{{ formatFecha(reporte()!.inicioEn) }}</p>
            <p class="text-surface-400 text-sm font-mono mt-1">
              {{ reporte()!.latitudInicio }}, {{ reporte()!.longitudInicio }}
            </p>
          </div>

          <!-- Fin -->
          <div class="bg-surface-800 rounded-xl p-5 border border-surface-700">
            <p class="text-surface-400 text-xs mb-2 uppercase tracking-wide">Fin</p>
            @if (reporte()!.finEn) {
              <p class="text-surface-100 font-semibold">{{ formatFecha(reporte()!.finEn!) }}</p>
              <p class="text-surface-400 text-sm font-mono mt-1">
                {{ reporte()!.latitudFin }}, {{ reporte()!.longitudFin }}
              </p>
            } @else {
              <p class="text-surface-400">—</p>
            }
          </div>
        </div>

        <!-- Botón Completar -->
        @if (reporte()!.estadoReporte === 'EN_COLA' || reporte()!.estadoReporte === 'EN_RUTA') {
          <div>
            <p-button
              label="Completar Reporte"
              icon="pi pi-flag"
              severity="warning"
              (onClick)="abrirModalCompletar()" />
          </div>
        }

        <!-- Mapa de recorrido -->
        <div class="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
          <div class="px-5 py-4 border-b border-surface-700 flex items-center justify-between">
            <div>
              <h2 class="text-surface-100 font-semibold">Recorrido en Mapa</h2>
              <p class="text-surface-400 text-xs mt-0.5">{{ seguimientos().length }} puntos GPS registrados</p>
            </div>
            @if (reporte()!.estadoReporte === 'EN_RUTA') {
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span class="text-green-400 text-xs font-medium">En vivo</span>
              </div>
            }
          </div>

          @if (cargandoSeguimientos()) {
            <div class="flex items-center justify-center" style="height: 420px;">
              <div class="flex flex-col items-center gap-3 text-surface-400">
                <i class="pi pi-spin pi-spinner text-3xl"></i>
                <span class="text-sm">Cargando mapa...</span>
              </div>
            </div>
          } @else if (seguimientos().length === 0) {
            <div class="flex flex-col items-center justify-center gap-3 text-surface-400" style="height: 420px;">
              <i class="pi pi-map text-5xl opacity-30"></i>
              <p class="text-sm">No hay puntos de seguimiento registrados</p>
              <p class="text-xs opacity-60">El seguimiento se activa cuando el bus entra en estado EN_RUTA</p>
            </div>
          } @else {
            <app-route-map
              [seguimientos]="seguimientos()"
              [estadoReporte]="reporte()!.estadoReporte" />
          }
        </div>

        <!-- Tabla de puntos GPS -->
        <div class="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
          <div class="px-5 py-4 border-b border-surface-700">
            <h2 class="text-surface-100 font-semibold text-sm">Detalle de puntos GPS</h2>
          </div>
          <p-table
            [value]="seguimientos()"
            [loading]="cargandoSeguimientos()"
            styleClass="p-datatable-sm"
            class="w-full">
            <ng-template pTemplate="header">
              <tr>
                <th class="w-12">#</th>
                <th>Latitud</th>
                <th>Longitud</th>
                <th>Fecha / Hora</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-seg let-i="rowIndex">
              <tr>
                <td><span class="text-surface-400 text-xs">{{ i + 1 }}</span></td>
                <td><span class="font-mono text-xs text-surface-100">{{ seg.latitud }}</span></td>
                <td><span class="font-mono text-xs text-surface-100">{{ seg.longitud }}</span></td>
                <td><span class="text-surface-400 text-xs">{{ formatFecha(seg.fechaCreacion) }}</span></td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    </div>

    <!-- Modal Completar -->
    <p-dialog
      [(visible)]="modalCompletarVisible"
      header="Completar Reporte"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '420px' }">
      <div class="flex flex-col gap-4 py-2" [formGroup]="formCompletar">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Latitud Final</label>
          <p-inputNumber
            formControlName="latitudFin"
            [minFractionDigits]="6"
            [maxFractionDigits]="8"
            placeholder="Ej: -33.456789"
            class="w-full"
            styleClass="w-full" />
          @if (formCompletar.controls['latitudFin'].invalid && formCompletar.controls['latitudFin'].touched) {
            <small class="text-red-400">Requerido</small>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Longitud Final</label>
          <p-inputNumber
            formControlName="longitudFin"
            [minFractionDigits]="6"
            [maxFractionDigits]="8"
            placeholder="Ej: -70.654321"
            class="w-full"
            styleClass="w-full" />
          @if (formCompletar.controls['longitudFin'].invalid && formCompletar.controls['longitudFin'].touched) {
            <small class="text-red-400">Requerido</small>
          }
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times" severity="secondary" (onClick)="modalCompletarVisible = false" />
          <p-button label="Completar" icon="pi pi-flag" severity="warning" [loading]="guardando()" (onClick)="completarReporte()" />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class ReporteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reportesService = inject(ReportesService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  reporte = signal<Reporte | null>(null);
  seguimientos = signal<Seguimiento[]>([]);
  cargando = signal(true);
  cargandoSeguimientos = signal(true);
  guardando = signal(false);
  modalCompletarVisible = false;

  formCompletar: FormGroup = this.fb.group({
    latitudFin: [null, Validators.required],
    longitudFin: [null, Validators.required],
  });

  get reporteId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.cargarReporte();
    this.cargarSeguimientos();
  }

  cargarReporte(): void {
    this.cargando.set(true);
    this.reportesService.obtenerPorId(this.reporteId).subscribe({
      next: res => {
        this.reporte.set(res.data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el reporte' });
      },
    });
  }

  cargarSeguimientos(): void {
    this.cargandoSeguimientos.set(true);
    this.reportesService.obtenerSeguimientos(this.reporteId).subscribe({
      next: res => {
        this.seguimientos.set(res.data.sort((a, b) => a.id - b.id));
        this.cargandoSeguimientos.set(false);
      },
      error: () => this.cargandoSeguimientos.set(false),
    });
  }

  abrirModalCompletar(): void {
    this.formCompletar.reset();
    this.modalCompletarVisible = true;
  }

  completarReporte(): void {
    if (this.formCompletar.invalid) {
      this.formCompletar.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.reportesService.completar(this.reporteId, this.formCompletar.value as { latitudFin: number; longitudFin: number }).subscribe({
      next: res => {
        this.guardando.set(false);
        this.modalCompletarVisible = false;
        this.reporte.set(res.data);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reporte completado correctamente' });
      },
      error: err => {
        this.guardando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo completar el reporte' });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/reportes']);
  }

  calcularOcupacion(): number {
    if (!this.reporte()!.bus) return 0;
    return Math.round((this.reporte()!.cantidadPasajeros / this.reporte()!.bus!.capacidad) * 100);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
