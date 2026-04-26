import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  ruta: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 shrink-0">
      <!-- Logo -->
      <div class="px-6 py-5 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <i class="pi pi-car text-white text-lg"></i>
          </div>
          <div>
            <p class="text-slate-100 font-bold text-sm leading-tight">Metropolitano</p>
            <p class="text-slate-400 text-xs">Fleet Monitor</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
        @for (item of navItems; track item.ruta) {
          <a
            [routerLink]="item.ruta"
            routerLinkActive="active-link"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all duration-150 text-sm font-medium nav-link cursor-pointer">
            <i [class]="'pi ' + item.icon + ' text-base'"></i>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Version -->
      <div class="px-6 py-4 border-t border-slate-800">
        <span class="text-slate-500 text-xs">v1.0.0</span>
      </div>
    </aside>
  `,
  styles: [`
    .nav-link.active-link {
      background-color: rgb(59 130 246 / 0.15);
      color: #60A5FA;
      border-left: 2px solid #3B82F6;
      padding-left: calc(0.75rem - 2px);
    }
  `],
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi-th-large', ruta: '/dashboard' },
    { label: 'Flota',     icon: 'pi-car',      ruta: '/buses'     },
    { label: 'Reportes',  icon: 'pi-file',     ruta: '/reportes'  },
  ];
}
