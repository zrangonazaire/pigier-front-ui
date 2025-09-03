// src/app/components/report-generator/report-generator.component.ts
import { Component } from '@angular/core';
import { ReportingAPIService } from '../../api-client';
import { saveAs } from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-report-generator',
  templateUrl: './recapetudiant.html',
  styleUrls: ['./recapetudiant.scss']
})
export class ReportGeneratorComponent {
  reportData = {
    niveau: '',
    campus: '',
    anneedebut: '',
    anneefin: ''
  };

  campusOptions = [
    'ABIDJAN PLATEAU',
    'ABIDJAN YOPOUGON',
    'YAMOUSSOUKRO',
    'ABOBO',
    'COCODY',
    'TREICHVILLE'
  ];

  niveauOptions = [
    'LP1', 'LP2', 'LP3',
    'Primaire', 'Collège', 'Lycée',
    'BTS1', 'BTS2', 'Licence'
  ];

  anneeOptions = ['2023', '2024', '2025', '2026'];
  isLoading = false;
  errorMessage = '';

  constructor(private reportingApi: ReportingAPIService) {}

  generatePDF(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // CORRECTION : Utilisez '*/*' comme attendu par le service généré
    this.reportingApi.generateReport(
      this.reportData.niveau,
      this.reportData.campus,
      this.reportData.anneedebut,
      this.reportData.anneefin,
      'body',
      false,
      {
        httpHeaderAccept: '*/*', // Changé de 'application/pdf' à '*/*'
        context: undefined,
        transferCache: undefined
      }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Conversion de la réponse en Blob
        const blob = new Blob([response], { type: 'application/pdf' });
        const filename = `rapport_${this.reportData.niveau}_${this.reportData.campus}.pdf`;
        saveAs(blob, filename);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur complète:', error);

        if (error.status === 400) {
          this.errorMessage = 'Paramètres invalides';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur interne du serveur: ' + error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Non autorisé. Veuillez vous connecter.';
        } else if (error.status === 404) {
          this.errorMessage = 'Service non trouvé. Vérifiez l\'URL du backend.';
        } else {
          this.errorMessage = 'Erreur lors de la génération du rapport: ' + error.message;
        }
      }
    });
  }

  generateExcel(): void {
    alert('Fonctionnalité Excel à implémenter');
  }

  refresh(): void {
    this.reportData = {
      niveau: '',
      campus: '',
      anneedebut: '',
      anneefin: ''
    };
    this.errorMessage = '';
  }

  isFormValid(): boolean {
    return !!this.reportData.niveau &&
           !!this.reportData.campus &&
           !!this.reportData.anneedebut &&
           !!this.reportData.anneefin;
  }

  get anneeScolaire(): string {
    if (this.reportData.anneedebut && this.reportData.anneefin) {
      return `${this.reportData.anneedebut}/${this.reportData.anneefin}`;
    }
    return '2023/2024';
  }
}
