import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
import { EleveControllerEtatService } from '../../../api-client';

@Component({
  selector: 'app-report-generator-excel',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss']
})
export class ReportGeneratorComponentExcel implements OnInit {

  reportData = {
    niveau: '',
    campus: 'ABIDJAN PLATEAU',
    anneedebut: '',
    anneefin: '',
    startDate: '', // Changé: string au lieu de Date
    endDate: ''    // Changé: string au lieu de Date
  };

  campusOptions = [
    'ABIDJAN PLATEAU',
    'ABIDJAN YOPOUGON',
    'YAMOUSSOUKRO',

  ];

  niveauOptions = [
    'LP1', 'LP2', 'LP3',
    'M1', 'M2'
  ];

  anneeOptions: number[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private eleveApiService: EleveControllerEtatService) {}

  ngOnInit(): void {
    this.generateAnneeOptions();
    this.setDefaultDates();
  }

  generateAnneeOptions(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.anneeOptions.push(i);
    }
  }

  setDefaultDates(): void {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Format YYYY-MM-DD pour les inputs date
    this.reportData.startDate = yesterday.toISOString().split('T')[0];
    this.reportData.endDate = today.toISOString().split('T')[0];
  }

  generatePDF(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    alert('Fonctionnalité PDF à implémenter avec votre API Spring Boot');
    this.isLoading = false;
  }

  generateExcel(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    // Validation des dates (comparaison des strings au format YYYY-MM-DD)
    if (this.reportData.startDate > this.reportData.endDate) {
      this.errorMessage = 'La date de début doit être antérieure à la date de fin';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Utilisation directe des strings (déjà au format YYYY-MM-DD)
    const startDate = this.reportData.startDate;
    const endDate = this.reportData.endDate;

    this.eleveApiService.generateExcel(
      this.anneeScolaire,
      this.reportData.campus,
      this.reportData.niveau,
      startDate,
      endDate,
      'response',
      false,
      {
        httpHeaderAccept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        context: undefined,
        transferCache: undefined
      }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `eleves_${this.reportData.niveau}_${this.reportData.campus}_${this.anneeScolaire}.xlsx`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        const blob = new Blob([response.body], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        saveAs(blob, filename);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur lors de la génération Excel:', error);

        if (error.status === 400) {
          this.errorMessage = 'Paramètres invalides. Veuillez vérifier vos sélections';
        } else if (error.status === 404) {
          this.errorMessage = 'Aucune donnée trouvée pour les critères sélectionnés';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard';
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Accès non autorisé. Veuillez vous reconnecter';
        } else {
          this.errorMessage = 'Erreur lors de la génération du fichier Excel';
        }
      }
    });
  }

  refresh(): void {
    this.reportData = {
      niveau: '',
      campus: 'ABIDJAN PLATEAU',
      anneedebut: '',
      anneefin: '',
      startDate: '',
      endDate: ''
    };
    this.setDefaultDates();
    this.errorMessage = '';
  }

  isFormValid(): boolean {
    return !!this.reportData.niveau &&
           !!this.reportData.campus &&
           !!this.reportData.anneedebut &&
           !!this.reportData.anneefin &&
           !!this.reportData.startDate &&
           !!this.reportData.endDate;
  }

  get anneeScolaire(): string {
    if (this.reportData.anneedebut && this.reportData.anneefin) {
      return `${this.reportData.anneedebut}/${this.reportData.anneefin}`;
    }
    return '';
  }
}
