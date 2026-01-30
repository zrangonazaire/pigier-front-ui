import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardPreinscriptionComponent } from './components/dashboard-preinscription/dashboard-preinscription.component';
import { TbPedaComponent } from './components/tb-peda/tb-peda.component';
import { PermissionGuard } from './core/permission.guard';
import {ImporterFichierComponent} from './admin/importer-fichier/importer-fichier';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'tb-preinscr',
    component: DashboardPreinscriptionComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        'READ_PREINSCRIPTION',
        'WRITE_PREINSCRIPTION',
        'EDIT_PREINSCRIPTION',
        'DELETE_PREINSCRIPTION',
        'READ_COMMERCIALE',
        'WRITE_COMMERCIALE',
        'EDIT_COMMERCIALE',
        'DELETE_COMMERCIALE',
      ],
    },
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'tb-peda',
    component: TbPedaComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        'READ_NOTE',
        'WRITE_NOTE',
        'EDIT_NOTE',
        'DELETE_NOTE',
        'READ_EXAMEN',
        'WRITE_EXAMEN',
        'EDIT_EXAMEN',
        'DELETE_EXAMEN',
        'READ_ELEVE',
        'WRITE_ELEVE',
        'EDIT_ELEVE',
        'DELETE_ELEVE',
      ],
    },
  },
  {
    path: 'preinscription',
    loadChildren: () =>
      import('./preinscription/preinscription.routes').then(
        (m) => m.PREINSCRIPTION_ROUTES
      ),
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        'READ_PREINSCRIPTION',
        'WRITE_PREINSCRIPTION',
        'EDIT_PREINSCRIPTION',
        'DELETE_PREINSCRIPTION',
        'READ_COMMERCIALE',
        'WRITE_COMMERCIALE',
        'EDIT_COMMERCIALE',
        'DELETE_COMMERCIALE',
      ],
    },
  },
  {
    path: 'caisse',
    loadChildren: () =>
      import('./caisse/caisse.routes').then((m) => m.CAISSE_ROUTES),
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        'READ_COMPTABILITE',
        'WRITE_COMPTABILITE',
        'EDIT_COMPTABILITE',
        'DELETE_COMPTABILITE',
      ],
    },
  },
  {
    path: 'eleve',
    loadChildren: () =>
      import('./eleve/eleve.routes').then((m) => m.ELEVE_ROUTES),
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        'READ_ELEVE',
        'WRITE_ELEVE',
        'EDIT_ELEVE',
        'DELETE_ELEVE',
      ],
    },
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
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        'READ_COMPTABILITE',
        'WRITE_COMPTABILITE',
        'EDIT_COMPTABILITE',
        'DELETE_COMPTABILITE',
      ],
    },
  },
  {
    path: 'notes',
    loadChildren: () => import('./note/note.route').then((m) => m.NOTE_ROUTE),
    canActivate: [PermissionGuard],
    data: {
      permissions: ['READ_NOTE', 'WRITE_NOTE', 'EDIT_NOTE', 'DELETE_NOTE'],
    },
  },
  {
  path: 'admin/importer-fichier',
  component: ImporterFichierComponent
}
];
