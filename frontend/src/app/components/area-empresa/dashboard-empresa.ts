import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-empresa.html',
  styleUrls: ['./dashboard-empresa.css']
})
export class DashboardEmpresaComponent implements OnInit {
  // Controle de Telas do Painel
  telaAtiva: string = 'inicio';

  // Sessão e Identificação
  usuarioLogado: any = { email: '', role: '', empresaId: null };
  dadosEmpresa: any = { id: null, razaoSocial: '', cnpj: '', telefone: '', endereco: '' };

  // Coleções de Dados (Apenas a Frota agora)
  listaMinhaFrota: any[] = [];

  // Indicadores Exigidos
  passagensCompradas: number = 0; // Fixo em 0 ou vindo de outro local futuramente
  onibusEmAtividade: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.recuperarSessaoUsuario();
  }

  // --- CONTROLE DE SESSÃO E SEGURANÇA ---
  recuperarSessaoUsuario() {
    const token = localStorage.getItem('token');
    const papel = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const empresaIdStr = localStorage.getItem('empresaId');

    if (!token || papel !== 'EMPRESA') {
      this.logout();
      return;
    }

    this.usuarioLogado = {
      email: email || '',
      role: papel,
      empresaId: empresaIdStr ? parseInt(empresaIdStr, 10) : null
    };

    // Inicializa apenas o que importa
    this.carregarDadosPerfilEmpresa();
    this.carregarFrota();
  }

  obterHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
    if (tela === 'inicio' || tela === 'frota') {
      this.carregarFrota();
    } else if (tela === 'perfil') {
      this.carregarDadosPerfilEmpresa();
    }
    if (this.cdr) this.cdr.detectChanges();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  carregarDadosPerfilEmpresa() {
    if (!this.usuarioLogado.empresaId) return;

    this.http.get(`http://localhost:8080/api/empresa/${this.usuarioLogado.empresaId}`, this.obterHeaders()).subscribe({
      next: (dados: any) => {
        if (dados) {
          this.dadosEmpresa = dados;
          if (this.cdr) this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Erro ao ler dados cadastrais da empresa:', err)
    });
  }

  // >>> ADICIONE ESTE BLOCO AQUI <<<
  atualizarPerfil(form: any) {
    if (form.invalid || !this.usuarioLogado.empresaId) return;

    this.http.put(`http://localhost:8080/api/empresa/${this.usuarioLogado.empresaId}`, this.dadosEmpresa, this.obterHeaders()).subscribe({
      next: (resposta: any) => {
        alert('Informações cadastrais salvas e atualizadas com sucesso!');
        this.carregarDadosPerfilEmpresa();
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil empresarial:', err);
        alert('Erro ao processar atualização.');
      }
    });
  }
  // --- OPERAÇÕES DA API: FROTA ---
  carregarFrota() {
    if (!this.usuarioLogado.empresaId) return;

    this.http.get<any[]>(`http://localhost:8080/api/transport/buscar-por-empresa/${this.usuarioLogado.empresaId}`, this.obterHeaders()).subscribe({
      next: (veiculos) => {
        this.listaMinhaFrota = Array.isArray(veiculos) ? veiculos : [];

        // Atualiza dinamicamente a quantidade de ônibus ativos na tela
        this.onibusEmAtividade = this.listaMinhaFrota.filter(v => v && v.status === 'ATIVO').length;

        // Mantém fixo conforme solicitado já que a rota de viagens foi removida
        this.passagensCompradas = 0;

        if (this.cdr) this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao listar frota dedicada:', err);
        this.listaMinhaFrota = [];
        this.onibusEmAtividade = 0;
        if (this.cdr) this.cdr.detectChanges();
      }
    });
  }

  salvarVeiculo(dadosForm: any, formRef: any) {
    if (!this.usuarioLogado.empresaId) return;

    const payloadVeiculo = {
      modelo: dadosForm.modelo,
      capacidade: dadosForm.capacidade,
      status: dadosForm.status || 'ATIVO',
      empresa: { id: this.usuarioLogado.empresaId }
    };

    this.http.post('http://localhost:8080/api/transport', payloadVeiculo, this.obterHeaders()).subscribe({
      next: () => {
        alert('Veículo inserido e homologado na sua frota ativa!');
        formRef.resetForm({ status: 'ATIVO' });
        this.carregarFrota();
      },
      error: (err) => console.error('Falha ao registrar novo veículo corporativo:', err)
    });
  }

  deletarTransporte(id: number) {
    if (!confirm('Deseja definitivamente remover este veículo da sua frota operacional?')) return;

    this.http.delete(`http://localhost:8080/api/transport/${id}`, this.obterHeaders()).subscribe({
      next: () => {
        alert('Veículo desvinculado com sucesso.');
        this.carregarFrota();
      },
      error: (err) => console.error('Erro ao excluir veículo:', err)
    });
  }
}
