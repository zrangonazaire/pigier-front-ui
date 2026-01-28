// dashboard-encaissement-bi.model.ts
import {EncaissementEleveBIBaseDTO} from './EncaissementEleveBIBaseDTO';

export interface DashboardEncaissementBIDTO {

  // ======================
  // CARTES
  // ======================
  totalEleves: number;

  totalElevesSoldes: number;
  totalElevesNonSoldes: number;

  montantTotalAttendu: number;
  montantTotalEncaisse: number;
  montantTotalRestant: number;

  montantDuAuxEleves: number;

  // ======================
  // TAUX
  // ======================
  tauxElevesSoldes: number;
  tauxRecouvrement: number;

  // ======================
  // CAMEMBERTS
  // ======================
  encaissementParNiveau: { [key: string]: number };
  encaissementParFiliere: { [key: string]: number };

  // ======================
  // DETAIL
  // ======================
  details: Array<EncaissementEleveBIBaseDTO>;
}
