import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="clases" class="px-2 py-0.5 rounded-full text-xs font-medium">
      {{ etiqueta }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() estado: string = '';

  get clases(): string {
    const mapa: Record<string, string> = {
      EN_RUTA: 'bg-green-500/20 text-green-400 border border-green-500/30',
      EN_COLA: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      FINALIZADO: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
      FUERA_DE_SERVICIO: 'bg-red-500/20 text-red-400 border border-red-500/30',
      EN_MANTENIMIENTO: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      DISPONIBLE: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    };
    return mapa[this.estado] ?? 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  }

  get etiqueta(): string {
    const mapa: Record<string, string> = {
      EN_RUTA: 'En Ruta',
      EN_COLA: 'En Cola',
      FINALIZADO: 'Finalizado',
      FUERA_DE_SERVICIO: 'Fuera de Servicio',
      EN_MANTENIMIENTO: 'En Mantenimiento',
      DISPONIBLE: 'Disponible',
    };
    return mapa[this.estado] ?? this.estado;
  }
}
