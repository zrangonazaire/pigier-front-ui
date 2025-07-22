import { Component } from '@angular/core';
import { Chart } from 'chart.js';
import { MenuComponent } from '../menu/menu.component';
@Component({
  selector: 'app-tb-comptablilite',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './tb-comptablilite.component.html',
  styleUrl: './tb-comptablilite.component.scss'
})
export class TbComptabliliteComponent {
 title = 'Suivi des Encaissements - Université Privée';

  ngAfterViewInit() {
    this.createEncaissementsChart();
    this.createFiliereChart();
  }

  createEncaissementsChart() {
    const ctx = document.getElementById('encaissementsChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
        datasets: [{
          label: 'Encaissements (XAF)',
          data: [1200000, 1850000, 1500000, 2100000, 1750000, 1950000, 2200000, 2050000, 2300000, 1950000],
          backgroundColor: 'rgba(78, 115, 223, 0.5)',
          borderColor: '#4e73df',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString() + ' XAF';
              }
            }
          }
        }
      }
    });
  }

  createFiliereChart() {
    const ctx = document.getElementById('filiereChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Médecine', 'Ingénierie', 'Droit', 'Gestion', 'Architecture'],
        datasets: [{
          data: [45, 25, 15, 10, 5],
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#36b9cc',
            '#f6c23e',
            '#e74a3b'
          ],
          hoverBackgroundColor: [
            '#2e59d9',
            '#17a673',
            '#2c9faf',
            '#dda20a',
            '#be2617'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}
