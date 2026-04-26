import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BusesListComponent } from './pages/buses/buses-list.component';
import { BusDetailComponent } from './pages/buses/bus-detail.component';
import { ReportesListComponent } from './pages/reportes/reportes-list.component';
import { ReporteDetailComponent } from './pages/reportes/reporte-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'buses', component: BusesListComponent },
      { path: 'buses/:id', component: BusDetailComponent },
      { path: 'reportes', component: ReportesListComponent },
      { path: 'reportes/:id', component: ReporteDetailComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
