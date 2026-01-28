import {
  Component,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

import { MenuComponent } from '../menu/menu.component';
import { EncaissementService } from '../../../api-client';
import { DashboardEncaissementBIDTO } from '../../../api-client/model/DashboardEncaissementBIDTO';
import {NgxPaginationModule} from 'ngx-pagination';

@Component({
  selector: 'app-tb-comptabilite',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    MenuComponent
  ],
  templateUrl: './tb-comptabilite.component.html',
  styleUrls: ['./tb-comptabilite.component.scss']
})
export class TbComptabiliteComponent implements OnInit {

  title = 'TABLEAU DE BORD DES ENCAISSEMENTS';
  annee: string = '';
  mois?: number;
  niveau?: string;
  dashboard!: DashboardEncaissementBIDTO;
  page = 1;
  searchText = '';
  chartNiveau?: Chart;
  chartFiliere?: Chart;
  chartSolde?: Chart;

  constructor(private encaissementService: EncaissementService) {}

  ngOnInit(): void {
    const now = new Date();
    this.mois = now.getMonth() + 1;
    this.annee = `${now.getFullYear() - 1}-${now.getFullYear()}`;
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.encaissementService
      .getDashboardEncaissements(this.anneeDB, this.mois, this.niveau)
      .subscribe({
        next: data => {
          this.dashboard = data;
          setTimeout(() => this.loadCharts(), 0);
        },
        error: err => console.error(err)
      });
  }

  onFiltreChange(): void {
    this.page = 1;
    this.loadDashboard();
  }

  loadCharts(): void {
    this.createNiveauChart();
    this.createFiliereChart();
    this.createSoldeChart();
  }

  createNiveauChart(): void {
    if (this.chartNiveau) this.chartNiveau.destroy();

    this.chartNiveau = new Chart('chartNiveau', {
      type: 'bar',
      data: {
        labels: Object.keys(this.dashboard.encaissementParNiveau),
        datasets: [{
          label: 'Encaissements',
          data: Object.values(this.dashboard.encaissementParNiveau),
          backgroundColor: '#4e73df'
        }]
      }
    });
  }

  createFiliereChart(): void {
    if (this.chartFiliere) this.chartFiliere.destroy();

    this.chartFiliere = new Chart('chartFiliere', {
      type: 'doughnut',
      data: {
        labels: Object.keys(this.dashboard.encaissementParFiliere),
        datasets: [{
          data: Object.values(this.dashboard.encaissementParFiliere)
        }]
      }
    });
  }

  createSoldeChart(): void {
    if (this.chartSolde) this.chartSolde.destroy();

    this.chartSolde = new Chart('chartSolde', {
      type: 'pie',
      data: {
        labels: ['Soldés', 'Non soldés'],
        datasets: [{
          data: [
            this.dashboard.totalElevesSoldes,
            this.dashboard.totalElevesNonSoldes
          ],
          backgroundColor: ['#1cc88a', '#e74a3b']
        }]
      }
    });
  }

  formatMontant(val: number): string {
    return val.toLocaleString('fr-FR') + ' FCFA';
  }

  get anneeDB(): string {
    return this.annee.replace('-', '/');
  }

  get niveauxDisponibles(): string[] {
    return [...new Set(this.dashboard?.details.map(d => d.niveau))];
  }

  get filteredDetails() {
    return this.dashboard.details.filter(e =>
      Object.values(e).some(v =>
        v?.toString().toLowerCase().includes(this.searchText.toLowerCase())
      )
    );
  }
}
