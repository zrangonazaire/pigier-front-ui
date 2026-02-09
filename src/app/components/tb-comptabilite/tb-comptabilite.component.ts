import {
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuComponent } from '../menu/menu.component';
import { EncaissementService } from '../../../api-client';
import { DashboardEncaissementBIDTO } from '../../../api-client/model/DashboardEncaissementBIDTO';
import { EncaissementEleveBIBaseDTO } from '../../../api-client/model/EncaissementEleveBIBaseDTO';
import { NgxPaginationModule } from 'ngx-pagination';

// PrimeNG
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';

interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-tb-comptabilite',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    MenuComponent,
    ChartModule,
    CardModule,
    Select,
    InputTextModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    TooltipModule,
    DividerModule,
    PaginatorModule
  ],
  templateUrl: './tb-comptabilite.component.html',
  styleUrls: ['./tb-comptabilite.component.scss']
})
export class TbComptabiliteComponent implements OnInit {

  title = 'TABLEAU DE BORD DES ENCAISSEMENTS';
  annee = '';
  mois?: number;
  niveau?: string;
  dashboard?: DashboardEncaissementBIDTO;
  loading = false;
  errorMessage = '';

  // Filtres colonnes tableau
  filterMatricule = '';
  filterNom = '';
  filterNiveau = '';
  filterFiliere = '';

  // Options dropdown année scolaire
  anneeOptions: SelectOption[] = [];

  // Options dropdown mois
  moisOptions: SelectOption[] = [
    { label: 'Tous les mois', value: undefined },
    { label: 'Janvier', value: 1 },
    { label: 'Février', value: 2 },
    { label: 'Mars', value: 3 },
    { label: 'Avril', value: 4 },
    { label: 'Mai', value: 5 },
    { label: 'Juin', value: 6 },
    { label: 'Juillet', value: 7 },
    { label: 'Août', value: 8 },
    { label: 'Septembre', value: 9 },
    { label: 'Octobre', value: 10 },
    { label: 'Novembre', value: 11 },
    { label: 'Décembre', value: 12 }
  ];

  // Charts data - 8 charts
  chartNiveauData: any;
  chartNiveauOptions: any;
  chartFiliereData: any;
  chartFiliereOptions: any;
  chartSoldeData: any;
  chartSoldeOptions: any;
  chartRecouvrementData: any;
  chartRecouvrementOptions: any;
  chartComparaisonData: any;
  chartComparaisonOptions: any;
  chartTopFilieresData: any;
  chartTopFilieresOptions: any;
  chartMontantsData: any;
  chartMontantsOptions: any;
  chartTauxSoldesData: any;
  chartTauxSoldesOptions: any;

  // Couleurs thème Pigier
  private readonly brandBlue = '#0b4da3';
  private readonly brandNavy = '#0a2f6f';
  private readonly brandYellow = '#f5c64e';
  private readonly successGreen = '#22c55e';
  private readonly dangerRed = '#ef4444';
  private readonly infoTeal = '#06b6d4';
  private readonly warningOrange = '#f97316';
  private readonly purple = '#8b5cf6';
  private readonly pink = '#ec4899';

  // Palette spécifique pour les niveaux
  private readonly niveauPalette = [
    '#0b4da3', '#1cc88a', '#f59e0b', '#6366f1', '#f97316', '#8b5cf6', '#ef4444', '#14b8a6', '#10b981', '#ec4899'
  ];

  constructor(private encaissementService: EncaissementService) {}

  ngOnInit(): void {
    this.generateAnneeOptions();
    const now = new Date();
    this.mois = now.getMonth() + 1;
    this.annee = `${now.getFullYear() - 1}-${now.getFullYear()}`;
    this.loadDashboard();
  }

  generateAnneeOptions(): void {
    const currentYear = new Date().getFullYear();
    this.anneeOptions = [];
    // Générer les 10 dernières années scolaires
    for (let i = 0; i < 10; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      this.anneeOptions.push({
        label: `${startYear}-${endYear}`,
        value: `${startYear}-${endYear}`
      });
    }
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.encaissementService
      .getDashboardEncaissements(this.anneeDB || undefined, this.mois, this.niveau)
      .subscribe({
        next: data => {
          this.dashboard = data;
          this.loading = false;
          this.buildCharts();
        },
        error: err => {
          this.loading = false;
          this.errorMessage = 'Erreur lors du chargement des données.';
          console.error(err);
        }
      });
  }

