import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class CadastroComponent {

  // Apenas as duas opções públicas agora 👥
  tipoUsuario: 'PASSAGEIRO' | 'EMPRESA' = 'PASSAGEIRO';

  dadosPassageiro = {
    nome: '',
    sobrenome: '',
    phone: '',
    email: '',
    cpf: '',
    password: '',
    idade: null
  };

  dadosEmpresa = {
    razaoSocial: '',
    cnpj: '',
    telefone: '',
    endereco: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  mudarTipo(tipo: 'PASSAGEIRO' | 'EMPRESA') {
    this.tipoUsuario = tipo;
  }

  executarCadastro() {
    // Segurança: os console.logs com dados abertos foram removidos daqui 🛡️
    if (this.tipoUsuario === 'PASSAGEIRO') {
      this.authService.cadastrarPassageiro(this.dadosPassageiro).subscribe({
        next: (resposta: any) => this.sucessoCadastro(),
        error: (erro: any) => this.erroCadastro(erro)
      });
    } else if (this.tipoUsuario === 'EMPRESA') {
      this.authService.cadastrarEmpresa(this.dadosEmpresa).subscribe({
        next: (resposta: any) => this.sucessoCadastro(),
        error: (erro: any) => this.erroCadastro(erro)
      });
    }
  }

  private sucessoCadastro() {
    alert('Cadastro realizado com sucesso! 🎉');
    this.router.navigate(['/login']);
  }

  private erroCadastro(erro: any) {
    alert('Falha ao cadastrar. Verifique os dados inseridos.');
  }
}
