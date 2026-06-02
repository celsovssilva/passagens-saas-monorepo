import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViagemCompraService, ViagemResponse, PassagemResponse, PassageiroResponse } from '../../service/viagem-compra.service';

@Component({
  selector: 'app-area-passageiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-passageiro.html',
  styleUrls: ['./area-passageiro.css']
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

  dadosPerfilPassageiro: any = { nome: '', sobrenome: '', phone: '', idade: 0, email: '' };
  listaRotasGerais: any[] = [];
  listaViagensGerais: any[] = [];
  listaEmpresasGerais: any[] = [];

  constructor(private apiService: ViagemCompraService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');

    if (token) {
      this.mensagemErro = '';
      this.obterPerfilPassageiro();
    } else {
      this.mensagemErro = 'Sessão inválida ou expirada. Por favor, refaça o login.';
    }
  }

  mudarSubAba(aba: string) {
    this.subAbaAtiva = aba;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (aba === 'historico') {
      this.carregarHistorico();
    } else if (aba === 'rotas') {
      this.listarTodasAsViagens();
    } else if (aba === 'empresas') {
      this.listarTodasAsEmpresas();
    }
  }

  buscarPassagens() {
    if (!this.busca.origem || !this.busca.destino || !this.busca.data) return;

    const dataFormatada = `${this.busca.data}T00:00:00`;

    this.apiService.pesquisarViagens(this.busca.origem, this.busca.destino, dataFormatada).subscribe({
      next: (viagens: ViagemResponse[]) => {
        // Corrigido de 'viajes' para 'viagens'
        this.viagensDisponiveis = viagens;
        this.pesquisaFeita = true;
      },
      error: () => this.mensagemErro = 'Erro ao pesquisar viagens no sistema.'
    });
  }

  comprar(viagemId: number) {
    if (!this.userId || this.userId === 0) {
      this.mensagemErro = 'Usuário não identificado de forma válida. Faça login novamente.';
      return;
    }

    const requestViagem = {
      id: viagemId,
      userId: this.userId,
      cpf: this.dadosPerfilPassageiro.cpf || '000.000.000-00',
      nomePassageiro: this.dadosPerfilPassageiro.nome,
      capacidade: this.qtdAssentosSelecionados
    };

    this.apiService.comprarPassagem(requestViagem).subscribe({
      next: () => {
        this.mensagemSucesso = 'Passagem agendada e confirmada com sucesso!';
        this.buscarPassagens();
      },
      error: (err: any) => this.mensagemErro = err.error?.message || 'Não foi possível realizar o agendamento da viagem.'
    });
  }

  comprarDisponivel(viagem: any) {
    if (!this.userId || this.userId === 0) {
      this.mensagemErro = 'Usuário não identificado de forma válida. Faça login novamente.';
      return;
    }

    const requestViagem = {
      id: viagem.id,
      userId: this.userId,
      cpf: this.dadosPerfilPassageiro.cpf || '000.000.000-00',
      nomePassageiro: this.dadosPerfilPassageiro.nome,
      capacidade: viagem.quantidadeDesejada || 1
    };

    this.apiService.comprarPassagem(requestViagem).subscribe({
      next: () => {
        this.mensagemSucesso = 'Passagem agendada e confirmada com sucesso!';
        this.listarTodasAsViagens();
      },
      error: (err: any) => this.mensagemErro = err.error?.message || 'Não foi possível realizar o agendamento da viagem.'
    });
  }

  carregarHistorico() {
    if (!this.userId || this.userId === 0) return;

    this.apiService.obterHistorico(this.userId).subscribe({
      next: (passagens: PassagemResponse[]) => this.minhasPassagens = passagens,
      error: () => this.mensagemErro = 'Erro ao carregar seu histórico de passagens.'
    });
  }

  obterPerfilPassageiro() {
    const idSalvo = localStorage.getItem('userId');
    if (idSalvo && idSalvo !== 'undefined' && idSalvo !== 'null' && idSalvo.trim() !== '') {
      this.userId = Number(idSalvo);
    }

    this.apiService.buscarPerfilLogado().subscribe({
      next: (dados: PassageiroResponse) => {
        this.dadosPerfilPassageiro = dados;
        this.mensagemErro = '';

        this.listarTodasAsViagens();
        this.listarTodasAsEmpresas();
      },
      error: (err) => {
        console.error('Falha no endpoint /meu-perfil:', err);
        if (err.status === 403) {
          this.mensagemErro = 'Acesso negado (403): Verifique as permissões do seu usuário no backend ou refaça o login.';
        } else {
          this.mensagemErro = 'Erro ao buscar dados do perfil do passageiro no servidor.';
        }
      }
    });
  }

  atualizarDadosPerfil() {
    this.apiService.atualizarPassageiro(this.userId, this.dadosPerfilPassageiro).subscribe({
      next: () => {
        this.mensagemSucesso = 'Seus dados foram atualizados com sucesso!';
        this.obterPerfilPassageiro();
      },
      error: () => this.mensagemErro = 'Erro ao salvar modificações do perfil.'
    });
  }

  excluirContaPassageiro() {
    if (confirm('ATENÇÃO: Deseja realmente excluir permanentemente sua conta do sistema?')) {
      this.apiService.deletarPassageiro(this.userId).subscribe({
        next: () => {
          alert('Sua conta foi removida com sucesso do banco de dados.');
          localStorage.clear();
          window.location.reload();
        },
        error: () => this.mensagemErro = 'Não foi possível deletar a conta.'
      });
    }
  }

  listarTodasAsViagens() {
    if (typeof this.apiService.listarTodasAsViagens !== 'function') {
      console.warn('O método listarTodasAsViagens não existe no ViagemCompraService.');
      return;
    }

    this.apiService.listarTodasAsViagens().subscribe({
      next: (dados: ViagemResponse[]) => {
        this.listaViagensGerais = (dados || []).map(viagem => ({
          ...viagem,
          quantidadeDesejada: 1
        }));
      },
      error: () => {
        this.mensagemErro = 'Erro ao carregar o mural de viagens do servidor.';
      }
    });
  }

  listarTodasAsEmpresas() {
    if (typeof this.apiService.obterTodasEmpresas !== 'function') return;

    this.apiService.obterTodasEmpresas().subscribe({
      next: (dados: any[]) => this.listaEmpresasGerais = dados || [],
      error: () => console.error('Erro ao listar as empresas operacionais.')
    });
  }
}
