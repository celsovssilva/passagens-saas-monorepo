import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViagemCompraService, ViagemResponse, PassagemResponse, PassageiroResponse } from '../../service/viagem-compra.service';

@Component({
  selector: 'app-area-passageiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-passageiro.html',
  styleUrl: './area-passageiro.css'
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

  // Objetos estruturados com base nas respostas reais do seu backend
  dadosPerfilPassageiro: any = { nome: '', sobrenome: '', phone: '', idade: 0, email: '' };
  listaRotasGerais: any[] = [];
  listaEmpresasGerais: any[] = [];

  constructor(private apiService: ViagemCompraService) {}

  ngOnInit() {
    const idSalvo = localStorage.getItem('userId');
    if (idSalvo) {
      this.userId = Number(idSalvo);
      this.obterPerfilPassageiro();
    }
  }

  mudarSubAba(aba: string) {
    this.subAbaAtiva = aba;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (aba === 'historico') {
      this.carregarHistorico();
    }
  }

  buscarPassagens() {
    if (!this.busca.origem || !this.busca.destino || !this.busca.data) return;

    // Converte a data simples do input para o formato esperado pelo LocalDateTime do Java
    const dataFormatada = `${this.busca.data}T00:00:00`;

    this.apiService.pesquisarViagens(this.busca.origem, this.busca.destino, dataFormatada).subscribe({
      next: (viagens: ViagemResponse[]) => {
        this.viagensDisponiveis = viagens;
        this.pesquisaFeita = true;
      },
      error: () => this.mensagemErro = 'Erro ao pesquisar viagens no sistema.'
    });
  }

  comprar(viagemId: number) {
    if (!this.userId) {
      this.mensagemErro = 'Usuário não identificado. Faça login novamente.';
      return;
    }

    // Montando o objeto exatamente como o ViagemRequest do seu agendarViagem() espera receber
    const requestViagem = {
      id: viagemId,
      userId: this.userId,
      cpf: this.dadosPerfilPassageiro.cpf || '000.000.000-00',
      nomePassageiro: this.dadosPerfilPassageiro.nome,
      capacidade: this.qtdAssentosSelecionados // Capacidade solicitada na reserva
    };

    this.apiService.comprarPassagem(requestViagem).subscribe({
      next: () => {
        this.mensagemSucesso = 'Passagem agendada e confirmada com sucesso!';
        this.buscarPassagens();
      },
      error: (err: any) => this.mensagemErro = err.error?.message || 'Não foi possível realizar o agendamento da viagem.'
    });
  }

  carregarHistorico() {
    this.apiService.obterHistorico(this.userId).subscribe({
      next: (passagens: PassagemResponse[]) => this.minhasPassagens = passagens,
      error: () => this.mensagemErro = 'Erro ao carregar seu histórico de passagens.'
    });
  }

  obterPerfilPassageiro() {
    this.apiService.buscarPassageiroPorId(this.userId).subscribe({
      next: (dados: PassageiroResponse) => this.dadosPerfilPassageiro = dados,
      error: () => console.error('Erro ao buscar dados do perfil do passageiro.')
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

  listarTodasAsRotas() {
    this.apiService.obterRotasGerais().subscribe({
      next: (dados: any[]) => this.listaRotasGerais = dados,
      error: () => console.error('Erro ao carregar malha de rotas.')
    });
  }

  listarTodasAsEmpresas() {
    this.apiService.obterTodasEmpresas().subscribe({
      next: (dados: any[]) => this.listaEmpresasGerais = dados,
      error: () => console.error('Erro ao listar as empresas operacionais.')
    });
  }
}
