import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { EncaissementDTO, EncaissementService } from '../../../api-client';
import { MenuComponent } from '../../components/menu/menu.component';




// NOTE: L'interface `EncaissementDTO` n'étant pas disponible,
// cette interface est une supposition basée sur un cas d'usage de facturation détaillée.
// Vous devrez peut-être l'ajuster pour correspondre aux vrais noms de champs.
interface FacturationDetail {
  dateEncaissement: string;
  montantEncaissement: number;
  nomApprenant: string;
  libelleNiveau: string;
  modePaiement: string;
}

@Component({
  selector: 'app-journal-caisse',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './journal-caisse.component.html',
  styleUrls: ['./journal-caisse.component.scss']
})
export class JournalCaisseComponent implements OnInit {
  encaissementService = inject(EncaissementService);

  // Propriétés pour l'onglet "Journaux"
  campus = {
    plateau: false,
    yopougon: false,
    yamoussoukro: false,
  };
  reglement = {
    cheque: false,
    espece: false,
    carte_bancaire: false,
    mobile_money: false,
    virement_banq_a_banque: false,
    virement_espece_banque: false,
  };
  selectedCaisse = 1;
  dateDebut = '';
  dateFin = '';

  // Propriétés pour l'onglet "Facture / Chiffre d’Affaire"
  dateDebutFacture = '';
  dateFinFacture = '';
  encaissementsCA = signal<EncaissementDTO[]>([]);
  errorMessage = signal('');
  loading = signal(false);
  // Propriétés pour la table de facturation
  facturations = signal<EncaissementDTO[]>([]);

  // Propriétés pour la pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  readonly itemsPerPageOptions = [5, 10, 25, 50];
  // Propriétés pour la pagination de la facturation
  currentPageFacturation = signal(1);
  itemsPerPageFacturation = signal(10);

  constructor() {
    const today = new Date().toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = today;
    this.dateDebutFacture = today;
    this.dateFinFacture = today;
  }

  ngOnInit(): void {
    // Vous pouvez charger des données initiales ici si nécessaire
  }

