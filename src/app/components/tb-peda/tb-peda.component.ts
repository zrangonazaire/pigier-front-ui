import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnneeScolaireControllerService, AnneeScolaireDto, ElevesService } from '../../../api-client';

@Component({
  selector: 'app-tb-peda',
  imports: [MenuComponent,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './tb-peda.component.html',
  styleUrl: './tb-peda.component.scss'
})
export class TbPedaComponent implements OnInit {
@ViewChild('levelChart') levelChartRef: any;
  @ViewChild('typeChart') typeChartRef: any;
  @ViewChild('pathChart') pathChartRef: any;

  totalStudents = 0;
  activeClasses = 0;
  activePaths = 12;
  selectedLevel = 'all';
  anneeScolaires=signal<AnneeScolaireDto[]>([]);
  anneeScolaireService=inject(AnneeScolaireControllerService);
  eleveService=inject(ElevesService);
  bonneAnnee: string = '';


  levels = [
    { id: 'L1', name: 'Licence 1' },
    { id: 'L2', name: 'Licence 2' },
    { id: 'L3', name: 'Licence 3' },
    { id: 'M1', name: 'Master 1' },
    { id: 'M2', name: 'Master 2' }
  ];

  academicYears = [
    { year: '2023-2024', licence1: 8, licence2: 7, licence3: 6, master1: 5, master2: 4, total: 30, rate: 100 },
    { year: '2022-2023', licence1: 7, licence2: 6, licence3: 5, master1: 4, master2: 4, total: 26, rate: 87 },
    { year: '2021-2022', licence1: 6, licence2: 5, licence3: 5, master1: 4, master2: 3, total: 23, rate: 77 },
    { year: '2020-2021', licence1: 5, licence2: 4, licence3: 4, master1: 3, master2: 2, total: 18, rate: 60 }
  ];

  pathDetails = [
    { 
      name: 'LPRGL1', 
      licence1: 120, licence2: 110, licence3: 95, 
      master1: 80, master2: 75, 
      total: 480 
    },
    { 
      name: 'LPRGL2', 
      licence1: 95, licence2: 90, licence3: 85, 
      master1: 70, master2: 65, 
      total: 405 
    },
    { 
      name: 'LPRGL3', 
      licence1: 110, licence2: 105, licence3: 100, 
      master1: 85, master2: 80, 
      total: 480 
    },
    { 
      name: 'LPRGL4', 
      licence1: 85, licence2: 80, licence3: 75, 
      master1: 60, master2: 55, 
      total: 355 
    }
  ];

  get totals() {
    return {
      licence1: this.pathDetails.reduce((sum, p) => sum + p.licence1, 0),
      licence2: this.pathDetails.reduce((sum, p) => sum + p.licence2, 0),
      licence3: this.pathDetails.reduce((sum, p) => sum + p.licence3, 0),
      master1: this.pathDetails.reduce((sum, p) => sum + p.master1, 0),
      master2: this.pathDetails.reduce((sum, p) => sum + p.master2, 0),
      general: this.pathDetails.reduce((sum, p) => sum + p.total, 0)
    };
  }

  levelData = {
    labels: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'],
    datasets: [{
      label: 'Effectifs',
      data: [410, 385, 355, 295, 275],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 99, 132, 0.7)'
      ],
      borderColor: [
        'rgb(54, 162, 235)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(255, 99, 132)'
      ],
      borderWidth: 1
    }]
  };

  typeData = {
    labels: ['Licence', 'Master'],
    datasets: [{
      data: [1150, 700],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)'
      ],
      hoverOffset: 4
    }]
  };

  pathData = {
    labels: ['LPRGL1', 'LPRGL2', 'LPRGL3', 'LPRGL4'],
    datasets: [{
      label: 'Effectifs totaux',
      data: [480, 405, 480, 355],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1
    }]
  };

  levelChart: any;
  typeChart: any;
  pathChart: any;
selectAnnee=''
  constructor() { }
  ngOnInit(): void {
     Chart.register(...registerables); 
     this.anneeScolaireService.getListeAnneesScolaires().subscribe({
      next: (response: any) =>{
        this.selectAnnee=response[0].annee_Sco!;
        this.anneeScolaires.set(response);
      },
      error: (error: any) => {
        console.error('Error fetching academic years:', error);
      },complete: () => {
        console.log('Liste des années scolaires:', this.anneeScolaires());
        this.totalEleves(this.anneeScolaires()[0].annee_Sco!);
        this.totalActiveClasses(this.anneeScolaires()[0].annee_Sco!);
      }
    });
   
  }
totalEleves(annee:any): void {
  this.bonneAnnee=annee.replace('/', '-'); 
  this.eleveService.effectifEleveParAnneeScolaire(this.bonneAnnee).subscribe({
      next: (response: any) => {
        this.totalStudents = response;
        console.log('Total students for year', annee, ':', this.totalStudents);
      },
      error: (error: any) => {
        console.error('Error fetching total students:', error);
      }
    });
}
totalActiveClasses(annee:any): void {
  this.bonneAnnee=annee.replace('/', '-');
  this.eleveService.totalClassActive(this.bonneAnnee).subscribe({
    next: (response: any) => {
      this.activeClasses = response;
      console.log('Total active classes:', this.activeClasses);
    },
    error: (error: any) => {
      console.error('Error fetching active classes:', error);
    }
  });
    }
/*   ngOnInit(): void {
    alert('Bienvenue dans l\'espace pédagogique');
     this.anneeScolaireService.getListeAnneesScolaires().subscribe({
      next: (response: any) =>{
        this.anneeScolaires.set(response);
        console.log('Liste des années scolaires:', this.anneeScolaires());
      },
      error: (error: any) => {
        console.error('Error fetching academic years:', error);
      }
    });
    Chart.register(...registerables);   
  } */

  ngAfterViewInit(): void {
    this.createLevelChart();
    this.createTypeChart();
    this.createPathChart();
  }

  createLevelChart(): void {
    this.levelChart = new Chart(this.levelChartRef.nativeElement, {
      type: 'bar',
      data: this.levelData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Nombre d'étudiants"
            }
          }
        }
      }
    });
  }

  createTypeChart(): void {
    this.typeChart = new Chart(this.typeChartRef.nativeElement, {
      type: 'doughnut',
      data: this.typeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.chart.data.datasets[0].data.reduce((a: any, b: any) => a + b, 0);
                const percentage = Math.round((10 / total) * 100);
                return `${label}: ${value} étudiants (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createPathChart(): void {
    this.pathChart = new Chart(this.pathChartRef.nativeElement, {
      type: 'bar',
      data: this.pathData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Nombre d'étudiants"
            }
          }
        }
      }
    });
  }

  updatePathChart(): void {
    if (this.selectedLevel === 'all') {
      this.pathData.datasets[0].data = [480, 405, 480, 355];
      this.pathData.datasets[0].label = 'Effectifs totaux';
    } else {
      const levelData: { [key: string]: number[] } = {
        'L1': [120, 95, 110, 85],
        'L2': [110, 90, 105, 80],
        'L3': [95, 85, 100, 75],
        'M1': [80, 70, 85, 60],
        'M2': [75, 65, 80, 55]
      };
      
      this.pathData.datasets[0].data = levelData[this.selectedLevel];
      this.pathData.datasets[0].label = `Effectifs en ${this.levels.find(l => l.id === this.selectedLevel)?.name}`;
    }
    
    this.pathChart.destroy();
    this.createPathChart();
  }
}
