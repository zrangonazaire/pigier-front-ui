// src/app/components/report-generator/report-generator.component.ts
import { Component } from '@angular/core';
import { ReportingAPIService } from '../../../api-client';
import { saveAs } from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  templateUrl: './recapetudiant.html',
  styleUrls: ['./recapetudiant.scss']
})
export class ReportGeneratorComponent {
  reportData = {
    niveau: '',
    campus: 'ABIDJAN PLATEAU', // Valeur par défaut
    anneedebut: '',
    anneefin: ''
  };

  campusOptions = [
    'ABIDJAN PLATEAU',
    'ABIDJAN YOPOUGON',
    'YAMOUSSOUKRO'
  ];

  niveauOptions = [
    'LP1', 'LP2', 'LP3','M1','M2'
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

    this.reportingApi.generateReport(
      this.reportData.niveau,
      this.reportData.campus,
      this.reportData.anneedebut,
      this.reportData.anneefin,
      'body',
      false,
      {
        httpHeaderAccept: '*/*',
        context: undefined,
        transferCache: undefined
      }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const blob = new Blob([response], { type: 'application/pdf' });
        const filename = `rapport_${this.reportData.niveau}_${this.reportData.campus}.pdf`;
        saveAs(blob, filename);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur:', error);

        if (error.status === 400) {
          this.errorMessage = 'Paramètres invalides';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur interne du serveur';
        } else {
          this.errorMessage = 'Erreur lors de la génération du rapport';
        }
      }
    });
  }

  generateExcel(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.reportData.campus === 'YAMOUSSOUKRO') {
      this.errorMessage = 'L\'exportation Excel n\'est pas disponible pour le campus de Yamoussoukro';
      return;
    }

    alert('Fonctionnalité Excel à implémenter');
  }

  refresh(): void {
    this.reportData = {
      niveau: '',
      campus: 'ABIDJAN PLATEAU',
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
    return '';
  }
}
