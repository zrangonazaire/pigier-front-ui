import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardPreinscriptionComponent } from './components/dashboard-preinscription/dashboard-preinscription.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'tb-preinscr', component: DashboardPreinscriptionComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'preinscription',
    loadChildren: () =>
      import('./preinscription/preinscription.routes').then(
        (m) => m.PREINSCRIPTION_ROUTES
      ),
  },
  {
    path: 'caisse',
    loadChildren: () =>
      import('./caisse/caisse.routes').then((m) => m.CAISSE_ROUTES),
  },
  {
    path: 'eleve',
    loadChildren: () =>
      import('./eleve/eleve.routes').then((m) => m.ELEVE_ROUTES),
  },
  {
    path: 'permissions',
    loadChildren: () =>
      import('./features/permission-management/permission.routes').then(
        (m) => m.PERMISSION_ROUTES
      ),
  },
  {
    path: 'users-roles',
    loadChildren: () =>
      import('./admin/roles/role.routes').then((m) => m.ROLE_ROUTES),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./admin/users/user.route').then((m) => m.ROLE_ROUTES),
  },
  {
    path: 'compta',
    loadChildren: () =>
      import('./components/tb-comptablilite/tb-comptabilite.routes').then(
        (m) => m.TB_COMPTABILITE_ROUTES
      ),
  },
];
