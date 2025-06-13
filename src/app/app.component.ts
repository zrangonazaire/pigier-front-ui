// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Import CommonModule for NgClass
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true, // Si votre app.component est standalone
  imports: [CommonModule, RouterOutlet] // Ajoutez RouterOutlet ici si standalone
})
export class AppComponent implements OnInit {
  title = 'Kranja App';

  isLoginPage: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Vérifie si l'URL actuelle contient '/login'
      this.isLoginPage = event.urlAfterRedirects.includes('/login');
      // Pour une correspondance exacte: this.isLoginPage = event.urlAfterRedirects === '/login';
    });
  }
}