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

  // Indicadores numéricos superiores
  totalPassageirosAtendidos: number = 0;
  totalVeiculosAtivos: number = 0;
  receitaOperacional: number = 0.00;

  // Listagens de dados isoladas para a Empresa
  listaMinhasViagens: any[] = [];
  listaMinhasRotas: any[] = [];
  listaMinhaFrota: any[] = [];

  // Propriedades para capturar os valores selecionados nos dropdowns
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
    empresaId: "",
    email: '',
    role: 'EMPRESA'
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarDadosDoToken();
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

        this.usuarioLogado.id = payload.id || payload.userId;
        this.usuarioLogado.empresaId = payload.empresaId;
        this.usuarioLogado.email = payload.sub || payload.email;
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

  carregarDadosPerfilEmpresa() {
    if (!this.usuarioLogado.empresaId) return;

    this.http.get<any>(`http://localhost:8080/api/empresa/buscar/${this.usuarioLogado.empresaId}`, this.obterHeaders()).subscribe({
      next: (dados) => {
        if (dados) {
          this.dadosEmpresa = {
            id: dados.id,
            razaoSocial: dados.razao_social || dados.razaoSocial,
            cnpj: dados.cnpj,
            telefone: dados.telefone,
            endereco: dados.endereco
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

  carregarFrota() {
    this.http.get<any[]>('http://localhost:8080/api/transport/listar-todas', this.obterHeaders()).subscribe({
      next: (dados) => {
        if (Array.isArray(dados)) {
          this.listaMinhaFrota = dados
            .filter((t: any) => t.empresaId === this.usuarioLogado.empresaId || t.empresa?.id === this.usuarioLogado.empresaId)
            .map((t: any) => ({
              id: t.id || t.idTransporte,
              modelo: t.modelo,
              capacidade: t.capacidade || t.vagas,
              status: t.status
            }));

          this.totalVeiculosAtivos = this.listaMinhaFrota.filter(v => v.status === 'ATIVO').length;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar frota:', err)
    });
  }

  salvarVeiculo(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    const payload = {
      modelo: dadosForm.modelo,
      capacidade: Number(dadosForm.capacidade),
      vagas: Number(dadosForm.capacidade),
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

  carregarOperacoes() {
    this.http.get<any[]>('http://localhost:8080/api/rotas', this.obterHeaders()).subscribe({
      next: (dados) => {
        this.listaMinhesRotas = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao ler rotas:', err)
    });

    this.http.get<any[]>('http://localhost:8080/api/viagem/listar-todas', this.obterHeaders()).subscribe({
      next: (dados) => {
        if (Array.isArray(dados)) {
          this.listaMinhasViagens = dados;

          let passageiros = 0;
          let receita = 0;
          this.listaMinhasViagens.forEach(v => {
            const vendidos = (v.capacidade || 42) - (v.vagasDisponiveis || 0);
            if (vendidos > 0) {
              passageiros += vendidos;
              receita += (vendidos * (v.valor || 120.00));
            }
          });
          this.totalPassageirosAtendidos = passageiros;
          this.receitaOperacional = receita;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao processar viagens:', err)
    });
  }

  salvarItinerarioRota(dadosForm: any, form: NgForm) {
    if (form.invalid) return;

    const payload = {
      origem: dadosForm.origem,
      ufOrigem: dadosForm.ufOrigem.toUpperCase(),
      destino: dadosForm.destino,
      ufDestino: dadosForm.ufDestino.toUpperCase(),
      valor: Number(dadosForm.valorBase),
      horario: dadosForm.horarioPadrao
    };

    this.http.post('http://localhost:8080/api/rotas/cadastrar', payload, this.obterHeaders()).subscribe({
      next: () => {
        form.resetForm();
        this.carregarOperacoes();
        alert('Nova rota comercial salva com sucesso!');
      },
      error: (err) => console.error(err)
    });
  }

  agendarViagem(dadosForm: any, form: NgForm) {
    // Captura os valores vindos diretamente das propriedades vinculadas por [(ngModel)]
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
            alert('Viagem cadastrada e ônibus escalado!');
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
