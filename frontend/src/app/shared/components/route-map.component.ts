import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  ElementRef,
  ViewChild,
  SimpleChanges,
} from '@angular/core';
import * as L from 'leaflet';
import { Seguimiento } from '../../core/models/seguimiento.model';

@Component({
  selector: 'app-route-map',
  standalone: true,
  template: `
    <div #mapContainer style="height: 420px; width: 100%; border-radius: 0.75rem; overflow: hidden;"></div>
  `,
})
export class RouteMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() seguimientos: Seguimiento[] = [];
  @Input() estadoReporte: string = '';

  private map?: L.Map;
  private layers: L.Layer[] = [];

  ngAfterViewInit(): void {
    this.initMap();
    if (this.seguimientos.length > 0) {
      this.renderRuta();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seguimientos'] && this.map) {
      this.renderRuta();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([-12.0464, -77.0320], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(this.map);
  }

  private renderRuta(): void {
    if (!this.map) return;

    // Limpiar capas anteriores
    this.layers.forEach(l => this.map!.removeLayer(l));
    this.layers = [];

    if (this.seguimientos.length === 0) return;

    const coords: L.LatLngExpression[] = this.seguimientos.map(s => [
      Number(s.latitud),
      Number(s.longitud),
    ]);

    // Polyline de la ruta
    const polyline = L.polyline(coords, {
      color: '#3B82F6',
      weight: 4,
      opacity: 0.85,
    }).addTo(this.map);
    this.layers.push(polyline);

    // Marcador de inicio (verde)
    const inicio = this.seguimientos[0];
    const markerInicio = L.marker([Number(inicio.latitud), Number(inicio.longitud)], {
      icon: this.crearIcono('green'),
    })
      .bindPopup(`<b>Inicio</b><br>${this.formatFecha(inicio.fechaCreacion)}`)
      .addTo(this.map);
    this.layers.push(markerInicio);

    const ultimo = this.seguimientos[this.seguimientos.length - 1];

    if (this.estadoReporte === 'FINALIZADO' && this.seguimientos.length > 1) {
      // Marcador de fin (rojo)
      const markerFin = L.marker([Number(ultimo.latitud), Number(ultimo.longitud)], {
        icon: this.crearIcono('red'),
      })
        .bindPopup(`<b>Fin</b><br>${this.formatFecha(ultimo.fechaCreacion)}`)
        .addTo(this.map);
      this.layers.push(markerFin);
    } else if (this.estadoReporte === 'EN_RUTA') {
      // Marcador de posición actual (azul pulsante)
      const markerActual = L.marker([Number(ultimo.latitud), Number(ultimo.longitud)], {
        icon: this.crearIcono('blue'),
      })
        .bindPopup(`<b>Posición actual</b><br>${this.formatFecha(ultimo.fechaCreacion)}`)
        .openPopup()
        .addTo(this.map);
      this.layers.push(markerActual);
    }

    // Ajustar vista al recorrido
    this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  }

  private crearIcono(color: 'green' | 'red' | 'blue'): L.DivIcon {
    const colores: Record<string, string> = {
      green: '#22C55E',
      red:   '#EF4444',
      blue:  '#3B82F6',
    };
    const hex = colores[color];
    return L.divIcon({
      className: '',
      html: `
        <div style="
          width: 18px; height: 18px;
          background: ${hex};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -12],
    });
  }

  private formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
