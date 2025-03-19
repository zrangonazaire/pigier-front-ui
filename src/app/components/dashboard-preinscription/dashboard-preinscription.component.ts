import { Component, inject, OnInit, signal } from '@angular/core';
import { PreinscriptionYakroResponseDto, PrinscriptionYakroService } from '../../../api-client';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dashboard-preinscription',
  standalone: true,
  imports: [CommonModule
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
  ngOnInit(): void {
   this.loadPreinscriptions();
  }

  loadPreinscriptions(page:number=1,size:number=10) {   
 
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
