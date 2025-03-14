import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { PreinspriptionComponent } from './preinspription/preinspription.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'preinscription', component: PreinspriptionComponent },
];
