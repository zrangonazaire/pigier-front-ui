import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ElevesService } from '../../../api-client/api/eleves.service';
import { AnneeScolaireControllerService } from '../../../api-client/api/anneeScolaireController.service';
import { AnneeScolaireDto } from '../../../api-client/model/anneeScolaireDto';
import { EleveRecordDTO } from '../../../api-client/model/eleveRecordDTO';
import { saveAs } from 'file-saver';
import { MenuComponent } from '../../components/menu/menu.component';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-etudiant-hyper-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent,],
  templateUrl: './etudiant-hyper-planning.component.html',
  styleUrls: ['./etudiant-hyper-planning.component.scss'],
})
export class EtudiantHyperPlanningComponent implements OnInit {
  anneeScolaire: string = '';
  anneesScolaires: AnneeScolaireDto[] = [];

  etablissements = [
    {
      id: 'plateau',
      name: 'ABIDJAN PLATEAU',
      value: 'ABIDJAN PLATEAU',
      checked: false,
    },
    {
      id: 'yopougon',
      name: 'ABIDJAN YOPOUGON',
      value: 'ABIDJAN YOPOUGON',
      checked: false,
    },
    {
      id: 'yamoussoukro',
      name: 'YAMOUSSOUKRO',
      value: 'YAMOUSSOUKRO',
      checked: false,
    },
  ];

  allClasses: string[] = []; // All classes fetched for the current anneeScolaire
  classes: { name: string; checked: boolean }[] = []; // Classes with checked state for display

  selectedEtablissements: string[] = [];
  selectedClasses: string[] = [];

  eleves: EleveRecordDTO[] = [];
  loadingAnneesScolaires: boolean = false;
  loadingClasses: boolean = false;
  loadingSearch: boolean = false;
  loadingExport: boolean = false;
  error: string | null = null;

  dateDebut: string = '';
  dateFin: string = '';

  page: number = 1;
  pageSize: number = 10;

  constructor(
    private elevesService: ElevesService,
    private anneeScolaireService: AnneeScolaireControllerService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadAnneesScolaires();
  }

  loadAnneesScolaires(): void {
    this.loadingAnneesScolaires = true;
    this.error = null;
    this.anneeScolaireService.getListeAnneesScolaires().subscribe({
      next: (data) => {
        this.anneesScolaires = data;
        if (this.anneesScolaires && this.anneesScolaires.length > 0) {
          // Assuming the DTO has a property 'annee_Sco' which is a string.
          this.anneeScolaire = this.anneesScolaires[0].annee_Sco!;

          this.loadClasses();
        } else {
          this.error = "Aucune année scolaire n'a été trouvée.";
        }
        this.loadingAnneesScolaires = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des années scolaires:', err);
        this.error = 'Impossible de charger les années scolaires.';
        this.loadingAnneesScolaires = false;
      },
    });
  }

  onAnneeScolaireChange(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    if (!this.anneeScolaire) {
      this.allClasses = [];
      this.classes = [];
      this.selectedClasses = [];
      return;
    }

    this.loadingClasses = true;
    this.error = null;
    this.elevesService.getAllClasses(this.anneeScolaire).subscribe({
      next: (data) => {
        this.allClasses = data;
        this.classes = data.map((cls) => ({ name: cls, checked: false }));
        this.selectedClasses = []; // Reset selected classes when new classes are loaded
        this.loadingClasses = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes:', err);
        this.error =
          "Impossible de charger les classes. Veuillez vérifier l'année scolaire.";
        this.loadingClasses = false;
        this.allClasses = [];
        this.classes = [];
        this.selectedClasses = [];
      },
    });
  }

  onEtablissementChange(etab: {
    id: string;
    name: string;
    value: string;
    checked: boolean;
  }): void {
    etab.checked = !etab.checked;
    this.selectedEtablissements = this.etablissements
      .filter((e) => e.checked)
      .map((e) => e.value);
  }

  onClasseChange(cls: { name: string; checked: boolean }): void {
    cls.checked = !cls.checked;
    this.selectedClasses = this.classes
      .filter((c) => c.checked)
      .map((c) => c.name);
  }

  search(): void {
    if (
      !this.anneeScolaire ||
      this.selectedEtablissements.length === 0 ||
      this.selectedClasses.length === 0
    ) {
      this.error =
        'Veuillez sélectionner une année scolaire, au moins un établissement et au moins une classe.';
      this.eleves = [];
      return;
    }
    const annee = this.anneeScolaire.replace('/', '-');
    this.loadingSearch = true;
    this.error = null;
    this.elevesService
      .getPromotionsEleves(
        this.selectedClasses,
        this.selectedEtablissements,
        annee,
        this.dateDebut,
        this.dateFin
      )
      .subscribe({
        next: (data) => {
          this.eleves = data;
          this.loadingSearch = false;
          // Ajout d'un log pour vérifier la structure
          console.log('Données élèves reçues:', data);
 
        },
        error: (err) => {
          console.error('Erreur lors de la recherche des élèves:', err);
          this.error =
            'Erreur lors de la récupération des élèves. Veuillez réessayer.';
          this.loadingSearch = false;
          this.eleves = [];
        },
      });
  }

  exportExcel(): void {
    if (
      !this.anneeScolaire ||
      this.selectedEtablissements.length === 0 ||
      this.selectedClasses.length === 0
    ) {
      this.error =
        "Veuillez sélectionner une année scolaire, au moins un établissement et au moins une classe pour l'exportation.";
      return;
    }
    const anne = this.anneeScolaire.replace('/', '-');
    this.loadingExport = true;
    this.error = null;
    console.log(
      'Export Excel:',
      this.selectedClasses,
      this.selectedEtablissements,
      anne
    );

    // Utilisation d'un appel HttpClient direct pour un contrôle total sur le responseType
    const url = `${this.elevesService.configuration.basePath}/eleves/getPromotionsElevesExcel`;
    
    let params = new HttpParams();
    this.selectedClasses.forEach(p => params = params.append('promotions', p));
    this.selectedEtablissements.forEach(e => params = params.append('etablissements', e));
    params = params.append('anneeScolaire', anne);

    // Ajout de l'en-tête d'authentification
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(url, { 
      params: params,
      headers: headers, // <-- Ajout des en-têtes ici
      responseType: 'blob' // Demander explicitement un blob
    })
      .subscribe({
        next: (data: Blob) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, `Promotions_Eleves_${anne}.xlsx`);
          this.loadingExport = false;
        },
        error: (err) => {
          console.error("Erreur lors de l'exportation Excel:", err);
          this.error =
            "Erreur lors de l'exportation des données. Veuillez réessayer.";
          this.loadingExport = false;
        },
      });
  }

  // Helper for date formatting
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR'); // Adjust locale as needed
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  get pagedEleves() {
    const start = (this.page - 1) * this.pageSize;
    return this.eleves.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.eleves.length / this.pageSize);
  }
}
