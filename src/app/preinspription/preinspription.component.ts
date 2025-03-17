import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule
  ],
 
  templateUrl: './preinspription.component.html',
  styleUrl: './preinspription.component.scss',
})
export class PreinspriptionComponent implements OnInit {
onSubmit() {
throw new Error('Method not implemented.');
}
  isLinear = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fourthFormGroup!: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      nomprenoms: ['', Validators.required],
      datnais: [''],
      lieunais: [''],
      sexe: [''],
      nationalite: [''],
      natident: [''],
      numidentite: [''],
      teletud: [''],
      celetud: [''],
      emailetud: [''],
      viletud: [''],
      cometud: ['']
    });

    this.secondFormGroup = this._formBuilder.group({
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
      idperm: ['']
    });

    this.thirdFormGroup = this._formBuilder.group({
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
      emailrespo: ['']
    });

    this.fourthFormGroup = this._formBuilder.group({
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
}
