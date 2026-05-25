import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // 👈 Permite usar <app-area-passageiro> sem quebrar o build
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
}) // 👈 Corrigido: Agora o decorator está devidamente fechado!
export class DashboardComponent implements OnInit {
  telaAtiva: string = 'inicio';
  listaViagens: any[] = [];

  usuarioLogado = {
    nome: 'Administrador',
    email: 'admin@admin.com',
    role: 'ADMIN'
  };

  dadosGlobais = {
    totalPassageiros: 0,
    totalEmpresas: 0,
    faturamentoHoje: 0
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarMetricasBanco();
    this.carregarViagensAtivas();
  }

  private obterHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  carregarMetricasBanco() {
    this.http.get<any>('http://localhost:8080/api/dashboard/estatisticas', this.obterHeaders()).subscribe({
      next: (dados) => {
        // Log para você ver no console do navegador se o JSON realmente entrou aqui
        console.log('Dados do dashboard recebidos:', dados);

        if (dados) {
          // Garante a atribuição exata das chaves vinda do Java
          this.dadosGlobais.totalPassageiros = Number(dados.totalPassageiros) || 0;
          this.dadosGlobais.totalEmpresas = Number(dados.totalEmpresas) || 0;
          this.dadosGlobais.faturamentoHoje = Number(dados.faturamentoHoje) || 0;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados globais do dashboard:', err);
      }
    });
  }

  carregarViagensAtivas() {
    this.http.get<any[]>('http://localhost:8080/api/viagem/pesquisar?origem=&destino=&data=', this.obterHeaders()).subscribe({
      next: (viagens) => {
        this.listaViagens = viagens || [];
      },
      error: (err) => {
        console.error('Erro ao listar viagens no painel:', err);
      }
    });
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
  }

  excluirViagem(idViagem: number) {
    if (confirm('Deseja realmente excluir esta viagem?')) {
      this.http.post<void>(`http://localhost:8080/api/viagem/deletar/${idViagem}`, {}, this.obterHeaders()).subscribe({
        next: () => {
          alert('Viagem deletada com sucesso!');
          this.carregarViagensAtivas();
        },
        error: (err) => console.error('Erro ao deletar viagem:', err)
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
