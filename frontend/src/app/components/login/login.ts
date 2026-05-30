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
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Objeto vinculado aos inputs do formulário HTML
  credenciais = {
    login: '',
    senha: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  executarLogin() {
    const dadosLogin = {
      login: this.credenciais.login,
      senha: this.credenciais.senha
    };

    this.authService.login(dadosLogin).subscribe({
      next: (response) => {
        console.log('Login efetuado com sucesso!', response);

        // Trata o token caso venha encapsulado em um objeto ou como string pura
        const token = response && typeof response === 'object' ? (response.token || response.tokenAcesso) : response;

        // Garante a leitura do token ativo (seja retornado na response ou já salvo pelo AuthService)
        const tokenAtivo = token || localStorage.getItem('token');

        if (tokenAtivo) {
          try {
            // Decodifica a seção do Payload do JWT (segunda parte do token)
            const parts = tokenAtivo.split('.');
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Lê a claim de nível de acesso (role/authority) injetada pelo Spring Security
            const roleUsuario = payload.role || payload.authority;
            console.log('Nível de acesso identificado:', roleUsuario);

            // REDIRECIONAMENTO INTELIGENTE BASEADO NA ROLE
            if (roleUsuario === 'EMPRESA') {
              this.router.navigate(['/dashboard-empresa']);
            } else if (roleUsuario === 'ADMIN') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/area-passageiro']);
            }
            return; // Interrompe a execução para não cair no fallback abaixo
          } catch (e) {
            console.error('Erro ao decodificar payload do token JWT:', e);
          }
        }

        // Fallback de segurança caso o formato do token mude inesperadamente
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro ao fazer login:', err);
        alert('Usuário ou senha incorretos.');
      }
    });
  }
}
