import { Route } from '@angular/router';
import { EtatlisteeleveComponent } from './etatlisteeleve/etatlisteeleve.component';
import { EtudiantHyperPlanningComponent } from './etudiant-hyper-planning/etudiant-hyper-planning.component';
import { ReportGeneratorComponent } from './recapetudiant/recapetudiant.component';
import {ReportGeneratorComponentExcel} from './etat-inscri-date/report-generator.component';


export const ELEVE_ROUTES: Route[] = [
  { path: 'etatliste-eleve', component: EtatlisteeleveComponent },
  { path: 'liste-hyper-planning', component: EtudiantHyperPlanningComponent },
   { path: 'recap-etudiant', component: ReportGeneratorComponent },
   { path: 'list-etudiant-date', component: ReportGeneratorComponentExcel }



];

