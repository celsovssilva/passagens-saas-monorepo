import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-empresa.html',
  styleUrls: ['./dashboard-empresa.css']
})
export class DashboardEmpresaComponent implements OnInit {
  telaAtiva: string = 'inicio';

  // Indicadores numéricos superiores exibidos nos cards
  totalPassageirosAtendidos: number = 0;
  totalVeiculosAtivos: number = 0;
  receitaOperacional: number = 0.00;

  // Listagens de dados filtradas para a Empresa
  listaMinhasViagens: any[] = [];
  listaMinhasRotas: any[] = [];
  listaMinhaFrota: any[] = [];

  // Propriedades para o bind bidirecional dos selects (evita bugs de NaN)
  idRotaSelecionada: string = '';
  idTransporteSelecionado: string = '';

  dadosEmpresa: any = {
    id: null,
    razaoSocial: '',
    cnpj: '',
    telefone: '',
    endereco: ''
  };

  usuarioLogado: any = {
    id: null,
    empresaId: null, // Será preenchido pelo Token JWT obrigatoriamente
    email: '',
    role: 'EMPRESA'
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarDadosDoToken();

    // Trava de segurança: Se o token não encontrou o ID da empresa, tenta buscar o ID reserva do localStorage
    if (!this.usuarioLogado.empresaId) {
      const backupId = localStorage.getItem('empresaId');
      if (backupId) {
        this.usuarioLogado.empresaId = Number(backupId);
      }
    }

    this.carregarDadosPerfilEmpresa();
    this.carregarFrota();
    this.carregarOperacoes();
  }

  private carregarDadosDoToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parts = token.split('.');
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        console.log('Payload completo do JWT decodificado:', payload);

        this.usuarioLogado.id = payload.id || payload.userId;

        // Varre todas as possíveis nomenclaturas do payload e força conversão numérica
        const rawEmpresaId = payload.empresaId || payload.empresa_id || payload.empresa || payload.idEmpresa;
        this.usuarioLogado.empresaId = rawEmpresaId ? Number(rawEmpresaId) : null;

        this.usuarioLogado.email = payload.sub || payload.email || payload.username;

