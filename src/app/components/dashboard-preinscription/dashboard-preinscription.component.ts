import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  PreinscriptionYakroResponseDto,
  PrinscriptionYakroService,
} from '../../../api-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-dashboard-preinscription',
  standalone: true,
  imports: [CommonModule, FormsModule,MenuComponent],
  templateUrl: './dashboard-preinscription.component.html',
  styleUrl: './dashboard-preinscription.component.scss',
})
export class DashboardPreinscriptionComponent  {
   // Liste des valeurs disponibles
   valeurs: number[] = [5, 10, 20, 50, 100];

   // Valeur sélectionnée par défaut
   selectedValeur: number = this.valeurs[0];

  private preinscritservice = inject(PrinscriptionYakroService);
  preinscrits = signal<PreinscriptionYakroResponseDto[]>([]);
  
  searchQuery = signal('');
  
  filtereUsers = computed(() => {
    const query = this.searchQuery().toUpperCase();
    return this.preinscrits().filter((preinscrit) => {
      console.log("LE FILTRE EST ", query);
      console.log("LES PREINSCRI SONT: ", this.preinscrits().length);
      console.log("LES NOM SONT: ", preinscrit.nomprenoms?.toUpperCase().includes(query));
  
      // Retourne explicitement le résultat de la condition
      return preinscrit.nomprenoms?.toUpperCase().includes(query)|| preinscrit.id?.toLowerCase().includes(query)|| preinscrit.teletud?.toLowerCase().includes(query);
      // Vous pouvez ajouter d'autres conditions ici si nécessaire
      // || preinscrit.teletud?.toLowerCase().includes(query)
      // || preinscrit.formsouh?.toLowerCase().includes(query)
    });
  });
sizeLoad=5;
constructor() {
  this.loadPreinscriptions();
}
  eror = signal<string | null>(null);
  loading = signal<boolean>(false);
  status = signal<'loading' | 'error' | 'loaded'>('loading');

  // Pagination

  // ngOnInit(): void {
  //   this.loadPreinscriptions();
  // }
  deletepreinscrit(id: any) {
    if (
      confirm('Voulez-vous vraiment supprimer cette préinscription ?') == true
    ) {
      this.preinscritservice.deletePreinscYakro(id).subscribe({
        next: (preinscrits) => {
          alert('La préinscription a été supprimée avec succès');
          this.loadPreinscriptions();
        },
        error: (error) => {},
      });
    } else {
    }
  }

  loadPreinscriptions(size: any = 5) {

  console.log("THE SIZE IS ", this.sizeLoad);
    this.eror.set(null);
    this.status.set('loading');
    this.preinscritservice.findAllPreinscYakro(0, this.sizeLoad).subscribe({
      next: (preinscrits) => {
        console.log('PREINSCRITS', preinscrits);
        this.preinscrits.set(preinscrits);        
        this.status.set('loaded');
      },
      error: (error) => {
        this.eror.set('error chargement preinscriptions : ' + error.message);
        console.log('error', error);
        this.status.set('error');
      },
    });
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
