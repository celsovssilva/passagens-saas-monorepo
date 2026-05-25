import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ViagemResponse {
  id: number;
  origem: string;
  destino: string;
  data: string;
  preco: number;
  assentosDisponiveis: number;
  empresaNome?: string;
}

export interface CompraRequest {
  userId: number;
  viagemId: number;
  quantidadeAssentos: number;
}

export interface CompraResponse {
  id: number;
  viagem: ViagemResponse;
  quantidadeAssentos: number;
  valorTotal: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViagemCompraService {
  private apiViagem = 'http://localhost:8080/api/viagem';
  private apiCompra = 'http://localhost:8080/api/compra';

  constructor(private http: HttpClient) {}

  pesquisarViagens(origem: string, destino: string, data: string): Observable<ViagemResponse[]> {
    let params = new HttpParams()
      .set('origem', origin)
      .set('destino', destino)
      .set('data', data);

    return this.http.get<ViagemResponse[]>(`${this.apiViagem}/pesquisar`, { params });
  }

  comprarPassagem(request: CompraRequest): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(`${this.apiCompra}/comprar`, request);
  }

  confirmarPagamento(idCompra: number): Observable<CompraResponse> {
    return this.http.put<CompraResponse>(`${this.apiCompra}/atualizar/${idCompra}`, {});
  }

  cancelarCompra(compraId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiCompra}/${compraId}/cancelar`, {});
  }

  obterHistorico(userId: number): Observable<CompraResponse[]> {
    return this.http.get<CompraResponse[]>(`${this.apiCompra}/historico/${userId}`);
  }
}
