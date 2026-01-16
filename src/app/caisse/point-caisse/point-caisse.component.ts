
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-point-caisse',
  standalone: true,

  imports: [
    FormsModule,
    MenuComponent
],
  templateUrl: './point-caisse.component.html',
  styleUrl: './point-caisse.component.scss'
})
export class PointCaisseComponent {
  selectedCampuses: string[] = ['ABIDJAN PLATEAU']; // Tableau pour stocker les sélections multiples
  selectedEncaissement: string = 'Tous';
  selectedFiltre: string = 'Périodique';
  selectedModeReglement: string = 'Tout';
  caisseNumber: number = 4;
  selectedDate: string = '2025-04-29';

  campuses = [
    'ABIDJAN PLATEAU',
    'FOAD',
    'YAMOUSSOUKRO',
    'ABIDJAN YOPOUGON'
  ];

  encaissements = [
    'Accessoire',
    'Frais examen',
    'Frais de scolarité',
    'Société',
    'Tous'
  ];

  filtres = [
    'Périodique',
    'Par folio',
    'Grouper par folio'
  ];

  modesReglement = [
    'Espèce',
    'Chèque',
    'Virement',
    'Mobile money',
    'Tout'
  ];

  toggleCampusSelection(campus: string): void {
    const index = this.selectedCampuses.indexOf(campus);
    if (index === -1) {
      this.selectedCampuses.push(campus);
    } else {
      this.selectedCampuses.splice(index, 1);
    }
  }

  isCampusSelected(campus: string): boolean {
    return this.selectedCampuses.includes(campus);
  }

  
}
