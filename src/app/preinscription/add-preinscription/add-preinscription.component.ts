import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { PrinscriptionYakroService, PreinscriptionYakroResponseDto, PreinscriptionYakroRequestDto } from '../../../api-client';
import { MenuComponent } from '../../components/menu/menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-preinscription',
  standalone: true,
  imports: [  ReactiveFormsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatStepperModule,
      FormsModule,
    MenuComponent,CommonModule],
  templateUrl: './add-preinscription.component.html',
  styleUrl: './add-preinscription.component.scss'
})
export class AddPreinscriptionComponent implements OnInit{
 ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }
  hasDiplomeEquivalent: boolean = false; // Réponse à la question
  private preinscritservice = inject(PrinscriptionYakroService);
  preinscrits = signal<PreinscriptionYakroResponseDto | null>(null);

  eror = signal<string | null>(null);
  loading = signal<boolean>(false);
  status = signal<'loading' | 'error' | 'loaded'>('loading');

  currentStep = 1; // Étape actuelle
  preinscriptionData: PreinscriptionYakroRequestDto = {
    nomprenoms: '',
    teletud: '',
  }; // Données du formulaire
  // Pour gérer l'affichage conditionnel

  // Méthode pour passer à l'étape suivante
  nextStep(form: NgForm) {
    // Valide le formulaire avant de passer à l'étape suivante
    if (form.invalid) {
      alert(
        'Veuillez remplir tous les champs obligatoires avant de continuer.'
      );
      return; // Bloque la navigation si le formulaire est invalide
    }

    // Passe à l'étape suivante si tout est valide
    if (this.currentStep < 6) {
      this.currentStep++;
    }
  }

  // Méthode pour revenir à l'étape précédente
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Méthode pour soumettre le formulaire
  addUnePreinscription() {
    this.genererID();
    this.loading.set(true);
    this.status.set('loading');
    this.preinscritservice
      .creerOrUpdatePreinscYakro(this.preinscriptionData)
      .subscribe(
        (response) => {
          this.preinscrits.set(response);
          this.status.set('loaded');
          this.loading.set(false);
          alert('Préinscription enregistrée avec succès.');
          this.printInscri(response.id);
          this.printPreinscrit(response.id);
          this.printMedical(response.id);
        },
        (error) => {
          this.eror.set(error.message);
          this.status.set('error');
          this.loading.set(false);
          alert(
            "Une erreur est survenue lors de l'enregistrement de la préinscription."
          );
        }
      );
    console.log('Formulaire soumis', this.preinscriptionData);
    // Ajoutez ici la logique pour envoyer les données au serveur
  }
  //METHODE POUR GENRER LE CODE DE PREINSCRIPTION
  genererID() {
    if (
      this.preinscriptionData.id?.length == 0 ||
      this.preinscriptionData.id == null
    ) {
      this.preinscriptionData.decision = 'E';
      // Générer un ID de 6 chiffres aléatoire
      const id = Math.floor(100000 + Math.random() * 900000);

      // Ajouter la lettre correspondante
      let lettre = '';
      switch (this.preinscriptionData.etab_source) {
        case 'ABIDJAN PLATEAU':
          lettre = 'P';
          break;
        case 'ABIDJAN YOPOUGON':
          lettre = 'L';
          break;
        case 'YAMOUSSOUKRO':
          lettre = 'Y';
          break;
        default:
          lettre = '';
      }
      this.preinscriptionData.decision = 'A';
      this.preinscriptionData.id = id.toString() + lettre;
    }
  }
  printInscri(arg0: any) {
    this.preinscritservice.impressionInscriptionYakro(arg0).subscribe({
      next: (response) => {
        
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (error) => {
        alert('Erreur impression');
      },
    });
  }
  printPreinscrit(arg0: any) {
    this.preinscritservice.impressionPreinscriptionYakro(arg0).subscribe({
      next: (response) => {
        
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (error) => {
        alert('Erreur impression');
      },
    });
  }
  printMedical(arg0: any) {
    this.preinscritservice.impressionFicheMedicaleyakro(arg0).subscribe({
      next: (response) => {
        
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (error) => {
        alert('Erreur impression');
      },
    });
  }
}
