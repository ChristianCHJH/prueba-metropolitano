import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TimelineModule } from 'primeng/timeline';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { BusesService } from '../../core/services/buses.service';
import { ReportesService } from '../../core/services/reportes.service';
import { Bus, EstadoOperativo } from '../../core/models/bus.model';
import { Reporte } from '../../core/models/reporte.model';
import { EstadoBus } from '../../core/models/estado-bus.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { OcupacionBarComponent } from '../../shared/components/ocupacion-bar.component';

interface EstadoOpcion {
  label: string;
  value: EstadoOperativo;
}

@Component({
  selector: 'app-bus-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TabViewModule,
    DropdownModule,
    TableModule,
    DialogModule,
    InputNumberModule,
    PaginatorModule,
    TimelineModule,
    SkeletonModule,
    StatusBadgeComponent,
    OcupacionBarComponent,
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
        } @else if (bus()) {
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-2xl font-bold text-surface-100 font-mono">{{ bus()!.codigo }}</h1>
            @if (bus()!.estadoOperativoActual) {
              <app-status-badge [estado]="bus()!.estadoOperativoActual!" />
            }
          </div>
        }
      </div>

      @if (!cargando() && bus()) {
        <!-- Cambiar Estado Operativo -->
        <div class="bg-surface-800 rounded-xl border border-surface-700 p-5">
          <h2 class="text-surface-100 font-semibold mb-4">Cambiar Estado Operativo</h2>
          <div class="flex items-center gap-3 flex-wrap">
            <p-dropdown
              [options]="estadosOpciones"
              [(ngModel)]="estadoSeleccionado"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar estado"
              styleClass="w-64" />
            <p-button
              label="Aplicar Estado"
              icon="pi pi-check"
              severity="primary"
              [loading]="aplicandoEstado()"
              (onClick)="aplicarEstado()" />
          </div>
        </div>

        <!-- Tabs -->
        <p-tabView>
          <!-- Tab 1: Reporte Activo -->
          <p-tabPanel header="Reporte Activo" leftIcon="pi pi-chart-bar">
            @if (bus()!.reporteActivo) {
              <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div class="bg-surface-900 rounded-xl p-4 border border-surface-700">
                    <p class="text-surface-400 text-xs mb-1">Estado del Reporte</p>
                    <app-status-badge [estado]="bus()!.reporteActivo!.estadoReporte" />
                  </div>
                  <div class="bg-surface-900 rounded-xl p-4 border border-surface-700">
                    <p class="text-surface-400 text-xs mb-1">Pasajeros</p>
                    <p class="text-surface-100 font-semibold">{{ bus()!.reporteActivo!.cantidadPasajeros }}</p>
                  </div>
                  <div class="bg-surface-900 rounded-xl p-4 border border-surface-700">
                    <p class="text-surface-400 text-xs mb-2">Ocupación</p>
                    <app-ocupacion-bar
                      [porcentaje]="bus()!.reporteActivo!.porcentajeOcupacion"
                      [pasajeros]="bus()!.reporteActivo!.cantidadPasajeros"
                      [capacidad]="bus()!.reporteActivo!.capacidadBus" />
                  </div>
                  <div class="bg-surface-900 rounded-xl p-4 border border-surface-700">
                    <p class="text-surface-400 text-xs mb-1">Coordenadas Inicio</p>
                    <p class="text-surface-100 text-sm font-mono">
                      {{ bus()!.reporteActivo!.latitudInicio }}, {{ bus()!.reporteActivo!.longitudInicio }}
                    </p>
                  </div>
                  <div class="bg-surface-900 rounded-xl p-4 border border-surface-700">
                    <p class="text-surface-400 text-xs mb-1">Hora de Inicio</p>
                    <p class="text-surface-100 text-sm">{{ formatFecha(bus()!.reporteActivo!.inicioEn) }}</p>
                  </div>
                </div>

                @if (bus()!.reporteActivo!.estadoReporte === 'EN_COLA' || bus()!.reporteActivo!.estadoReporte === 'EN_RUTA') {
                  <div>
                    <p-button
                      label="Completar Reporte"
                      icon="pi pi-flag"
                      severity="warning"
                      (onClick)="abrirModalCompletar()" />
                  </div>
                }
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center py-12 gap-4">
                <i class="pi pi-file text-5xl text-surface-400 opacity-40"></i>
                <p class="text-surface-400">No hay reporte activo para este bus</p>
                <p-button
                  label="Iniciar Reporte"
                  icon="pi pi-play"
                  severity="success"
                  (onClick)="abrirModalIniciar()" />
              </div>
            }
          </p-tabPanel>

          <!-- Tab 2: Historial de Reportes -->
          <p-tabPanel header="Historial de Reportes" leftIcon="pi pi-history">
            <p-table
              [value]="reportes()"
              [loading]="cargandoReportes()"
              styleClass="p-datatable-sm"
              class="w-full">
              <ng-template pTemplate="header">
                <tr>
                  <th>ID</th>
                  <th>Estado</th>
                  <th>Pasajeros</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Duración</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-reporte>
                <tr class="cursor-pointer hover:bg-surface-700/30" (click)="verReporte(reporte.id)">
                  <td><span class="text-surface-400 text-sm">#{{ reporte.id }}</span></td>
                  <td><app-status-badge [estado]="reporte.estadoReporte" /></td>
                  <td><span class="text-surface-400">{{ reporte.cantidadPasajeros }}</span></td>
                  <td><span class="text-surface-400 text-sm">{{ formatFecha(reporte.inicioEn) }}</span></td>
                  <td><span class="text-surface-400 text-sm">{{ reporte.finEn ? formatFecha(reporte.finEn) : '—' }}</span></td>
                  <td><span class="text-surface-400 text-sm">{{ calcularDuracion(reporte.inicioEn, reporte.finEn) }}</span></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="text-center py-8 text-surface-400">No hay reportes registrados</td>
                </tr>
              </ng-template>
            </p-table>
            @if (totalReportes() > 0) {
              <div class="border-t border-surface-700 mt-0">
                <p-paginator
                  [rows]="pageSizeReportes"
                  [totalRecords]="totalReportes()"
                  [first]="firstReportes()"
                  (onPageChange)="onPageReportes($event)" />
              </div>
            }
          </p-tabPanel>

          <!-- Tab 3: Estados Operativos -->
          <p-tabPanel header="Estados Operativos" leftIcon="pi pi-list">
            @if (cargandoEstados()) {
              <div class="flex flex-col gap-3">
                @for (i of [1,2,3]; track i) {
                  <p-skeleton height="3rem" />
                }
              </div>
            } @else if (estados().length === 0) {
              <p class="text-surface-400 py-8 text-center">No hay estados registrados</p>
            } @else {
              <div class="flex flex-col gap-2">
                @for (estado of estados(); track estado.id) {
                  <div class="flex items-center justify-between bg-surface-900 rounded-lg px-4 py-3 border border-surface-700">
                    <app-status-badge [estado]="estado.estadoOperativo" />
                    <span class="text-surface-400 text-sm">{{ formatFecha(estado.fechaCreacion) }}</span>
                  </div>
                }
              </div>
            }
          </p-tabPanel>
        </p-tabView>
      }
    </div>

    <!-- Modal Completar Reporte -->
    <p-dialog
      [(visible)]="modalCompletarVisible"
      header="Completar Reporte"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '420px' }">
      <div class="flex flex-col gap-4 py-2" [formGroup]="formCompletar">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Latitud Final</label>
          <p-inputNumber formControlName="latitudFin" [minFractionDigits]="6" [maxFractionDigits]="8" placeholder="Ej: -33.456789" class="w-full" styleClass="w-full" />
          @if (formCompletar.controls['latitudFin'].invalid && formCompletar.controls['latitudFin'].touched) {
            <small class="text-red-400">Requerido</small>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Longitud Final</label>
          <p-inputNumber formControlName="longitudFin" [minFractionDigits]="6" [maxFractionDigits]="8" placeholder="Ej: -70.654321" class="w-full" styleClass="w-full" />
          @if (formCompletar.controls['longitudFin'].invalid && formCompletar.controls['longitudFin'].touched) {
            <small class="text-red-400">Requerido</small>
          }
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times" severity="secondary" (onClick)="modalCompletarVisible = false" />
          <p-button label="Completar" icon="pi pi-flag" severity="warning" [loading]="guardandoReporte()" (onClick)="completarReporte()" />
        </div>
      </ng-template>
    </p-dialog>

    <!-- Modal Iniciar Reporte -->
    <p-dialog
      [(visible)]="modalIniciarVisible"
      header="Iniciar Reporte"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '420px' }">
      <div class="flex flex-col gap-4 py-2" [formGroup]="formIniciar">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Cantidad de Pasajeros</label>
          <p-inputNumber formControlName="cantidadPasajeros" [min]="0" placeholder="Número de pasajeros" class="w-full" styleClass="w-full" />
          @if (formIniciar.controls['cantidadPasajeros'].invalid && formIniciar.controls['cantidadPasajeros'].touched) {
            <small class="text-red-400">Requerido (mín. 0)</small>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Latitud Inicial</label>
          <p-inputNumber formControlName="latitudInicio" [minFractionDigits]="6" [maxFractionDigits]="8" placeholder="Ej: -33.456789" class="w-full" styleClass="w-full" />
          @if (formIniciar.controls['latitudInicio'].invalid && formIniciar.controls['latitudInicio'].touched) {
            <small class="text-red-400">Requerido</small>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Longitud Inicial</label>
          <p-inputNumber formControlName="longitudInicio" [minFractionDigits]="6" [maxFractionDigits]="8" placeholder="Ej: -70.654321" class="w-full" styleClass="w-full" />
          @if (formIniciar.controls['longitudInicio'].invalid && formIniciar.controls['longitudInicio'].touched) {
            <small class="text-red-400">Requerido</small>
          }
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times" severity="secondary" (onClick)="modalIniciarVisible = false" />
          <p-button label="Iniciar" icon="pi pi-play" severity="success" [loading]="guardandoReporte()" (onClick)="iniciarReporte()" />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class BusDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly busesService = inject(BusesService);
  private readonly reportesService = inject(ReportesService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  bus = signal<Bus | null>(null);
  cargando = signal(true);
  reportes = signal<Reporte[]>([]);
  cargandoReportes = signal(false);
  totalReportes = signal(0);
  firstReportes = signal(0);
  pageSizeReportes = 10;
  estados = signal<EstadoBus[]>([]);
  cargandoEstados = signal(false);
  aplicandoEstado = signal(false);
  guardandoReporte = signal(false);
  estadoSeleccionado: EstadoOperativo | null = null;
  modalCompletarVisible = false;
  modalIniciarVisible = false;

  estadosOpciones: EstadoOpcion[] = [
    { label: 'Disponible', value: 'DISPONIBLE' },
    { label: 'En Cola', value: 'EN_COLA' },
    { label: 'En Ruta', value: 'EN_RUTA' },
    { label: 'Finalizado', value: 'FINALIZADO' },
    { label: 'Fuera de Servicio', value: 'FUERA_DE_SERVICIO' },
    { label: 'En Mantenimiento', value: 'EN_MANTENIMIENTO' },
  ];

  formCompletar: FormGroup = this.fb.group({
    latitudFin: [null, Validators.required],
    longitudFin: [null, Validators.required],
  });

  formIniciar: FormGroup = this.fb.group({
    cantidadPasajeros: [null, [Validators.required, Validators.min(0)]],
    latitudInicio: [null, Validators.required],
    longitudInicio: [null, Validators.required],
  });

  get busId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.cargarBus();
    this.cargarReportes();
    this.cargarEstados();
  }

  cargarBus(): void {
    this.cargando.set(true);
    this.busesService.obtenerPorId(this.busId).subscribe({
      next: res => {
        this.bus.set(res.data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el bus' });
      },
    });
  }

  cargarReportes(): void {
    this.cargandoReportes.set(true);
    const page = Math.floor(this.firstReportes() / this.pageSizeReportes) + 1;
    this.busesService.listarReportes(this.busId, page, this.pageSizeReportes).subscribe({
      next: res => {
        this.reportes.set(res.data);
        this.totalReportes.set(res.meta?.total ?? res.data.length);
        this.cargandoReportes.set(false);
      },
      error: () => this.cargandoReportes.set(false),
    });
  }

  cargarEstados(): void {
    this.cargandoEstados.set(true);
    this.busesService.listarEstados(this.busId).subscribe({
      next: res => {
        this.estados.set(res.data);
        this.cargandoEstados.set(false);
      },
      error: () => this.cargandoEstados.set(false),
    });
  }

  onPageReportes(event: PaginatorState): void {
    this.firstReportes.set(event.first ?? 0);
    this.cargarReportes();
  }

  aplicarEstado(): void {
    if (!this.estadoSeleccionado) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Selecciona un estado operativo' });
      return;
    }
    this.aplicandoEstado.set(true);
    this.busesService.cambiarEstado(this.busId, this.estadoSeleccionado).subscribe({
      next: () => {
        this.aplicandoEstado.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado correctamente' });
        this.cargarBus();
        this.cargarEstados();
      },
      error: err => {
        this.aplicandoEstado.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo cambiar el estado' });
      },
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
    const reporteId = this.bus()!.reporteActivo!.id;
    this.guardandoReporte.set(true);
    this.reportesService.completar(reporteId, this.formCompletar.value as { latitudFin: number; longitudFin: number }).subscribe({
      next: () => {
        this.guardandoReporte.set(false);
        this.modalCompletarVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reporte completado' });
        this.cargarBus();
        this.cargarReportes();
      },
      error: err => {
        this.guardandoReporte.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo completar el reporte' });
      },
    });
  }

  abrirModalIniciar(): void {
    this.formIniciar.reset();
    this.modalIniciarVisible = true;
  }

  iniciarReporte(): void {
    if (this.formIniciar.invalid) {
      this.formIniciar.markAllAsTouched();
      return;
    }
    this.guardandoReporte.set(true);
    const { cantidadPasajeros, latitudInicio, longitudInicio } = this.formIniciar.value as {
      cantidadPasajeros: number;
      latitudInicio: number;
      longitudInicio: number;
    };
    this.reportesService.iniciar({ busId: this.busId, cantidadPasajeros, latitudInicio, longitudInicio }).subscribe({
      next: () => {
        this.guardandoReporte.set(false);
        this.modalIniciarVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reporte iniciado' });
        this.cargarBus();
        this.cargarReportes();
      },
      error: err => {
        this.guardandoReporte.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo iniciar el reporte' });
      },
    });
  }

  verReporte(id: number): void {
    this.router.navigate(['/reportes', id]);
  }

  volver(): void {
    this.router.navigate(['/buses']);
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
