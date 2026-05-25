import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { AdminService } from '../../service/admin.service';
import { AreaPassageiroComponent } from '../area-passageiro/area-passageiro';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AreaPassageiroComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  usuarioLogado = { email: '', nome: '', role: '' };
  telaAtiva: string = 'inicio';

  dadosGlobais = {
    totalPassageiros: 0,
    totalEmpresas: 0,
    faturamentoHoje: 0
  };

  constructor(
    public auth: AuthService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef // Injetado para forçar a atualização dos cards
  ) {}

  ngOnInit() {
    this.carregarDadosUsuario();

    // Se for ADMIN, busca as métricas com um pequeno delay seguro
    if (this.usuarioLogado.role === 'ADMIN') {
      setTimeout(() => {
        this.carregarMetricasBanco();
      }, 100);
    }
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
  }

  carregarDadosUsuario() {
    const token = this.auth.getToken();
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const jsonPayload = decodeURIComponent(window.atob(base64Url.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        this.usuarioLogado.email = payload.sub || '';
        this.usuarioLogado.nome = payload.nome || 'Administrador';
        this.usuarioLogado.role = payload.role || '';
      } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
      }
    }
  }

  carregarMetricasBanco() {
    this.adminService.getEstatisticasGlobais().subscribe({
      next: (dados) => {
        if (dados) {
          this.dadosGlobais.totalPassageiros = dados.totalPassageiros;
          this.dadosGlobais.totalEmpresas = dados.totalEmpresas;
          this.dadosGlobais.faturamentoHoje = dados.faturamentoHoje;

          // Força o Angular a renderizar os novos valores na tela imediatamente
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Não foi possível carregar os dados globais:', err);
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
