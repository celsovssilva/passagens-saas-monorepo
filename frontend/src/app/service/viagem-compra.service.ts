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
  id: number;
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

export interface PassageiroItemPayload {
  nome: string;
  cpf: string;
  numeroAssentos: number;
  quantidadeDeAssentos: number;
}

export interface CompraRequestPayload {
  usuarioId: number;
  viagemId: number;
  passageiro: PassageiroItemPayload[];
  metodo: string;
  numeroCartao?: string | null;
  cvv?: string | null;
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

  obterPassageiroPorId(idPassageiro: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/passageiro/buscar/${idPassageiro}`,
      this.obterHeaders()
    );
  }

  // ATUALIZADO: Aponta agora para a infraestrutura real de transações do seu CompraService
  comprarPassagem(compraRequestPayload: CompraRequestPayload): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/compra/comprar`,
      compraRequestPayload,
      this.obterHeaders()
    );
  }
  confirmarPagamento(idCompra: number): Observable<any> {
    return this.http.put<any>(
        `${this.baseUrl}/compra/atualizar/${idCompra}`,
        {}, // O body vai vazio porque o Java só espera a PathVariable
        this.obterHeaders()
    );
  }

  obterHistorico(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compra/historico/${userId}`, this.obterHeaders());
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
  cancelarCompra(compraId: number): Observable<any> {
    return this.http.patch<any>(
      `http://localhost:8080/api/compra/${compraId}/cancelar`,
      {},
      this.obterHeaders(),
    );
  }
}
