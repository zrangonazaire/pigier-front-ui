import { Routes } from '@angular/router';
import { PermissionManagementComponent } from './permission-management.component';

export const PERMISSION_ROUTES: Routes = [
  {
    path: 'gestion-permissions', // URL: /gestion-permissions
    component: PermissionManagementComponent,
  }
];