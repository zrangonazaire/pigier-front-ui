import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';


@Component({
  selector: 'app-list-preinscription',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './list-preinscription.component.html',
  styleUrl: './list-preinscription.component.scss'
})
export class ListPreinscriptionComponent implements OnInit{
  preinscriptions = [
    { nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', telephone: '0123456789', date: new Date() },
    { nom: 'Durand', prenom: 'Marie', email: 'marie.durand@example.com', telephone: '0987654321', date: new Date() }
  ];

  constructor() {}

  ngOnInit(): void {}

  viewDetails(preinscription: any): void {
    console.log('Voir les détails de :', preinscription);
  }

  deletePreinscription(preinscription: any): void {
    this.preinscriptions = this.preinscriptions.filter(p => p !== preinscription);
    console.log('Préinscription supprimée :', preinscription);
  }
}
