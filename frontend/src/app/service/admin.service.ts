import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Ajuste o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Busca os dados reais do DashboardController do Spring Boot
  getEstatisticasGlobais(): Observable<any> {
    return this.http.get<any>(`${`${this.apiUrl}/dashboard/estatisticas`}`, this.getHeaders());
  }
}
