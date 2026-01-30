import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuComponent } from '../../components/menu/menu.component';
import * as XLSX from 'xlsx';
import {AdministrationService} from '../../../api-client/api/administration.service';
import {AdministrationTempo} from '../../../api-client/model/administrationTempo';

@Component({
  selector: 'app-importer-fichier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MenuComponent],
  templateUrl: './importer-fichier.html',
  styleUrls: ['./importer-fichier.scss']
})
export class ImporterFichierComponent implements OnInit{
  fileName: string = '';
  selectedFile: File | null = null;
  allowedFileTypes = ['.csv', '.xlsx', '.xls', '.txt'];
  showTraitement = false;
  tableSource: 'FILE' | 'BACK' = 'FILE';
  totalLignes = 0;
  columns = [
    { label: 'Matri_Elev', key: 'matriElev' },
    { label: 'nomPrenoms', key: 'nomPrenoms' },
    { label: 'Groupe', key: 'groupe' },
    { label: 'CodeUE', key: 'codeUE' },
    { label: 'ecue1', key: 'ecue1' },
    { label: 'ecue2', key: 'ecue2' },
    { label: 'Dte_Deliber', key: 'dteDeliber' },
    { label: 'Moyenne CC', key: 'moyenneCC' },
    { label: 'Moyenne Exam', key: 'moyenneExam' },
    { label: 'Moyenne Gle', key: 'moyenneGle' },
    { label: 'decision', key: 'decision' },
    { label: 'Annee', key: 'annee' },
    { label: 'date_operation', key: 'dateOperation' },
    { label: 'creditUE', key: 'creditUE' },
    { label: 'classActu', key: 'classActu' },
    { label: 'classExam', key: 'classExam' },
    { label: 'Etat', key: 'traitement' }
  ];
  data: any[] = [];
  filteredData: any[] = [];
  paginatedData: any[] = [];
  filters: any = {};
  page = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private administrationService: AdministrationService) {}

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedFileTypes.includes(extension)) {
      alert('Type de fichier non supporté');
      this.resetForm();
      return;
    }
    this.selectedFile = file;
    this.fileName = file.name;
    this.showTraitement = false;
    this.tableSource = 'FILE';
    this.lireFichier(file);
  }

  lireFichier(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let workbook;
      try {
        workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      } catch {
        const ws = XLSX.utils.aoa_to_sheet(
          e.target.result.split(/\r\n|\n/).map((l: string) => l.split(','))
        );
        workbook = { Sheets: { Sheet1: ws }, SheetNames: ['Sheet1'] };
      }
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
      this.data = json.map(row => {
        const obj: any = {};
        this.columns.forEach(col => {
          obj[col.key] = row[col.label] ?? '';
        });
        return obj;
      });
      this.refreshTable();
    };
    file.name.endsWith('.csv') || file.name.endsWith('.txt')
      ? reader.readAsText(file)
      : reader.readAsArrayBuffer(file);
  }

  importerFichier(): void {
    if (!this.selectedFile) return;
    this.administrationService.importExcel(this.selectedFile).subscribe({
      next: () => {
        alert('Import effectué avec succès');
        this.tableSource = 'BACK';
        this.listerAdministrationTempo();
        this.showTraitement = true;
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l’import');
      }
    });
  }

  listerAdministrationTempo(): void {
    this.administrationService.getListe().subscribe({
      next: (list: AdministrationTempo[]) => {
        this.data = list;
        this.refreshTable();
      },
      error: () => alert('Erreur chargement des données')
    });
  }

  traiterDonnees(): void {
    this.administrationService.traiter().subscribe({
      next: () => {
        alert('Traitement terminé');
        this.listerAdministrationTempo();
      },
      error: () => alert('Erreur traitement')
    });
  }

  filtrerTableau(): void {
    this.filteredData = this.data.filter(row =>
      this.columns.every(col =>
        !this.filters[col.key] ||
        row[col.key]?.toString().toLowerCase().includes(
          this.filters[col.key].toLowerCase()
        )
      )
    );
    this.page = 1;
    this.updatePagination();
  }

  refreshTable(): void {
    this.filteredData = [...this.data];
    this.totalLignes = this.data.length;
    this.page = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const start = (this.page - 1) * this.pageSize;
    this.paginatedData = this.filteredData.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.updatePagination();
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size);
    this.page = 1;
    this.updatePagination();
  }

  annulerImport(): void {
    if (confirm('Annuler l’import ?')) this.resetForm();
  }

  resetForm(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.data = [];
    this.filteredData = [];
    this.paginatedData = [];
    this.filters = {};
    this.totalLignes = 0;
    this.showTraitement = false;
    this.tableSource = 'FILE';
  }

  formatCell(value: any, label: string): any {
    const numericLabels = ['Moyenne CC', 'Moyenne Exam', 'Moyenne Gle'];

    if (numericLabels.includes(label) && value !== null && value !== undefined) {
      return Number(value).toFixed(2);
    }
    return value ?? '';
  }
}
