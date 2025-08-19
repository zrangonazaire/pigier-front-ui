import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { PrinscriptionService } from '../../../api-client';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';
import { Chart, registerables } from 'chart.js';
import { NgxPaginationModule } from 'ngx-pagination';
import { startOfDay, endOfDay } from 'date-fns';
// Ajout des imports Angular Material nécessaires
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
Chart.register(...registerables);

interface Preinscription {
  id: string;
  datinscrip: Date;
  nomprenoms: string;
  celetud: string;
  formsouh: string;
  decision: 'En attente' | 'Validée' | 'Rejetée' | 'A' | 'E' | 'I';
  etab_source: 'ABIDJAN PLATEAU' | 'ABIDJAN YOPOUGON' | 'YAMOUSSOUKRO';
  isInscrit?: boolean;
  utilisateurCreateur?: string;
  anneeScolaire?: string;
}

interface StatCard {
  title: string;
  value: string;
  icon: string;
  class: string;
}

interface Column {
  key: string;
  label: string;
}
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-dashboard-preinscription',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuComponent,
    DatePipe,
    NgxPaginationModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter },
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dashboard-preinscription.component.html',
  styleUrls: ['./dashboard-preinscription.component.scss'],
})
export class DashboardPreinscriptionComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  router = inject(Router);
  startDate: Date | null = null;
  endDate: Date | null = null;
  formatDisplayDate(date: moment.Moment): string {
    return date ? date.format('DD-MM-YYYY') : '';
  }
  isLoadingMedical = signal<{[key: string]: boolean}>({});
  isLoadingInscription =signal<{[key: string]: boolean}>({});
  isLoadingPreinscription = signal<{[key: string]: boolean}>({});
  errorMessage = signal('');
  filterByDateRange() {
    if (this.startDate && this.endDate) {
      const start = moment(this.startDate, 'DD-MM-YYYY hh:mm');
      const end = moment(this.endDate, 'DD-MM-YYYY hh:mm');
      this.error.set(null);
      this.status.set('loading');
      this.loading.set(true);
      console.log(
        'Filtrage des préinscriptions entre:',
        start.format('DD-MM-YYYY hh:mm'),
        end.format('DD-MM-YYYY hh:mm')
      );
      this.preinscritservice
        .findAllPreinscEntreDeuxDate(
          start.format('DD-MM-YYYY hh:mm'),
          end.format('DD-MM-YYYY hh:mm')
        )
        .subscribe({
          next: (preinscritsDto) => {
            const mappedPreinscrits: Preinscription[] = preinscritsDto.map(
              (dto) => ({
                id: dto.id ? String(dto.id) : '',
                datinscrip: dto.dateInscription
                  ? new Date(dto.dateInscription)
                  : new Date(),
                utilisateurCreateur: dto.utilisateurCreateur || '',
                nomprenoms: dto.nomPrenoms || '',
                celetud: dto.contactCellulaire1 || '',
                formsouh: dto.formationSouhaitee || '',
                decision:
                  (dto.decision as 'En attente' | 'Validée' | 'Rejetée') ||
                  'En attente',
                etab_source:
                  (dto.etablissementSource as
                    | 'ABIDJAN PLATEAU'
                    | 'ABIDJAN YOPOUGON'
                    | 'YAMOUSSOUKRO') || 'ABIDJAN PLATEAU',
                isInscrit:
                  dto.decision === 'Validée' ? Math.random() > 0.5 : false,
                anneeScolaire: dto.anneeScolaire || '',
              })
            );

            this.allPreinscrits.set(mappedPreinscrits);
            this.filteredPreinscriptions.set([...mappedPreinscrits]);
            this.updateStats();
            this.status.set('loaded');
            this.loading.set(false);
            this.updateChartData();
          },
          error: (error) => {
            console.error(
              'Erreur lors du chargement des préinscriptions:',
              error
            );
            this.error.set('Erreur de chargement : ' + error.message);
            this.status.set('error');
            this.loading.set(false);
            this.showAlert(
              'Erreur',
              'Impossible de charger les préinscriptions'
            );
          },
        });
    }
  }
  @ViewChild('preinscriptionChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private preinscritservice = inject(PrinscriptionService);

  // Données et états
  allPreinscrits = signal<Preinscription[]>([]);
  filteredPreinscriptions = signal<Preinscription[]>([]);
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();

  // Filtres et pagination
  searchTerm = signal<string>('');
  selectedSite = signal<string>('all');
  selectedStatus = signal<string>('all');
  itemsPerPage = signal<number>(10);
  currentPage = signal<number>(1);

  // Configuration des colonnes
  columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'datinscrip', label: 'Date Insc.' },
    { key: 'utilisateurCreateur', label: 'Commercial' },
    { key: 'nomprenoms', label: 'Nom et Prénoms' },
    { key: 'celetud', label: 'Contact' },
    { key: 'formsouh', label: 'Formation' },
    { key: 'decision', label: 'Décision' },
    { key: 'etab_source', label: 'Établissement' },
    { key: 'anneescol', label: 'Année Scol.' },
  ];
  sortColumn = signal<string>('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Cartes de statistiques
  stats = signal<StatCard[]>([
    {
      title: 'Total Préinscriptions',
      value: '0',
      icon: 'fas fa-user-graduate',
      class: 'stat-primary',
    },
    {
      title: 'Abidjan Plateau',
      value: '0',
      icon: 'fas fa-university',
      class: 'stat-secondary',
    },
    {
      title: 'Abidjan Yopougon',
      value: '0',
      icon: 'fas fa-university',
      class: 'stat-tertiary',
    },
    {
      title: 'Yamoussoukro',
      value: '0',
      icon: 'fas fa-university',
      class: 'stat-quaternary',
    },
  ]);

  // Modale
  showModal = signal<boolean>(false);
  modalTitle = signal<string>('');
  modalMessage = signal<string>('');
  modalType = signal<'confirm' | 'alert'>('alert');
  modalAction: (() => void) | null = null;

  // États
  error = signal<string | null>(null);
  loading = signal<boolean>(false);
  status = signal<'loading' | 'error' | 'loaded'>('loading');

  // Graphique
  private chart: Chart | undefined;

  constructor() {
    this.loadPreinscriptions();
  }

  ngOnInit(): void {
    const today = new Date();
    this.startDate = startOfDay(today); // 00:00:00
    this.endDate = endOfDay(today); // 23:59:59
    this.filterByDateRange();
  }
  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // Chargement des données
  loadPreinscriptions(): void {
    // this.error.set(null);
    // this.status.set('loading');
    // this.loading.set(true);
    // this.preinscritservice.findAllPreinsc(this.itemsPerPage()).subscribe({
    //   next: (preinscritsDto) => {
    //     console.log('Chargement des préinscriptions...', this.itemsPerPage());
    //     console.log('Préinscriptions chargées:', preinscritsDto);
    //     const mappedPreinscrits: Preinscription[] = preinscritsDto.map(
    //       (dto) => ({
    //         id: dto.id ? String(dto.id) : '',
    //         datinscrip: dto.datinscrip ? new Date(dto.datinscrip) : new Date(),
    //         utilisateurCreateur: dto.utilisateurCreateur || '',
    //         nomprenoms: dto.nomprenoms || '',
    //         celetud: dto.teletud || '',
    //         formsouh: dto.formsouh || '',
    //         decision:
    //           (dto.decision as 'En attente' | 'Validée' | 'Rejetée') ||
    //           'En attente',
    //         etab_source:
    //           (dto.etab_source as
    //             | 'Abidjan Plateau'
    //             | 'Abidjan Yopougon'
    //             | 'Yamoussoukro') || 'Abidjan Plateau',
    //         isInscrit: dto.decision === 'Validée' ? Math.random() > 0.5 : false,
    //       })
    //     );
    //     this.allPreinscrits.set(mappedPreinscrits);
    //     this.filteredPreinscriptions.set([...mappedPreinscrits]);
    //     this.updateStats();
    //     this.status.set('loaded');
    //     this.loading.set(false);
    //     this.updateChartData();
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors du chargement des préinscriptions:', error);
    //     this.error.set('Erreur de chargement : ' + error.message);
    //     this.status.set('error');
    //     this.loading.set(false);
    //     this.showAlert('Erreur', 'Impossible de charger les préinscriptions');
    //   },
    // });
  }

  // Filtrage
  filterBySite(): void {
    // Quand le site change, on ré-applique tous les filtres.
    this.applySearch();
  }

  filterByStatus(): void {
    // Quand le statut change, on ré-applique tous les filtres.
    this.applySearch();
  }

  applySearch(): void {
    const term = this.searchTerm().toLowerCase();
    const site = this.selectedSite();
    const status = this.selectedStatus();

    // On commence TOUJOURS par la liste complète pour que les filtres ne s'accumulent pas.
    let results = this.allPreinscrits();

    // 1. Filtrer par site
    if (site !== 'all') {
      results = results.filter(item => item.etab_source === site);
    }

    // 2. Filtrer par statut
    if (status !== 'all') {
      results = results.filter(item => item.decision === status);
    }

    // 3. Filtrer par terme de recherche (si le champ n'est pas vide)
    if (term) {
      results = results.filter(
        (item) =>
          item.nomprenoms.toLowerCase().includes(term) ||
          item.id.toString().includes(term) ||
          item.celetud.toLowerCase().includes(term) ||
          item.formsouh.toLowerCase().includes(term)
      );
    }

    this.filteredPreinscriptions.set(results);
    this.applySorting();
    this.currentPage.set(1);
  }

  // Tri
  sortTable(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.applySorting();
  }

  applySorting(): void {
    const column = this.sortColumn();
    const direction = this.sortDirection();

    this.filteredPreinscriptions.set(
      [...this.filteredPreinscriptions()].sort((a, b) => {
        const valueA = a[column as keyof Preinscription];
        const valueB = b[column as keyof Preinscription];

        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return direction === 'asc' ? -1 : 1;
        if (valueB == null) return direction === 'asc' ? 1 : -1;

        if (valueA < valueB) {
          return direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      })
    );
  }

  // Mise à jour des statistiques
  updateStats(): void {
    const total = this.allPreinscrits().length;
    const plateau = this.allPreinscrits().filter(
      (p) => p.etab_source === 'ABIDJAN PLATEAU'
    ).length;
    const yopougon = this.allPreinscrits().filter(
      (p) => p.etab_source === 'ABIDJAN YOPOUGON'
    ).length;
    const yamoussoukro = this.allPreinscrits().filter(
      (p) => p.etab_source === 'YAMOUSSOUKRO'
    ).length;

    this.stats.set([
      {
        title: 'Total Préinscriptions',
        value: total.toString(),
        icon: 'fas fa-user-graduate',
        class: 'stat-primary',
      },
      {
        title: 'Abidjan Plateau',
        value: plateau.toString(),
        icon: 'fas fa-university',
        class: 'stat-secondary',
      },
      {
        title: 'Abidjan Yopougon',
        value: yopougon.toString(),
        icon: 'fas fa-university',
        class: 'stat-tertiary',
      },
      {
        title: 'Yamoussoukro',
        value: yamoussoukro.toString(),
        icon: 'fas fa-university',
        class: 'stat-quaternary',
      },
    ]);
  }

  // Actions
  openMedicalForm(item: Preinscription): void {
    this.showConfirm(
      'Fiche Médicale',
      `Voulez-vous ouvrir la fiche médicale de ${item.nomprenoms}?`,
      () => this.printMedical(item.id)
    );
  }

  viewPreinscription(item: Preinscription): void {
    this.isLoadingPreinscription.update(states => ({
      ...states,
      [item.id]: true
    }));
    this.preinscritservice
      .impressionPreinscriptionYakro(item.id.toString())
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        
        },
        error: (error) => {
          this.showAlert(
            'Erreur',
            "Échec de l'impression de la préinscription"
          );
          this.isLoadingPreinscription.update(states => ({
            ...states,
            [item.id]: false
          }));
        },
        complete: () => {
          this.isLoadingPreinscription.update(states => ({
            ...states,
            [item.id]: false
          }));
        },
      });
  }

  processInscription(item: Preinscription): void {
    this.showConfirm(
      'Inscription',
      `Voulez-vous inscrire ${item.nomprenoms}?`,
      () => this.printInscri(item.id)
    );
  }

  // Fonctions d'impression
  printMedical(id: any): void {
    this.isLoadingMedical.update(states => ({
      ...states,
      [id]: true
    }));
    this.preinscritservice
      .impressionFicheMedicaleyakro(id.toString())
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
       
        },
        error: (error) => {
          this.showAlert(
            'Erreur',
            "Échec de l'impression de la fiche médicale"
          );
            this.isLoadingMedical.update(states => ({
      ...states,
      [id]: false
    }));
        },
        complete: () => {
            this.isLoadingMedical.update(states => ({
      ...states,
      [id]: false
    }));
        },
      });
  }

  printInscri(id: any): void {
    this.isLoadingInscription.update(states => ({
      ...states,
      [id]: true
    }));
    this.preinscritservice.impressionInscriptionYakro(id.toString()).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        
      },
      error: (error) => {
        this.showAlert('Erreur', "Échec de l'impression de l'inscription");
        this.isLoadingInscription.update(states => ({
          ...states,
          [id]: false
        }));
      },
      complete: () => {
        this.isLoadingInscription.update(states => ({
          ...states,
          [id]: false
        }));
       
      },
    });
  }

  // Gestion des modales
  showAlert(title: string, message: string): void {
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.modalType.set('alert');
    this.showModal.set(true);
    this.modalAction = null;
  }

  showConfirm(title: string, message: string, action: () => void): void {
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.modalType.set('confirm');
    this.modalAction = action;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  confirmAction(): void {
    if (this.modalAction) {
      this.modalAction();
    }
    this.closeModal();
  }

  // Graphique
  private createChart(): void {
    if (this.chartCanvas) {
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Inscrits', 'En Attent', 'Autorisé'],
          datasets: [
            {
              label: 'Statut des préinscriptions',
              data: [0, 0, 0, 0],
              backgroundColor: [
                'rgba(0, 255, 136, 0.7)',
                'rgba(0, 123, 255, 0.7)',
                'rgba(255, 170, 0, 0.7)',
                'rgba(255, 0, 102, 0.7)',
              ],
              borderColor: [
                'rgba(0, 255, 136, 1)',
                'rgba(0, 123, 255, 1)',
                'rgba(255, 170, 0, 1)',
                'rgba(255, 0, 102, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
            x: {},
          },
        },
      });
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (this.chart) {
      const inscrits = this.allPreinscrits().filter((p) => p.isInscrit).length;
      const validees = this.allPreinscrits().filter(
        (p) => p.decision === 'I'
      ).length;
      const enAttente = this.allPreinscrits().filter(
        (p) => p.decision === 'E'
      ).length;
      const rejetees = this.allPreinscrits().filter(
        (p) => p.decision === 'A'
      ).length;

      this.chart.data.datasets[0].data = [inscrits, validees, enAttente];
      this.chart.update();
    }
  }
  nouvellePreinscription(): void {
    this.router.navigate(['/preinscription/add-preins']);
  }
}
