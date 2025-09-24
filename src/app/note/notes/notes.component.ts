import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notes',
  imports: [MenuComponent,FormsModule,CommonModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent {
  etudiants = [
    { matricule: 'E001', nom: 'Kouadio Jean', cc: 12, exam: 14, absent: false },
    { matricule: 'E002', nom: 'Traoré Mariam', cc: 10, exam: 11, absent: false },
    { matricule: 'E003', nom: 'Koné Ibrahim', cc: 8, exam: 9, absent: true },
  ];

  get stats() {
    const notes = this.etudiants.filter(e => !e.absent).map(e => (e.cc*2 + e.exam)/3);
    return {
      effectif: this.etudiants.length,
      moyenneGen: (notes.reduce((a,b)=>a+b,0)/notes.length).toFixed(2),
      max: Math.max(...notes).toFixed(2),
      min: Math.min(...notes).toFixed(2),
      admis: notes.filter(n => n >= 10).length
    };
  }

  get statsCards() {
    return [
      { title: 'Effectif', value: this.stats.effectif, color: 'text-primary' },
      { title: 'Moyenne Générale', value: this.stats.moyenneGen, color: 'text-success' },
      { title: 'Max', value: this.stats.max, color: 'text-danger' },
      { title: 'Min', value: this.stats.min, color: 'text-warning' },
      { title: '≥ Moyenne', value: this.stats.admis, color: 'text-success' },
    ];
  }
}
