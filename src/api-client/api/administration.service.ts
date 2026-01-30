import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AdministrationTempo} from '../model/administrationTempo';

@Injectable({ providedIn: 'root' })
export class AdministrationService {

  private readonly baseUrl = 'http://localhost:8084/api/v1/administration';

  constructor(private http: HttpClient) {}

  importExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/import`,
      formData,
      { responseType: 'text' }
    );
  }

  getListe(): Observable<AdministrationTempo[]> {
    return this.http.get<AdministrationTempo[]>(`${this.baseUrl}/list`);
  }

  traiter(): Observable<any> {
    return this.http.post(`${this.baseUrl}/traiter`, {},
      { responseType: 'text' });
  }
}

