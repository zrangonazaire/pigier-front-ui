import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardPreinscriptionComponent } from './components/dashboard-preinscription/dashboard-preinscription.component';

export const routes: Routes = [
  { path: '', redirectTo: 'tb-preinscr', pathMatch: 'full' },
  {path:'tb-preinscr',component:DashboardPreinscriptionComponent},
  { path: 'login', component: LoginComponent },
  { path: 'preinscription', loadChildren: () => import('./preinscription/preinscription.routes').then(m => m.PREINSCRIPTION_ROUTES) },
  {path:'caisse',loadChildren: () => import('./caisse/caisse.routes').then(m => m.CAISSE_ROUTES)},
  {path:'eleve',loadChildren: () => import('./eleve/eleve.routes').then(m => m.ELEVE_ROUTES)},
];
