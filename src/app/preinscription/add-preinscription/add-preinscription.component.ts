import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PrinscriptionService,
  PreinscriptionRequestDto,
} from '../../../api-client';
import { TokenService } from '../../services/token.service';
import { MenuComponent } from '../../components/menu/menu.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-preinscription',
  standalone: true,
  templateUrl: './add-preinscription.component.html',
  styleUrls: ['./add-preinscription.component.scss'],
  imports: [CommonModule, MenuComponent, FormsModule, ReactiveFormsModule],
})
export class AddPreinscriptionComponent implements OnInit {
  toastrService = inject(ToastrService);
  currentUser = '';
  error = signal<string | null>(null);
  loading = signal<boolean>(false);
  status = signal<'loading' | 'error' | 'loaded'>('loading');
  router = inject(Router);

  tokenService = inject(TokenService);
  preinscritservice = inject(PrinscriptionService);
  preinscriptionForm!: FormGroup;
  currentStep = 1;
  steps = [
    'IDENTITE ETUDIANT',
    'NIVEAU ACADEMIQUE',
    'CYCLE DE FORMATION',
    'RESPONSABLE DU PAIEMENT',
    "MESURE A PRENDRE EN CAS D'URGENCE",
    'VALIDATION',
  ];

  formations = [
    'BTS Assistant(e) de Direction 2ème Année',
    'BTS Finance Comptabilité et Gestion des Entreprises 2ème Année',
    'BTS Gestion Commerciale 2ème Année',
    "BTS Informatique Développeur d'Application 2ème Année",
    'BTS Ressources Humaines et Communication 2ème Année',
    'BTS Tourisme-Hôtellerie 1ère Année',
    'BTS Tourisme-Hôtellerie 2ème Année',
    'Licence Pro Assistant(e) de Direction 1ère Année',
    'Licence Pro Assistant(e) de Direction 3ème Année',
    'Licence Pro Audit Comptable et Contrôle de Gestion 1ère Année',
    'Licence Pro Audit Comptable et Contrôle de Gestion 3ème Année',
    'Licence pro Communication et Développement des marques 1ère Année',
    'Licence Pro Communication et Développement des Marques 3ème Année',
    'Licence Pro Comptabilité Finance 1ère Année',
    'Licence Pro Comptabilité Finance 3ème Année',
    'Licence Pro Gestion Administrative du Personnel 3ème Année',
    'Licence Pro Gestion des Entreprises 3ème Année',
    'Licence Pro Gestion des Ressources Humaines 3ème Année',
    'Licence Pro Marketing et Communication Publicitaire 1ère Année',
    'Licence Pro Marketing et Communication Publicitaire 3ème Année',
    'Licence Pro Réseaux et Génie Logiciel 1ère Année',
    'Licence Pro Réseaux et Génie Logiciel 3ème Année',
    'Master Pro Administration des Entreprises 1ère Année',
    'Master Pro Administration des Entreprises 2ème Année',
    'Master Pro Audit et Contrôle de Gestion 1ère Année',
    'Master Pro Audit et Contrôle de Gestion 2ème Année',
    'Master Pro Finance Comptabilité 1ère Année',
    'Master Pro Finance Comptabilité 2ème Année',
    'Master Pro Fiscalité et Droit des Affaires 1ère Année',
    'Master Pro Fiscalité et Droit des Affaires 2ème Année',
    'Master Pro Génie Informatique et Réseaux 1ère Année',
    'Master Pro Génie Informatique et Réseaux 2ème Année',
    'Master Pro Marketing 1ère Année',
    'Master Pro Marketing 2ème Année',
  ];
  nationalites = [
    'Ivoirienne',
    'Algérienne',
    'Américaine',
    'Belge',
    'Béninoise',
    'Burkinabè',
    'Camerounaise',
    'Canadienne',
    'Centrafricaine',
    'Congolaise',
    'Française',
    'Gabonaise',
    'Gambienne',
    'Ghanéenne',
    'Guinéenne',
    'Guinéenne Équatoriale',
    'Libérienne',
    'Malienne',
    'Marocaine',
    'Mauritanienne',
    'Nigériane',
    'Nigérienne',
    'Rwandaise',
    'Sénégalaise',
    'Sierra-Léonaise',
    'Suisse',
    'Tchadienne',
    'Togolaise',
    'Tunisienne',
    'Autre',
  ];
  typeIdent = [
    'Carte Nationale d’Identité',
    'Passeport',
    'Attestation d’identité',
    'Carte consulaire',
    'Permis de conduire',
    'Extrait de naissance',
    'Autres',
  ];
  tuteur = ['PERE', 'MERE', 'TUTEUR', 'SOIS-MEME'];
  miseAjourRespo(pres: any) {
    switch (pres) {
      case 'PERE':
        break;
      case 'MERE':
        break;
      case 'TUTEUR':
        break;
      case 'SOIS-MEME':
        break;
      default:
        break;
    }
  }
  etabSource = ['ABIDJAN PLATEAU', 'ABIDJAN YOPOUGON', 'YAMOUSSOUKRO'];
  constructor(private fb: FormBuilder) {}
  private generateId(etabSource: string): string {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 chiffres
    console.log('Etab Source généré est le suivant:', etabSource);
    let suffix = 'AP';
    switch (etabSource) {
      case 'ABIDJAN PLATEAU':
        suffix = 'AP';
        break;
      case 'ABIDJAN YOPOUGON':
        suffix = 'AY';
        break;
      case 'YAMOUSSOUKRO':
        suffix = 'YA'; // Note: le fichier build minifié génère 'Y'. Assurez-vous que 'YA' est correct.
        break;
      default:
        suffix = 'AP';
    }
    return `${randomDigits}${suffix}`;
  }
  ngOnInit() {
    this.initForm();
    try {
      this.currentUser = localStorage.getItem('access_token') || '';
      const decodedToken = jwtDecode<any>(this.currentUser);

      this.currentUser = decodedToken.fullUser.lastname || 'Utilisateur';
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
    }
  }

