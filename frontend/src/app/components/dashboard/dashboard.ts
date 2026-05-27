import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms'; // 👈 Importamos o FormsModule aqui
import { CommonModule } from '@angular/common';       // 👈 Importamos o CommonModule para ngIf, ngFor, ngClass, pipes

// 📦 ATENÇÃO: Importe o componente da Área do Passageiro aqui!
// Verifique se o caminho do arquivo e o nome da classe estão corretos conforme o seu projeto.
import { AreaPassageiroComponent } from '../area-passageiro/area-passageiro';

@Component({
  selector: 'app-dashboard',
  standalone: true, // 👈 Garante que ele está marcado como Standalone
  imports: [
    CommonModule,             // Resolve: *ngIf, *ngFor, [ngClass], date, number
    FormsModule,              // Resolve: #rotaForm="ngForm"
    AreaPassageiroComponent   // Resolve: <app-area-passageiro>
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  telaAtiva: string = 'inicio';
  listaViagens: any[] = [];

  usuarioLogado: any = {
    nome: 'Administrador',
    email: '',
    role: 'ADMIN'
  };

  dadosGlobais: any = {
    totalPassageiros: 0,
    totalEmpresas: 0,
    faturamentoHoje: 0.00
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user = localStorage.getItem('usuario');
    if (user) {
      this.usuarioLogado = JSON.parse(user);
    }

    this.carregarViagens();
    this.carregarDadosGlobais();
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

  carregarDadosGlobais() {
    this.http.get<any>('http://localhost:8080/api/dashboard/dados', this.obterHeaders()).subscribe({
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
    this.http.post('http://localhost:8080/api/viagem/cadastrar', dadosForm, this.obterHeaders()).subscribe({
      next: (res) => {
        console.log('Nova rota/viagem criada:', res);
        form.resetForm();
        this.definirTela('inicio');
        this.carregarViagens();
      },
      error: (err) => {
        console.error('Erro ao cadastrar rota:', err);
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
