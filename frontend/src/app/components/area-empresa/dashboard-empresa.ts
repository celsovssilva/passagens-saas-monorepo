import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-empresa.html',
  styleUrls: ['./dashboard-empresa.css'],
})
export class DashboardEmpresaComponent implements OnInit {
  // Controle de Telas do Painel
  telaAtiva: string = 'inicio';

  // Sessão e Identificação
  usuarioLogado: any = { id: null, email: '', role: 'EMPRESA', empresaId: null };
  dadosEmpresa: any = { id: null, razaoSocial: '', cnpj: '', telefone: '', endereco: '' };

  // Coleções de Dados
  listaMinhaFrota: any[] = [];
  listaRotas: any[] = [];
  listaMinhasViagens: any[] = [];

  // Indicadores Numéricos Atuais
  totalPassageirosAtendidos: number = 0;
  totalVeiculosAtivos: number = 0;
  receitaOperacional: number = 0;

  // --- GETTERS (PROPRIEDADES FANTASMAS) ---
  // Vincula o que as versões antigas do HTML pedem às variáveis reais do commit de sucesso
  get passagensCompradas(): number {
    return this.totalPassageirosAtendidos;
  }

  get onibusEmAtividade(): number {
    return this.totalVeiculosAtivos;
  }

  // Fallbacks de propriedades para binds antigos do dropdown
  idRotaSelecionada: string = '';
  idTransporteSelecionado: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.recuperarSessaoUsuario();
  }

  // --- CONTROLE DE SESSÃO E SEGURANÇA ---
  recuperarSessaoUsuario() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return;
    }

    try {
      const parts = token.split('.');
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      this.usuarioLogado.id = payload.id || payload.userId;
      this.usuarioLogado.email = payload.sub || payload.email || payload.username;

      const rawEmpresaId =
        payload.empresaId || payload.empresa_id || payload.empresa || payload.idEmpresa;
      this.usuarioLogado.empresaId = rawEmpresaId ? Number(rawEmpresaId) : null;

      if (this.usuarioLogado.empresaId) {
        localStorage.setItem('empresaId', this.usuarioLogado.empresaId.toString());
      } else {
        const backupId = localStorage.getItem('empresaId');
        if (backupId) this.usuarioLogado.empresaId = Number(backupId);
      }
    } catch (e) {
      console.error('Erro ao decodificar token JWT da empresa:', e);
    }

    this.carregarDadosPerfilEmpresa();
    this.carregarFrota();
    this.carregarOperacoes();
  }

  obterHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      }),
    };
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
    if (tela === 'frota') this.carregarFrota();
    if (tela === 'inicio' || tela === 'viagens') {
      this.carregarOperacoes();
      this.carregarFrota();
    }
    if (tela === 'perfil') this.carregarDadosPerfilEmpresa();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // --- DADOS DA EMPRESA ---
  carregarDadosPerfilEmpresa() {
    if (!this.usuarioLogado.empresaId) return;

    this.http
      .get<any>(
        `http://localhost:8080/api/empresa/buscar/${this.usuarioLogado.empresaId}`,
        this.obterHeaders(),
      )
      .subscribe({
        next: (dados) => {
          if (dados) {
            this.dadosEmpresa = {
              id: this.usuarioLogado.empresaId,
              razaoSocial: dados.razaoSocial || dados.razao_social || '',
              cnpj: dados.cnpj || '', // Armazena o CNPJ puro vindo do banco
              telefone: dados.telefone || '', // Armazena o Telefone puro vindo do banco
              endereco: dados.endereco || '', // Armazena o Endereço puro vindo do banco
            };
            if (this.cdr) this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Erro ao ler dados cadastrais da empresa:', err),
      });
  }

  atualizarPerfil(form: NgForm) {
    if (form.invalid || !this.usuarioLogado.empresaId) return;

    this.http
      .put(
        `http://localhost:8080/api/empresa/atualizar/${this.usuarioLogado.empresaId}`,
        this.dadosEmpresa,
        this.obterHeaders(),
      )
      .subscribe({
        next: () => {
          alert('Dados cadastrais atualizados com sucesso!');
          this.carregarDadosPerfilEmpresa();
        },
        error: (err) => {
          console.error('Erro ao atualizar perfil empresarial:', err);
          alert('Erro ao processar atualização.');
        },
      });
  }

  // --- OPERAÇÕES DA API: FROTA ---
  carregarFrota() {
    if (!this.usuarioLogado.empresaId) return;

    // ✅ ROTA CORRIGIDA: Apontando para api/transport/buscar-por-empresa/
    this.http
      .get<
        any[]
      >(`http://localhost:8080/api/transport/buscar-por-empresa/${this.usuarioLogado.empresaId}`, this.obterHeaders())
      .subscribe({
        next: (dados) => {
          if (Array.isArray(dados)) {
            this.listaMinhaFrota = dados.map((t: any) => ({
              id: t.id || t.idTransporte || t.id_transporte,
              modelo: t.modelo || 'Modelo Não Definido',
              capacidade: t.capacidade || t.vagas || 0,
              status: t.status || 'ATIVO',
            }));

            this.totalVeiculosAtivos = this.listaMinhaFrota.filter(
              (v) => v.status === 'ATIVO',
            ).length;
          }
          if (this.cdr) this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao listar frota dedicada:', err);
          this.listaMinhaFrota = [];
          this.totalVeiculosAtivos = 0;
          if (this.cdr) this.cdr.detectChanges();
        },
      });
  }
  salvarVeiculo(dadosForm: any, formRef: NgForm) {
    // Se não houver ID da empresa cadastrado na sessão, avisa antes de enviar
    if (!this.usuarioLogado.empresaId) {
      alert('Erro: ID da empresa não encontrado na sessão. Faça login novamente.');
      return;
    }
    if (formRef.invalid) return;

    const payloadVeiculo = {
      modelo: dadosForm.modelo,
      capacidade: Number(dadosForm.capacidade), // Certifique-se de que o Java usa "vagas"
      status: dadosForm.status || 'ATIVO',
      empresaId: Number(this.usuarioLogado.empresaId),
    };

    this.http
      .post('http://localhost:8080/api/transport/cadastrar', payloadVeiculo, this.obterHeaders())
      .subscribe({
        next: () => {
          alert('Veículo adicionado com sucesso à frota!');
          formRef.resetForm({ status: 'ATIVO' });
          this.carregarFrota();
        },
        error: (err) => {
          console.error('Falha ao registrar novo veículo corporativo:', err);
          alert('O servidor rejeitou o cadastro. Verifique o console do Spring Boot.');
        },
      });
  }
  deletarTransporte(id: number) {
    if (!confirm('Deseja realmente remover este veículo?')) return;

    this.http
      .delete(`http://localhost:8080/api/transport/deletar/${id}`, this.obterHeaders())
      .subscribe({
        next: () => {
          alert('Veículo desvinculado com sucesso.');
          this.carregarFrota();
        },
        error: (err) => console.error('Erro ao excluir veículo:', err),
      });
  }

  // --- OPERAÇÕES DA API: GERENCIAR VIAGENS ---
  carregarOperacoes() {
    this.http.get<any[]>('http://localhost:8080/api/rotas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaRotas = dados || [];
        if (this.cdr) this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar rotas globais:', err),
    });

    if (!this.usuarioLogado.empresaId) return;

    this.http
      .get<
        any[]
      >(`http://localhost:8080/api/viagem/buscar-por-empresa/${this.usuarioLogado.empresaId}`, this.obterHeaders())
      .subscribe({
        next: (dados) => {
          if (Array.isArray(dados)) {
            this.listaMinhasViagens = dados;

            let passageirosContados = 0;
            let receitaSomada = 0;

            this.listaMinhasViagens.forEach((viagem) => {
              const capacidadeTotal = viagem.capacidade || viagem.transport?.capacidade || 42;
              const vagasRestantes =
                viagem.vagasDisponiveis !== undefined ? viagem.vagasDisponiveis : capacidadeTotal;
              const passagensCompradas = capacidadeTotal - vagasRestantes;

              if (passagensCompradas > 0) {
                passageirosContados += passagensCompradas;
                const precoPassagem = viagem.valor || viagem.rota?.valor || 120.0;
                receitaSomada += passagensCompradas * precoPassagem;
              }
            });

            this.totalPassageirosAtendidos = passageirosContados;
            this.receitaOperacional = receitaSomada;
          }
          if (this.cdr) this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao listar viagens corporativas:', err),
      });
  }

  salvarItinerarioRota(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    const payload = {
      origem: dadosForm.origem,
      ufOrigem: dadosForm.ufOrigem.toUpperCase(),
      destino: dadosForm.destino,
      ufDestino: dadosForm.ufDestino.toUpperCase(),
      valorBase: Number(dadosForm.valorBase),
      horarioPadrao: dadosForm.horarioPadrao,
    };

    this.http
      .post('http://localhost:8080/api/rotas/cadastrar', payload, this.obterHeaders())
      .subscribe({
        next: () => {
          form.resetForm();
          this.carregarOperacoes();
          alert('Nova rota comercial salva com sucesso!');
        },
        error: (err) => console.error('Erro ao cadastrar rota no servidor:', err),
      });
  }

  // --- REDIRECIONADOR DE SUBMISSÃO COMPATÍVEL ---
  salvarViagem(valoresForm: any, formRef: NgForm) {
    this.agendarViagem(valoresForm, formRef);
  }

  agendarViagem(dadosForm: any, form: NgForm) {
    // Busca os ids diretamente do objeto mapeado pelo formulário HTML (dadosForm)
    // Se o HTML usar a propriedade local antiga, faz o fallback para ela
    const rId = dadosForm.rotaId || this.idRotaSelecionada;
    const tId = dadosForm.transportId || this.idTransporteSelecionado;

    const rotaIdNum = parseInt(rId, 10);
    const transportIdNum = parseInt(tId, 10);

    if (isNaN(transportIdNum) || isNaN(rotaIdNum)) {
      alert('Por favor, selecione um veículo válido da sua frota ativa e uma rota!');
      return;
    }

    const payload = {
      rotaId: rotaIdNum,
      transportId: transportIdNum,
      dataSaida: dadosForm.dataSaida,
      vagasDisponiveis: null,
    };

    this.http
      .post('http://localhost:8080/api/viagem/cadastrar', payload, this.obterHeaders())
      .subscribe({
        next: () => {
          this.idRotaSelecionada = '';
          this.idTransporteSelecionado = '';
          form.resetForm();
          this.carregarOperacoes();
          alert('Viagem cadastrada e ônibus escalado com sucesso!');
        },
        error: (err) => alert('Erro ao registrar viagem no cronograma.'),
      });
  }

  excluirViagem(idViagem: number) {
    if (!confirm('Deseja realmente derrubar essa escala e cancelar a viagem?')) return;

    this.http
      .delete(`http://localhost:8080/api/viagem/deletar/${idViagem}`, this.obterHeaders())
      .subscribe({
        next: () => {
          this.carregarOperacoes();
          alert('Escala cancelada.');
        },
        error: (err) => console.error('Erro ao deletar viagem:', err),
      });
  }
}
