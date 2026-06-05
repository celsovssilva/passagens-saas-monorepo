import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  ViagemCompraService,
  CompraRequestPayload,
  PassagemResponse,
} from '../../service/viagem-compra.service';

@Component({
  selector: 'app-area-passageiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-passageiro.html',
  styleUrls: ['./area-passageiro.css'],
})
export class AreaPassageiroComponent implements OnInit {
  @Input() emailUsuario: string = '';

  userId!: number;
  subAbaAtiva: string = 'buscar'; // 'buscar' | 'historico' | 'checkout' | 'rotas' | 'empresas'

  // Gerenciamento do Checkout de Compra
  subTelaCompra: 'formulario' | 'pix' | 'sucesso' = 'formulario';
  viagemSelecionadaId!: number;
  idCompraPendente: number | null = null;
  backupHistoricoCompra: CompraRequestPayload | null = null;
  quantidadeSelecionada: number = 1;

  // Lista dinâmica de passageiros vinculados ao formulário de compra
  listaPassageirosForm: Array<{ nome: string; cpf: string; numeroAssentos: number }> = [
    { nome: '', cpf: '', numeroAssentos: 1 },
  ];

  busca = { origem: '', destino: '', data: '' };

  // Mudado para any[] para evitar o erro de tipagem estrita no HTML com rota/transport
  viagensDisponiveis: any[] = [];
  pesquisaFeita: boolean = false;

  // Mudado para any[] para evitar o erro de tipagem com id/cpf/viagem no histórico
  minhasPassagens: any[] = [];

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  dadosPerfilPassageiro: any = {
    nome: '',
    sobrenome: '',
    phone: '',
    idade: 25,
    email: '',
    cpf: '',
  };

  listaRotasGerais: any[] = [];
  listaViagensGerais: any[] = [];
  listaEmpresasGerais: any[] = [];

  constructor(
    private apiService: ViagemCompraService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.tentarCarregarUsuarioSessao();

    // Inicializa listagens globais independentes de ID
    this.listarTodasAsViagens();
    this.listarTodasAsEmpresas();
    this.listarTodasAsRotas();
  }

  private tentarCarregarUsuarioSessao(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = atob(payloadBase64);
        const tokenDecodificado = JSON.parse(payloadDecodificado);

        if (tokenDecodificado.id) {
          this.userId = Number(tokenDecodificado.id);
          localStorage.setItem('userId', String(this.userId));

          if (tokenDecodificado.nome) this.dadosPerfilPassageiro.nome = tokenDecodificado.nome;
          this.dadosPerfilPassageiro.email = tokenDecodificado.sub || '';

          return true;
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }

    const idSalvo = localStorage.getItem('userId');
    if (idSalvo) {
      this.userId = Number(idSalvo);
      return true;
    }

    return false;
  }

  carregarDadosPerfilDoBanco() {
    if (!this.userId) this.tentarCarregarUsuarioSessao();
    if (!this.userId) return;

    this.apiService.obterPassageiroPorId(this.userId).subscribe({
      next: (dados: any) => {
        if (dados) {
          this.dadosPerfilPassageiro = dados;
        }
        this.mensagemErro = '';
      },
      error: (err: any) => {
        console.warn(
          'Perfil detalhado não localizado no banco (404/403). Usando dados da sessão de login.',
          err,
        );
      },
    });
  }

  mudarSubAba(aba: string) {
    this.subAbaAtiva = aba;
    this.limparMensagens();

    if (aba === 'historico') {
      this.carregarHistorico();
    } else if (aba === 'rotas') {
      this.listarTodasAsRotas();
      this.listarTodasAsViagens();
    } else if (aba === 'empresas') {
      this.listarTodasAsEmpresas();
    }
  }

  buscarPassagens() {
    if (!this.busca.origem || !this.busca.destino || !this.busca.data) return;

    const dataFormatada = `${this.busca.data}T00:00:00`;
    this.limparMensagens();

    this.apiService
      .pesquisarViagens(this.busca.origem, this.busca.destino, dataFormatada)
      .subscribe({
        next: (viagens: any[]) => {
          this.viagensDisponiveis = viagens || [];
          this.pesquisaFeita = true;
          if (viagens.length === 0) {
            this.mensagemErro = 'Nenhuma viagem encontrada para este destino na data selecionada.';
          }
        },
        error: () => (this.mensagemErro = 'Erro ao pesquisar viagens no sistema.'),
      });
  }

  comprarDisponivel(viagemId: number) {
    this.viagemSelecionadaId = viagemId;
    this.limparMensagens();

    if (!this.userId) {
      this.tentarCarregarUsuarioSessao();
    }

    this.apiService.obterPassageiroPorId(this.userId).subscribe({
      next: (dados: any) => {
        if (dados) {
          this.dadosPerfilPassageiro = dados;
          this.listaPassageirosForm = [
            {
              nome: dados.nome || '',
              cpf: dados.cpf || '',
              numeroAssentos: 1,
            },
          ];
        }
        this.subTelaCompra = 'formulario';
        this.mudarSubAba('checkout');
      },
      error: (err: any) => {
        console.warn(
          'Tratando erro de perfil ausente (404/403). Abrindo formulário de checkout em branco.',
          err,
        );

        this.listaPassageirosForm = [{ nome: '', cpf: '', numeroAssentos: 1 }];
        this.subTelaCompra = 'formulario';
        this.mudarSubAba('checkout');
      },
    });
  }

