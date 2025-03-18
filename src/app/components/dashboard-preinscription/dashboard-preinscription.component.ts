import { Component, inject, OnInit, signal } from '@angular/core';
import { PreinscriptionYakroResponseDto, PrinscriptionYakroService } from '../../../api-client';


@Component({
  selector: 'app-dashboard-preinscription',
  standalone: true,
  imports: [
  ],
  templateUrl: './dashboard-preinscription.component.html',
  styleUrl: './dashboard-preinscription.component.scss',
})
export class DashboardPreinscriptionComponent implements OnInit {
private preinscritservice=inject(PrinscriptionYakroService);
private preinscrits=signal<PreinscriptionYakroResponseDto[]>([]);
  ngOnInit(): void {
   this.loadPreinscriptions();
  }

  loadPreinscriptions() {   
    console.log('***** ***** ***** ***** loading  preinscriptions ***** ***** ***** *****');
    this.preinscritservice.findAllPreinscYakro().subscribe({
      next: (preinscrits) => {  
      console.log("LES PREINSCRIPTION SONT",preinscrits);
      this.preinscrits.set(preinscrits);
      },
      error: (error) => {   
        console.error('error loading preinscriptions', error);
      } });
   
  }
}