  onFiltreChange(): void {
    this.loadDashboard();
  }

  buildCharts(): void {
    if (!this.dashboard) return;

    // 1. Chart Encaissement par Niveau (Bar horizontal)
    const niveauEntries = Object.entries(this.dashboard.encaissementParNiveau || {}).sort((a, b) => b[1] - a[1]);
    const niveauLabels = niveauEntries.map(([k]) => k);
    const niveauColors = niveauLabels.map(l => this.getNiveauColor(l));
    this.chartNiveauData = {
      labels: niveauLabels,
      datasets: [{
        label: 'Montant encaissé',
        data: niveauEntries.map(([, v]) => v),
        backgroundColor: niveauColors,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
    this.chartNiveauOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => this.formatMontant(ctx.raw)
          }
        }
      },
      scales: {
        x: {
          ticks: { callback: (v: number) => this.formatCompact(v) },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: { grid: { display: false } }
      }
    };

    // 2. Chart Encaissement par Filière (Pyramide / Bar horizontal) - Labels abrégés
    const filiereEntries = Object.entries(this.dashboard.encaissementParFiliere || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
    this.chartFiliereData = {
      labels: filiereEntries.map(([k]) => this.truncateLabel(k, 10)),
      datasets: [{
        label: 'Encaissé par filière',
        data: filiereEntries.map(([, v]) => v),
        backgroundColor: this.generatePaletteColors(filiereEntries.length),
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 18
      }]
    };
    this.chartFiliereOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items: any) => filiereEntries[items[0].dataIndex]?.[0] || '',
            label: (ctx: any) => this.formatMontant(ctx.raw)
          }
        }
      },
      scales: {
        x: {
          ticks: { callback: (v: number) => this.formatCompact(v), font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10 } }
        }
      }
    };

    // 3. Chart Soldés vs Non Soldés (Doughnut)
    this.chartSoldeData = {
      labels: ['Élèves soldés', 'Élèves non soldés'],
      datasets: [{
        data: [this.dashboard.totalElevesSoldes, this.dashboard.totalElevesNonSoldes],
        backgroundColor: [this.successGreen, this.dangerRed],
        hoverOffset: 10,
        borderWidth: 0
      }]
    };
    this.chartSoldeOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, padding: 12, font: { size: 12, weight: '500' }, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.label}: ${ctx.raw} élève(s)`
          }
        }
      }
    };

    // 4. Chart Taux de recouvrement (Gauge)
    const taux = this.dashboard.tauxRecouvrement ?? 0;
    this.chartRecouvrementData = {
      labels: ['Recouvré', 'Restant'],
      datasets: [{
        data: [taux, 100 - taux],
        backgroundColor: [this.brandYellow, '#e5e7eb'],
        borderWidth: 0
      }]
    };
    this.chartRecouvrementOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      rotation: -90,
      circumference: 180,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    };

    // 5. Chart Comparaison Attendu vs Encaissé (Bar groupé)
    this.chartComparaisonData = {
      labels: ['Montants globaux'],
      datasets: [
        {
          label: 'Attendu',
          data: [this.dashboard.montantTotalAttendu],
          backgroundColor: this.brandBlue,
          borderRadius: 6
        },
        {
          label: 'Encaissé',
          data: [this.dashboard.montantTotalEncaisse],
          backgroundColor: this.successGreen,
          borderRadius: 6
        },
        {
          label: 'Restant',
          data: [this.dashboard.montantTotalRestant],
          backgroundColor: this.dangerRed,
          borderRadius: 6
        }
      ]
    };
    this.chartComparaisonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, padding: 12, font: { size: 12 }, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${this.formatMontant(ctx.raw)}`
          }
        }
      },
      scales: {
        y: {
          ticks: { callback: (v: number) => this.formatCompact(v) },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { grid: { display: false } }
      }
    };

    // 6. Chart Top 5 Filières (Polar Area) - Sans légende, tooltip riche
    const topFilieres = filiereEntries.slice(0, 5);
    this.chartTopFilieresData = {
      labels: topFilieres.map(([k]) => this.truncateLabel(k, 12)),
      datasets: [{
        data: topFilieres.map(([, v]) => v),
        backgroundColor: [this.brandBlue, this.brandYellow, this.successGreen, this.infoTeal, this.purple].map(c => c + 'dd')
      }]
    };
    this.chartTopFilieresOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items: any) => topFilieres[items[0].dataIndex]?.[0] || '',
            label: (ctx: any) => this.formatMontant(ctx.raw)
          }
        }
      },
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    };

    // 7. Chart Répartition Montants (Pie)
    this.chartMontantsData = {
      labels: ['Encaissé', 'Restant dû', 'Trop-perçu'],
      datasets: [{
        data: [
          this.dashboard.montantTotalEncaisse,
          Math.max(0, this.dashboard.montantTotalRestant ?? 0),
          this.dashboard.montantDuAuxEleves
        ],
        backgroundColor: [this.successGreen, this.warningOrange, this.purple],
        hoverOffset: 8
      }]
    };
    this.chartMontantsOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, padding: 10, font: { size: 11 }, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.label}: ${this.formatMontant(ctx.raw)}`
          }
        }
      }
    };

    // 8. Chart Taux Élèves Soldés (Gauge)
    const tauxSoldes = this.dashboard.tauxElevesSoldes ?? 0;
    this.chartTauxSoldesData = {
      labels: ['Soldés', 'Non soldés'],
      datasets: [{
        data: [tauxSoldes, 100 - tauxSoldes],
        backgroundColor: [this.successGreen, '#e5e7eb'],
        borderWidth: 0
      }]
    };
    this.chartTauxSoldesOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      rotation: -90,
      circumference: 180,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    };
  }

  get anneeDB(): string {
    return this.annee.replace('-', '/');
  }

  get niveauxOptions(): SelectOption[] {
    const details = this.dashboard?.details ?? [];
    const niveaux = [...new Set(details.map(d => d.niveau))].filter(Boolean);
    return [
      { label: 'Tous les niveaux', value: undefined },
      ...niveaux.map(n => ({ label: n, value: n }))
    ];
  }

  get filteredDetails(): EncaissementEleveBIBaseDTO[] {
    let data = this.dashboard?.details ?? [];

    if (this.filterMatricule) {
      data = data.filter(e => e.matricule?.toLowerCase().includes(this.filterMatricule.toLowerCase()));
    }
    if (this.filterNom) {
      data = data.filter(e => e.nomPrenom?.toLowerCase().includes(this.filterNom.toLowerCase()));
    }
    if (this.filterNiveau) {
      data = data.filter(e => e.niveau?.toLowerCase().includes(this.filterNiveau.toLowerCase()));
    }
    if (this.filterFiliere) {
      data = data.filter(e => e.filiere?.toLowerCase().includes(this.filterFiliere.toLowerCase()));
    }

    return data;
  }

  get kpiCards() {
    if (!this.dashboard) return [];
    const d = this.dashboard;
    const moyenneParEleve = d.totalEleves ? Math.round((d.montantTotalEncaisse ?? 0) / d.totalEleves) : 0;
    const resteParEleve = d.totalElevesNonSoldes ? Math.round((d.montantTotalRestant ?? 0) / d.totalElevesNonSoldes) : 0;

    return [
      {
        icon: 'fa-solid fa-users',
        label: 'Total étudiants',
        value: d.totalEleves,
        bg: 'bg-blue'
      },
      {
        icon: 'fa-solid fa-check',
        label: 'Élèves soldés',
        value: d.totalElevesSoldes,
        bg: 'bg-green'
      },
      {
        icon: 'fa-solid fa-ban',
        label: 'Élèves non soldés',
        value: d.totalElevesNonSoldes,
        bg: 'bg-red'
      },
      {
        icon: 'fa-solid fa-inbox',
        label: 'Montant attendu',
        value: this.formatMontant(d.montantTotalAttendu),
        bg: 'bg-yellow'
      },
      {
        icon: 'fa-solid fa-dollar-sign',
        label: 'Montant encaissé',
        value: this.formatMontant(d.montantTotalEncaisse),
        bg: 'bg-teal'
      },
      {
        icon: 'fa-solid fa-hourglass-half',
        label: 'Restant à payer',
        value: this.formatMontant(d.montantTotalRestant),
        bg: 'bg-orange'
      },
      {
        icon: 'fa-solid fa-rotate-left',
        label: 'Trop-perçu (dû aux élèves)',
        value: this.formatMontant(d.montantDuAuxEleves),
        bg: 'bg-purple'
      },
      {
        icon: 'fa-solid fa-square-check',
        label: 'Taux élèves soldés',
        value: this.formatPercent(d.tauxElevesSoldes),
        bg: 'bg-cyan'
      },
      {
        icon: 'fa-solid fa-chart-pie',
        label: 'Taux de recouvrement',
        value: this.formatPercent(d.tauxRecouvrement),
        bg: 'bg-indigo'
      },
      {
        icon: 'fa-solid fa-euro-sign',
        label: 'Moyenne encaissée/élève',
        value: this.formatMontant(moyenneParEleve),
        bg: 'bg-pink'
      },
      {
        icon: 'fa-solid fa-stopwatch',
        label: 'Reste moyen/non soldé',
        value: this.formatMontant(resteParEleve),
        bg: 'bg-amber'
      },
      {
        icon: 'fa-solid fa-th-large',
        label: 'Nb filières actives',
        value: Object.keys(d.encaissementParFiliere || {}).length,
        bg: 'bg-slate'
      }
    ];
  }

  // Propositions de KPIs additionnels pour la comptabilité
  get suggestedKpis(): string[] {
    return [
      'Encaissement moyen par jour/semaine/mois',
      'Évolution mensuelle des encaissements',
      'Taux de paiement par échéance',
      'Nombre de paiements en retard',
      'Montant des impayés > 30/60/90 jours',
      'Top 10 des plus gros débiteurs',
      'Répartition par mode de paiement (espèces, virement, chèque)',
      'Prévision de trésorerie',
      'Comparaison année N vs N-1'
    ];
  }

  formatMontant(val?: number | null): string {
    const safeVal = val ?? 0;
    return safeVal.toLocaleString('fr-FR') + ' FCFA';
  }

  formatPercent(val?: number | null): string {
    const safeVal = val ?? 0;
    return safeVal.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
  }

  formatCompact(val: number): string {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K';
    return val.toString();
  }

  truncateLabel(label: string, maxLength: number): string {
    if (!label) return '';
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 1) + '…';
  }

  getSoldeSeverity(solde: number): 'success' | 'danger' | 'warn' {
    if (solde === 0) return 'success';
    if (solde > 0) return 'danger';
    return 'warn';
  }

  clearFilters(): void {
    this.filterMatricule = '';
    this.filterNom = '';
    this.filterNiveau = '';
    this.filterFiliere = '';
  }

  private generateGradientColors(count: number, start: string, end: string): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const ratio = i / Math.max(count - 1, 1);
      colors.push(this.interpolateColor(start, end, ratio));
    }
    return colors;
  }

  private generatePaletteColors(count: number): string[] {
    const palette = [
      this.brandBlue, this.brandYellow, this.successGreen, this.dangerRed,
      this.infoTeal, this.warningOrange, this.purple, this.pink, '#14b8a6', '#6366f1'
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  private interpolateColor(c1: string, c2: string, ratio: number): string {
    const hex = (c: string) => parseInt(c.slice(1), 16);
    const r1 = (hex(c1) >> 16) & 255, g1 = (hex(c1) >> 8) & 255, b1 = hex(c1) & 255;
    const r2 = (hex(c2) >> 16) & 255, g2 = (hex(c2) >> 8) & 255, b2 = hex(c2) & 255;
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    return `rgb(${r},${g},${b})`;
  }

  // Couleur cohérente par niveau
  getNiveauColor(niveau?: string): string {
    const niv = (niveau || '').trim();
    if (!niv) return this.brandBlue;
    const details = this.dashboard?.details || [];
    const uniques = [...new Set(details.map(d => d.niveau).filter(Boolean))];
    const idx = uniques.indexOf(niv);
    if (idx >= 0) {
      return this.niveauPalette[idx % this.niveauPalette.length];
    }
    // fallback hash simple
    const hash = [...niv].reduce((h, c) => h + c.charCodeAt(0), 0);
    return this.niveauPalette[hash % this.niveauPalette.length];
  }

  niveauStyle(niveau?: string) {
    const color = this.getNiveauColor(niveau);
    return {
      'background-color': color,
      color: '#fff',
      'border-radius': '8px',
      'font-weight': 600,
      padding: '6px 12px'
    };
  }

  rowStyle(niveau?: string) {
    const color = this.getNiveauColor(niveau);
    return {
      'border-left': `5px solid ${color}55`,
      'background': 'linear-gradient(90deg, rgba(0,0,0,0.02), #fff)'
    };
  }
}
