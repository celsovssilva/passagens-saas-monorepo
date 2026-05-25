import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private apiPassageiro = 'http://localhost:8080/api/passageiro';
  private apiEmpresa = 'http://localhost:8080/api/empresa';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(dadosLogin: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, dadosLogin).pipe(
      tap(response => {
        if (response) {
          this.salvarToken(response);
        }
      })
    );
  }

  cadastrarPassageiro(dadosPassageiro: any): Observable<any> {
    return this.http.post<any>(`${this.apiPassageiro}/cadastrar`, dadosPassageiro);
  }

  cadastrarEmpresa(dadosEmpresa: any): Observable<any> {
    return this.http.post<any>(`${this.apiEmpresa}/cadastrar`, dadosEmpresa);
  }

  salvarToken(response: any) {
    if (response && response.token) {
      localStorage.setItem('token', response.token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAutenticado(): boolean {
    const token = this.getToken();
    return !!token && token !== 'undefined' && token !== 'null';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
