import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Mantém o objeto vinculado ao seu formulário HTML
  credenciais = {
    login: '',
    senha: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  executarLogin() {
    // 🚀 CORRIGIDO: Enviando exatamente a chave 'login' que o seu Java espera receber
    const dadosLogin = {
      login: this.credenciais.login,
      senha: this.credenciais.senha
    };

    this.authService.login(dadosLogin).subscribe({
      next: (response) => {
        console.log('Login efetuado com sucesso!', response);
        // Muda para a tela do dashboard agora que o token foi gerado
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro ao fazer login:', err);
        alert('Usuário ou senha incorretos.');
      }
    });
  }
}
