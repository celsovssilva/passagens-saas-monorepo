import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
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
    private router: Router,
    private cdr: ChangeDetectorRef // 👈 Injetado o gerenciador de renderização
  ) {}

  ngOnInit(): void {
    this.carregarMetricasBanco();
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
      next: (dados: any) => {
        console.log('Dados do dashboard recebidos no TS:', dados);

        if (dados) {
          // Atualiza a referência criando um objeto totalmente novo
          this.dadosGlobais = {
            totalPassageiros: Number(dados.totalPassageiros) || 0,
            totalEmpresas: Number(dados.totalEmpresas) || 0,
            faturamentoHoje: Number(dados.faturamentoHoje) || 0
          };

          // 🔥 FORÇA O ANGULAR A RE-RENDERIZAR A TELA IMEDIATAMENTE
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados globais do dashboard:', err);
      }
    });
  }

  carregarViagensAtivas() {
    this.listaViagens = [];
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
  }

  excluirViagem(idViagem: number) {
    if (confirm('Deseja realmente excluir esta viagem?')) {
      this.http.post<any>(`http://localhost:8080/api/viagem/deletar/${idViagem}`, {}, this.obterHeaders()).subscribe({
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
