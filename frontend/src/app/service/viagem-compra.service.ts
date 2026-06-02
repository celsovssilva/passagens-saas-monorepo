import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ViagemResponse {
  id: number;
  origem: string;
  destino: string;
  ufOrigem: string;
  ufDestino: string;
  transporteModelo: string;
  dataSaida: string;
  valor: number;
  vagasDisponiveis: number;
}

export interface PassageiroResponse {
  nome: string;
  phone: string;
  email: string;
  idade: number;
}

export interface PassagemResponse {
  nomePassageiro: string;
  email: string;
  documento: string;
  origem: string;
  destino: string;
  quantidadeDeAssentos: number;
  dataHoraDaCompra: string;
  numeroAssentos: number;
}

@Injectable({
  providedIn: 'root'
})
export class ViagemCompraService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private obterHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  pesquisarViagens(origem: string, destino: string, data: string): Observable<ViagemResponse[]> {
    return this.http.get<ViagemResponse[]>(
      `${this.baseUrl}/viagem/pesquisar?origem=${origem}&destino=${destino}&data=${data}`,
      this.obterHeaders()
    );
  }

  comprarPassagem(request: { id: number; userId: number; cpf: string; nomePassageiro: string; capacidade: number }): Observable<ViagemResponse> {
    return this.http.post<ViagemResponse>(`${this.baseUrl}/viagem/agendar`, request, this.obterHeaders());
  }

  obterHistorico(userId: number): Observable<PassagemResponse[]> {
    return this.http.get<PassagemResponse[]>(`${this.baseUrl}/compra/historico/${userId}`, this.obterHeaders());
  }

  // 🔴 ATENÇÃO: Mudou para o endpoint dinâmico que criamos no Spring Boot!
  buscarPerfilLogado(): Observable<PassageiroResponse> {
    return this.http.get<PassageiroResponse>(`${this.baseUrl}/passageiro/meu-perfil`, this.obterHeaders());
  }

  atualizarPassageiro(idPassageiro: number, dados: any): Observable<PassageiroResponse> {
    return this.http.put<PassageiroResponse>(`${this.baseUrl}/passageiro/atualizar/${idPassageiro}`, dados, this.obterHeaders());
  }

  deletarPassageiro(idPassageiro: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/passageiro/deletar/${idPassageiro}`, this.obterHeaders());
  }

  obterTodasEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/empresa/listar-todas`, this.obterHeaders());
  }

  obterRotasGerais(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rotas`, this.obterHeaders());
  }

  listarTodasAsViagens(): Observable<ViagemResponse[]> {
    return this.http.get<ViagemResponse[]>(`${this.baseUrl}/viagem/listar-todas`, this.obterHeaders());
  }
}
