import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { MenuComponent } from '../../components/menu/menu.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-importer-fichier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MenuComponent],
  templateUrl: './importer-fichier.html',
  styleUrls: ['./importer-fichier.scss']
})
export class ImporterFichierComponent {
  fileName: string = '';
  selectedFile: File | null = null;
  allowedFileTypes = ['.csv', '.xlsx', '.xls', '.txt'];
  showTraitement: boolean = false;

  // Colonnes + nouvelle colonne Étape
  columns: string[] = [
    'Matri_Elev','nomPrenoms','Groupe','CodeUE','ecue1','ecue2',
    'Dte_Deliber','Moyenne CC','Moyenne Exam','Moyenne Gle','decision',
    'Annee','date_operation','creditUE','classActu','classExam','Etape'
  ];

  data: any[] = [];
  filteredData: any[] = [];
  filters: any = {};

  // Pagination
  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  paginatedData: any[] = [];

  // 1️⃣ Quand on choisit un fichier
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedFileTypes.includes(fileExtension)) {
      alert('Type de fichier non supporté. Utilisez: ' + this.allowedFileTypes.join(', '));
      this.resetForm();
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    this.showTraitement = false;

    // Lire le fichier et afficher son contenu dans le tableau
    this.lireFichier(file);
  }

  // 2️⃣ Lire le fichier Excel/CSV
  lireFichier(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      let workbook;
      try {
        const data = new Uint8Array(e.target.result);
        workbook = XLSX.read(data, { type: 'array' });
      } catch {
        // Si CSV, on le lit comme texte
        const csvData = e.target.result;
        const ws = XLSX.utils.aoa_to_sheet(
          csvData.split(/\r\n|\n/).map((line: string) => line.split(',')) // séparer par virgule
        );
        workbook = { Sheets: { Sheet1: ws }, SheetNames: ['Sheet1'] };
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      let jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      // Ajouter la colonne "Etape" vide
      this.data = jsonData.map(row => {
        const filteredRow: any = {};
        this.columns.forEach(col => {
          filteredRow[col] = col === 'Etape' ? '' : (row[col] !== undefined ? row[col] : '');
        });
        return filteredRow;
      });

      this.filteredData = [...this.data];
      this.updatePagination();
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  // 3️⃣ Bouton Importer → active le bouton Traitement
  importerFichier(): void {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }
    alert(`Fichier "${this.selectedFile.name}" importé avec succès !`);
    this.showTraitement = true;
  }

  // 4️⃣ Annuler
  annulerImport(): void {
    if (confirm('Voulez-vous vraiment annuler l\'importation ?')) {
      this.resetForm();
    }
  }

  // 5️⃣ Réinitialiser
  resetForm(): void {
    this.selectedFile = null;
    this.fileName = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.data = [];
    this.filteredData = [];
    this.filters = {};
    this.showTraitement = false;
    this.page = 1;
    this.paginatedData = [];
  }

  // 6️⃣ Filtrer le tableau
  filtrerTableau() {
    this.filteredData = this.data.filter(row => {
      return this.columns.every(col => {
        if (!this.filters[col]) return true;
        return row[col].toString().toLowerCase().includes(this.filters[col].toLowerCase());
      });
    });
    this.page = 1;
    this.updatePagination();
  }

  // 7️⃣ Pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.updatePagination();
  }

  changePageSize(newSize: number) {
    this.pageSize = Number(newSize);
    this.page = 1;
    this.updatePagination();
  }

  // 8️⃣ Traitement des données
  traiterDonnees() {
    alert('Traitement des données lancé !');
    console.log('Données à traiter:', this.filteredData);
  }
}
