import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BusesService } from '../../core/services/buses.service';
import { Bus } from '../../core/models/bus.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-buses-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    PaginatorModule,
    SkeletonModule,
    StatusBadgeComponent,
  ],
  template: `
    <div class="p-6 flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Gestión de Flota</h1>
          <p class="text-surface-400 text-sm mt-1">Administra los buses del sistema</p>
        </div>
        <p-button
          label="Nuevo Bus"
          icon="pi pi-plus"
          severity="primary"
          (onClick)="abrirModalCrear()" />
      </div>

      <!-- Tabla -->
      <div class="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
        <p-table
          [value]="buses()"
          [loading]="cargando()"
          styleClass="p-datatable-sm"
          class="w-full">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="id" class="w-16">ID <p-sortIcon field="id" /></th>
              <th pSortableColumn="codigo">Código <p-sortIcon field="codigo" /></th>
              <th>Capacidad</th>
              <th>Estado Operativo</th>
              <th>Estado</th>
              <th class="text-center w-28">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-bus>
            <tr>
              <td><span class="text-surface-400 text-sm">{{ bus.id }}</span></td>
              <td>
                <span class="font-mono font-semibold text-surface-100">{{ bus.codigo }}</span>
              </td>
              <td><span class="text-surface-400">{{ bus.capacidad }} pas.</span></td>
              <td>
                @if (bus.estadoOperativoActual) {
                  <app-status-badge [estado]="bus.estadoOperativoActual" />
                } @else {
                  <span class="text-surface-400 text-xs">Sin estado</span>
                }
              </td>
              <td>
                @if (bus.estado) {
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    Activo
                  </span>
                } @else {
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    Inactivo
                  </span>
                }
              </td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <p-button
                    icon="pi pi-eye"
                    severity="info"
                    [rounded]="true"
                    [text]="true"
                    size="small"
                    pTooltip="Ver detalle"
                    (onClick)="verDetalle(bus.id)" />
                  <p-button
                    icon="pi pi-pencil"
                    severity="info"
                    [rounded]="true"
                    [text]="true"
                    size="small"
                    pTooltip="Editar"
                    (onClick)="abrirModalEditar(bus)" />
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [rounded]="true"
                    [text]="true"
                    size="small"
                    pTooltip="Eliminar"
                    (onClick)="confirmarEliminar(bus)" />
                </div>
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

    <!-- Modal Crear / Editar -->
    <p-dialog
      [(visible)]="modalVisible"
      [header]="modoEdicion() ? 'Editar Bus' : 'Nuevo Bus'"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '420px' }">
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Código</label>
          <input
            pInputText
            [formControl]="$any(form.controls['codigo'])"
            placeholder="Ej: BUS-001"
            class="w-full" />
          @if (form.controls['codigo'].invalid && form.controls['codigo'].touched) {
            <small class="text-red-400">El código es requerido</small>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-400">Capacidad</label>
          <p-inputNumber
            [formControl]="$any(form.controls['capacidad'])"
            [min]="1"
            placeholder="Número de pasajeros"
            class="w-full"
            styleClass="w-full" />
          @if (form.controls['capacidad'].invalid && form.controls['capacidad'].touched) {
            <small class="text-red-400">La capacidad es requerida (mín. 1)</small>
          }
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            (onClick)="cerrarModal()" />
          <p-button
            label="Guardar"
            icon="pi pi-save"
            severity="success"
            [loading]="guardando()"
            (onClick)="guardar()" />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class BusesListComponent implements OnInit {
  private readonly busesService = inject(BusesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  buses = signal<Bus[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  totalRecords = signal(0);
  first = signal(0);
  pageSize = 10;
  modalVisible = false;
  modoEdicion = signal(false);
  busSeleccionado = signal<Bus | null>(null);

  form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required]],
    capacidad: [null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.cargarDatos();
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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la flota' });
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

  abrirModalCrear(): void {
    this.modoEdicion.set(false);
    this.busSeleccionado.set(null);
    this.form.reset();
    this.modalVisible = true;
  }

  abrirModalEditar(bus: Bus): void {
    this.modoEdicion.set(true);
    this.busSeleccionado.set(bus);
    this.form.patchValue({ codigo: bus.codigo, capacidad: bus.capacidad });
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
    const { codigo, capacidad } = this.form.value as { codigo: string; capacidad: number };

    if (this.modoEdicion() && this.busSeleccionado()) {
      this.busesService.actualizar(this.busSeleccionado()!.id, { codigo, capacidad }).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bus actualizado correctamente' });
          this.cargarDatos();
        },
        error: err => {
          this.guardando.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo actualizar el bus' });
        },
      });
    } else {
      this.busesService.crear({ codigo, capacidad }).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bus creado correctamente' });
          this.cargarDatos();
        },
        error: err => {
          this.guardando.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo crear el bus' });
        },
      });
    }
  }

  confirmarEliminar(bus: Bus): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el bus <strong>${bus.codigo}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.busesService.eliminar(bus.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bus eliminado correctamente' });
            this.cargarDatos();
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo eliminar el bus' });
          },
        });
      },
    });
  }
}
