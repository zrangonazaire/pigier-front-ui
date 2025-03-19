import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,

} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { PreinscriptionYakroRequestDto } from '../../api-client';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule
  ],

  templateUrl: './preinspription.component.html',
  styleUrl: './preinspription.component.scss',
})
export class PreinspriptionComponent implements OnInit {
ngOnInit(): void {
  throw new Error('Method not implemented.');
}
hasDiplomeEquivalent: boolean | null = null; // Réponse à la question
currentStep: number = 1;
  preinscriptionData: PreinscriptionYakroRequestDto = {
    nomprenoms: '',
    teletud: ''
  };

  nextStep() {
    this.currentStep++;
  }

  previousStep() {
    this.currentStep--;
  }

  submitForm() {
    console.log('Form submitted:', this.preinscriptionData);
  }

}
