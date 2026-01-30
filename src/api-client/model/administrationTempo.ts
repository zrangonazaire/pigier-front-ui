export interface AdministrationTempo {
  id?: number;
  matriElev: string;
  nomPrenoms: string;
  groupe: string;
  codeUE: string;
  ecue1: string;
  ecue2: string;
  dteDeliber: string;
  moyenneCC: number;
  moyenneExam: number;
  moyenneGle: number;
  decision: string;
  annee: string;
  dateOperation: string;
  creditUE: number;
  classActu: string;
  classExam: string;
  traitement: 'TRAITE' | 'NON_TRAITE';
}
