import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastModule, ConfirmDialogModule],
  template: `
    <div class="flex h-screen overflow-hidden">
      <app-sidebar />
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <router-outlet />
      </main>
    </div>
    <p-toast position="top-right" />
    <p-confirmDialog
      styleClass="bg-surface-800"
      [style]="{ width: '420px' }">
    </p-confirmDialog>
  `,
})
export class AppLayoutComponent {}
