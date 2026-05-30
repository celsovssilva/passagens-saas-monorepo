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
  listaTransportesDisponiveis: any[] = []; // Alimentado dinamicamente via listar-todas
  listaFrota: any[] = [];
  listaEmpresas: any[] = [];

  usuarioLogado: any = {
    id: null,
    empresaId: null,
    nome: 'Usuário',
    email: 'Não identificado',
    role: 'PASSAGEIRO'
  };

  dadosGlobais: any = {
    totalPassageiros: 0,
    totalEmpresas: 0,
    faturamentoHoje: 0.00
  };

  subTelaCompra: string = 'formulario';
  backupHistoricoCompra: any = null;
  idCompraPendente: number | null = null;

  quantidadeSelecionada: number = 1;
  listaPassageirosForm: any[] = [{ nome: '', cpf: '', numeroAssentos: null }];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadDecodificado = this.decodificarTokenJwt(token);
        console.log('Dados extraídos do Token JWT com sucesso:', payloadDecodificado);

        this.usuarioLogado.id = payloadDecodificado.id || payloadDecodificado.userId || 1;
        this.usuarioLogado.empresaId = payloadDecodificado.empresaId || null;
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
    if (tela === 'comprar') {
      this.subTelaCompra = 'formulario';
      this.quantidadeSelecionada = 1;
      this.gerarCamposPassageiros();
    }
    if (tela === 'frota') {
      this.obterDadosDaFrota();
    }
  }

  obterHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  obterDadosDaFrota() {
    // 1. Carrega as empresas para o select do formulário de cadastro
    if (this.usuarioLogado?.role === 'ADMIN') {
      this.http.get<any[]>('http://localhost:8080/api/empresa/listar-todas', this.obterHeaders()).subscribe({
        next: (dados: any[]) => {
          if (Array.isArray(dados)) {
            this.listaEmpresas = dados.map((emp: any) => ({
              id: emp.id,
              nome: emp.razao_social || emp.razaoSocial || emp.nome || `Empresa #${emp.id}`
            }));
          } else {
            this.listaEmpresas = [];
          }
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.error('Erro ao listar todas as empresas:', e);
          this.listaEmpresas = [];
          this.cdr.detectChanges();
        }
      });
    }

    // 2. AQUI ESTÁ O SEGREDO DA TABELA: Buscar todos os transportes e salvar na 'listaFrota'
    this.http.get<any[]>('http://localhost:8080/api/transport/listar-todas', this.obterHeaders()).subscribe({
      next: (dados: any[]) => {
        if (Array.isArray(dados)) {
          // Preenche a tabela visual com TODOS os veículos do banco
          this.listaFrota = dados.map((dado: any) => ({
            id: dado.id || dado.idTransporte,
            modelo: dado.modelo || 'Não Informado',
            capacidade: dado.vagas !== undefined && dado.vagas !== null ? dado.vagas : (dado.capacidade || 0),
            status: dado.status || 'ATIVO'
          }));
        } else {
          this.listaFrota = [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao listar a frota completa para a tabela:', err);
        this.listaFrota = [];
        this.cdr.detectChanges();
      }
    });
  }

  salvarTransporte(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    const transportPayload = {
      modelo: dadosForm.modelo,
      capacidade: Number(dadosForm.capacidade),
      vagas: Number(dadosForm.capacidade),
      status: dadosForm.status,
      empresaId: this.usuarioLogado.role === 'EMPRESA' ? Number(this.usuarioLogado.empresaId) : Number(dadosForm.empresaId || 1)
    };

    this.http.post('http://localhost:8080/api/transport/cadastrar', transportPayload, this.obterHeaders()).subscribe({
      next: (res: any) => {
        form.resetForm({ status: 'ATIVO' });
        this.obterDadosDaFrota();
        this.carregarRotasETransportes();
        alert(`Veículo cadastrado com sucesso!`);
      },
      error: (err: any) => {
        console.error('Erro ao cadastrar veículo:', err);
        alert('Erro ao enviar dados do veículo para o servidor.');
      }
    });
  }

  deletarTransporte(id: number) {
    if (confirm('Deseja realmente deletar este transporte?')) {
      this.http.delete(`http://localhost:8080/api/transport/deletar/${id}`, this.obterHeaders()).subscribe({
        next: () => {
          this.obterDadosDaFrota();
          this.carregarRotasETransportes();
          alert('Transporte removido com sucesso.');
        },
        error: (err: any) => console.error(err)
      });
    }
  }

  carregarViagens() {
    this.http.get<any[]>('http://localhost:8080/api/viagem/listar-todas', this.obterHeaders()).subscribe({
      next: (dados: any) => {
        this.listaViagens = Array.isArray(dados) ? dados : [];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao carregar rotas no feed de viagens:', err)
    });
  }

  onPassagemComprada(sucesso: any) {
    if (sucesso) {
      this.carregarViagens();
      this.carregarDadosGlobais();
    }
  }

  // ATUALIZADO: Processamento robusto e tratamento de chaves do TransportResponse
  carregarRotasETransportes() {
    const headersSeguros = this.obterHeaders();

    this.http.get<any[]>('http://localhost:8080/api/rotas', headersSeguros).subscribe({
      next: (dados: any) => {
        this.listaRotasDisponiveis = dados;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao buscar rotas:', err)
    });

    this.http.get<any[]>('http://localhost:8080/api/transport/listar-todas', headersSeguros).subscribe({
      next: (dados: any[]) => {
        if (Array.isArray(dados)) {
          this.listaTransportesDisponiveis = dados.map((t: any) => ({
            id: t.id || t.idTransporte || 1, // Atribui fallback caso o DTO não envie a chave primaria id explícita
            modelo: t.modelo || 'Modelo não cadastrado',
            status: t.status || 'ATIVO',
            // Mapeia tanto a propriedade 'capacidade' quanto 'vagas' de forma flexível
            vagas: t.capacidade !== undefined && t.capacidade !== null ? Number(t.capacidade) : (t.vagas ? Number(t.vagas) : 42)
          }));
        } else {
          this.listaTransportesDisponiveis = [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao listar todos os veículos do backend:', err);
        this.listaTransportesDisponiveis = [];
        this.cdr.detectChanges();
      }
    });
  }

  carregarDadosGlobais() {
    this.http.get<any>('http://localhost:8080/api/dashboard/estatisticas', this.obterHeaders()).subscribe({
      next: (dados: any) => {
        this.dadosGlobais = dados;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao carregar dados globais:', err)
    });
  }

  excluirViagem(idViagem: number) {
    if (confirm('Tem a certeza que deseja excluir esta viagem operacional?')) {
      this.http.delete(`http://localhost:8080/api/viagem/deletar/${idViagem}`, this.obterHeaders()).subscribe({
        next: () => this.carregarViagens(),
        error: (err: any) => console.error('Erro ao apagar viagem:', err)
      });
    }
  }

  salvarItinerarioRota(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    const rotaRequestPayload = {
      origem: dadosForm.origem,
      ufOrigem: dadosForm.ufOrigem.toUpperCase(),
      destino: dadosForm.destino,
      ufDestino: dadosForm.ufDestino.toUpperCase(),
      valorBase: Number(dadosForm.valorBase),
      horarioPadrao: dadosForm.horarioPadrao + ':00'
    };

    this.http.post('http://localhost:8080/api/rotas/cadastrar', rotaRequestPayload, this.obterHeaders()).subscribe({
      next: () => {
        form.resetForm();
        this.carregarRotasETransportes();
        this.definirTela('inicio');
        alert('Rota e preço base cadastrados com sucesso!');
      },
      error: (err: any) => {
        console.error(err);
        alert('Erro ao cadastrar a rota. Verifique as restrições do sistema.');
      }
    });
  }

  salvarNovaRota(dadosForm: any, form: NgForm) {
    const rId = parseInt(dadosForm.rotaId, 10);
    const tId = parseInt(dadosForm.transportId, 10);

    const veiculoSelecionado = this.listaTransportesDisponiveis.find(t => t.id === tId);

    const totalVagasDoVeiculo = veiculoSelecionado && veiculoSelecionado.vagas
        ? Number(veiculoSelecionado.vagas)
        : 42;

    const viagemRequestPayload = {
      id: null,
      rotaId: isNaN(rId) ? null : rId,
      transportId: isNaN(tId) ? null : tId,
      dataSaida: dadosForm.dataSaida,
      userId: null,
      capacidade: totalVagasDoVeiculo,
      vagasDisponiveis: totalVagasDoVeiculo,
      cpf: dadosForm.cpf || null,
      nomePassageiro: dadosForm.nomePassageiro || null
    };

    this.http.post('http://localhost:8080/api/viagem/cadastrar', viagemRequestPayload, this.obterHeaders()).subscribe({
      next: () => {
        form.resetForm();
        this.definirTela('inicio');
        this.carregarViagens();
      },
      error: (err: any) => {
        console.error('Erro ao cadastrar rota operacional:', err);
        alert('Erro ao salvar viagem.');
      }
    });
  }

  gerarCamposPassageiros() {
    this.listaPassageirosForm = [];
    for (let i = 0; i < Number(this.quantidadeSelecionada); i++) {
      this.listaPassageirosForm.push({ nome: '', cpf: '', numeroAssentos: null });
    }
  }

  validarEAvancarFluxoCompra(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    const idUsuarioEfetivo = this.usuarioLogado.id;
    const totalPassagens = Number(this.quantidadeSelecionada);

    const compraRequestPayload = {
      usuarioId: Number(idUsuarioEfetivo),
      viagemId: Number(dadosForm.viagemId),
      passageiro: this.listaPassageirosForm.map(p => ({
        nome: p.nome,
        cpf: p.cpf,
        numeroAssentos: Number(p.numeroAssentos),
        quantidadeDeAssentos: totalPassagens
      })),
      metodo: dadosForm.metodo,
      numeroCartao: dadosForm.numeroCartao || null,
      cvv: dadosForm.cvv || null
    };

    this.backupHistoricoCompra = compraRequestPayload;

    this.http.post<any>('http://localhost:8080/api/compra/comprar', compraRequestPayload, this.obterHeaders()).subscribe({
      next: (compraSalvaNoBanco: any) => {
        this.idCompraPendente = compraSalvaNoBanco?.id || compraSalvaNoBanco?.idCompra || null;

        if (dadosForm.metodo === 'PIX') {
          this.subTelaCompra = 'pix';
          this.cdr.detectChanges();
        } else {
          this.efetivarConfirmacaoPagamentoNoBackend(form);
        }
      },
      error: (err: any) => {
        console.error('Erro ao processar o POST inicial de compra:', err);
        alert('Não foi possível registrar a intenção de compra.');
      }
    });
  }

  dispararCompraParaServidor() {
    this.efetivarConfirmacaoPagamentoNoBackend(null);
  }

  private efetivarConfirmacaoPagamentoNoBackend(form: NgForm | null) {
    if (!this.idCompraPendente) {
      alert('Erro: Nenhuma referência de compra pendente foi localizada.');
      return;
    }

    this.http.put(`http://localhost:8080/api/compra/atualizar/${this.idCompraPendente}`, {}, this.obterHeaders()).subscribe({
      next: () => {
        if (form) form.resetForm();
        this.subTelaCompra = 'sucesso';
        this.carregarViagens();
        this.carregarDadosGlobais();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao efetuar o PUT de confirmação:', err);
        alert('Falha na aprovação do pagamento.');
      }
    });
  }

  confirmarEnvioTokenFake() {
    alert('Código de pagamento PIX copiado!');
  }

  resetarEIrParaHome() {
    this.subTelaCompra = 'formulario';
    this.backupHistoricoCompra = null;
    this.idCompraPendente = null;
    this.quantidadeSelecionada = 1;
    this.gerarCamposPassageiros();
    this.definirTela('inicio');
  }

  cancelar(): void {
    this.resetarEIrParaHome();
  }

  cancelarCompra(eventoCompra: any): void {
    const idEfetivo = eventoCompra?.id || eventoCompra?.idCompra || eventoCompra;

    if (!idEfetivo || isNaN(Number(idEfetivo))) {
      console.log('Nenhum ID detectado para cancelamento:', eventoCompra);
      return;
    }

    if (confirm('Tem certeza que deseja cancelar esta passagem/reserva?')) {
      this.http.delete(`http://localhost:8080/api/compra/deletar/${Number(idEfetivo)}`, this.obterHeaders()).subscribe({
        next: () => {
          alert('Passagem/Compra cancelada com sucesso!');
          this.carregarViagens();
          this.carregarDadosGlobais();
        },
        error: (err: any) => {
          console.error('Erro ao cancelar passagem no servidor:', err);
          alert('Não foi possível processar o cancelamento.');
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
