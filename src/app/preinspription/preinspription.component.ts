import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-preinspription',
  imports: [ReactiveFormsModule, MatRadioModule],
  templateUrl: './preinspription.component.html',
  styleUrl: './preinspription.component.scss'
})
export class PreinspriptionComponent implements OnInit {
  preinscriptionForm!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.preinscriptionForm = this.fb.group({
      id: [null],
      nomprenoms: ['', Validators.required],
      datnais: ['', Validators.required],
      lieunais: [''],
      sexe: [''],
      nationalite: [''],
      natident: [''],
      numidentite: [''],
      teletud: [''],
      celetud: [''],
      emailetud: ['', Validators.email],
      viletud: [''],
      cometud: [''],
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
      formsouh: [''],
      idperm: [''],
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
      emailrespo: ['', Validators.email],
      copiebac: [''],
      copderndipl: [''],
      contnompren1: [''],
      contadr1: [''],
      contel1: [''],
      contcel1: [''],
      contnompren2: [''],
      contadr2: [''],
      contel2: [''],
      contcel2: [''],
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
      datinscrip: [''],
      decision: [''],
      numtabl: [''],
      numatri: [''],
      totbac: [0],
      matpc: [''],
      anneescolaire: [''],
      Etab_source: [''],
      Inscrit_Sous_Titre: [false]
    });
  }

  onSubmit(): void {
    if (this.preinscriptionForm.valid) {
      console.log(this.preinscriptionForm.value);
      // Envoyer les données au serveur ou effectuer d'autres actions
    } else {
      console.log('Formulaire invalide');
    }
  }
}
