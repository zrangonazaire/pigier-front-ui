import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    RouterLink,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  currentUser = '';
  ngOnInit(): void {
   this.currentUser = localStorage.getItem('access_token') || '';
   if (this.currentUser) {
     try {
       const decodedToken = jwtDecode<any>(this.currentUser);
       this.currentUser = decodedToken.fullUser.lastname
 || 'Utilisateur';
       console.log('Utilisateur actuel:', this.currentUser);
     } catch (error) {
       console.error('Erreur lors du décodage du token:', error);
       this.currentUser = 'Utilisateur';
     }
   } else {
     this.currentUser = 'Utilisateur';
   }
  }
  navbarOpen = false;
  // currentUser is already declared above, you can set its value as needed

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  toggleSubmenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const parent = (event.target as HTMLElement).closest('.dropdown-submenu');
    parent?.classList.toggle('show');
  }

  logout() {
    console.log('Déconnexion...');
    // Implémentez votre logique de déconnexion
  }
}
