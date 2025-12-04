import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
//import { EtudiantControllerService } from '../../../api/etudiantController.service';
import { EtudiantControllerService } from '../../../api-client';



@Component({
  standalone: true, // ← Ajoutez cette ligne
  imports: [CommonModule, 
    FormsModule,
    MenuComponent  
  ], // ← AJOUTEZ FormsModule
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})

export class StudentListComponent implements OnInit {
  // Variables simples
  campus = '';
  anneeScolaire = '';
  classe = '';

  isLoading = false;
  errorMessage = '';
  apiStatus = '';

  campuses = ['ABIDJAN PLATEAU', 'ABIDJAN YOPOUGON', 'YAMOUSSOUKRO'];
  anneesScolaires = ['2023/2024', '2024/2025', '2025/2026'];
  classesExamples = ['URGL1', 'URGL2', 'BTS1', 'BTS2', 'LICENCE1', 'LICENCE2', 'LICENCE3'];

  constructor(private etudiantService: EtudiantControllerService) {}

  ngOnInit(): void {
    this.checkApiHealth();
  }

  checkApiHealth(): void {
    this.etudiantService.healthCheck().subscribe({
      next: (response) => {
        this.apiStatus = 'API connectée';
      },
      error: (error) => {
        this.apiStatus = 'API non disponible';
      }
    });
  }

  exportToExcel(): void {
    if (!this.campus || !this.anneeScolaire || !this.classe) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Appel direct avec gestion simple
    this.etudiantService.exportEtudiantsToExcel(
      this.anneeScolaire,
      this.campus,
      this.classe
    ).subscribe({
      next: (response: any) => {
        this.handleExcelResponse(response);
        this.isLoading = false;
      },
      error: (error) => {
        this.handleExcelError(error);
        this.isLoading = false;
      }
    });
  }

  private handleExcelResponse(response: any): void {
    try {
      let blob: Blob;

      if (response instanceof Blob) {
        blob = response;
      } else {
        // Convertir en Blob si nécessaire
        blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      }

      this.downloadFile(blob);
      this.errorMessage = 'Fichier Excel généré avec succès!';

    } catch (error) {
      this.errorMessage = 'Erreur lors du traitement du fichier.';
      console.error('Erreur traitement fichier:', error);
    }
  }

  private handleExcelError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Erreur d\'authentification.';
    } else if (error.status === 500) {
      this.errorMessage = 'Aucune donnée trouvée pour ces critères.';
    } else {
      this.errorMessage = 'Erreur lors de la génération du fichier.';
    }
    console.error('Erreur export:', error);
  }

  private downloadFile(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Liste_Etudiants_${this.classe}_${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  resetForm(): void {
    this.campus = '';
    this.anneeScolaire = '';
    this.classe = '';
    this.errorMessage = '';
  }

  getRandomExample(): string {
    return this.classesExamples[Math.floor(Math.random() * this.classesExamples.length)];
  }

  exportToPDF(): void {
  this.errorMessage = '📄 Fonctionnalité PDF bientôt disponible. Utilisez "Impression Excel" pour exporter la liste.';

  // Optionnel : exporter en Excel quand même
  setTimeout(() => {
    this.exportToExcel();
  }, 2000);
}
}
