import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ElevesService } from '../../../api-client/api/eleves.service';
import { AnneeScolaireControllerService } from '../../../api-client/api/anneeScolaireController.service';
import { AnneeScolaireDto } from '../../../api-client/model/anneeScolaireDto';
import { EleveRecordDTO } from '../../../api-client/model/eleveRecordDTO';
import { saveAs } from 'file-saver';
import { MenuComponent } from '../../components/menu/menu.component';

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
    { id: 'plateau', name: 'ABIDJAN PLATEAU', value: 'ABIDJAN PLATEAU', checked: false },
    { id: 'yopougon', name: 'ABIDJAN YOPOUGON', value: 'ABIDJAN YOPOUGON', checked: false },
    { id: 'yamoussoukro', name: 'YAMOUSSOUKRO', value: 'YAMOUSSOUKRO', checked: false },
  ];

  allClasses: string[] = [];
  classes: { name: string; checked: boolean }[] = [];

  selectedEtablissements: string[] = [];
  selectedClasses: string[] = [];

  eleves: EleveRecordDTO[] = [];
  loadingAnneesScolaires = false;
  loadingClasses = false;
  loadingSearch = false;
  loadingExport = false;
  error: string | null = null;

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
        if (this.anneesScolaires?.length > 0) {
          this.anneeScolaire = this.anneesScolaires[0].annee_Sco!;
          console.log('Année scolaire par défaut:', this.anneeScolaire);
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
        this.selectedClasses = [];
        this.loadingClasses = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes:', err);
        this.error = "Impossible de charger les classes.";
        this.loadingClasses = false;
        this.allClasses = [];
        this.classes = [];
        this.selectedClasses = [];
      },
    });
  }

  onEtablissementChange(etab: { id: string; name: string; value: string; checked: boolean }): void {
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
    if (!this.anneeScolaire || this.selectedEtablissements.length === 0 || this.selectedClasses.length === 0) {
      this.error = 'Veuillez sélectionner une année scolaire, au moins un établissement et une classe.';
      this.eleves = [];
      return;
    }

    const annee = this.anneeScolaire.replace('/', '-');
    this.loadingSearch = true;
    this.error = null;

    this.elevesService.getPromotionsEleves(this.selectedClasses, this.selectedEtablissements, annee)
      .subscribe({
        next: (data) => {
          console.log("Résultat élèves:", data);
          if (Array.isArray(data)) {
            this.eleves = data;
          } else {
            console.warn("Réponse inattendue (attendu tableau d'élèves) :", data);
            this.eleves = [];
            this.error = "Le serveur a renvoyé un format inattendu.";
          }
          this.loadingSearch = false;
        },
        error: (err) => {
          console.error('Erreur lors de la recherche des élèves:', err);
          this.error = 'Erreur lors de la récupération des élèves.';
          this.loadingSearch = false;
          this.eleves = [];
        },
      });
  }

  exportExcel(): void {
    if (!this.anneeScolaire || this.selectedEtablissements.length === 0 || this.selectedClasses.length === 0) {
      this.error = "Veuillez sélectionner une année scolaire, un établissement et une classe pour l'export.";
      return;
    }

    const anne = this.anneeScolaire.replace('/', '-');
    this.loadingExport = true;
    this.error = null;

    console.log('Export Excel:', this.selectedClasses, this.selectedEtablissements, anne);

    // Utilisation d'un appel HttpClient direct pour un contrôle total sur le responseType
    const url = `${this.elevesService.configuration.basePath}/eleves/getPromotionsElevesExcel`;
    
    let params = new HttpParams();
    this.selectedClasses.forEach(p => params = params.append('promotions', p));
    this.selectedEtablissements.forEach(e => params = params.append('etablissements', e));
    params = params.append('anneeScolaire', anne);

    this.http.get(url, { 
      params: params,
      responseType: 'blob', // Demander explicitement un blob
      observe: 'response' // Pour obtenir la réponse HTTP complète
    })
      .subscribe({
        next: (response: any) => {
          const blob = new Blob([response.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, `Promotions_Eleves_${anne}.xlsx`);
          this.loadingExport = false;
        },
        error: (err) => {
          console.error("Erreur lors de l'exportation Excel:", err);
          this.error = "Erreur lors de l'exportation des données.";
          this.loadingExport = false;
        },
      });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  }
}
