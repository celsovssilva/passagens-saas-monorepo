import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ViagemResponse {
  id: number;
  origem: string;
  destino: string;
  data: string;
  preco: number;
  assentosDisponiveis: number;
}

export interface PassageiroResponse {
  id: number;
  nome: string;
  phone: string;
  email: string;
  idade: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiPassageiro = 'http://localhost:8080/api/passageiro';
  private apiViagem = 'http://localhost:8080/api/viagem';
  private apiAdminDashboard = 'http://localhost:8080/api/dashboard/estatisticas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private obterHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getEstatisticasGlobais(): Observable<any> {
    return this.http.get<any>(this.apiAdminDashboard, this.obterHeaders());
  }

  buscarPassageiroPorId(idPassageiro: number): Observable<PassageiroResponse> {
    return this.http.get<PassageiroResponse>(`${this.apiPassageiro}/buscar/${idPassageiro}`, this.obterHeaders());
  }

  deletarPassageiro(idPassageiro: number): Observable<void> {
    return this.http.delete<void>(`${this.apiPassageiro}/deletar/${idPassageiro}`, this.obterHeaders());
  }

  buscarViagemPorId(id: number): Observable<ViagemResponse> {
    return this.http.get<ViagemResponse>(`${this.apiViagem}/buscar/${id}`, this.obterHeaders());
  }

  pesquisarViagens(origem: string, destino: string, data: string): Observable<ViagemResponse[]> {
    return this.http.get<ViagemResponse[]>(
      `${this.apiViagem}/pesquisar?origem=${origem}&destino=${destino}&data=${data}`,
      this.obterHeaders()
    );
  }

  listarPassageirosDaViagem(viagemId: number): Observable<PassageiroResponse[]> {
    return this.http.get<PassageiroResponse[]>(`${this.apiViagem}/listar-passageiros/${viagemId}`, this.obterHeaders());
  }

  deletarViagem(idViagem: number): Observable<void> {
    return this.http.post<void>(`${this.apiViagem}/deletar/${idViagem}`, {}, this.obterHeaders());
  }
}
