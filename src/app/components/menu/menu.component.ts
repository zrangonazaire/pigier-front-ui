import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { routes } from '../../app.routes';

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
    RouterLinkActive,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  router = inject(Router);
  currentUser = '';
  roleCommer = false;
  roleAdmin = false;
  roleComptable = false;
  roleNote = false;
  roleDirCom = false;

  currentUserRole: string = 'Poste Utilisateur';
  currentRole: any[] = [];
  ngOnInit(): void {
    this.currentUser = localStorage.getItem('access_token') || '';
    if (this.currentUser) {
      this.roleAdmin = false;
      this.roleCommer = false;
      this.roleComptable = false;
      this.roleNote = false;
      this.roleDirCom = false;

      try {
        const decodedToken = jwtDecode<any>(this.currentUser);
        this.currentRole = decodedToken.fullUser.roles;
        this.currentUser = decodedToken.fullUser.lastname || 'Utilisateur';
        console.log('Utilisateur connecté:', this.currentUser);
        
        for (let index = 0; index < this.currentRole.length; index++) {
          const element = this.currentRole[index].nomRole;
          console.log("Rôle de l'utilisateur:", element);
          if (element === 'ROLE_ADMIN') {
            this.roleAdmin = true;
          } else if (element === 'ROLE_COMMERCIALE') {
            this.roleCommer = true;
          } else if (element === 'ROLE_COMPTABLE') {
            this.roleComptable = true;
          } else if (element === 'ROLE_NOTE') {
            this.roleNote = true;
          } else if (element === 'ROLE_DIR_COM') {
            this.roleDirCom = true;
          }
        }

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
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
    this.currentUser = '';
    //this.currentRole = '';
    this.roleAdmin = false;
    this.roleCommer = false;
    this.roleComptable = false;
    this.roleNote = false;
    this.roleDirCom = false;
  }
}
