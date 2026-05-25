import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);

          // Trata o role dinamicamente caso ele venha direto ou dentro de um array
          const userRole = response.role || response.roles || 'PASSAGEIRO';
          localStorage.setItem('role', String(userRole).toUpperCase());

          // Redireciona direto para o Dashboard após salvar os dados
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  // Métodos de cadastro que estavam faltando
  cadastrarPassageiro(dados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cadastro/passageiro`, dados);
  }

  cadastrarEmpresa(dados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cadastro/empresa`, dados);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // Validações rápidas de perfil usadas no HTML via *ngIf
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isEmpresa(): boolean {
    return this.getRole() === 'EMPRESA' || this.isAdmin();
  }

  isPassageiro(): boolean {
    return this.getRole() === 'PASSAGEIRO' || this.isAdmin();
  }
}
