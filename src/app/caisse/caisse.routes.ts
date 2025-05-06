import { Route } from '@angular/router';
import { JournalCaisseComponent } from './journal-caisse/journal-caisse.component';
import { PointCaisseComponent } from './point-caisse/point-caisse.component';

export const CAISSE_ROUTES: Route[] = [
  { path: 'journal-caisse', component: JournalCaisseComponent },
  { path: 'point-caisse', component: PointCaisseComponent },
];
