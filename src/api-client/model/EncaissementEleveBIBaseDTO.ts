// encaissement-eleve-bi-base.model.ts
export interface EncaissementEleveBIBaseDTO {
  matricule: string;
  nomPrenom: string;

  niveau: string;    // BTS | L | M
  filiere: string;

  montantAttendu: number;
  montantEncaisse: number;
  solde: number;
}
