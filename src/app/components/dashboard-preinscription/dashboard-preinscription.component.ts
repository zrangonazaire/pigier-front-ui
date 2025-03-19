import { Component, inject, OnInit, signal } from '@angular/core';
import { PreinscriptionYakroResponseDto, PrinscriptionYakroService } from '../../../api-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dashboard-preinscription',
  standalone: true,
  imports: [CommonModule,FormsModule
  ],
  templateUrl: './dashboard-preinscription.component.html',
  styleUrl: './dashboard-preinscription.component.scss',
})
export class DashboardPreinscriptionComponent implements OnInit {
private preinscritservice=inject(PrinscriptionYakroService);
 preinscrits=signal<PreinscriptionYakroResponseDto[]>([]);

eror=signal<string|null>(null);
loading=signal<boolean>(false);
status = signal<'loading' | 'error' | 'loaded'>('loading');

 // Pagination

 
  ngOnInit(): void {
   this.loadPreinscriptions();
  }
  deletepreinscrit(id:any){
  ;
    if (  confirm("Voulez-vous vraiment supprimer cette préinscription ?")==true) {
      this.preinscritservice.deletePreinscYakro(id).subscribe({
        next: (preinscrits) => {  
        alert("La préinscription a été supprimée avec succès");
        this.loadPreinscriptions();
    },
        error: (error) => { }});  
    } else {
      
    }
  

  }

  loadPreinscriptions(page:number=1,size:number=5) {   
 
    this.eror.set(null);
    this.status.set('loading');
    console.log('***** ***** ***** ***** loading  preinscriptions ***** ***** ***** *****');
    this.preinscritservice.findAllPreinscYakro(page,size).subscribe({
      next: (preinscrits) => {  
      console.log("LES PREINSCRIPTION SONT : ",preinscrits);
      this.preinscrits.set(preinscrits);
    
      this.status.set('loaded');
      },
      error: (error) => {   
        console.error('error loading preinscriptions', error);
        this.eror.set('error chargement preinscriptions');
       
        this.status.set('error');
      } });
   
  }
}