        if (this.usuarioLogado.empresaId) {
          localStorage.setItem('empresaId', this.usuarioLogado.empresaId.toString());
        } else {
          console.warn('Aviso: Atributo da empresa não localizado no payload do Token JWT.');
        }
      } catch (e) {
        console.error('Erro ao decodificar token da empresa:', e);
      }
    }
  }

  obterHeaders() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  definirTela(tela: string) {
    this.telaAtiva = tela;
    if (tela === 'frota') this.carregarFrota();
    if (tela === 'inicio' || tela === 'rotas') {
      this.carregarOperacoes();
      this.carregarFrota();
    }
    if (tela === 'perfil') this.carregarDadosPerfilEmpresa();
  }

  // ==========================================
  // PERFIL DA EMPRESA
  // ==========================================
  carregarDadosPerfilEmpresa() {
    if (!this.usuarioLogado.empresaId) return;

    this.http.get<any>(`http://localhost:8080/api/empresa/buscar/${this.usuarioLogado.empresaId}`, this.obterHeaders()).subscribe({
      next: (dados) => {
        if (dados) {
          this.dadosEmpresa = {
            id: dados.id,
            razaoSocial: dados.razaoSocial || dados.razao_social || 'Empresa Parceira',
            cnpj: dados.cnpj,
            telefone: dados.telefone || '',
            endereco: dados.endereco || ''
          };
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar perfil da empresa:', err)
    });
  }

  atualizarPerfil(form: NgForm) {
    if (form.invalid) return;

    this.http.put(`http://localhost:8080/api/empresa/atualizar/${this.dadosEmpresa.id}`, this.dadosEmpresa, this.obterHeaders()).subscribe({
      next: () => {
        alert('Dados cadastrais atualizados com sucesso!');
        this.carregarDadosPerfilEmpresa();
      },
      error: (err) => alert('Erro ao atualizar os dados da empresa.')
    });
  }

  // ==========================================
  // GESTÃO DA FROTA
  // ==========================================
  carregarFrota() {
    if (!this.usuarioLogado.empresaId) {
      console.warn("A frota não pode ser carregada porque o id da empresa está nulo.");
      return;
    }

    this.http.get<any[]>(`http://localhost:8080/api/transport/buscar-por-empresa/${this.usuarioLogado.empresaId}`, this.obterHeaders()).subscribe({
      next: (dados) => {
        console.log('Frota exclusiva retornada pelo backend:', dados);
        if (Array.isArray(dados)) {
          this.listaMinhaFrota = dados.map((t: any) => ({
            id: t.id || t.idTransporte || t.id_transporte,
            modelo: t.modelo || 'Modelo Não Definido',
            capacidade: t.capacidade || t.vagas || 0,
            status: t.status || 'ATIVO'
          }));

          this.totalVeiculosAtivos = this.listaMinhaFrota.filter(v => v.status === 'ATIVO').length;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar frota dedicada:', err)
    });
  }

  salvarVeiculo(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    if (!this.usuarioLogado.empresaId) {
      alert('Sessão inválida ou ID de empresa ausente. Faça o login novamente.');
      return;
    }

    const payload = {
      modelo: dadosForm.modelo,
      capacidade: Number(dadosForm.capacidade),
      status: dadosForm.status,
      empresaId: Number(this.usuarioLogado.empresaId)
    };

    this.http.post('http://localhost:8080/api/transport/cadastrar', payload, this.obterHeaders()).subscribe({
      next: () => {
        form.resetForm({ status: 'ATIVO' });
        this.carregarFrota();
        alert('Veículo adicionado com sucesso à frota!');
      },
      error: (err) => console.error('Erro ao cadastrar veículo:', err)
    });
  }

  deletarTransporte(id: number) {
    if (confirm('Deseja realmente remover este veículo?')) {
      this.http.delete(`http://localhost:8080/api/transport/deletar/${id}`, this.obterHeaders()).subscribe({
        next: () => {
          this.carregarFrota();
          alert('Veículo removido com sucesso.');
        },
        error: (err) => alert('Erro ao remover o veículo. Verifique se há viagens vinculadas a ele.')
      });
    }
  }

  // ==========================================
  // PROCESSAMENTO DO PAINEL (Rotas e Viagens da Empresa)
  // ==========================================
  carregarOperacoes() {
    // 1. Carrega as rotas comerciais
    this.http.get<any[]>('http://localhost:8080/api/rotas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaMinhasRotas = dados;
        if (this.cdr) this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao ler rotas:', err)
    });

    if (!this.usuarioLogado || !this.usuarioLogado.empresaId) return;

    // 2. Consome o endpoint trazendo as viagens reais
    this.http.get<any[]>(`http://localhost:8080/api/viagem/buscar-por-empresa/${this.usuarioLogado.empresaId}`, this.obterHeaders()).subscribe({
      next: (dados) => {
        if (Array.isArray(dados)) {
          console.log('Viagens retornadas do banco:', dados);

          this.listaMinhasViagens = dados.map((v: any) => {
            const rotaInfo = v.rota || {};
            const veiculoInfo = v.transport || v.veiculo || {};

            const capacidadeDefinida = v.capacidade || veiculoInfo.capacidade || veiculoInfo.vagas || 2;
            const disponiveis = v.vagasDisponiveis !== undefined ? v.vagasDisponiveis : capacidadeDefinida;

            return {
              id: v.id,
              origem: rotaInfo.origem || 'Não Definida',
              ufOrigem: rotaInfo.ufOrigem || '',
              destino: rotaInfo.destino || 'Não Definido',
              ufDestino: rotaInfo.ufDestino || '',
              dataSaida: v.dataSaida || 'Horário não agendado',
              capacidade: capacidadeDefinida,
              vagasDisponiveis: disponiveis,
              valor: v.valor || rotaInfo.valorBase || rotaInfo.valor || 120.00
            };
          });

          // Processamento financeiro interno do bloco next
          let passageirosContados = 0;
          let receitaSomada = 0;

          this.listaMinhasViagens.forEach((viagem: any) => {
            const passagensCompradas = viagem.capacidade - viagem.vagasDisponiveis;
            if (passagensCompradas > 0) {
              passageirosContados += passagensCompradas;
              receitaSomada += (passagensCompradas * viagem.valor);
            }
          });

          this.totalPassageirosAtendidos = passageirosContados;
          this.receitaOperacional = receitaSomada;
        }
        if (this.cdr) this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao ler viagens dedicadas por empresa:', err);
        this.listaMinhasViagens = [];
      }
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
      horarioPadrao: dadosForm.horarioPadrao
    };

    this.http.post('http://localhost:8080/api/rotas/cadastrar', payload, this.obterHeaders()).subscribe({
      next: () => {
        form.resetForm();
        this.carregarOperacoes();
        alert('Nova rota comercial salva com sucesso!');
      },
      error: (err) => console.error('Erro ao cadastrar rota no servidor:', err)
    });
  }

  agendarViagem(dadosForm: any, form: NgForm) {
    const rotaIdNum = parseInt(this.idRotaSelecionada, 10);
    const transportIdNum = parseInt(this.idTransporteSelecionado, 10);

    if (isNaN(transportIdNum) || isNaN(rotaIdNum)) {
      alert('Por favor, selecione um veículo válido da sua frota ativa e uma rota!');
      return;
    }

    this.http.get<any>(`http://localhost:8080/api/transport/buscar/${transportIdNum}`, this.obterHeaders()).subscribe({
      next: (veiculo) => {
        const totalVagas = veiculo ? (veiculo.capacidade || veiculo.vagas || 42) : 42;

        const payload = {
          rotaId: rotaIdNum,
          transportId: transportIdNum,
          dataSaida: dadosForm.dataSaida,
          capacidade: totalVagas,
          vagasDisponiveis: totalVagas
        };

        this.http.post('http://localhost:8080/api/viagem/cadastrar', payload, this.obterHeaders()).subscribe({
          next: () => {
            this.idRotaSelecionada = '';
            this.idTransporteSelecionado = '';
            form.resetForm();
            this.carregarOperacoes();
            alert('Viagem cadastrada e ônibus escalado com sucesso!');
          },
          error: (err) => alert('Erro ao registrar viagem no cronograma.')
        });
      },
      error: (err) => {
        console.error('Erro ao validar veículo:', err);
        alert('Não foi possível verificar as vagas do veículo.');
      }
    });
  }

  excluirViagem(idViagem: number) {
    if (confirm('Deseja realmente derrubar essa escala e cancelar a viagem?')) {
      this.http.delete(`http://localhost:8080/api/viagem/deletar/${idViagem}`, this.obterHeaders()).subscribe({
        next: () => {
          this.carregarOperacoes();
          alert('Escala cancelada.');
        },
        error: (err) => console.error(err)
      });
    }
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
