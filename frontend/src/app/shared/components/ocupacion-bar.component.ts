import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ocupacion-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-1 min-w-[120px]">
      <div class="w-full bg-surface-700 rounded-full h-2">
        <div
          [style.width.%]="porcentaje"
          [ngClass]="colorBarra"
          class="h-2 rounded-full transition-all duration-300">
        </div>
      </div>
      <span class="text-xs text-surface-400">{{ pasajeros }}/{{ capacidad }} ({{ porcentaje }}%)</span>
    </div>
  `,
})
export class OcupacionBarComponent {
  @Input() porcentaje: number = 0;
  @Input() pasajeros: number = 0;
  @Input() capacidad: number = 0;

  get colorBarra(): string {
    if (this.porcentaje > 85) return 'bg-red-500';
    if (this.porcentaje >= 60) return 'bg-amber-500';
    return 'bg-green-500';
  }
}
