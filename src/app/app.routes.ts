import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { PreinspriptionComponent } from './preinspription/preinspription.component';
import { DashboardPreinscriptionComponent } from './components/dashboard-preinscription/dashboard-preinscription.component';

export const routes: Routes = [
  { path: '', redirectTo: 'tb-preinscr', pathMatch: 'full' },
  {path:'tb-preinscr',component:DashboardPreinscriptionComponent},
  { path: 'login', component: LoginComponent },
  { path: 'preinscription', component: PreinspriptionComponent },
];
