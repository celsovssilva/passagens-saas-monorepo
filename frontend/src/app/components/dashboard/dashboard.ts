import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AreaPassageiroComponent } from '../area-passageiro/area-passageiro';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AreaPassageiroComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  telaAtiva: string = 'inicio';
  listaViagens: any[] = [];

  listaRotasDisponiveis: any[] = [];
  listaTransportesDisponiveis: any[] = [];

  usuarioLogado: any = {
    nome: 'Usuário',
    email: 'Não identificado',
    role: 'PASSAGEIRO'
  };

  dadosGlobais: any = {
    totalPassageiros: 0,
    totalEmpresas: 0,
    faturamentoHoje: 0.00
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadDecodificado = this.decodificarTokenJwt(token);
        console.log('Dados extraídos do Token JWT com sucesso:', payloadDecodificado);

        this.usuarioLogado.email = payloadDecodificado.sub || payloadDecodificado.email || 'Não identificado';
        this.usuarioLogado.nome = payloadDecodificado.nome || this.usuarioLogado.email.split('@')[0];

        let roleExtraida = payloadDecodificado.role || payloadDecodificado.roles || payloadDecodificado.authorities || '';
        if (Array.isArray(roleExtraida) && roleExtraida.length > 0) {
          roleExtraida = roleExtraida[0];
        }

        if (typeof roleExtraida === 'string') {
          this.usuarioLogado.role = roleExtraida.replace('ROLE_', '').toUpperCase();
        }
      } catch (erro) {
        console.error('Erro ao decodificar informações de perfil do token:', erro);
      }
    }

    this.carregarViagens();
    this.carregarDadosGlobais();
    this.carregarRotasETransportes();
  }

  private decodificarTokenJwt(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
          window.atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
  }

  obterHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  carregarViagens() {
    this.http.get<any[]>('http://localhost:8080/api/viagem/listar-todas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaViagens = [...dados];
        console.log('Viagens reais carregadas para a tabela:', this.listaViagens);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar viagens dinâmicas:', err);
      }
    });
  }

  onPassagemComprada(sucesso: boolean) {
    if (sucesso) {
      console.log('Passagem confirmada! Atualizando listagem de vagas...');
      this.carregarViagens();
      this.carregarDadosGlobais();
    }
  }

  carregarRotasETransportes() {
    this.http.get<any[]>('http://localhost:8080/api/rotas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaRotasDisponiveis = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar rotas para o formulário:', err)
    });

    const idTransportePadrao = 1;
    this.http.get<any>(`http://localhost:8080/api/transport/buscar/${idTransportePadrao}`, this.obterHeaders()).subscribe({
      next: (dado) => {
        this.listaTransportesDisponiveis = Array.isArray(dado) ? dado : [dado];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(`Erro ao buscar transporte ID ${idTransportePadrao}:`, err)
    });
  }

  carregarDadosGlobais() {
    this.http.get<any>('http://localhost:8080/api/dashboard/estatisticas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.dadosGlobais = dados;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard:', err);
      }
    });
  }

  excluirViagem(idViagem: number) {
    if (confirm('Tem a certeza que deseja excluir esta viagem operacional?')) {
      this.http.delete(`http://localhost:8080/api/viagem/deletar/${idViagem}`, this.obterHeaders()).subscribe({
        next: () => {
          console.log('Viagem apagada com sucesso da base de dados!');
          this.carregarViagens();
        },
        error: (err) => {
          console.error('Erro ao apagar viagem:', err);
        }
      });
    }
  }

  salvarNovaRota(dadosForm: any, form: NgForm) {
    const rId = parseInt(dadosForm.rotaId, 10);
    const tId = parseInt(dadosForm.transportId, 10);

    const viagemRequestPayload = {
      id: null,
      rotaId: isNaN(rId) ? null : rId,
      transportId: isNaN(tId) ? 1 : tId,
      dataSaida: dadosForm.dataSaida,
      userId: null,
      capacidade: dadosForm.capacidade ? Number(dadosForm.capacidade) : 42,
      vagasDisponiveis: dadosForm.capacidade ? Number(dadosForm.capacidade) : 42,
      cpf: dadosForm.cpf || null,
      nomePassageiro: dadosForm.nomePassageiro || null
    };

    console.log('Enviando ViagemRequest limpo para o back-end:', viagemRequestPayload);

    this.http.post('http://localhost:8080/api/viagem/cadastrar', viagemRequestPayload, this.obterHeaders()).subscribe({
      next: (res) => {
        console.log('Nova viagem criada com relacionamentos!', res);
        form.resetForm();
        this.definirTela('inicio');
        this.carregarViagens();
      },
      error: (err) => {
        console.error('Erro ao cadastrar rota com base no ViagemRequest:', err);
        alert('Erro ao salvar viagem. Verifique as chaves relacionais no banco.');
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
