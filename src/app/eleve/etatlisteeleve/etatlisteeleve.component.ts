import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElevesService } from '../../../api-client';
import { MenuComponent } from '../../components/menu/menu.component';

import { saveAs } from 'file-saver';
// Définition de l'interface pour les données des élèves
interface Eleve {
  Matri_Elev: string;
  Nom_Elev: string;
  Lieunais_Elev: string;
  Datenais_Elev: string;
  Sexe_Elev: string;
  celetud: string;
  Des_Nat: string;
  Code_Detcla: string;
}

@Component({

  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuComponent
  ],

  selector: 'app-etatlisteeleve',
  templateUrl: './etatlisteeleve.component.html',
  styleUrls: ['./etatlisteeleve.component.scss']
})
export class EtatlisteeleveComponent {
  PARAMEANNE: string = '';
  PARAMCLASSE: string = '';
  eleves: Eleve[] = [];
  chargement: boolean = false;
  erreur: string = '';

  // Ajout des campus et de la sélection
  campuses = [
    { id: 'plateau', value: 'ABIDJAN PLATEAU', label: 'ABIDJAN PLATEAU' },
    { id: 'yopougon', value: 'ABIDJAN YOPOUGON', label: 'ABIDJAN YOPOUGON' },
    { id: 'yamoussoukro', value: 'YAMOUSSOUKRO', label: 'YAMOUSSOUKRO' } // Correction du nom
  ];
  PARAMETAB: string = 'ABIDJAN PLATEAU';
  //selectedCampus: string = 'ABIDJAN PLATEAU'; // Valeur par défaut
 private eleveService = inject(ElevesService);

  constructor(private http: HttpClient) {}

  rechercherEleves() {
    if (!this.PARAMEANNE || !this.PARAMCLASSE) {
      this.erreur = 'Veuillez saisir l\'année scolaire et la classe';
      return;
    }
    this.erreur = '';
    this.chargement = true;

    // À remplacer par votre endpoint API
    const url = `http://votre-api/eleves?annee=${this.PARAMEANNE}&classe=${this.PARAMCLASSE}`;

    this.http.get<Eleve[]>(url).subscribe({
      next: (data) => {
        this.eleves = data;
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = 'Erreur lors de la récupération des données';
        console.error(err);
        this.chargement = false;
      }
    });
  }

printeleves() {
this.eleveService.etatListeEtudiant(this.PARAMCLASSE, this.PARAMEANNE.replace(/\s/g, '').substring(0, 4), this.PARAMEANNE.replace(/\s/g, '').slice(-4), this.PARAMETAB).subscribe({
  next: (response) => {
    const blob = new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  },
  error: (error) => {
    alert('Erreur impression'+error.message);
  }
});

//alert(this.PARAMEANNE.replace(/\s/g, '').substring(0, 4));

//alert(this.PARAMEANNE.replace(/\s/g, '').slice(-4));

}




printeleveExcel(){
if(this.PARAMETAB =='YAMOUSSOUKRO'){
  alert('L\'exportation Excel n\'est pas disponible pour le campus de Yamoussoukro.');
  return;


}
  this.eleveService.etatListeEtudiantExcel(this.PARAMCLASSE, this.PARAMEANNE.replace(/\s/g, '').substring(0, 4), this.PARAMEANNE.replace(/\s/g, '').slice(-4), this.PARAMETAB).subscribe({
    next: (response) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Liste_Eleve_${this.PARAMCLASSE}_${this.PARAMEANNE}_${this.PARAMETAB}.xlsx`);
    },
    error: (error) => {
      alert('Erreur lors de l\'exportation Excel : ' + error.message);
    }
  });
}









  /*
    printInscri(arg0: any) {
    this.preinscritservice.impressionInscriptionYakro(arg0).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (error) => {
        alert('Erreur impression');
      },
    });
  } */
}
