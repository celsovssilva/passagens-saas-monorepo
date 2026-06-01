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

        console.log('Payload completo do JWT decodificado:', payload); // 👀 Log para auditar os campos do Token

        // Mapeia os dados do usuário autenticado a partir do payload do JWT
        this.usuarioLogado.id = payload.id || payload.userId;

        // 🔥 CORREÇÃO DO EMPRESA_ID NULL: Varre todas as possíveis nomenclaturas do payload e força conversão numérica
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
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
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
        alert('Dados cadastrais updated com sucesso!');
        this.carregarDadosPerfilEmpresa();
      },
      error: (err) => alert('Erro ao atualizar os dados da empresa.')
    });
  }

  // ==========================================
  // GESTÃO DA FROTA (Consumindo Endpoint Customizado)
  // ==========================================
  carregarFrota() {
    if (!this.usuarioLogado.empresaId) {
      console.warn("Afrota não pode ser carregada porque o id da empresa está nulo.");
      return;
    }

    // 🔥 ALTERAÇÃO AQUI: Agora batendo no endpoint otimizado que traz apenas os carros da empresa
    this.http.get<any[]>(`http://localhost:8080/api/transport/buscar-por-empresa/${this.usuarioLogado.empresaId}`, this.obterHeaders()).subscribe({
      next: (dados) => {
        console.log('Frota exclusiva retornada pelo backend:', dados);
        if (Array.isArray(dados)) {
          // Como o backend já filtrou, mapeamos as chaves diretamente com segurança
          this.listaMinhaFrota = dados.map((t: any) => ({
            id: t.id || t.idTransporte || t.id_transporte,
            modelo: t.modelo || 'Modelo Não Definido',
            capacidade: t.vagas || t.capacidade || 0,
            status: t.status || 'ATIVO'
          }));

          // Alimenta o indicador de veículos com status ativo
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

    // Mapeia o payload garantindo que o ID correto da empresa vai no corpo da requisição do banco
    const payload = {
      modelo: dadosForm.modelo,
      capacidade: Number(dadosForm.capacidade),
      status: dadosForm.status,
      empresaId: Number(this.usuarioLogado.empresaId) // Vinculando a empresa atual
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
  // PROCESSAMENTO DO PAINEL (Rotas, Passagens e Receita)
  // ==========================================
  carregarOperacoes() {
    this.http.get<any[]>('http://localhost:8080/api/rotas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaMinhasRotas = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao ler rotas:', err)
    });

    if (!this.usuarioLogado.empresaId) return;

    this.http.get<any[]>('http://localhost:8080/api/viagem/listar-todas', this.obterHeaders()).subscribe({
      next: (dados) => {
        if (Array.isArray(dados)) {
          console.log('Lista bruta de viagens vinda do servidor:', dados);

          // Filtra trazendo apenas as escalas associadas aos veículos ou rotas da empresa
          this.listaMinhasViagens = dados.filter((v: any) => {
            // 1. Tenta varrer todas as propriedades possíveis de relacionamento direto ou aninhado
            const idEmpresaViagem = v.empresaId ||
              v.empresa_id ||
              v.transport?.empresaId ||
              v.transport?.empresa?.id ||
              v.veiculo?.empresaId ||
              v.veiculo?.empresa?.id ||
              v.rota?.empresaId ||
              v.rota?.empresa?.id;

            // 2. CASO SEJA UM DTO SIMPLIFICADO (que só traz IDs numéricos brutos como transportId ou veiculoId):
            // Cruzamos com a sua listaMinhaFrota que já está carregada no Angular da Empresa
            const idDoCarro = v.transportId || v.transport_id || v.veiculoId || v.veiculo_id || v.transport?.id || v.veiculo?.id;

            if (idDoCarro) {
              const pertenceAFrota = this.listaMinhaFrota.some(f => Number(f.id) === Number(idDoCarro));
              if (pertenceAFrota) return true;
            }

            return Number(idEmpresaViagem) === Number(this.usuarioLogado.empresaId);
          });

          let passageirosContados = 0;
          let receitaSomada = 0;

          this.listaMinhasViagens.forEach(viagem => {
            // Adaptação para aceitar tanto 'capacidade' quanto 'vagas' ou buscar do objeto aninhado
            const capacidadeTotal = viagem.capacidade || viagem.transport?.capacidade || viagem.veiculo?.capacidade || 42;
            const vagasRestantes = viagem.vagasDisponiveis !== undefined ? viagem.vagasDisponiveis : capacidadeTotal;

            const passagensCompradas = capacidadeTotal - vagasRestantes;

            if (passagensCompradas > 0) {
              passageirosContados += passagensCompradas;

              // Se 'valor' vier zerado, tenta ler do 'valorBase' ou do objeto da rota aninhada
              const precoPassagem = viagem.valor || viagem.valorBase || viagem.rota?.valorBase || viagem.rota?.valor || 120.00;
              receitaSomada += (passagensCompradas * precoPassagem);
            }
          });

          this.totalPassageirosAtendidos = passageirosContados;
          this.receitaOperacional = receitaSomada;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao processar passagens vendidas no painel:', err)
    });
  }

  salvarItinerarioRota(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    // 🔥 ALINHAMENTO DE CHAVES: Agora combinando perfeitamente com o DTO do Java
    const payload = {
      origem: dadosForm.origem,
      ufOrigem: dadosForm.ufOrigem.toUpperCase(),
      destino: dadosForm.destino,
      ufDestino: dadosForm.ufDestino.toUpperCase(),
      valorBase: Number(dadosForm.valorBase),     // ✅ Corrigido para valorBase
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
