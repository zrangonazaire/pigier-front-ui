import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserAuthservice } from '../../services/user.auth.service';

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
  private authService = inject(UserAuthservice);
  currentUser = '';

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user?.lastname || user?.firstname || 'Utilisateur';
    });
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

  private modulePermissions(module: string): string[] {
    const key = module.replace(/\s+/g, '_').toUpperCase();
    return [
      `READ_${key}`,
      `WRITE_${key}`,
      `EDIT_${key}`,
      `DELETE_${key}`,
    ];
  }

  hasModuleAccess(module: string): boolean {
    return this.authService.hasAnyPermission(this.modulePermissions(module));
  }

  hasAnyAccess(): boolean {
    return this.authService.hasAnyPermission([
      ...this.modulePermissions('PREINSCRIPTION'),
      ...this.modulePermissions('COMMERCIALE'),
      ...this.modulePermissions('COMPTABILITE'),
      ...this.modulePermissions('EXAMEN'),
      ...this.modulePermissions('NOTE'),
      ...this.modulePermissions('ELEVE'),
      ...this.modulePermissions('ADMINISTRATION'),
    ]);
  }

  isNotAdmin(): boolean {
    return !this.authService.isAdmin();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout() {
    console.log('DǸconnexion...');
    this.authService.logout();
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
    this.currentUser = '';
  }

}
