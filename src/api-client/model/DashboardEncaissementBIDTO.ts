// dashboard-encaissement-bi.model.ts
import {EncaissementEleveBIBaseDTO} from './EncaissementEleveBIBaseDTO';

export interface DashboardEncaissementBIDTO {

  totalEleves: number;
  totalElevesSoldes: number;
  totalElevesNonSoldes: number;
  montantTotalAttendu: number;
  montantTotalEncaisse: number;
  montantTotalRestant: number;
  montantDuAuxEleves: number;
  tauxElevesSoldes: number;
  tauxRecouvrement: number;
  encaissementParNiveau: { [key: string]: number };
  encaissementParFiliere: { [key: string]: number };
  details: Array<EncaissementEleveBIBaseDTO>;
}
