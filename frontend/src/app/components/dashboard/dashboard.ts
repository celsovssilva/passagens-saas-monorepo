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
  // Controle de Navegação Principal
  telaAtiva: string = 'inicio';

  // Listas de Dados
  listaViagens: any[] = [];
  listaRotasDisponiveis: any[] = [];
  listaTransportesDisponiveis: any[] = [];

  // Dados do Usuário Conectado
  usuarioLogado: any = {
    id: null,
    nome: 'Usuário',
    email: 'Não identificado',
    role: 'PASSAGEIRO'
  };

  // Métricas do Painel
  dadosGlobais: any = {
    totalPassageiros: 0,
    totalEmpresas: 0,
    faturamentoHoje: 0.00
  };

  // Variáveis do Controle de Fluxo de Compra e Pagamento (Integração Java)
  subTelaCompra: string = 'formulario'; // Passos: 'formulario' | 'pix' | 'sucesso'
  backupHistoricoCompra: any = null;
  idCompraPendente: number | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadDecodificado = this.decodificarTokenJwt(token);
        console.log('Dados extraídos do Token JWT com sucesso:', payloadDecodificado);

        this.usuarioLogado.id = payloadDecodificado.id || payloadDecodificado.userId || 1;
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
      this.subTelaCompra = 'formulario'; // Reseta o fluxo ao entrar na aba
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

  carregarViagens() {
    this.http.get<any[]>('http://localhost:8080/api/viagem/listar-todas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaViagens = [...dados];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar viagens:', err)
    });
  }

  onPassagemComprada(sucesso: boolean) {
    if (sucesso) {
      this.carregarViagens();
      this.carregarDadosGlobais();
    }
  }

  carregarRotasETransportes() {
    this.http.get<any[]>('http://localhost:8080/api/rotas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaRotasDisponiveis = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar rotas:', err)
    });

    const idTransportePadrao = 1;
    this.http.get<any>(`http://localhost:8080/api/transport/buscar/${idTransportePadrao}`, this.obterHeaders()).subscribe({
      next: (dado) => {
        this.listaTransportesDisponiveis = Array.isArray(dado) ? dado : [dado];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(`Erro ao buscar transporte ID ${idTransportePadrao}:`, err)
    });
  }

  carregarDadosGlobais() {
    this.http.get<any>('http://localhost:8080/api/dashboard/estatisticas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.dadosGlobais = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar dados globais:', err)
    });
  }

  excluirViagem(idViagem: number) {
    if (confirm('Tem a certeza que deseja excluir esta viagem operacional?')) {
      this.http.delete(`http://localhost:8080/api/viagem/deletar/${idViagem}`, this.obterHeaders()).subscribe({
        next: () => this.carregarViagens(),
        error: (err) => console.error('Erro ao apagar viagem:', err)
      });
    }
  }

  salvarNovaRota(dadosForm: any, form: NgForm) {
    const rId = parseInt(dadosForm.rotaId, 10);
    const tId = parseInt(dadosForm.transportId, 10);

    const viagemRequestPayload = {
      id: null,
      rotaId: isNaN(rId) ? null : rId,
      transportId: isNaN(tId) ? 1 : tId,
      dataSaida: dadosForm.dataSaida,
      userId: null,
      capacidade: dadosForm.capacidade ? Number(dadosForm.capacidade) : 42,
      vagasDisponiveis: dadosForm.capacidade ? Number(dadosForm.capacidade) : 42,
      cpf: dadosForm.cpf || null,
      nomePassageiro: dadosForm.nomePassageiro || null
    };

    this.http.post('http://localhost:8080/api/viagem/cadastrar', viagemRequestPayload, this.obterHeaders()).subscribe({
      next: () => {
        form.resetForm();
        this.definirTela('inicio');
        this.carregarViagens();
      },
      error: (err) => {
        console.error('Erro ao cadastrar rota:', err);
        alert('Erro ao salvar viagem.');
      }
    });
  }

  // =========================================================================
  // LOGICA DO FLUXO DE COMPRAS E ATUALIZAÇÃO DE PAGAMENTO (INTEGRAÇÃO JAVA)
  // =========================================================================

  /**
   * PASSO 1: Envia o POST para criar o registro da compra com status PENDENTE
   */
  validarEAvancarFluxoCompra(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    const compraRequestPayload = {
      usuarioId: this.usuarioLogado.id || 1,
      viagemId: Number(dadosForm.viagemId),
      passageiro: [
        {
          nome: dadosForm.nomePassageiro,
          cpf: dadosForm.cpfPassageiro
        }
      ],
      metodo: dadosForm.metodo,
      numeroCartao: dadosForm.numeroCartao || null,
      cvv: dadosForm.cvv || null
    };

    // Guarda informações locais para renderizar o recibo no final
    this.backupHistoricoCompra = compraRequestPayload;

    console.log('Passo 1: Registrando intenção de compra (Status: PENDENTE)...');

    this.http.post<any>('http://localhost:8080/api/compra/comprar', compraRequestPayload, this.obterHeaders()).subscribe({
      next: (compraSalvaNoBanco) => {
        // Mapeia dinamicamente o ID retornado pelo banco
        this.idCompraPendente = compraSalvaNoBanco?.id || compraSalvaNoBanco?.idCompra || null;
        console.log('Compra gravada no banco! ID temporário:', this.idCompraPendente);

        if (dadosForm.metodo === 'PIX') {
          // Se for PIX, muda para a tela do QR Code e aguarda a ação do usuário
          this.subTelaCompra = 'pix';
          this.cdr.detectChanges();
        } else {
          // Se for Cartão de Crédito, já realiza a chamada do PUT imediatamente
          this.efetivarConfirmacaoPagamentoNoBackend(form);
        }
      },
      error: (err) => {
        console.error('Erro ao processar o POST inicial de compra:', err);
        alert('Não foi possível registrar a intenção de compra.');
      }
    });
  }

  /**
   * Disparado manualmente pelo clique do botão na tela de QR Code do PIX
   */
  dispararCompraParaServidor() {
    this.efetivarConfirmacaoPagamentoNoBackend(null);
  }

  /**
   * PASSO 2: Chama o endpoint @PutMapping("/atualizar/{idCompra}") do Spring Boot
   * É este método que altera o status para APROVADO e envia o e-mail!
   */
  private efetivarConfirmacaoPagamentoNoBackend(form: NgForm | null) {
    if (!this.idCompraPendente) {
      alert('Erro: Nenhuma referência de compra pendente foi localizada.');
      return;
    }

    console.log(`Passo 2: Enviando PUT para confirmar pagamento da compra #${this.idCompraPendente}...`);

    this.http.put(`http://localhost:8080/api/compra/atualizar/${this.idCompraPendente}`, {}, this.obterHeaders()).subscribe({
      next: () => {
        console.log('Pagamento Aprovado e Mensagem/E-mail disparada pelo Backend!');

        if (form) {
          form.resetForm();
        }

        // Transiciona a interface para a tela de Sucesso/Recibo
        this.subTelaCompra = 'sucesso';

        // Recarrega as tabelas para atualizar assentos e faturamento
        this.carregarViagens();
        this.carregarDadosGlobais();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao efetuar o PUT de confirmação:', err);
        alert('Falha na aprovação do pagamento. Verifique os logs do servidor Java.');
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
    this.definirTela('inicio');
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
