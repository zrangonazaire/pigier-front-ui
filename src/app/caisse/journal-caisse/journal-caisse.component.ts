import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EncaissementService } from '../../../api-client';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-journal-caisse',
  standalone: true,
  imports: [CommonModule, FormsModule,MenuComponent],
  templateUrl: './journal-caisse.component.html',
  styleUrl: './journal-caisse.component.scss',
})
export class JournalCaisseComponent {
  //DROIT D'INSCRIPTION
  printDroitInsc() {
       const selectedCampuses = Object.entries(this.campus)
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        switch (key) {
          case 'plateau':
            return 'ABIDJAN PLATEAU';
          case 'yopougon':
            return 'ABIDJAN YOPOUGON';
          case 'yamoussoukro':
            return 'YAMOUSSOUKRO';
          default:
            return '';
        }
      });
    const selectedReglement = Object.entries(this.reglement)
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        switch (key) {
          case 'cheque':
            return 'C';
          case 'espece':
            return 'E';

          case 'carte_bancaire':
            return 'B';
          case 'mobile_money':
            return 'O';
          case 'virement_banq_a_banque':
            return 'V';
          case 'virement_espece_banque':
            return 'W';
          default:
            return '';
        }
      });
    this.encaissementService
      .generateJournalEncaissementsDroitInscriBetweenDatesReport(
        selectedReglement,
        selectedCampuses,
        this.dateDebut,
        this.dateFin,
        this.selectedCaisse
      )
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        },
        error: (error) => {
          alert('Erreur impression');
          console.error("Erreur lors de l'impression :", error);
        },
      });
    console.log('Configuration :', {
      campuses: selectedCampuses,
      reglement: selectedReglement,
      caisse: this.selectedCaisse,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin,
    });
  }
  
  campus = {
    plateau: false,
    yopougon: false,
    yamoussoukro: false,
  };
  encaissementService = inject(EncaissementService);
  selectedCaisse: number = 1;
  dateDebut: string = '';
  dateFin: string = '';
  reglement = {
    cheque: false,
    espece: false,
    carte_bancaire: false,
    mobile_money: false,
    virement_banq_a_banque: false,
    virement_espece_banque: false,
  };

  constructor() {
    // Initialisation des dates avec la date du jour par défaut
    const today = new Date().toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = today;
  }

  printScolarite() {
    const selectedCampuses = Object.entries(this.campus)
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        switch (key) {
          case 'plateau':
            return 'ABIDJAN PLATEAU';
          case 'yopougon':
            return 'ABIDJAN YOPOUGON';
          case 'yamoussoukro':
            return 'YAMOUSSOUKRO';
          default:
            return '';
        }
      });
    const selectedReglement = Object.entries(this.reglement)
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        switch (key) {
          case 'cheque':
            return 'C';
          case 'espece':
            return 'E';

          case 'carte_bancaire':
            return 'B';
          case 'mobile_money':
            return 'O';
          case 'virement_banq_a_banque':
            return 'V';
          case 'virement_espece_banque':
            return 'W';
          default:
            return '';
        }
      });
    this.encaissementService
      .generateJournalEncaissementsBetweenDatesReport(
        selectedReglement,
        selectedCampuses,
        this.dateDebut,
        this.dateFin,

        this.selectedCaisse
      )
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        },
        error: (error) => {
          alert('Erreur impression');
          console.error("Erreur lors de l'impression :", error);
        },
      });
    console.log('Configuration :', {
      campuses: selectedCampuses,
      reglement: selectedReglement,
      caisse: this.selectedCaisse,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin,
    });
  }
}