  atualizarQuantidadePassageiros() {
    const qtd = Math.max(1, Number(this.quantidadeSelecionada));
    this.quantidadeSelecionada = qtd;

    while (this.listaPassageirosForm.length < qtd) {
      this.listaPassageirosForm.push({
        nome: '',
        cpf: '',
        numeroAssentos: this.listaPassageirosForm.length + 1,
      });
    }
    while (this.listaPassageirosForm.length > qtd) {
      this.listaPassageirosForm.pop();
    }
  }

  validarEAvancarFluxoCompra(dadosForm: any, form: NgForm) {
    if (form.invalid) return;
    this.limparMensagens();

    if (!this.userId) this.tentarCarregarUsuarioSessao();
    if (!this.validarUsuario()) return;

    const totalPassagens = Number(this.quantidadeSelecionada);

    const compraRequestPayload: CompraRequestPayload = {
      usuarioId: Number(this.userId),
      viagemId: Number(this.viagemSelecionadaId),
      passageiro: this.listaPassageirosForm.map((p) => ({
        nome: p.nome,
        cpf: p.cpf,
        numeroAssentos: Number(p.numeroAssentos),
        quantidadeDeAssentos: totalPassagens,
      })),
      metodo: dadosForm.metodo,
      numeroCartao: dadosForm.numeroCartao || null,
      cvv: dadosForm.cvv || null,
    };

    this.backupHistoricoCompra = compraRequestPayload;

    this.apiService.comprarPassagem(compraRequestPayload).subscribe({
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
        console.error('Erro ao processar a compra:', err);
        this.mensagemErro =
          err.error?.message || 'Não foi possível registrar a intenção de compra.';
      },
    });
  }

  dispararCompraParaServidor(formCompra: NgForm) {
    this.efetivarConfirmacaoPagamentoNoBackend(formCompra);
  }

  private efetivarConfirmacaoPagamentoNoBackend(form: NgForm | null) {
    if (!this.idCompraPendente) {
      this.mensagemErro = 'Erro: Nenhuma referência de compra pendente foi localizada.';
      return;
    }

    this.apiService.confirmarPagamento(this.idCompraPendente).subscribe({
      next: () => {
        this.mensagemSucesso =
          'Compra realizada com sucesso! O bilhete em formato PDF foi enviado para o seu e-mail.';
        if (form) form.resetForm();

        this.subTelaCompra = 'sucesso';
        this.listarTodasAsViagens();
        this.carregarHistorico();

        this.quantidadeSelecionada = 1;
        this.listaPassageirosForm = [{ nome: '', cpf: '', numeroAssentos: 1 }];
        this.idCompraPendente = null;

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao efetuar o PUT de confirmação:', err);
        this.mensagemErro = err.error?.message || 'Falha na aprovação do pagamento.';
      },
    });
  }
  carregarHistorico() {
    if (!this.userId) this.tentarCarregarUsuarioSessao();
    if (!this.userId || this.userId === 0) return;

    this.apiService.obterHistorico(this.userId).subscribe({
      next: (passagens: any[]) => {
        this.minhasPassagens = passagens || [];
        console.log('--- DADOS REAIS DO HISTÓRICO ---', passagens);
      },
      error: () => (this.mensagemErro = 'Erro ao carregar o seu histórico de passagens.'),
    });
  }
  atualizarDadosPerfil() {
    if (!this.validarUsuario()) return;
    this.limparMensagens();

    this.apiService.atualizarPassageiro(this.userId, this.dadosPerfilPassageiro).subscribe({
      next: () => {
        this.mensagemSucesso = 'Seus dados foram atualizados com sucesso!';
        this.carregarDadosPerfilDoBanco();
      },
      error: () => (this.mensagemErro = 'Erro ao salvar modificações do perfil.'),
    });
  }

  excluirContaPassageiro() {
    if (!this.validarUsuario()) return;

    if (confirm('Deseja realmente excluir permanentemente a sua conta?')) {
      this.apiService.deletarPassageiro(this.userId).subscribe({
        next: () => {
          alert('Sua conta foi removida com sucesso.');
          localStorage.clear();
          window.location.reload();
        },
        error: () => (this.mensagemErro = 'Não foi possível deletar a conta.'),
      });
    }
  }

  cancelarMinhaCompra(id: number): void {
    this.apiService.cancelarCompra(id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Compra cancelada com sucesso!';
        this.carregarHistorico(); // Atualiza a lista na tela
      },
      error: (error) => {
        console.error('Erro ao cancelar compra:', error);
        alert('Não foi possível cancelar a compra.');
      }
    });
  }
  listarTodasAsViagens() {
    this.apiService.listarTodasAsViagens().subscribe({
      next: (dados: any[]) => {
        this.listaViagensGerais = dados || [];
      },
      error: () => (this.mensagemErro = 'Falha ao carregar o mural de viagens disponíveis.'),
    });
  }

  listarTodasAsEmpresas() {
    this.apiService.obterTodasEmpresas().subscribe({
      next: (dados: any[]) => (this.listaEmpresasGerais = dados || []),
      error: () => console.error('Erro ao listar empresas.'),
    });
  }

  listarTodasAsRotas() {
    this.apiService.obterRotasGerais().subscribe({
      next: (dados: any[]) => (this.listaRotasGerais = dados || []),
      error: () => console.error('Erro ao listar rotas gerais do sistema.'),
    });
  }

  private validarUsuario(): boolean {
    if (!this.userId || isNaN(this.userId) || this.userId === 0) {
      this.mensagemErro = 'Usuário não identificado de forma válida. Faça login novamente.';
      return false;
    }
    return true;
  }

  private limparMensagens() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }
  deslogarPassageiro() {
    localStorage.clear();
    window.location.reload();
  }
}
