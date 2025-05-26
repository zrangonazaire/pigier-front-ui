import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElevesService } from '../../../api-client';

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
    FormsModule
  ],

  selector: 'app-etatlisteeleve',
  templateUrl: './etatlisteeleve.component.html',
  styleUrls: ['./etatlisteeleve.component.css']
})
export class EtatlisteeleveComponent {
  PARAMEANNE: string = '';
  PARAMCLASSE: string = '';
  eleves: Eleve[] = [];
  chargement: boolean = false;
  erreur: string = '';

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
this.eleveService.etatListeEtudiant(this.PARAMCLASSE, this.PARAMEANNE.replace(/\s/g, '').substring(0, 4), this.PARAMEANNE.replace(/\s/g, '').slice(-4)).subscribe({
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
