import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journal-caisse',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-caisse.component.html',
  styleUrl: './journal-caisse.component.scss'
})
export class JournalCaisseComponent {
  campus = {
    plateau: false,
    yopougon: false,
    yamoussoukro: false
  };

  selectedOption: string = 'tous';
  selectedAffichage: string = 'detail';
  selectedCaisse: number = 1;
  dateDebut: string = '';
  dateFin: string = '';

  constructor() {
    // Initialisation des dates avec la date du jour par défaut
    const today = new Date().toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = today;
  }

  submitForm() {
    const selectedCampuses = Object.entries(this.campus)
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        switch(key) {
          case 'plateau': return 'ABIDJAN PLATEAU';
          case 'yopougon': return 'ABIDJAN YOPOUGON';
          case 'yamoussoukro': return 'YAMOUSSOUKRO';
          default: return '';
        }
      });

    console.log('Configuration :', {
      campuses: selectedCampuses,
      option: this.selectedOption,
      affichage: this.selectedAffichage,
      caisse: this.selectedCaisse,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin
    });

    // Implémentez votre logique d'impression ici
  }
}
