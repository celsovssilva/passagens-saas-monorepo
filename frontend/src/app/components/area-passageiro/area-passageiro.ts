import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViagemCompraService, ViagemResponse, CompraResponse } from '../../service/viagem-compra.service';

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

  minhasCompras: CompraResponse[] = [];
  qtdAssentosSelecionados: number = 1;

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(private apiService: ViagemCompraService) {}

  ngOnInit() {
    const idSalvo = localStorage.getItem('userId');
    if (idSalvo) {
      this.userId = Number(idSalvo);
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

    const dataFormatada = `${this.busca.data}T00:00:00`;

    this.apiService.pesquisarViagens(this.busca.origem, this.busca.destino, dataFormatada).subscribe({
      next: (viagens: ViagemResponse[]) => {
        this.viagensDisponiveis = viagens;
        this.pesquisaFeita = true;
      },
      error: () => this.mensagemErro = 'Erro ao pesquisar viagens.'
    });
  }

  comprar(viagemId: number) {
    if (!this.userId) {
      this.mensagemErro = 'Usuário não identificado. Faça login novamente.';
      return;
    }

    const request = {
      userId: this.userId,
      viagemId: viagemId,
      quantidadeAssentos: this.qtdAssentosSelecionados
    };

    this.apiService.comprarPassagem(request).subscribe({
      next: () => {
        this.mensagemSucesso = 'Reserva realizada! Confirme o pagamento no histórico.';
        this.buscarPassagens();
      },
      error: () => this.mensagemErro = 'Não foi possível realizar a compra.'
    });
  }

  carregarHistorico() {
    this.apiService.obterHistorico(this.userId).subscribe({
      next: (compras: CompraResponse[]) => this.minhasCompras = compras,
      error: () => this.mensagemErro = 'Erro ao carregar histórico.'
    });
  }

  pagar(compraId: number) {
    this.apiService.confirmarPagamento(compraId).subscribe({
      next: () => {
        this.mensagemSucesso = 'Pagamento confirmado com sucesso!';
        this.carregarHistorico();
      }
    });
  }

  cancelar(compraId: number) {
    if (confirm('Deseja realmente cancelar esta passagem?')) {
      this.apiService.cancelarCompra(compraId).subscribe({
        next: () => {
          this.mensagemSucesso = 'Passagem cancelada.';
          this.carregarHistorico();
        }
      });
    }
  }
}