  // Méthodes pour l'onglet "Journaux"
  printDroitInsc(): void {
    const selectedCampuses = this.getSelectedCampuses();
    const selectedReglements = this.getSelectedReglements();

    this.encaissementService.generateJournalEncaissementsDroitInscriBetweenDatesReport(
      selectedReglements,
      selectedCampuses,
      this.dateDebut,
      this.dateFin,
      this.selectedCaisse
    ).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (err) => {
        alert("Erreur impression");
        console.error("Erreur lors de l'impression :", err);
      }
    });
  }

  printScolarite(): void {
    const selectedCampuses = this.getSelectedCampuses();
    const selectedReglements = this.getSelectedReglements();

    this.encaissementService.generateJournalEncaissementsBetweenDatesReport(
      selectedReglements,
      selectedCampuses,
      this.dateDebut,
      this.dateFin,
      this.selectedCaisse
    ).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (err) => {
        alert("Erreur impression");
        console.error("Erreur lors de l'impression :", err);
      }
    });
  }

  private getSelectedCampuses(): string[] {
    return Object.entries(this.campus)
      .filter(([, value]) => value)
      .map(([key]) => {
        switch (key) {
          case 'plateau': return 'ABIDJAN PLATEAU';
          case 'yopougon': return 'ABIDJAN YOPOUGON';
          case 'yamoussoukro': return 'YAMOUSSOUKRO';
          default: return '';
        }
      });
  }

  private getSelectedReglements(): string[] {
    return Object.entries(this.reglement)
      .filter(([, value]) => value)
      .map(([key]) => {
        switch (key) {
          case 'cheque': return 'C';
          case 'espece': return 'E';
          case 'carte_bancaire': return 'B';
          case 'mobile_money': return 'O';
          case 'virement_banq_a_banque': return 'V';
          case 'virement_espece_banque': return 'W'; // Correction du return manquant
          default: return '';
        }
      });
  }

  // Méthode pour l'onglet "Facture / Chiffre d’Affaire"
  rechercher(): void {
    const selectedCampuses = this.getSelectedCampuses();

    if (selectedCampuses.length === 0) {
      this.errorMessage.set('Veuillez sélectionner au moins un campus.');
      return;
    }
    if (!this.dateDebutFacture || !this.dateFinFacture) {
      this.errorMessage.set('Veuillez sélectionner les dates de début et de fin.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.encaissementsCA.set([]); // On vide le tableau avant la nouvelle recherche
    this.facturations.set([]);

    const chiffreAffaire$ = this.encaissementService.listeChiffreChiffreAffaire(selectedCampuses, this.dateDebutFacture, this.dateFinFacture);
    const facturation$ = this.encaissementService.listeFacturation(selectedCampuses, this.dateDebutFacture, this.dateFinFacture);

    forkJoin({
      chiffreAffaire: chiffreAffaire$,
      facturation: facturation$
    }).subscribe({
        next: ({ chiffreAffaire, facturation }) => {
          this.loading.set(false);

          // Données pour la table de chiffre d'affaire
          this.encaissementsCA.set(chiffreAffaire as EncaissementDTO[]);
          this.currentPage.set(1);
          console.log('Données Chiffre d\'Affaire reçues :', chiffreAffaire);

          // Données pour la table de facturation
          // Le DTO du service est casté vers notre interface locale.
          // Assurez-vous que les noms de champs correspondent.
          this.facturations.set(facturation as EncaissementDTO[]);
          this.currentPageFacturation.set(1);
          console.log('Données Facturation reçues :', facturation);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set('Erreur lors de la récupération des données.');
          this.encaissementsCA.set([]);
          this.facturations.set([]);
          console.error(err);
        }
      });
  }

  exportToExcel(): void {
    const selectedCampuses = this.getSelectedCampuses();
    if (selectedCampuses.length === 0) {
      this.errorMessage.set('Veuillez sélectionner au moins un campus pour l\'exportation.');
      return;
    }
    if (!this.dateDebutFacture || !this.dateFinFacture) {
      this.errorMessage.set('Veuillez sélectionner les dates de début et de fin pour l\'exportation.');
      return;
    }

    this.errorMessage.set('');

    // La méthode de service est censée retourner un blob pour le téléchargement de fichier.
    // Le client généré peut avoir un type de retour incorrect ('string').
    // Nous castons la réponse en 'any' et la traitons comme un Blob.
    (this.encaissementService.generateChiffreAffaireExcelDeFacturation(
      selectedCampuses,
      this.dateDebutFacture,
      this.dateFinFacture
    ) as Observable<any>).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chiffre_affaire_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de la génération du fichier Excel.');
        console.error('Erreur export Excel:', err);
      }
    });
  }

  exportFacturationToExcel(): void {
    const selectedCampuses = this.getSelectedCampuses();
    if (selectedCampuses.length === 0) {
      this.errorMessage.set('Veuillez sélectionner au moins un campus pour l\'exportation.');
      return;
    }
    if (!this.dateDebutFacture || !this.dateFinFacture) {
      this.errorMessage.set('Veuillez sélectionner les dates de début et de fin pour l\'exportation.');
      return;
    }

    this.errorMessage.set('');

    (this.encaissementService.generateFichierExcelDeFacturation(
      selectedCampuses,
      this.dateDebutFacture,
      this.dateFinFacture
    ) as Observable<any>).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detail_facturation_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de la génération du fichier Excel de facturation.');
        console.error('Erreur export Excel facturation:', err);
      }
    });
  }

  // Logique de pagination
  totalPages = computed(() => {
    return Math.ceil(this.encaissementsCA().length / this.itemsPerPage());
  });

  paginatedEncaissements = computed(() => {
    const data = this.encaissementsCA();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return data.slice(startIndex, endIndex);
  });

  pages = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onItemsPerPageChange(value: string | number): void {
    this.itemsPerPage.set(Number(value));
    this.currentPage.set(1); // Revenir à la première page
  }

  // Logique de pagination pour Facturation
  totalPagesFacturation = computed(() => {
    return Math.ceil(this.facturations().length / this.itemsPerPageFacturation());
  });

  paginatedFacturations = computed(() => {
    const data = this.facturations();
    const startIndex = (this.currentPageFacturation() - 1) * this.itemsPerPageFacturation();
    const endIndex = startIndex + this.itemsPerPageFacturation();
    return data.slice(startIndex, endIndex);
  });

  pagesFacturation = computed(() => {
    return Array.from({ length: this.totalPagesFacturation() }, (_, i) => i + 1);
  });

  goToPageFacturation(page: number): void {
    if (page >= 1 && page <= this.totalPagesFacturation()) {
      this.currentPageFacturation.set(page);
    }
  }

  onItemsPerPageChangeFacturation(value: string | number): void {
    this.itemsPerPageFacturation.set(Number(value));
    this.currentPageFacturation.set(1); // Revenir à la première page
  }

  // Conversion du numéro du mois en nom
  getMonthName(monthNumber: number): string {
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    if (monthNumber >= 1 && monthNumber <= 12) {
      return monthNames[monthNumber - 1];
    }
    return `Mois invalide (${monthNumber})`;
  }
}
