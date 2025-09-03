import { Route } from '@angular/router';
import { EtatlisteeleveComponent } from './etatlisteeleve/etatlisteeleve.component';
import { ReportGeneratorComponent } from './recapetudiant/recapetudiant.component';


export const ELEVE_ROUTES: Route[] = [
  { path: 'etatliste-eleve', component: EtatlisteeleveComponent },
  { path: 'recap-etudiant', component: ReportGeneratorComponent },
];

