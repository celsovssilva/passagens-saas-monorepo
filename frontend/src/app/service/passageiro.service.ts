import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PassageiroResponse {
  nome: string;
  phone: string;
  email: string;
  idade: number;
}

export interface PassageiroRequest {
  nome: string;
  sobrenome?: string;
  phone: string;
  email: string;
  cpf: string;
  idade: number;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PassageiroService {
  private apiUrl = 'http://localhost:8080/api/passageiro';

  constructor(private http: HttpClient) {}

  // Busca o perfil usando o email do subject
  buscarPorEmail(email: string): Observable<PassageiroResponse> {
    // Caso crie o endpoint por email no Java, a rota muda.
    // Se mantiver por ID, precisaremos que o login retorne o ID para salvar no localStorage.
    return this.http.get<PassageiroResponse>(`${this.apiUrl}/buscar/perfil?email=${email}`);
  }

  atualizarPassageiro(idPassageiro: number, passageiro: PassageiroRequest): Observable<PassageiroResponse> {
    return this.http.put<PassageiroResponse>(`${this.apiUrl}/atualizar/${idPassageiro}`, passageiro);
  }
}