  initForm() {
    this.preinscriptionForm = this.fb.group({
      id: [''],
      // Informations personnelles
      nomPrenoms: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      lieuNaissance: [''],
      sexe: ['', Validators.required],
      nationalite: [''],
      nationaliteIdentite: ['', Validators.required],
      numeroIdentite: ['', Validators.required],

      // Contacts étudiant
      telephoneEtudiant: [''],
      cellulaireEtudiant: ['', Validators.required],
      emailEtudiant: [''],
      villeEtudiant: [''],
      communeEtudiant: [''],

      // Formation
      baccalaureat: [''],
      anneeBac: [''],
      diplomeEquivalence: [''],
      anneeDiplomeEquivalence: [''],
      niveauEtudes: [''],
      anneeNiveauEtudes: [''],
      grade: [''],
      anneeGrade: [''],
      specialiteGrade: [''],
      etablissementFrequente: [''],
      formationSouhaitee: ['', Validators.required],
      idPermanent: [''],

      // Responsable
      nomPere: [''],
      nomMere: [''],
      titreResponsable: [''],
      responsable: [''],
      nomResponsable: [''],
      professionResponsable: [''],
      employeurResponsable: [''],
      villeResponsable: [''],
      communeResponsable: [''],
      boitePostaleResponsable: [''],
      cellulaireResponsable: [''],
      telephoneBureauResponsable: [''],
      telephoneDomicileResponsable: [''],
      emailResponsable: [''],

      // Santé et contacts d'urgence
      contactNomPrenom1: [''],
      contactAdresse1: [''],
      contactTelephone1: [''],
      contactCellulaire1: [''],
      contactNomPrenom2: [''],
      contactAdresse2: [''],
      contactTelephone2: [''],
      contactCellulaire2: [''],
      cliniqueDeclaree: [false],
      nomClinique: [''],
      telephoneClinique: [''],
      medecinClinique: [''],
      contactMedecin: [''],
      maladies: [''],
      soins: [''],
      medicaments: [''],
      premiersSoins: [''],
      interventionsChirurgicales: [''],

      // Documents et validation
      copieBac: [''],
      copieDernierDiplome: [''],
      decision: ['A'],
      numeroTable: [''],
      numeroMatricule: [''],
      totalBac: [0],
      matierePrincipale: [''],
      anneeScolaire: ['2025/2026'],
      etablissementSource: [''],
      inscritSousTitre: [false],
      utilisateurCreateur: [''],
    });
  }

  showError(controlName: string): any {
    const control = this.preinscriptionForm.get(controlName);
    return control?.invalid && (control?.dirty || control?.touched);
  }

  nextStep() {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  printMedical(id: any): void {
    this.loading.set(true);
    this.preinscritservice
      .impressionFicheMedicaleyakro(id.toString())
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
          this.loading.set(false);
        },
        error: (error) => {
          alert("Erreur lors de l'impression de la fiche médicale");
          this.loading.set(false);
        },
      });
  }

  printInscri(id: any): void {
    this.loading.set(true);
    this.preinscritservice.impressionInscriptionYakro(id.toString()).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        this.loading.set(false);
      },
      error: (error) => {
        alert("Erreur lors de l'impression de l'inscription");
        this.loading.set(false);
      },
    });
  }
  viewPreinscription(id: any): void {
    this.loading.set(true);
    this.preinscritservice
      .impressionPreinscriptionYakro(id.toString())
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
          this.loading.set(false);
        },
        error: (error) => {
          alert("Erreur lors de l'impression de la préinscription");
          this.loading.set(false);
        },
      });
  }

  submit() {
    if (this.preinscriptionForm.valid) {
      this.preinscriptionForm.patchValue({
        id: this.generateId(this.preinscriptionForm.value.etablissementSource),
        utilisateurCreateur: this.currentUser, // Copie pour immuabilité
      });
      const data: PreinscriptionRequestDto = this.preinscriptionForm.value;
      this.preinscritservice.creerOrUpdatePreinsc(data).subscribe({
        next: (response) => {

          this.viewPreinscription(response.id);
          this.printMedical(response.id);
          this.printInscri(response.id);
          this.preinscriptionForm.reset();
          this.router.navigate(['/tb-preinscr']);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Erreur lors de la préinscription:', error);
          const errorMessage =
            error.error?.message ||
            error.message ||
            'Une erreur inconnue est survenue.';
          this.toastrService.error(errorMessage);
        },
        complete: () => {
          this.loading.set(false);
          this.toastrService.success('Préinscription réussie !', 'Succès');
        }
      });
      // Envoyer les données à l'API Spring Boot
    } else {
      this.preinscriptionForm.markAllAsTouched();
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }
}
