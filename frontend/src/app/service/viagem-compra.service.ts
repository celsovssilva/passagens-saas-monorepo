import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Espelha exatamente o Record ViagemResponse do Java
export interface ViagemResponse {
  id: number;
  origem: string;
  destino: string;
  ufOrigem: string;
  ufDestino: string;
  transporteModelo: string;
  dataSaida: string; // LocalDateTime vira string no JSON
  valor: number;
  vagasDisponiveis: number;
}

// Espelha exatamente o Record PassageiroResponse do Java
export interface PassageiroResponse {
  nome: string;
  phone: string;
  email: string;
  idade: number;
}

// Espelha exatamente o Record PassagemResponse do Java
export interface PassagemResponse {
  nomePassageiro: string;
  email: string;
  documento: string; // Mapeado do CPF no backend
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

  // Vinculado a: GET api/viagem/pesquisar
  pesquisarViagens(origem: string, destino: string, data: string): Observable<ViagemResponse[]> {
    return this.http.get<ViagemResponse[]>(`${this.baseUrl}/viagem/pesquisar?origem=${origem}&destino=${destino}&data=${data}`);
  }

  // Vinculado a: POST api/viagem/agendar
  comprarPassagem(request: { id: number; userId: number; cpf: string; nomePassageiro: string; capacidade: number }): Observable<ViagemResponse> {
    return this.http.post<ViagemResponse>(`${this.baseUrl}/viagem/agendar`, request);
  }

  // Vinculado a: GET api/compra/historico/{userId} -> Mapeado para retornar a lista de passagens do usuário
  obterHistorico(userId: number): Observable<PassagemResponse[]> {
    return this.http.get<PassagemResponse[]>(`${this.baseUrl}/compra/historico/${userId}`);
  }

  // Vinculado a: GET api/passageiro/buscar/{idPassaeiro}
  buscarPassageiroPorId(idPassagerio: number): Observable<PassageiroResponse> {
    return this.http.get<PassageiroResponse>(`${this.baseUrl}/passageiro/buscar/${idPassagerio}`);
  }

  // Vinculado a: PUT api/passageiro/atualizar/{idPassageiro}
  atualizarPassageiro(idPassagerio: number, dados: any): Observable<PassageiroResponse> {
    return this.http.put<PassageiroResponse>(`${this.baseUrl}/passageiro/atualizar/${idPassagerio}`, dados);
  }

  // Vinculado a: DELETE api/passageiro/deletar/{idPassageiro}
  deletarPassageiro(idPassagerio: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/passageiro/deletar/${idPassagerio}`);
  }

  // Vinculado a: GET api/empresa/listar-todas
  obterTodasEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/empresa/listar-todas`);
  }

  // Vinculado a: GET api/rotas
  obterRotasGerais(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rotas`);
  }
}
