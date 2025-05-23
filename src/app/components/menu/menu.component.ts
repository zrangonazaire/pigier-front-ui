import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

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
export class MenuComponent {
  navbarOpen = false;
  currentUser = 'Admin';

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
