import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ReportesService } from '../../core/services/reportes.service';
import { BusesService } from '../../core/services/buses.service';
import { Reporte, EstadoReporte } from '../../core/models/reporte.model';
import { Bus } from '../../core/models/bus.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

interface FiltroEstado {
  label: string;
  value: EstadoReporte | null;
}

@Component({
  selector: 'app-reportes-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    PaginatorModule,
    SkeletonModule,
    StatusBadgeComponent,
  ],
  template: `
    <div class="p-6 flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Reportes de Viaje</h1>
          <p class="text-surface-400 text-sm mt-1">Historial de reportes del sistema</p>
        </div>
        <p-button
          label="Nuevo Reporte"
          icon="pi pi-plus"
          severity="success"
          (onClick)="abrirModalNuevo()" />
      </div>

      <!-- Filtro -->
      <div class="flex items-center gap-3 flex-wrap">
        <label class="text-sm text-surface-400">Filtrar por estado:</label>
        <p-dropdown
          [options]="filtrosEstado"
          [(ngModel)]="filtroSeleccionado"
          optionLabel="label"
          optionValue="value"
          (onChange)="aplicarFiltro()"
          styleClass="w-48" />
      </div>

      <!-- Tabla -->
      <div class="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
        <p-table
          [value]="reportesFiltrados()"
          [loading]="cargando()"
          styleClass="p-datatable-sm"
          class="w-full">
          <ng-template pTemplate="header">
            <tr>
              <th class="w-16">ID</th>
              <th>Bus</th>
              <th>Estado</th>
              <th>Pasajeros</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Duración</th>
              <th class="text-center w-20">Acción</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-reporte>
            <tr>
              <td><span class="text-surface-400 text-sm">#{{ reporte.id }}</span></td>
              <td>
                <span class="font-mono font-semibold text-surface-100">
                  {{ reporte.bus?.codigo ?? 'Bus #' + reporte.busId }}
                </span>
              </td>
              <td><app-status-badge [estado]="reporte.estadoReporte" /></td>
              <td><span class="text-surface-400">{{ reporte.cantidadPasajeros }}</span></td>
              <td><span class="text-surface-400 text-sm">{{ formatFecha(reporte.inicioEn) }}</span></td>
              <td><span class="text-surface-400 text-sm">{{ reporte.finEn ? formatFecha(reporte.finEn) : '—' }}</span></td>
              <td><span class="text-surface-400 text-sm">{{ calcularDuracion(reporte.inicioEn, reporte.finEn) }}</span></td>
              <td class="text-center">
                <p-button
                  icon="pi pi-eye"
                  severity="info"
                  [rounded]="true"
                  [text]="true"
                  size="small"
                  pTooltip="Ver detalle"
                  (onClick)="verDetalle(reporte.id)" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center py-10 text-surface-400">
                <i class="pi pi-file text-4xl mb-3 block opacity-30"></i>
                No hay reportes registrados
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Modal Nuevo Reporte -->
    <p-dialog
      [(visible)]="modalVisible"
      header="Nuevo Reporte"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '440px' }">
      <div class="flex flex-col gap-4 py-2" [formGroup]="form">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Bus</label>
          <p-dropdown
            formControlName="busId"
            [options]="buses()"
            optionLabel="codigo"
            optionValue="id"
            placeholder="Seleccionar bus"
            styleClass="w-full"
            [filter]="true"
            filterBy="codigo" />
          @if (form.controls['busId'].invalid && form.controls['busId'].touched) {
            <small class="text-red-400">Selecciona un bus</small>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Cantidad de Pasajeros</label>
          <p-inputNumber
            formControlName="cantidadPasajeros"
            [min]="0"
            placeholder="Número de pasajeros"
            class="w-full"
            styleClass="w-full" />
          @if (form.controls['cantidadPasajeros'].invalid && form.controls['cantidadPasajeros'].touched) {
            <small class="text-red-400">Requerido (mín. 0)</small>
          }
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-400">Latitud Inicio</label>
            <p-inputNumber
              formControlName="latitudInicio"
              [minFractionDigits]="6"
              [maxFractionDigits]="8"
              placeholder="-33.456789"
              styleClass="w-full" />
            @if (form.controls['latitudInicio'].invalid && form.controls['latitudInicio'].touched) {
              <small class="text-red-400">Requerido</small>
            }
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-400">Longitud Inicio</label>
            <p-inputNumber
              formControlName="longitudInicio"
              [minFractionDigits]="6"
              [maxFractionDigits]="8"
              placeholder="-70.654321"
              styleClass="w-full" />
            @if (form.controls['longitudInicio'].invalid && form.controls['longitudInicio'].touched) {
              <small class="text-red-400">Requerido</small>
            }
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times" severity="secondary" (onClick)="cerrarModal()" />
          <p-button label="Iniciar Reporte" icon="pi pi-play" severity="success" [loading]="guardando()" (onClick)="guardar()" />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class ReportesListComponent implements OnInit {
  private readonly reportesService = inject(ReportesService);
  private readonly busesService = inject(BusesService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  reportes = signal<Reporte[]>([]);
  reportesFiltrados = signal<Reporte[]>([]);
  buses = signal<Bus[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  modalVisible = false;
  filtroSeleccionado: EstadoReporte | null = null;

  filtrosEstado: FiltroEstado[] = [
    { label: 'Todos', value: null },
    { label: 'En Cola', value: 'EN_COLA' },
    { label: 'En Ruta', value: 'EN_RUTA' },
    { label: 'Finalizado', value: 'FINALIZADO' },
  ];

  form: FormGroup = this.fb.group({
    busId: [null, Validators.required],
    cantidadPasajeros: [null, [Validators.required, Validators.min(0)]],
    latitudInicio: [null, Validators.required],
    longitudInicio: [null, Validators.required],
  });

  ngOnInit(): void {
    this.cargarBuses();
    this.cargarReportes();
  }

  cargarBuses(): void {
    this.busesService.listar(1, 100).subscribe({
      next: res => this.buses.set(res.data),
      error: () => {},
    });
  }

  cargarReportes(): void {
    this.cargando.set(true);
    const estado = this.filtroSeleccionado ?? undefined;
    this.reportesService.listar(1, 100, estado).subscribe({
      next: res => {
        this.reportes.set(res.data);
        this.reportesFiltrados.set(res.data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  aplicarFiltro(): void {
    this.cargarReportes();
  }

  abrirModalNuevo(): void {
    this.form.reset();
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const { busId, cantidadPasajeros, latitudInicio, longitudInicio } = this.form.value as {
      busId: number;
      cantidadPasajeros: number;
      latitudInicio: number;
      longitudInicio: number;
    };
    this.reportesService.iniciar({ busId, cantidadPasajeros, latitudInicio, longitudInicio }).subscribe({
      next: res => {
        this.guardando.set(false);
        this.cerrarModal();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reporte iniciado correctamente' });
        this.router.navigate(['/reportes', res.data.id]);
      },
      error: err => {
        this.guardando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo iniciar el reporte' });
      },
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/reportes', id]);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  calcularDuracion(inicio: string, fin: string | null): string {
    if (!fin) return 'En curso';
    const diff = Math.floor((new Date(fin).getTime() - new Date(inicio).getTime()) / 60000);
    if (diff < 60) return `${diff} min`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  }
}
