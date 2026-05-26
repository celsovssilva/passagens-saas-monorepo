import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Essencial para o funcionamento do formulário
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 FormsModule adicionado aqui para não quebrar o build
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Executa os dois carregamentos assim que a tela abre
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
      next: (dados: any) => {
        console.log('Dados do dashboard recebidos no TS:', dados);

        if (dados) {
          // Mantido exatamente a atribuição reativa que deu certo antes
          this.dadosGlobais = {
            totalPassageiros: Number(dados.totalPassageiros) || 0,
            totalEmpresas: Number(dados.totalEmpresas) || 0,
            faturamentoHoje: Number(dados.faturamentoHoje) || 0
          };

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados globais do dashboard:', err);
      }
    });
  }

  carregarViagensAtivas() {
    // Busca os dados do seu endpoint do Java que lista todas as rotas fixas
    this.http.get<any[]>('http://localhost:8080/api/rotas', this.obterHeaders()).subscribe({
      next: (dados) => {
        console.log('Rotas carregadas para a tabela:', dados);
        this.listaViagens = dados || [];
        this.cdr.detectChanges(); // Garante a renderização estável na tabela
      },
      error: (err) => {
        console.error('Erro ao listar rotas no painel:', err);
      }
    });
  }

  // 🔥 Nova função para cadastrar a Rota enviando para o RotasController do Java
  salvarNovaRota(dadosForm: any, formReference: any) {
    let horarioOriginal = dadosForm.horarioPadrao;
    if (horarioOriginal && horarioOriginal.split(':').length === 2) {
      horarioOriginal = `${horarioOriginal}:00`; // Formata para LocalTime (HH:mm:ss)
    }

    const payload = {
      origem: dadosForm.origem,
      ufOrigem: dadosForm.ufOrigem ? dadosForm.ufOrigem.toUpperCase() : '',
      destino: dadosForm.destino,
      ufDestino: dadosForm.ufDestino ? dadosForm.ufDestino.toUpperCase() : '',
      valorBase: Number(dadosForm.valorBase),
      horarioPadrao: horarioOriginal
    };

    this.http.post<any>('http://localhost:8080/api/rotas/cadastrar', payload, this.obterHeaders()).subscribe({
      next: () => {
        alert('Nova rota operacional cadastrada com sucesso!');
        formReference.reset();
        this.carregarViagensAtivas(); // Atualiza a tabela por baixo
        this.telaAtiva = 'inicio'; // Voltar para a tela inicial
      },
      error: (err) => {
        console.error('Erro ao cadastrar rota:', err);
        alert('Erro ao salvar nova rota. Verifique os dados fornecidos.');
      }
    });
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
  }

  excluirViagem(idViagem: number) {
    if (confirm('Deseja realmente excluir esta rota do sistema?')) {
      this.http.delete<any>(`http://localhost:8080/api/rotas/${idViagem}`, this.obterHeaders()).subscribe({
        next: () => {
          alert('Rota deletada com sucesso!');
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
