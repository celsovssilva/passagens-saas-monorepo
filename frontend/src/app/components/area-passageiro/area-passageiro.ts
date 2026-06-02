import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ViagemCompraService,
  ViagemResponse,
  PassagemResponse,
} from '../../service/viagem-compra.service';
import { jwtDecode } from 'jwt-decode';

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
  subAbaAtiva: string = 'buscar';

  busca = { origem: '', destino: '', data: '' };
  viagensDisponiveis: ViagemResponse[] = [];
  pesquisaFeita: boolean = false;

  minhasPassagens: PassagemResponse[] = [];
  qtdAssentosSelecionados: number = 1;

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  dadosPerfilPassageiro: any = {
    nome: 'Passageiro',
    sobrenome: '',
    phone: '',
    idade: 25,
    email: '',
    cpf: '000.000.000-00',
  };
  listaRotasGerais: any[] = [];
  listaViagensGerais: any[] = [];
  listaEmpresasGerais: any[] = [];

  constructor(private apiService: ViagemCompraService) {}
  ngOnInit() {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        this.mensagemErro = '';

        // Decodifica o payload do JWT nativamente
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = atob(payloadBase64);
        const tokenDecodificado = JSON.parse(payloadDecodificado);

        console.log('CONTEÚDO DO TOKEN:', tokenDecodificado);

        // 🌟 Agora captura o ID real que o Java vai enviar na Claim "id"
        if (tokenDecodificado.id) {
          this.userId = Number(tokenDecodificado.id);
          localStorage.setItem('userId', String(this.userId));
        } else {
          // Fallback seguro caso o token antigo ainda esteja no cache do navegador
          const idSalvo = localStorage.getItem('userId');
          if (idSalvo) {
            this.userId = Number(idSalvo);
          } else {
            this.mensagemErro = 'ID do usuário não encontrado no Token. Por favor, faça login novamente.';
            return;
          }
        }

        if (tokenDecodificado.nome) this.dadosPerfilPassageiro.nome = tokenDecodificado.nome;
        this.dadosPerfilPassageiro.email = tokenDecodificado.sub || '';

        // Inicializa todas as listagens globais que já funcionam
        this.listarTodasAsViagens();
        this.listarTodasAsEmpresas();
        this.listarTodasAsRotas();

      } catch (error) {
        console.error('Erro ao ler dados do Token:', error);
        this.mensagemErro = 'Erro de autenticação local. Faça login novamente.';
      }
    } else {
      this.mensagemErro = 'Sessão inválida ou token não encontrado. Por favor, faça login novamente.';
    }
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
        next: (viagens: ViagemResponse[]) => {
          this.viagensDisponiveis = viagens;
          this.pesquisaFeita = true;
          if (viagens.length === 0) {
            this.mensagemErro = 'Nenhuma viagem encontrada para este destino na data selecionada.';
          }
        },
        error: () => (this.mensagemErro = 'Erro ao pesquisar viagens no sistema.'),
      });
  }

  comprar(viagemId: number) {
    if (!this.validarUsuario()) return;

    const requestViagem = {
      id: viagemId,
      userId: this.userId,
      cpf: this.dadosPerfilPassageiro.cpf || '111.111.111-11',
      nomePassageiro: this.dadosPerfilPassageiro.nome,
      capacidade: this.qtdAssentosSelecionados,
    };

    this.apiService.comprarPassagem(requestViagem).subscribe({
      next: () => {
        this.mensagemSucesso = 'Passagem agendada e confirmada com sucesso!';
        this.buscarPassagens();
        this.carregarHistorico();
      },
      error: (err: any) => {
        console.error(err);
        this.mensagemErro =
          err.error?.message || 'Falha ao processar o agendamento da viagem no servidor.';
      },
    });
  }

  comprarDisponivel(viagem: any) {
    if (!this.validarUsuario()) return;

    const requestViagem = {
      id: viagem.id,
      userId: this.userId,
      cpf: this.dadosPerfilPassageiro.cpf || '111.111.111-11',
      nomePassageiro: this.dadosPerfilPassageiro.nome,
      capacidade: viagem.quantidadeDesejada || 1,
    };

    this.apiService.comprarPassagem(requestViagem).subscribe({
      next: () => {
        this.mensagemSucesso = 'Passagem comprada com sucesso a partir do mural!';
        this.listarTodasAsViagens();
        this.carregarHistorico();
      },
      error: (err: any) => {
        console.error(err);
        this.mensagemErro =
          err.error?.message || 'Erro de permissão ou dados inválidos ao agendar.';
      },
    });
  }

  carregarHistorico() {
    if (!this.userId || this.userId === 0) return;

    this.apiService.obterHistorico(this.userId).subscribe({
      next: (passagens: PassagemResponse[]) => (this.minhasPassagens = passagens),
      error: () => (this.mensagemErro = 'Erro ao carregar o seu histórico de passagens.'),
    });
  }

  atualizarDadosPerfil() {
    if (!this.validarUsuario()) return;
    this.limparMensagens();

    this.apiService.atualizarPassageiro(this.userId, this.dadosPerfilPassageiro).subscribe({
      next: (response) => {
        this.mensagemSucesso = 'Seus dados foram atualizados com sucesso!';
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

  listarTodasAsViagens() {
    this.apiService.listarTodasAsViagens().subscribe({
      next: (dados: ViagemResponse[]) => {
        this.listaViagensGerais = (dados || []).map((viagem) => ({
          ...viagem,
          quantidadeDesejada: 1,
        }));
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
}
