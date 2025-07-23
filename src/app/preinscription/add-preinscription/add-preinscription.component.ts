import { Component, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-add-preinscription',
  standalone: true,
  templateUrl: './add-preinscription.component.html',
  styleUrls: ['./add-preinscription.component.scss'],
  imports: [CommonModule, MenuComponent, FormsModule, ReactiveFormsModule],
})
export class AddPreinscriptionComponent {
    error = signal<string | null>(null);
    loading = signal<boolean>(false);
    status = signal<'loading' | 'error' | 'loaded'>('loading');
    router= inject(Router);
  tokenService = inject(TokenService);
  preinscritservice = inject(PrinscriptionService);
  fb = inject(FormBuilder);

  step = 1;
  hasBac: string = '';
  isSelfResponsible: boolean = false;

  preinscriptionForm: FormGroup;
  currentUser: string = '';

  constructor(private formBuilder: FormBuilder) {
    const decodedToken = this.tokenService.decodeToken() as {
      fullUser?: { lastname?: string };
    };
    console.log(decodedToken);
    this.currentUser = decodedToken.fullUser?.lastname ?? '';
    this.preinscriptionForm = this.formBuilder.group({
      // Étape 1 : Infos personnelles
      id: [''],
      nomprenoms: ['', Validators.required],
      datnais: ['', Validators.required],
      lieunais: ['', Validators.required],
      sexe: ['', Validators.required],
      nationalite: ['', Validators.required],
      natident: ['', Validators.required], // ou typeidentite si tu as renommé
      numidentite: ['', Validators.required],
      teletud: [''],
      celetud: ['', Validators.required],
      emailetud: ['', Validators.required],
      viletud: ['', Validators.required],
      cometud: ['', Validators.required],

      // Étape 2 : Bac & Études
      baccalaureat: [''],
      annbac: [''],
      diplequiv: [''],
      anndiplequiv: [''],
      nivoetud: [''],
      annivoetud: [''],
      grade: [''],
      anngrad: [''],
      specgrad: [''],
      etsfreq: [''],
      formsouh: ['', Validators.required],
      anneescolaire: [''],
      etab_source: ['', Validators.required],

      // Étape 3 : Responsable
      isSelfResponsible: [false],
      nompere: [''],
      nomere: [''],
      titrespo: [''],
      respo: [''],
      nomrespo: [''],
      profrespo: [''],
      emprespo: [''],
      vilrespo: [''],
      comrespo: [''],
      bprespo: [''],
      celrespo: [''],
      telburespo: [''],
      teldomrespo: [''],
      emailrespo: [''],
      idperm: [''],
      // Étape 4 : Santé
      clindec: [''],
      clinnom: [''],
      clintel: [''],
      clinmed: [''],
      clinmedcont: [''],
      maladies: [''],
      soins: [''],
      medic: [''],
      premsoins: [''],
      intervchir: [''],

      // Étape 5 : Contacts d'urgence et pièces
      contnompren1: [''],
      contadr1: [''],
      contel1: [''],
      contcel1: [''],
      contnompren2: [''],
      contadr2: [''],
      contel2: [''],
      contcel2: [''],
      copiebac: [''],
      copderndipl: [''],
      decision: [''],
      numtabl: [''],
      numatri: [''],
      totbac: [''],
      matpc: [''],
      Inscrit_Sous_Titre: [false],
      utilisateurCreateur: [''],
    });
  }

  nextStep() {
    if (this.step < 6) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  onHasBacChange(value: string) {
    this.hasBac = value;
    if (value === 'non') {
      this.preinscriptionForm.patchValue({
        baccalaureat: '',
        annbac: '',
        Etab_source: '',
      });
    }
  }
  // Ajoute cette propriété dans la classe :
  responsableType: string = 'self';

  // Ajoute cette méthode :
  onResponsableTypeChange(type: string) {
    this.responsableType = type;
    if (type === 'self') {
      // Recopie les infos de l'étudiant
      this.preinscriptionForm.patchValue({
        nomrespo: this.preinscriptionForm.value.nomprenoms,
        vilrespo: this.preinscriptionForm.value.viletud,
        comrespo: this.preinscriptionForm.value.cometud,
        celrespo: this.preinscriptionForm.value.celetud,
        emailrespo: this.preinscriptionForm.value.emailetud,
        decision: "A",
      });
    } else if (type === 'pere') {
      this.preinscriptionForm.patchValue({
        nomrespo: this.preinscriptionForm.value.nompere,
      });
    } else if (type === 'mere') {
      this.preinscriptionForm.patchValue({
        nomrespo: this.preinscriptionForm.value.nomere,
      });
    }
  }
  onSelfResponsibleChange(event: any) {
    this.isSelfResponsible = event.target.checked;
    if (this.isSelfResponsible) {
      this.preinscriptionForm.patchValue({
        nomrespo: this.preinscriptionForm.value.nomprenoms,
        vilrespo: this.preinscriptionForm.value.viletud,
        comrespo: this.preinscriptionForm.value.cometud,
        celrespo: this.preinscriptionForm.value.celetud,
        emailrespo: this.preinscriptionForm.value.emailetud,
      });
    }
  }
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
        suffix = 'Y';
        break;
      default:
        suffix = 'AP';
    }
    return `${randomDigits}${suffix}`;
  }
  // Fonctions d'impression
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
          alert(            'Erreur lors de l\'impression de la fiche médicale'
       
          );
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
        alert('Erreur lors de l\'impression de l\'inscription');
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
          alert(
            'Erreur lors de l\'impression de la préinscription'
          );
          this.loading.set(false);
        },
      });
  }
  submit() {
    if (this.preinscriptionForm.valid) {
      this.preinscriptionForm.patchValue({
        utilisateurCreateur: this.currentUser,
        id: this.generateId(this.preinscriptionForm.value.etab_source),
      });
      const data: PreinscriptionRequestDto = this.preinscriptionForm.value;
      this.preinscritservice.creerOrUpdatePreinscYakro(data).subscribe({
        next: (response) => {
          alert('Préinscription enregistrée avec succès.');
        },
        error: (error) => {
          alert('Erreur lors de la préinscription.');
        },
      });
      this.viewPreinscription(data.id);
      this.printMedical(data.id);
      this.printInscri(data.id);
      // Réinitialiser le formulaire après soumission
      this.preinscriptionForm.reset();
      this.router.navigate(['/tb-preinscr']);
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
